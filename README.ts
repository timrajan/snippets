<div id="rowLimitMsg" class="alert alert-warning" role="alert" hidden>
    You can add a maximum of 20 students.
</div>

    function refreshRowState() {
    const count = container.querySelectorAll('.student-row').length;

    container.querySelectorAll('.add-row').forEach(btn => {
        btn.hidden = count >= MAX_ROWS;
    });

    document.getElementById('rowLimitMsg').hidden = count < MAX_ROWS;
}
