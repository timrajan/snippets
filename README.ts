@model YourNamespace.Models.Student

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h3 class="mb-0">Student Registration Form</h3>
                </div>
                <div class="card-body p-4">
                    <form asp-action="Register" asp-controller="Student" method="post">
                        @Html.AntiForgeryToken()
                        
                        <!-- Text Input -->
                        <div class="mb-3">
                            <label asp-for="Name" class="form-label">Full Name</label>
                            <input asp-for="Name" class="form-control" placeholder="Enter full name" required />
                            <span asp-validation-for="Name" class="text-danger"></span>
                        </div>

                        <!-- Email Input -->
                        <div class="mb-3">
                            <label asp-for="Email" class="form-label">Email Address</label>
                            <input asp-for="Email" type="email" class="form-control" placeholder="name@example.com" required />
                            <span asp-validation-for="Email" class="text-danger"></span>
                        </div>

                        <!-- Date Input -->
                        <div class="mb-3">
                            <label asp-for="DateOfBirth" class="form-label">Date of Birth</label>
                            <input asp-for="DateOfBirth" type="date" class="form-control" required />
                            <span asp-validation-for="DateOfBirth" class="text-danger"></span>
                        </div>

                        <!-- Phone Input -->
                        <div class="mb-3">
                            <label for="phone" class="form-label">Phone Number</label>
                            <input type="tel" class="form-control" id="phone" placeholder="(123) 456-7890" />
                        </div>

                        <!-- Textarea -->
                        <div class="mb-3">
                            <label for="address" class="form-label">Address</label>
                            <textarea class="form-control" id="address" rows="3" placeholder="Enter your address"></textarea>
                        </div>

                        <!-- Select Dropdown -->
                        <div class="mb-3">
                            <label for="grade" class="form-label">Grade</label>
                            <select class="form-select" id="grade">
                                <option selected disabled>Choose grade...</option>
                                <option value="1">Grade 1</option>
                                <option value="2">Grade 2</option>
                                <option value="3">Grade 3</option>
                                <option value="4">Grade 4</option>
                                <option value="5">Grade 5</option>
                            </select>
                        </div>

                        <!-- Radio Buttons -->
                        <div class="mb-3">
                            <label class="form-label">Gender</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="gender" id="male" value="male">
                                <label class="form-check-label" for="male">
                                    Male
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="gender" id="female" value="female">
                                <label class="form-check-label" for="female">
                                    Female
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="gender" id="other" value="other">
                                <label class="form-check-label" for="other">
                                    Other
                                </label>
                            </div>
                        </div>

                        <!-- Checkboxes -->
                        <div class="mb-3">
                            <label class="form-label">Interests</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="sports" value="sports">
                                <label class="form-check-label" for="sports">
                                    Sports
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="music" value="music">
                                <label class="form-check-label" for="music">
                                    Music
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="art" value="art">
                                <label class="form-check-label" for="art">
                                    Art
                                </label>
                            </div>
                        </div>

                        <!-- Switch (Toggle) -->
                        <div class="mb-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="newsletter">
                                <label class="form-check-label" for="newsletter">
                                    Subscribe to newsletter
                                </label>
                            </div>
                        </div>

                        <!-- File Upload -->
                        <div class="mb-3">
                            <label for="photo" class="form-label">Student Photo</label>
                            <input class="form-control" type="file" id="photo">
                        </div>

                        <!-- Submit Button -->
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary btn-lg">
                                Register Student
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
