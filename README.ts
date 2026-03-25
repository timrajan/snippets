


@if (TempData["Message"] != null)
{
    var msgType = TempData["MessageType"] ?? "success";

    <div id="appAlert" 
     class="alert alert-@msgType alert-dismissible fade show position-fixed top-50 start-50 translate-middle p-4"
     role="alert"
     style="z-index: 9999; min-width: 600px;">
    @TempData["Message"]
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>

    <script>
        setTimeout(() => {
            const el = document.getElementById('appAlert');
            if (el) {
                el.classList.remove('show');
                setTimeout(() => el.remove(), 500);
            }
        }, 3000);
    </script>
}
