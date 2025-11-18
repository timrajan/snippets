 document.addEventListener('DOMContentLoaded', function() {
        var form = document.querySelector('form');
        
        if (form) {
            console.log('Form found!');
            
            form.addEventListener('submit', function(e) {
                console.log('Form submitting to:', this.action);
                console.log('Method:', this.method);
                
                var formData = new FormData(this);
                console.log('Form data:');
                for (var pair of formData.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }
            });
        } else {
            console.log('ERROR: Form not found!');
        }
    });
