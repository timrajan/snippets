@section Scripts {
<script>
    var inFlight = false;

    function loadPending() {
        if (inFlight || document.hidden) return;
        if ($('.popover.show').length) return;
        inFlight = true;

        $('#recordsBody').load('/TestClient/PendingRecordsData', function () {
            $('[data-bs-toggle="popover"]').each(function () {
                new bootstrap.Popover(this, { container: 'body', sanitize: false });
            });
            $('#lastUpdated').text(new Date().toLocaleTimeString());
            inFlight = false;
        });
    }

    $(function () {
        loadPending();
        setInterval(loadPending, 30000);
    });
</script>
}
