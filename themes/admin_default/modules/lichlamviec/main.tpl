<!-- BEGIN: main -->
<form class="form-inline llv-filter" method="get" action="{NV_BASE_ADMINURL}index.php">
    <input type="hidden" name="{NV_LANG_VARIABLE}" value="{NV_LANG_DATA}">
    <input type="hidden" name="{NV_NAME_VARIABLE}" value="{MODULE_NAME}">
    <div class="form-group">
        <label for="llv-month">{LANG.filter_month}</label>
        <input type="month" id="llv-month" name="month" value="{FILTER.month}" class="form-control">
    </div>
    <div class="checkbox">
        <label><input type="checkbox" name="month" value="all"{FILTER.all_checked}> {LANG.filter_all}</label>
    </div>
    <div class="form-group">
        <input type="search" name="q" value="{FILTER.q}" class="form-control" placeholder="{LANG.filter_q}" maxlength="100">
    </div>
    <button type="submit" class="btn btn-default"><em class="fa fa-search"></em> {LANG.filter_submit}</button>
    <span class="llv-actions">
        <a href="{URL_ADD}" class="btn btn-primary"><em class="fa fa-plus"></em> {LANG.add}</a>
        <a href="{URL_SITE}" class="btn btn-default" target="_blank"><em class="fa fa-calendar"></em> {LANG.view_site}</a>
    </span>
</form>

<!-- BEGIN: empty -->
<div class="alert alert-info">{LANG.empty_list}</div>
<!-- END: empty -->

<!-- BEGIN: list -->
<div class="table-responsive">
    <table class="table table-striped table-bordered table-hover">
        <thead>
            <tr>
                <th class="text-nowrap">{LANG.edate}</th>
                <th class="text-nowrap">{LANG.time}</th>
                <th>{LANG.title}</th>
                <th class="text-center text-nowrap">{LANG.status}</th>
                <th class="text-center text-nowrap">{LANG.feature}</th>
            </tr>
        </thead>
        <tbody>
            <!-- BEGIN: row -->
            <tr id="llv-row-{ROW.id}">
                <td class="text-nowrap">{ROW.date_text}</td>
                <td class="text-nowrap">{ROW.time_text}</td>
                <td>
                    <a href="{ROW.url_edit}"><strong>{ROW.title}</strong></a>
                    <!-- BEGIN: meta --><div class="text-muted small">{META}</div><!-- END: meta -->
                </td>
                <td class="text-center">
                    <button type="button" class="btn btn-xs btn-{ROW.status_class}" data-llv="status" data-id="{ROW.id}" data-checkss="{ROW.checkss}">{ROW.status_text}</button>
                </td>
                <td class="text-center text-nowrap">
                    <a href="{ROW.url_edit}" class="btn btn-xs btn-default"><em class="fa fa-edit"></em> {GLANG.edit}</a>
                    <a href="{ROW.url_copy}" class="btn btn-xs btn-default"><em class="fa fa-copy"></em> {LANG.copy}</a>
                    <button type="button" class="btn btn-xs btn-danger" data-llv="delete" data-id="{ROW.id}" data-checkss="{ROW.checkss}"><em class="fa fa-trash-o"></em> {GLANG.delete}</button>
                </td>
            </tr>
            <!-- END: row -->
        </tbody>
    </table>
</div>
<!-- BEGIN: generate_page -->
<div class="text-center">{GENERATE_PAGE}</div>
<!-- END: generate_page -->
<!-- END: list -->

<style>
.llv-filter { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-bottom: 16px; }
.llv-filter .form-group, .llv-filter .checkbox { margin: 0; }
.llv-filter input[type="search"] { min-width: 260px; }
.llv-actions { margin-left: auto; }
</style>
<script>
$(function () {
    // Ô "Mọi tháng" bật thì bỏ ô chọn tháng (cùng tên month, gửi giá trị all)
    var $all = $('.llv-filter input[value="all"]'), $month = $('#llv-month');
    function sync() { $month.prop('disabled', $all.is(':checked')); }
    $all.on('change', sync); sync();

    $('[data-llv]').on('click', function () {
        var $b = $(this), act = $b.data('llv'), id = $b.data('id');
        if (act === 'delete' && !confirm('{LANG.delete_confirm}')) return;
        $b.prop('disabled', true);
        $.post(location.href, { action: act, id: id, checkss: $b.data('checkss') }, function (res) {
            $b.prop('disabled', false);
            if (!res || res.status !== 'ok') { alert('{LANG.error_save}'); return; }
            if (act === 'delete') { $('#llv-row-' + id).fadeOut(200, function () { $(this).remove(); }); return; }
            $b.text(res.text).toggleClass('btn-success', res.value == 1).toggleClass('btn-default', res.value != 1);
        }, 'json').fail(function () { $b.prop('disabled', false); alert('{LANG.error_save}'); });
    });
});
</script>
<!-- END: main -->
