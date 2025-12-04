document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    var tooltipList = [...tooltipTriggerList].map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});



<span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" data-bs-title="This link is currently disabled">
    <a href="#" class="disabled" aria-disabled="true" tabindex="-1" style="pointer-events: none;">
        Disabled Link
    </a>
</span>
