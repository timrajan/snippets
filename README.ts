@model YourNamespace.Models.Student

@{
    ViewBag.Title = "Student Registration - Step 1";
}

<h2>Student Registration - Basic Information</h2>

@using (Html.BeginForm("Register", "Student", FormMethod.Post))
{
    @Html.AntiForgeryToken()
    
    <div class="form-group">
        @Html.LabelFor(m => m.Name)
        @Html.TextBoxFor(m => m.Name, new { @class = "form-control", required = "required" })
    </div>

    <div class="form-group">
        @Html.LabelFor(m => m.Email)
        @Html.TextBoxFor(m => m.Email, new { @class = "form-control", type = "email", required = "required" })
    </div>

    <div class="form-group">
        @Html.LabelFor(m => m.DateOfBirth, "Date of Birth")
        @Html.TextBoxFor(m => m.DateOfBirth, new { @class = "form-control", type = "date", required = "required" })
    </div>

    <!-- Add all your other existing fields here -->

    <button type="submit" class="btn btn-primary">Continue</button>
}



------
@{
    ViewBag.Title = "Student Registration - Previous Addresses & Schools";
}

<h2>Previous Addresses & Schools</h2>
<p>Add all previous addresses and schools. One student record will be created for each pair.</p>

<form id="previousAddressForm" method="post" action="@Url.Action("PreviousAddresses", "Student")">
    @Html.AntiForgeryToken()
    
    <div style="margin-bottom: 20px;">
        <strong>Address & School Pair</strong>
    </div>
    
    <div id="addressSchoolContainer">
        <!-- Pairs will be added by JavaScript -->
    </div>

    <div style="margin-top: 20px;">
        <button type="submit" class="btn btn-success">Submit All Records</button>
    </div>
</form>

<style>
    .address-school-pair {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
        align-items: center;
    }
    
    .field-group {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .field-group label {
        white-space: nowrap;
        font-weight: 500;
        color: #555;
    }
    
    .field-group input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        min-width: 250px;
    }
    
    .btn-add, .btn-remove {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 18px;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
    }
    
    .btn-add {
        background-color: #28a745;
        color: white;
    }
    
    .btn-remove {
        background-color: #dc3545;
        color: white;
    }
    
    .btn-add:hover {
        background-color: #218838;
    }
    
    .btn-remove:hover {
        background-color: #c82333;
    }

    .btn-success {
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }

    .btn-success:hover {
        background-color: #0056b3;
    }
</style>

<script>
    let pairCount = 0;

    function createAddressSchoolPair() {
        const container = document.getElementById('addressSchoolContainer');
        const pairDiv = document.createElement('div');
        pairDiv.className = 'address-school-pair';
        pairDiv.id = 'pair-' + pairCount;

        const addressLabel = pairCount === 0 ? 'Previous Address:' : `Previous Address ${pairCount}:`;
        const schoolLabel = pairCount === 0 ? 'Previous School Name:' : `Previous School Name ${pairCount}:`;

        pairDiv.innerHTML = `
            <div class="field-group">
                <label for="address_${pairCount}">${addressLabel}</label>
                <input type="text" 
                       id="address_${pairCount}"
                       name="addressSchoolPairs[${pairCount}].PreviousAddress" 
                       placeholder="Enter previous address" 
                       required />
            </div>
            <div class="field-group">
                <label for="school_${pairCount}">${schoolLabel}</label>
                <input type="text" 
                       id="school_${pairCount}"
                       name="addressSchoolPairs[${pairCount}].PreviousSchoolName" 
                       placeholder="Enter previous school name" 
                       required />
            </div>
            <button type="button" class="btn-add" onclick="addPair()" title="Add new pair">+</button>
            ${pairCount > 0 ? '<button type="button" class="btn-remove" onclick="removePair(' + pairCount + ')" title="Remove this pair">−</button>' : ''}
        `;

        container.appendChild(pairDiv);
        pairCount++;
    }

    function addPair() {
        createAddressSchoolPair();
    }

    function removePair(index) {
        const pairDiv = document.getElementById('pair-' + index);
        if (pairDiv) {
            pairDiv.remove();
            reindexPairs();
        }
    }

    function reindexPairs() {
        const container = document.getElementById('addressSchoolContainer');
        const pairs = container.querySelectorAll('.address-school-pair');
        
        pairs.forEach((pair, index) => {
            pair.id = 'pair-' + index;
            
            const addressLabel = index === 0 ? 'Previous Address:' : `Previous Address ${index}:`;
            const schoolLabel = index === 0 ? 'Previous School Name:' : `Previous School Name ${index}:`;
            
            // Update address field
            const addressLabelElement = pair.querySelectorAll('label')[0];
            const addressInput = pair.querySelectorAll('input')[0];
            addressLabelElement.textContent = addressLabel;
            addressLabelElement.setAttribute('for', `address_${index}`);
            addressInput.id = `address_${index}`;
            addressInput.name = `addressSchoolPairs[${index}].PreviousAddress`;
            
            // Update school field
            const schoolLabelElement = pair.querySelectorAll('label')[1];
            const schoolInput = pair.querySelectorAll('input')[1];
            schoolLabelElement.textContent = schoolLabel;
            schoolLabelElement.setAttribute('for', `school_${index}`);
            schoolInput.id = `school_${index}`;
            schoolInput.name = `addressSchoolPairs[${index}].PreviousSchoolName`;
            
            // Update remove button
            const removeBtn = pair.querySelector('.btn-remove');
            if (removeBtn) {
                removeBtn.onclick = function() { removePair(index); };
            }
        });
        
        pairCount = pairs.length;
    }

    // Initialize with one default pair on page load
    document.addEventListener('DOMContentLoaded', function() {
        createAddressSchoolPair();
    });
</script>
```

## How It Looks:

**Initial State (First Load):**
```
Address & School Pair

Previous Address: [_____________________________]  Previous School Name: [_____________________]  [+]
```

**After Clicking + Button Once:**
```
Address & School Pair

Previous Address: [_____________________________]  Previous School Name: [_____________________]  [+]
Previous Address 1: [___________________________]  Previous School Name 1: [___________________]  [+] [-]
```

**After Clicking + Button Again:**
```
Address & School Pair

Previous Address: [_____________________________]  Previous School Name: [_____________________]  [+]
Previous Address 1: [___________________________]  Previous School Name 1: [___________________]  [+] [-]
Previous Address 2: [___________________________]  Previous School Name 2: [___________________]  [+] [-]
