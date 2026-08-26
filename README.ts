@section Scripts {
    <script>
        $(function () {
            $('[data-bs-toggle="popover"]').each(function () {
                new bootstrap.Popover(this, { container: 'body' });
            });
        });
    </script>
}
