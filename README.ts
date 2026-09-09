@section Scripts {
    <script>
        $(function () {
            $('.copy-row').on('click', function () {
                var btn = $(this);
                navigator.clipboard.writeText(btn.data('copy')).then(function () {
                    btn.addClass('btn-success').removeClass('btn-outline-secondary');
                    setTimeout(function () {
                        btn.addClass('btn-outline-secondary').removeClass('btn-success');
                    }, 1000);
                });
            });
        });
    </script>
}
