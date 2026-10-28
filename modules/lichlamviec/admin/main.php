<?php

/**
 * Module Lịch làm việc: danh sách lịch trong quản trị.
 * Lọc theo tháng (mặc định tháng hiện tại) và từ khoá; ẩn/hiện, xoá bằng ajax.
 */

if (!defined('NV_IS_FILE_ADMIN')) {
    exit('Stop!!!');
}

$table = NV_PREFIXLANG . '_' . $module_data;

// Ajax: xoá, đổi ẩn/hiện
$action = $nv_Request->get_title('action', 'post', '');
if ($action === 'delete' or $action === 'status') {
    $id = $nv_Request->get_int('id', 'post', 0);
    $checkss = $nv_Request->get_title('checkss', 'post', '');
    if (!$id or $checkss !== md5($id . NV_CHECK_SESSION)) {
        nv_jsonOutput(['status' => 'error']);
    }
    $row = $db->query('SELECT id, edate, title, status FROM ' . $table . ' WHERE id=' . $id)->fetch();
    if (empty($row)) {
        nv_jsonOutput(['status' => 'error']);
    }
    if ($action === 'delete') {
        $db->exec('DELETE FROM ' . $table . ' WHERE id=' . $id);
        nv_insert_logs(NV_LANG_DATA, $module_name, 'Delete', $row['edate'] . ' ' . $row['title'], $admin_info['userid']);
        nv_jsonOutput(['status' => 'ok']);
    }
    $status = $row['status'] ? 0 : 1;
    $db->exec('UPDATE ' . $table . ' SET status=' . $status . ', edit_time=' . NV_CURRENTTIME . ' WHERE id=' . $id);
    nv_jsonOutput(['status' => 'ok', 'value' => $status, 'text' => $lang_module['status_' . $status]]);
}

$page_title = $lang_module['main'];
$base_url = NV_BASE_ADMINURL . 'index.php?' . NV_LANG_VARIABLE . '=' . NV_LANG_DATA . '&amp;' . NV_NAME_VARIABLE . '=' . $module_name;

$month = $nv_Request->get_title('month', 'get', nv_date('Y-m', NV_CURRENTTIME));
if ($month !== 'all' and !llv_clean_date($month . '-01')) {
    $month = nv_date('Y-m', NV_CURRENTTIME);
}
$q = nv_substr($nv_Request->get_title('q', 'get', ''), 0, 100);
$page = max(1, $nv_Request->get_int('page', 'get', 1));
$per_page = 50;

$where = [];
$params = [];
if ($month !== 'all') {
    $where[] = 'edate BETWEEN :from AND :to';
    $params[':from'] = $month . '-01';
    $params[':to'] = date('Y-m-t', strtotime($month . '-01'));
}
if ($q !== '') {
    $where[] = '(title LIKE :q OR location LIKE :q2 OR host LIKE :q3)';
    $params[':q'] = $params[':q2'] = $params[':q3'] = '%' . addcslashes($q, '%_\\') . '%';
}
$sql_where = $where ? ' WHERE ' . implode(' AND ', $where) : '';

$sth = $db->prepare('SELECT COUNT(*) FROM ' . $table . $sql_where);
$sth->execute($params);
$num_items = (int) $sth->fetchColumn();

// Lọc theo tháng: ngày tăng dần như đọc lịch; xem mọi tháng: mới nhất trước
$order = $month === 'all' ? 'edate DESC, start_time ASC, id ASC' : 'edate ASC, start_time ASC, id ASC';
$sth = $db->prepare('SELECT * FROM ' . $table . $sql_where . ' ORDER BY ' . $order . ' LIMIT ' . $per_page . ' OFFSET ' . (($page - 1) * $per_page));
$sth->execute($params);
$rows = $sth->fetchAll();

$xtpl = new XTemplate('main.tpl', NV_ROOTDIR . '/themes/' . $global_config['module_theme'] . '/modules/' . $module_file);
$xtpl->assign('LANG', $lang_module);
$xtpl->assign('GLANG', $lang_global);
$xtpl->assign('NV_BASE_ADMINURL', NV_BASE_ADMINURL);
$xtpl->assign('NV_LANG_VARIABLE', NV_LANG_VARIABLE);
$xtpl->assign('NV_LANG_DATA', NV_LANG_DATA);
$xtpl->assign('NV_NAME_VARIABLE', NV_NAME_VARIABLE);
$xtpl->assign('MODULE_NAME', $module_name);
$xtpl->assign('FILTER', [
    'month' => $month === 'all' ? '' : $month,
    'all_checked' => $month === 'all' ? ' checked="checked"' : '',
    'q' => nv_htmlspecialchars($q)
]);
$xtpl->assign('URL_ADD', $base_url . '&amp;' . NV_OP_VARIABLE . '=content');
$xtpl->assign('URL_SITE', nv_url_rewrite(NV_BASE_SITEURL . 'index.php?' . NV_LANG_VARIABLE . '=' . NV_LANG_DATA . '&amp;' . NV_NAME_VARIABLE . '=' . $module_name, true));
$xtpl->assign('URL_MAIN', $base_url);

$thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
foreach ($rows as $row) {
    foreach (['title', 'location', 'host'] as $f) {
        $row[$f] = nv_htmlspecialchars($row[$f]);
    }
    $ts = strtotime($row['edate'] . ' 12:00:00');
    $row['date_text'] = $thu[(int) date('w', $ts)] . ', ' . date('d/m/Y', $ts);
    $row['time_text'] = $row['start_time'] ? $row['start_time'] . ($row['end_time'] ? '–' . $row['end_time'] : '') : $lang_module['all_day'];
    $row['status_text'] = $lang_module['status_' . (int) $row['status']];
    $row['status_class'] = $row['status'] ? 'success' : 'default';
    $row['checkss'] = md5($row['id'] . NV_CHECK_SESSION);
    $row['url_edit'] = $base_url . '&amp;' . NV_OP_VARIABLE . '=content&amp;id=' . $row['id'];
    $row['url_copy'] = $base_url . '&amp;' . NV_OP_VARIABLE . '=content&amp;copy=' . $row['id'];
    $xtpl->assign('ROW', $row);
    if ($row['location'] !== '' or $row['host'] !== '') {
        $xtpl->assign('META', implode(' · ', array_filter([$row['location'], $row['host']], 'strlen')));
        $xtpl->parse('main.list.row.meta');
    }
    $xtpl->parse('main.list.row');
}

if ($rows) {
    $page_url = $base_url . '&amp;month=' . ($month === 'all' ? 'all' : $month) . ($q !== '' ? '&amp;q=' . urlencode($q) : '');
    $generate_page = nv_generate_page($page_url, $num_items, $per_page, $page);
    if ($generate_page) {
        $xtpl->assign('GENERATE_PAGE', $generate_page);
        $xtpl->parse('main.list.generate_page');
    }
    $xtpl->parse('main.list');
} else {
    $xtpl->parse('main.empty');
}

$xtpl->parse('main');
$contents = $xtpl->text('main');

include NV_ROOTDIR . '/includes/header.php';
echo nv_admin_theme($contents);
include NV_ROOTDIR . '/includes/footer.php';
