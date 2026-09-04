@{
    var msgType = TempData["MessageType"] as string ?? "success";
    var message = TempData["Message"] as string;
    var bgColour = msgType switch
    {
        "danger"  => "#dc3545",
        "warning" => "#ffc107",
        "info"    => "#0dcaf0",
        _         => "#28a745"
    };
}

@if (!string.IsNullOrEmpty(message))
{
    <div id="appAlert"
         class="alert alert-@msgType alert-dismissible fade show position-fixed start-50 translate-middle p-4"
         role="alert"
         style="z-index: 9999; min-width: 800px; top: 75%; background-color: @bgColour; color: white; border: none;">
        @message
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
    </div>
}
