1. Model (Update your ViewModel)
csharppublic class YourFormViewModel
{
    public bool MultiEmails { get; set; }
    public List<string> Emails { get; set; } = new List<string> { "" };
    
    // ... other properties
}


RAZOR ( View ) 

@model YourFormViewModel

<form asp-action="YourAction" method="post" id="yourForm">
    
    <!-- Multi Emails Checkbox -->
    <div class="form-group">
        <label>
            <input type="checkbox" id="multiEmailsCheckbox" asp-for="MultiEmails" />
            Multi Emails
        </label>
    </div>

    <!-- Email Fields Container -->
    <div id="emailFieldsContainer">
        <div class="form-group email-field-group" data-index="0">
            <label for="Emails_0">Email</label>
            <div class="input-group">
                <input type="email" class="form-control" name="Emails[0]" id="Emails_0" />
                <div class="input-group-append" style="display: none;" id="buttonGroup_0">
                    <button type="button" class="btn btn-success btn-add-email" data-index="0">+</button>
                </div>
            </div>
            <span asp-validation-for="Emails[0]" class="text-danger"></span>
        </div>
    </div>

    <button type="submit" class="btn btn-primary">Submit</button>
</form>

@section Scripts {
    <script>
        let emailCount = 1;

        document.addEventListener('DOMContentLoaded', function() {
            const multiEmailsCheckbox = document.getElementById('multiEmailsCheckbox');
            const emailFieldsContainer = document.getElementById('emailFieldsContainer');
            const buttonGroup0 = document.getElementById('buttonGroup_0');

            // Toggle + button visibility based on checkbox
            multiEmailsCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    buttonGroup0.style.display = 'block';
                } else {
                    buttonGroup0.style.display = 'none';
                    // Remove all additional email fields
                    const additionalFields = emailFieldsContainer.querySelectorAll('.email-field-group:not([data-index="0"])');
                    additionalFields.forEach(field => field.remove());
                    emailCount = 1;
                }
            });

            // Event delegation for add and remove buttons
            emailFieldsContainer.addEventListener('click', function(e) {
                // Add email field
                if (e.target.classList.contains('btn-add-email')) {
                    const currentIndex = e.target.getAttribute('data-index');
                    const newIndex = emailCount;
                    
                    const newFieldHTML = `
                        <div class="form-group email-field-group" data-index="${newIndex}">
                            <label for="Emails_${newIndex}">Email ${newIndex + 1}</label>
                            <div class="input-group">
                                <input type="email" class="form-control" name="Emails[${newIndex}]" id="Emails_${newIndex}" />
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-success btn-add-email" data-index="${newIndex}">+</button>
                                    <button type="button" class="btn btn-danger btn-remove-email" data-index="${newIndex}">-</button>
                                </div>
                            </div>
                            <span class="text-danger"></span>
                        </div>
                    `;
                    
                    emailFieldsContainer.insertAdjacentHTML('beforeend', newFieldHTML);
                    emailCount++;
                }
                
                // Remove email field
                if (e.target.classList.contains('btn-remove-email')) {
                    const currentIndex = e.target.getAttribute('data-index');
                    const fieldToRemove = emailFieldsContainer.querySelector(`.email-field-group[data-index="${currentIndex}"]`);
                    if (fieldToRemove) {
                        fieldToRemove.remove();
                    }
                }
            });
        });
    </script>
}



CONTROLLER 



[HttpPost]
public IActionResult YourAction(YourFormViewModel model)
{
    if (ModelState.IsValid)
    {
        if (model.MultiEmails)
        {
            // Filter out empty emails
            var validEmails = model.Emails.Where(e => !string.IsNullOrWhiteSpace(e)).ToList();
            
            // Process your emails
            foreach (var email in validEmails)
            {
                // Your logic here
            }
        }
        else
        {
            // Single email logic
            var email = model.Emails.FirstOrDefault();
            // Your logic here
        }
        
        return RedirectToAction("Success");
    }
    
    return View(model);
}




CSS

 .email-field-group {
    margin-bottom: 15px;
}

.input-group {
    display: flex;
    align-items: center;
}

.input-group input {
    flex: 1;
}

.input-group-append {
    display: flex;
    margin-left: 5px;
    gap: 5px;
}

.btn-add-email, .btn-remove-email {
    padding: 0.375rem 0.75rem;
}
