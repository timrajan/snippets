@{
    var role = ViewBag.Role ?? "TeamAdmin";
}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - StudentManagement</title>
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
    <link rel="stylesheet" href="~/StudentManagement.styles.css" asp-append-version="true" />
    <style>
        html, body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            min-height: 100vh;
            width: 100%;
        }

        body {
            display: flex;
            flex-direction: column;
            min-width: 100%;
        }

        .top-nav {
            background-color: #2E2B5F;
            padding: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            min-width: 100%;
        }

        .top-nav .container-fluid {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .nav-menu {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            gap: 30px;
        }

        .user-info {
            color: white;
            font-size: 14px;
            white-space: nowrap;
        }

        .nav-menu li {
            display: inline-block;
        }

        .nav-menu a {
            color: white;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            transition: opacity 0.3s;
        }

        .nav-menu a:hover {
            opacity: 0.8;
        }

        .header-banner {
            background: linear-gradient(135deg, #4054B5 0%, #5B6FD8 100%);
            height: 100px;
            width: 100%;
            min-width: 100%;
        }

        .main-content {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
            flex: 1;
            width: 100%;
            min-width: fit-content;
        }

        .back-button {
            background-color: white;
            color: #000;
            border: 2px solid #000;
            border-radius: 25px;
            padding: 10px 30px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-block;
            text-decoration: none;
            margin-bottom: 20px;
        }

        .back-button:hover {
            background-color: #000;
            color: white;
        }

        footer {
            background-color: #2E2B5F;
            color: white;
            padding: 20px 0;
            margin-top: auto;
            font-size: 14px;
            width: 100%;
            min-width: 100%;
        }

        footer .container-fluid {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        footer p {
            margin: 0;
        }

        .footer-left {
            text-align: left;
            white-space: nowrap;
        }

        .footer-right {
            white-space: nowrap;
        }

        footer a {
            color: #5B6FD8;
            text-decoration: none;
        }

        footer a:hover {
            text-decoration: underline;
        }

        .credits-link {
            color: white;
            text-decoration: underline;
            cursor: pointer;
            margin-left: 10px;
        }

        .credits-link:hover {
            opacity: 0.8;
        }

        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: flex-start;
            padding-top: 12.5vh;
        }

        .modal-overlay.active {
            display: flex;
        }

        .credits-dialog {
            background-color: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 30px 80px;
            width: 600px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .credits-dialog h2 {
            margin: 0 0 30px 0;
            font-size: 32px;
            font-weight: bold;
            color: #000;
        }

        .credits-dialog ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .credits-dialog li {
            font-size: 18px;
            color: #000;
            margin: 5px 0;
            padding-left: 0;
        }

        .dialog-footer {
            margin-top: 30px;
            text-align: right;
        }

        .ok-button {
            background-color: #4054B5;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 35px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }

        .ok-button:hover {
            background-color: #2E2B5F;
        }
    </style>
</head>
<body>
    <header>
        <nav class="top-nav">
            <div class="container-fluid">
                <ul class="nav-menu">
                    <li><a asp-controller="Home" asp-action="Index">Home</a></li>
                    @if (role == "SuperAdmin")
                    {
                        <li><a asp-controller="Team" asp-action="Index">Teams Management</a></li>
                        <li><a asp-controller="Student" asp-action="Index">User Management</a></li>
                    }
                    else if (role == "TeamAdmin")
                    {
                        <li><a asp-controller="Team" asp-action="Index">Team Management</a></li>
                    }
                </ul>
                <div class="user-info">
                    You are logged in as <strong>@ViewBag.Username</strong>
                </div>
            </div>
        </nav>
        <div class="header-banner"></div>
    </header>

    <div class="main-content">
        @if (ViewContext.RouteData.Values["controller"]?.ToString() != "Home" ||
             ViewContext.RouteData.Values["action"]?.ToString() != "Index")
        {
            <button onclick="history.back()" class="back-button">← Back</button>
        }
        <main role="main">
            @RenderBody()
        </main>
    </div>

    <footer>
        <div class="container-fluid">
            <div class="footer-left">
                <p>&copy; @DateTime.Now.Year Student Management System. All rights reserved.</p>
            </div>
            <div class="footer-right">
                <p>
                    <a href="#" class="credits-link" onclick="openCreditsDialog(event)">Credits</a>
                    <span style="margin: 0 15px;">|</span>
                    Designed for educational purposes
                </p>
            </div>
        </div>
    </footer>

    <!-- Credits Dialog -->
    <div id="creditsModal" class="modal-overlay" onclick="closeCreditsDialog(event)">
        <div class="credits-dialog" onclick="event.stopPropagation()">
            <h2>Credits</h2>
            <ul>
                <li>Elon Musk</li>
                <li>Mark Zuckerberg</li>
                <li>George Bush</li>
                <li>Vatherine Homes</li>
            </ul>
            <div class="dialog-footer">
                <button class="ok-button" onclick="closeCreditsDialog(event)">OK</button>
            </div>
        </div>
    </div>

    <script src="~/lib/jquery/dist/jquery.min.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>

    <script>
        function openCreditsDialog(event) {
            event.preventDefault();
            document.getElementById('creditsModal').classList.add('active');
        }

        function closeCreditsDialog(event) {
            document.getElementById('creditsModal').classList.remove('active');
        }
    </script>

    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
