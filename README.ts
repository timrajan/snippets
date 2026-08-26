@section Scripts {
<script>
    var inFlight = false;

    function renderRows(rows) {
        var html = rows.map(function (r) {
            return '<tr><td>' + r.email + '</td><td>' + r.latestCreated +
                   '</td><td>' + r.rowCount + '</td></tr>';
        }).join('');
        $('#recordsBody').html(html);
    }

    function loadPending() {
        if (inFlight || document.hidden) return;
        inFlight = true;

        $.ajax({ url: '@Url.Action("PendingRecordsData", "TestClient")', cache: false })
            .done(function (data) {
                renderRows(data.rows);
                $('#rowCount').text(data.count);
                $('#recordsTable').toggle(data.count > 0);
                $('#emptyState').toggle(data.count === 0);
                $('#lastUpdated').text(new Date().toLocaleTimeString());
            })
            .always(function () { inFlight = false; });
    }

    $(function () {
        loadPending();
        setInterval(loadPending, 30000);
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) loadPending();
        });
    });
}
</script>
}
