@{
    var role = ViewBag.Role ?? "SuperAdmin";
    var studentRole = ViewBag.StudentRole as string;
    ViewData["Title"] = role == "Student" ? "Student - Home Page" :
                        role == "TeamAdmin" ? "Team Admin - Home Page" :
                        "Super Admin - Home Page";
}

<style>
    .home-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        padding: 40px;
    }

    .cards-container {
        display: flex;
        gap: 80px;
        align-items: center;
        justify-content: center;
    }

    .record-card {
        background-color: #4054B5;
        border: none;
        border-radius: 30px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 350px;
        height: 250px;
    }

    .record-card:hover {
        transform: translateY(-5px);
        background-color: #2f3f8f;
        box-shadow: 0 10px 30px rgba(64, 84, 181, 0.4);
        color: white;
        text-decoration: none;
    }

    .record-card h2 {
        font-size: 28px;
        font-weight: 600;
        margin: 0;
        color: white;
    }

    .record-card.disabled {
        background-color: #cccccc;
        cursor: not-allowed;
        pointer-events: none;
    }

    .record-card.disabled:hover {
        transform: none;
        background-color: #cccccc;
        box-shadow: none;
    }
</style>

<!-- Main Content -->
<div class="home-container">
    <div class="cards-container">
        @if (studentRole == "Creator")
        {
            <a href="/StudyRecord/Index" class="record-card">
                <h2>Study Record</h2>
            </a>
        }
        else if (studentRole == "Viewer")
        {
            <a href="#" class="record-card disabled">
                <h2>Study Record</h2>
            </a>
        }
        else
        {
            <!-- For SuperAdmin and TeamAdmin -->
            <a href="/StudyRecord/Index" class="record-card">
                <h2>Study Record</h2>
            </a>
        }

        <a href="/SportsRecord/Index" class="record-card disabled">
            <h2>Sports Record</h2>
        </a>
    </div>
</div>
