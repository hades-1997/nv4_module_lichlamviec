<?php

/**
 * Module Lịch làm việc: giao diện ngoài site.
 */

if (!defined('NV_IS_MOD_LICHLAMVIEC')) {
    exit('Stop!!!');
}

/**
 * Trang lịch: khung [data-mlc] để lichlamviec.js vẽ lưới tháng và cột âm lịch.
 *
 * @param array $cfg today, api, events
 * @return string
 */
function nv_theme_lichlamviec_main($cfg)
{
    global $module_info, $lang_module, $lang_global;

    $xtpl = new XTemplate('main.tpl', NV_ROOTDIR . '/themes/' . $module_info['template'] . '/modules/' . $module_info['module_theme']);
    $xtpl->assign('LANG', $lang_module);
    $xtpl->assign('GLANG', $lang_global);
    $xtpl->assign('TITLE', $module_info['custom_title']);
    $xtpl->assign('CONFIG', htmlspecialchars(json_encode($cfg, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ENT_QUOTES, 'UTF-8'));

    if (!empty($module_info['description'])) {
        $xtpl->assign('DESCRIPTION', $module_info['description']);
        $xtpl->parse('main.description');
    }

    $xtpl->parse('main');
    return $xtpl->text('main');
}
