<?php

/**
 * Module Lịch làm việc: trang lịch tháng.
 * Có tham số from, to (Y-m-d) thì trả JSON lịch trong khoảng đó (tối đa 62 ngày) cho JS tải tháng khác.
 */

if (!defined('NV_IS_MOD_LICHLAMVIEC')) {
    exit('Stop!!!');
}

$table = NV_PREFIXLANG . '_' . $module_data;

if ($nv_Request->isset_request('from', 'get') and $nv_Request->isset_request('to', 'get')) {
    $from = llv_clean_date($nv_Request->get_title('from', 'get', ''));
    $to = llv_clean_date($nv_Request->get_title('to', 'get', ''));
    if (!$from or !$to or $from > $to or (strtotime($to) - strtotime($from)) / 86400 > 62) {
        http_response_code(400);
        nv_jsonOutput(['error' => $lang_module['range_error']]);
    }
    nv_jsonOutput(llv_events_between($table, $from, $to));
}

$page_title = $module_info['site_title'];
$key_words = $module_info['keywords'];
$description = $module_info['description'];
$page_url = NV_BASE_SITEURL . 'index.php?' . NV_LANG_VARIABLE . '=' . NV_LANG_DATA . '&amp;' . NV_NAME_VARIABLE . '=' . $module_name;
$canonicalUrl = getCanonicalUrl($page_url);

$today = nv_date('Y-m-d', NV_CURRENTTIME);
$range = llv_grid_range($today);

$cfg = [
    'today' => $today,
    'api' => nv_url_rewrite(NV_BASE_SITEURL . 'index.php?' . NV_LANG_VARIABLE . '=' . NV_LANG_DATA . '&' . NV_NAME_VARIABLE . '=' . $module_name, true),
    'events' => llv_events_between($table, $range[0], $range[1])
];

$contents = nv_theme_lichlamviec_main($cfg);

include NV_ROOTDIR . '/includes/header.php';
echo nv_site_theme($contents);
include NV_ROOTDIR . '/includes/footer.php';
