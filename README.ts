@section Scripts {
<script>
    function refreshPendingCount() {
        if (document.hidden) return;
        $.getJSON('/TestClient/PendingCount', function (d) {
            $('#pendingBadge').text(d.count);
            $('#pendingBtn').toggle(d.count > 0);
        });
    }

    $(function () {
        refreshPendingCount();
        setInterval(refreshPendingCount, 30000);
    });
</script>
}


<a href="/TestClient/PendingRecords" class="btn btn-warning" id="pendingBtn" style="display:none;">
    Pending Records <span class="badge bg-dark" id="pendingBadge">0</span>
</a>
