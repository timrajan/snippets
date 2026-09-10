@section Scripts {
    <script>
        $(function () {
            $('.edit-comment').on('click', function () {
                var btn = $(this);
                $('#commentEmail').val(btn.data('email'));
                $('#commentStudentName').text(btn.data('name'));
                $('#commentText').val(btn.data('comment'));
            });
        });
    </script>
}
