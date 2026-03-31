@{
    ViewData["Title"] = "Before You Begin";
}

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">

            <!-- Header Card -->
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h3 class="mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Important Information
                    </h3>
                </div>

                <div class="card-body">
                    <p class="lead">
                        Please read the following information carefully before proceeding with your application.
                    </p>

                    <hr />

                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                            <i class="bi bi-check-circle text-success me-2"></i>
                            Ensure all your personal details are up to date before filling in the forms.
                        </li>
                        <li class="list-group-item">
                            <i class="bi bi-check-circle text-success me-2"></i>
                            You will need to provide a valid government-issued ID number in the next step.
                        </li>
                        <li class="list-group-item">
                            <i class="bi bi-check-circle text-success me-2"></i>
                            All fields marked with an asterisk (*) are mandatory and must be completed.
                        </li>
                        <li class="list-group-item">
                            <i class="bi bi-check-circle text-success me-2"></i>
                            Your information is kept secure and will not be shared with third parties.
                        </li>
                        <li class="list-group-item">
                            <i class="bi bi-check-circle text-success me-2"></i>
                            Once submitted, changes cannot be made without contacting the administrator.
                        </li>
                    </ul>

                    <div class="alert alert-warning mt-4" role="alert">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Note:</strong> This process cannot be saved midway. Please ensure you have all required information ready before continuing.
                    </div>

                </div>

                <div class="card-footer text-end">
                    <a asp-controller="YourController" asp-action="FirstForm" class="btn btn-primary px-4">
                        Continue <i class="bi bi-arrow-right ms-1"></i>
                    </a>
                </div>
            </div>

        </div>
    </div>
</div>
