@{
    ViewData["Title"] = "Your Page Title";
}

<!-- 
    container: Creates a centered wrapper with responsive padding on left/right
    py-4: Adds padding on top and bottom (y-axis). The "4" is a spacing unit in Bootstrap
-->
<div class="container py-4">

    <!-- 
        row: Creates a horizontal group that contains columns
        justify-content-center: Centers the columns horizontally within the row
    -->
    <div class="row justify-content-center">
    
        <!-- 
            col-12: On extra small/small screens (phones), take full width (12 out of 12 columns)
            col-md-8: On medium screens (tablets), take 8 out of 12 columns (66% width)
            col-lg-6: On large screens (desktops), take 6 out of 12 columns (50% width)
            This makes the form narrower on larger screens for better readability
        -->
        <div class="col-12 col-md-8 col-lg-6">
            
            <!-- 
                card: Creates a bordered box/panel with rounded corners
                shadow-sm: Adds a subtle shadow effect underneath the card
            -->
            <div class="card shadow-sm">
            
                <!-- 
                    card-header: Creates a styled header section at the top of the card
                    Typically has a slightly different background color
                -->
                <div class="card-header">
                
                    <!-- 
                        mb-0: Sets margin-bottom to 0 (removes default heading margin)
                        This prevents extra space below the heading inside the header
                    -->
                    <h4 class="mb-0">Form Title</h4>
                </div>
                
                <!-- 
                    card-body: Creates the main content area of the card
                    Adds padding inside the card for the form elements
                -->
                <div class="card-body">
                    
                    <!-- 
                        asp-action: Razor tag helper that sets the form's action URL
                        method="post": Form will submit data using HTTP POST method
                    -->
                    <form asp-action="YourAction" method="post">
                        
                        <!-- 
                            mb-3: Adds margin-bottom with spacing unit 3
                            This creates consistent vertical spacing between form fields
                        -->
                        <div class="mb-3">
                        
                            <!-- 
                                asp-for: Razor tag helper that binds label to the model property
                                form-label: Bootstrap class that styles the label text
                            -->
                            <label asp-for="Name" class="form-label">Name</label>
                            
                            <!-- 
                                asp-for: Binds this input to the "Name" property in your model
                                form-control: Bootstrap class that styles text inputs
                                Gives the input full width, proper padding, borders, and focus effects
                            -->
                            <input asp-for="Name" class="form-control" placeholder="Enter your name" />
                            
                            <!-- 
                                asp-validation-for: Displays validation error messages for this field
                                text-danger: Bootstrap class that makes the text red for errors
                            -->
                            <span asp-validation-for="Name" class="text-danger"></span>
                        </div>
                        
                        <!-- 
                            Another form group with mb-3 for consistent spacing
                        -->
                        <div class="mb-3">
                        
                            <!-- 
                                form-label: Consistent label styling across the form
                            -->
                            <label asp-for="Email" class="form-label">Email</label>
                            
                            <!-- 
                                type="email": HTML5 input type for email validation
                                form-control: Same Bootstrap styling as other inputs
                            -->
                            <input asp-for="Email" type="email" class="form-control" placeholder="Enter your email" />
                            
                            <!-- 
                                Validation message display for email field
                            -->
                            <span asp-validation-for="Email" class="text-danger"></span>
                        </div>
                        
                        <!-- 
                            Form group for the select dropdown
                        -->
                        <div class="mb-3">
                        
                            <!-- 
                                Label for the dropdown, bound to CategoryId property
                            -->
                            <label asp-for="CategoryId" class="form-label">Select Category</label>
                            
                            <!-- 
                                asp-for: Binds selected value to CategoryId property in your model
                                asp-items: Populates dropdown options from Model.Categories (a SelectList)
                                form-select: Bootstrap class specifically for styling <select> elements
                                Gives the dropdown proper styling, arrow icon, and focus effects
                            -->
                            <select asp-for="CategoryId" asp-items="Model.Categories" class="form-select">
                            
                                <!-- 
                                    Default placeholder option with empty value
                                    This shows when no selection has been made
                                -->
                                <option value="">-- Select an option --</option>
                            </select>
                            
                            <!-- 
                                Validation error display for the dropdown
                            -->
                            <span asp-validation-for="CategoryId" class="text-danger"></span>
                        </div>
                        
                        <!-- 
                            Another select dropdown example with static/hardcoded options
                        -->
                        <div class="mb-3">
                        
                            <!-- 
                                for="status": Standard HTML attribute linking label to input by id
                                (Used when not using Razor model binding)
                            -->
                            <label for="status" class="form-label">Status</label>
                            
                            <!-- 
                                id and name: Standard HTML attributes for form submission
                                form-select: Bootstrap styling for select elements
                            -->
                            <select id="status" name="Status" class="form-select">
                            
                                <!-- 
                                    Static options - these are hardcoded in the HTML
                                    value="": Empty value for the placeholder option
                                -->
                                <option value="">-- Choose status --</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        
                        <!-- 
                            d-grid: Makes this div a CSS grid container (for stacking buttons on mobile)
                            gap-2: Adds gap/spacing between grid items
                            d-md-flex: On medium screens and up, switches to flexbox layout (side by side)
                            justify-content-md-end: On medium screens and up, aligns buttons to the right
                        -->
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        
                            <!-- 
                                asp-action="Index": Links back to the Index action
                                btn: Base Bootstrap button class (required for all buttons)
                                btn-outline-secondary: Gray outlined button style (not filled)
                            -->
                            <a asp-action="Index" class="btn btn-outline-secondary">Cancel</a>
                            
                            <!-- 
                                type="submit": Makes this button submit the form
                                btn: Base Bootstrap button class
                                btn-primary: Primary colored button (usually blue, filled)
                            -->
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </div>
                        
                    </form>
                    
                </div>
            </div>
            
        </div>
    </div>
</div>

<!-- 
    @section Scripts: Razor section that injects content into the Scripts section of your layout
    This ensures validation scripts load at the bottom of the page
-->
@section Scripts {
    <!-- 
        Renders the partial view containing jQuery validation scripts
        Required for client-side form validation to work
    -->
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
}
