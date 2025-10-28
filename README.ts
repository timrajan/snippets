<!DOCTYPE html>
<html>
<head>
    <title>Add Team Admin</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background-color: #f5f5f5;
        }

        .back-btn {
            background-color: white;
            color: black;
            border: 2px solid black;
            border-radius: 30px;
            padding: 10px 30px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-bottom: 20px;
        }

        .back-btn:hover {
            background-color: #f0f0f0;
        }

        h1 {
            color: #000;
            font-size: 32px;
            margin-bottom: 60px;
        }

        .form-row {
            display: flex;
            align-items: center;
            margin-bottom: 60px;
        }

        label {
            font-size: 18px;
            color: #000;
            width: 200px;
            font-weight: normal;
        }

        input[type="text"] {
            width: 300px;
            padding: 10px;
            border: 1px solid #000;
            font-size: 16px;
            box-sizing: border-box;
        }

        input:focus {
            outline: none;
            border-color: #000;
        }

        .button-group {
            display: flex;
            gap: 20px;
            margin-left: 200px;
        }

        .submit-btn {
            background-color: white;
            color: black;
            border: 2px solid black;
            border-radius: 30px;
            padding: 10px 40px;
            font-size: 16px;
            cursor: pointer;
        }

        .submit-btn:hover {
            background-color: #f0f0f0;
        }

        .cancel-btn {
            background-color: white;
            color: black;
            border: 2px solid black;
            border-radius: 30px;
            padding: 10px 40px;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
            cursor: pointer;
        }

        .cancel-btn:hover {
            background-color: #f0f0f0;
        }

        .error-message {
            background-color: #f44336;
            color: white;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 25px;
        }
    </style>
</head>
<body>
    <a href="/Team/Index" class="back-btn">Back</a>

    <h1>Add Team Admin</h1>

    @if (ViewBag.Error != null)
    {
        <div class="error-message">
            @ViewBag.Error
        </div>
    }

    <form method="post" action="/Team/AddAdmin/@ViewBag.Team.Id">

        <div class="form-row">
            <label for="adminUsername">Admin Username</label>
            <input type="text"
                   id="adminUsername"
                   name="adminUsername"
                   required
                   maxlength="100" />
        </div>

        <div class="button-group">
            <button type="submit" class="submit-btn">submit</button>
            <a href="/Team/Index" class="cancel-btn">Cancel</a>
        </div>

    </form>
</body>
</html>
