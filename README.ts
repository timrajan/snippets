<div id="appAlert"
     class="alert alert-@msgType alert-dismissible fade show position-fixed start-50 translate-middle p-4"
     role="alert"
     style="z-index: 9999; min-width: 800px; top: 75%; background-color: #28a745; color: white; border: none;">
    @TempData["Message"]
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
