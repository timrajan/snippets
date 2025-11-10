<!-- Dropdown -->
<select id="Role" name="Role">
    <option value="">-- Select Role --</option>
    <option value="admin">Admin</option>
    <option value="user">User</option>
    <option value="manager">Manager</option>
</select>

<!-- Radio buttons that hide when Admin is selected -->
<div id="radioSection">
    <label>Select Option:</label>
    <input type="radio" name="Option" value="option1" /> Option 1
    <input type="radio" name="Option" value="option2" /> Option 2
</div>

<script>
    $(document).ready(function() {
        $('#Role').change(function() {
            var selectedRole = $(this).val();
            
            if (selectedRole === 'admin') {
                $('#radioSection').hide(); // Hide radio buttons
            } else {
                $('#radioSection').show(); // Show radio buttons
            }
        });
        
        // Also check on page load in case there's a pre-selected value
        $('#Role').trigger('change');
    });
</script>
