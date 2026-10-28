<?php

/**
 * Module Lịch làm việc: hàm dùng cho cả ngoài site lẫn quản trị.
 */

if (!defined('NV_MAINFILE')) {
    exit('Stop!!!');
}

if (!function_exists('llv_clean_time')) {
    /** Chuẩn hoá giờ "8:05", "08:05" → "08:05"; sai thì trả rỗng. */
    function llv_clean_time($value)
    {
        return preg_match('/^([01]?\d|2[0-3]):([0-5]\d)$/', trim((string) $value), $m) ? sprintf('%02d:%s', $m[1], $m[2]) : '';
    }

    /** Ngày dạng Y-m-d hợp lệ; sai thì trả rỗng. */
    function llv_clean_date($value)
    {
        $value = trim((string) $value);
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) && checkdate((int) substr($value, 5, 2), (int) substr($value, 8, 2), (int) substr($value, 0, 4)) ? $value : '';
    }

    /** Một mục lịch dạng mảng cho JS. */
    function llv_event_data($row)
    {
        return [
            'id' => (int) $row['id'],
            'date' => (string) $row['edate'],
            'start' => (string) $row['start_time'],
            'end' => (string) $row['end_time'],
            'title' => (string) $row['title'],
            'location' => (string) $row['location'],
            'host' => (string) $row['host'],
            'note' => (string) $row['note']
        ];
    }

    /** Lịch đang hiện trong khoảng ngày [from, to]. */
    function llv_events_between($table, $from, $to)
    {
        global $db;

        $sth = $db->prepare('SELECT id, edate, start_time, end_time, title, location, host, note FROM ' . $table . '
            WHERE status = 1 AND edate BETWEEN :from AND :to ORDER BY edate ASC, start_time ASC, id ASC LIMIT 500');
        $sth->bindValue(':from', $from, PDO::PARAM_STR);
        $sth->bindValue(':to', $to, PDO::PARAM_STR);
        $sth->execute();

        return array_map('llv_event_data', $sth->fetchAll());
    }

    /** Ô đầu (Thứ Hai) và ô cuối (Chủ nhật) của lưới tháng chứa ngày $ymd. */
    function llv_grid_range($ymd)
    {
        $first = new DateTimeImmutable(substr($ymd, 0, 7) . '-01');
        $last = $first->modify('last day of this month');
        $start = $first->modify('-' . (((int) $first->format('N')) - 1) . ' days');
        $end = $last->modify('+' . (7 - (int) $last->format('N')) . ' days');

        return [$start->format('Y-m-d'), $end->format('Y-m-d')];
    }
}
