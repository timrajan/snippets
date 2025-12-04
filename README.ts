document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    var tooltipList = [...tooltipTriggerList].map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
