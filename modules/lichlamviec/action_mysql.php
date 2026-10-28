<?php

/**
 * Module Lịch làm việc: tạo / xoá bảng dữ liệu khi cài, gỡ module.
 * Mỗi dòng là một mục lịch. Giờ trống là việc cả ngày.
 */

if (!defined('NV_IS_FILE_MODULES')) {
    exit('Stop!!!');
}

$sql_drop_module = [];
$sql_drop_module[] = 'DROP TABLE IF EXISTS ' . $db_config['prefix'] . '_' . $lang . '_' . $module_data . ';';

$sql_create_module = $sql_drop_module;

$sql_create_module[] = 'CREATE TABLE ' . $db_config['prefix'] . '_' . $lang . '_' . $module_data . " (
 id int(11) unsigned NOT NULL AUTO_INCREMENT,
 edate date NOT NULL COMMENT 'Ngày',
 start_time varchar(5) NOT NULL DEFAULT '' COMMENT 'Giờ bắt đầu H:i, trống là cả ngày',
 end_time varchar(5) NOT NULL DEFAULT '' COMMENT 'Giờ kết thúc H:i',
 title varchar(255) NOT NULL DEFAULT '' COMMENT 'Nội dung công việc',
 location varchar(255) NOT NULL DEFAULT '' COMMENT 'Địa điểm',
 host varchar(255) NOT NULL DEFAULT '' COMMENT 'Chủ trì, thành phần',
 note text COMMENT 'Ghi chú',
 status tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT '1: hiện, 0: ẩn',
 admin_id mediumint(8) unsigned NOT NULL DEFAULT '0',
 add_time int(11) unsigned NOT NULL DEFAULT '0',
 edit_time int(11) unsigned NOT NULL DEFAULT '0',
 PRIMARY KEY (id),
 KEY edate (edate, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
