<?php

/**
 * Module Lịch làm việc: thêm, sửa, nhân bản một mục lịch.
 * id: sửa; copy: điền sẵn từ mục có sẵn để tạo mục mới (họp định kỳ chỉ cần đổi ngày).
 */

if (!defined('NV_IS_FILE_ADMIN')) {
    exit('Stop!!!');
}

$table = NV_PREFIXLANG . '_' . $module_data;
$base_url = NV_BASE_ADMINURL . 'index.php?' . NV_LANG_VARIABLE . '=' . NV_LANG_DATA . '&' . NV_NAME_VARIABLE . '=' . $module_name;

$id = $nv_Request->get_int('id', 'get,post', 0);
$copy = $nv_Request->get_int('copy', 'get', 0);

$row = [
    'id' => 0,
    'edate' => nv_date('Y-m-d', NV_CURRENTTIME),
    'start_time' => '',
    'end_time' => '',
    'title' => '',
    'location' => '',
    'host' => '',
    'note' => '',
    'status' => 1
];

if ($id or $copy) {
    $old = $db->query('SELECT * FROM ' . $table . ' WHERE id=' . ($id ?: $copy))->fetch();
    if (empty($old)) {
        nv_redirect_location($base_url);
    }
    $row = array_merge($row, array_intersect_key($old, $row));
    if ($copy) {
        $row['id'] = 0;
    }
}

$error = '';
if ($nv_Request->isset_request('save', 'post') or $nv_Request->isset_request('save_add', 'post')) {
    if ($nv_Request->get_title('checkss', 'post', '') !== NV_CHECK_SESSION) {
        nv_redirect_location($base_url);
    }
    $row['title'] = nv_substr($nv_Request->get_title('title', 'post', ''), 0, 255);
    $row['edate'] = llv_clean_date($nv_Request->get_title('edate', 'post', ''));
    $row['start_time'] = llv_clean_time($nv_Request->get_title('start_time', 'post', ''));
    $row['end_time'] = $row['start_time'] ? llv_clean_time($nv_Request->get_title('end_time', 'post', '')) : '';
    if ($row['end_time'] and $row['end_time'] <= $row['start_time']) {
        $row['end_time'] = ''; // giờ kết thúc trước giờ bắt đầu: bỏ, chỉ giữ giờ bắt đầu
    }
    $row['location'] = nv_substr($nv_Request->get_title('location', 'post', ''), 0, 255);
    $row['host'] = nv_substr($nv_Request->get_title('host', 'post', ''), 0, 255);
    $row['note'] = trim(strip_tags($nv_Request->get_textarea('note', '')));
    $row['status'] = $nv_Request->get_int('status', 'post', 0) ? 1 : 0;

    if ($row['title'] === '') {
        $error = $lang_module['error_title'];
    } elseif ($row['edate'] === '') {
        $error = $lang_module['error_date'];
    } else {
        $fields = ['edate', 'start_time', 'end_time', 'title', 'location', 'host', 'note', 'status'];
        if ($id) {
            $sth = $db->prepare('UPDATE ' . $table . ' SET ' . implode(', ', array_map(function ($f) {
                return $f . '=:' . $f;
            }, $fields)) . ', edit_time=' . NV_CURRENTTIME . ' WHERE id=' . $id);
        } else {
            $sth = $db->prepare('INSERT INTO ' . $table . ' (' . implode(', ', $fields) . ', admin_id, add_time, edit_time)
                VALUES (:' . implode(', :', $fields) . ', ' . (int) $admin_info['userid'] . ', ' . NV_CURRENTTIME . ', ' . NV_CURRENTTIME . ')');
        }
        foreach ($fields as $f) {
            $sth->bindValue(':' . $f, $row[$f], $f === 'status' ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        if ($sth->execute()) {
            nv_insert_logs(NV_LANG_DATA, $module_name, $id ? 'Edit' : 'Add', $row['edate'] . ' ' . $row['title'], $admin_info['userid']);
            $nv_Cache->delMod($module_name);
            if ($nv_Request->isset_request('save_add', 'post')) {
                // Thêm tiếp: giữ ngày vừa nhập, các ô khác để trống
                nv_redirect_location($base_url . '&' . NV_OP_VARIABLE . '=content&date=' . $row['edate']);
            }
            nv_redirect_location($base_url . '&month=' . substr($row['edate'], 0, 7));
        }
        $error = $lang_module['error_save'];
    }
} elseif (!$id and !$copy) {
    $date = llv_clean_date($nv_Request->get_title('date', 'get', ''));
    if ($date) {
        $row['edate'] = $date;
    }
}

$page_title = $id ? $lang_module['edit'] : $lang_module['add'];

$xtpl = new XTemplate('content.tpl', NV_ROOTDIR . '/themes/' . $global_config['module_theme'] . '/modules/' . $module_file);
$xtpl->assign('LANG', $lang_module);
$xtpl->assign('GLANG', $lang_global);
$xtpl->assign('FORM_ACTION', NV_BASE_ADMINURL . 'index.php?' . NV_LANG_VARIABLE . '=' . NV_LANG_DATA . '&amp;' . NV_NAME_VARIABLE . '=' . $module_name . '&amp;' . NV_OP_VARIABLE . '=' . $op . ($id ? '&amp;id=' . $id : ''));
$xtpl->assign('CHECKSS', NV_CHECK_SESSION);
$row['status_checked'] = $row['status'] ? ' checked="checked"' : '';
$xtpl->assign('ROW', array_map(function ($v) {
    return is_string($v) ? nv_htmlspecialchars($v) : $v;
}, $row));

if ($error) {
    $xtpl->assign('ERROR', $error);
    $xtpl->parse('main.error');
}
if (!$id) {
    $xtpl->parse('main.save_add');
}

$xtpl->parse('main');
$contents = $xtpl->text('main');

include NV_ROOTDIR . '/includes/header.php';
echo nv_admin_theme($contents);
include NV_ROOTDIR . '/includes/footer.php';
