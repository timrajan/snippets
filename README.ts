 function toggleRadioButtons() {
        var role = document.getElementById('Role').value;
        var radioSection = document.getElementById('radioSection');
        
        if (role === 'admin') {
            radioSection.style.display = 'none';
        } else {
            radioSection.style.display = 'block';
        }
    }
    
    // Check on page load
    window.onload = function() {
        toggleRadioButtons();
    };
