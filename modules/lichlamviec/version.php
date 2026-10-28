<?php

/**
 * Module Lịch làm việc (lịch công tác) kèm lịch vạn niên âm dương.
 * Chuyển từ plugin WordPress "Minland Lịch" (minland.io.vn) sang NukeViet 4.x.
 */

if (!defined('NV_ADMIN') or !defined('NV_MAINFILE')) {
    exit('Stop!!!');
}

$module_version = [
    'name' => 'Lichlamviec',
    'modfuncs' => 'main',
    'change_alias' => 'main',
    'submenu' => '',
    'is_sysmod' => 0,
    'virtual' => 1,
    'version' => '4.6.00',
    'date' => 'Wednesday, October 28, 2026 08:00:00 GMT+07:00',
    'author' => 'Đắc Lợi',
    'note' => 'Lịch làm việc kèm lịch vạn niên âm dương'
];
