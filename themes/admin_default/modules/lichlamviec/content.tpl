<!-- BEGIN: main -->
<!-- BEGIN: error -->
<div class="alert alert-danger">{ERROR}</div>
<!-- END: error -->
<form method="post" action="{FORM_ACTION}" class="llv-form">
    <input type="hidden" name="checkss" value="{CHECKSS}">
    <div class="panel panel-default">
        <div class="panel-body">
            <div class="form-group">
                <label for="llv-title">{LANG.title} <span class="text-danger">*</span></label>
                <input type="text" id="llv-title" name="title" value="{ROW.title}" class="form-control" maxlength="255" required placeholder="{LANG.title_placeholder}">
            </div>
            <div class="row">
                <div class="col-sm-8 form-group">
                    <label for="llv-date">{LANG.edate} <span class="text-danger">*</span></label>
                    <input type="date" id="llv-date" name="edate" value="{ROW.edate}" class="form-control" required>
                </div>
                <div class="col-sm-8 form-group">
                    <label for="llv-start">{LANG.start_time}</label>
                    <input type="time" id="llv-start" name="start_time" value="{ROW.start_time}" class="form-control">
                    <p class="help-block">{LANG.start_time_note}</p>
                </div>
                <div class="col-sm-8 form-group">
                    <label for="llv-end">{LANG.end_time}</label>
                    <input type="time" id="llv-end" name="end_time" value="{ROW.end_time}" class="form-control">
                </div>
            </div>
            <div class="form-group">
                <label for="llv-location">{LANG.location}</label>
                <input type="text" id="llv-location" name="location" value="{ROW.location}" class="form-control" maxlength="255" placeholder="{LANG.location_placeholder}">
            </div>
            <div class="form-group">
                <label for="llv-host">{LANG.host}</label>
                <input type="text" id="llv-host" name="host" value="{ROW.host}" class="form-control" maxlength="255" placeholder="{LANG.host_placeholder}">
            </div>
            <div class="form-group">
                <label for="llv-note">{LANG.note}</label>
                <textarea id="llv-note" name="note" rows="3" class="form-control">{ROW.note}</textarea>
            </div>
            <div class="checkbox">
                <label><input type="checkbox" name="status" value="1"{ROW.status_checked}> {LANG.status}</label>
            </div>
        </div>
    </div>
    <div class="text-center">
        <button type="submit" name="save" value="1" class="btn btn-primary"><em class="fa fa-save"></em> {LANG.save}</button>
        <!-- BEGIN: save_add -->
        <button type="submit" name="save_add" value="1" class="btn btn-default"><em class="fa fa-plus"></em> {LANG.save_add}</button>
        <!-- END: save_add -->
    </div>
</form>
<script>
$(function () {
    // Chưa có giờ bắt đầu thì giờ kết thúc không có nghĩa (việc cả ngày)
    var $s = $('#llv-start'), $e = $('#llv-end');
    function sync() { $e.prop('disabled', !$s.val()); }
    $s.on('input change', sync); sync();
});
</script>
<!-- END: main -->
