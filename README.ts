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
        
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
        }
        
        .form-container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 600px;
        }
        
        .team-info-box {
            background-color: #E8F5E9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 4px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
            font-size: 15px;
        }
        
        .field-description {
            color: #999;
            font-size: 13px;
            margin-bottom: 5px;
        }
        
        input[type="text"],
        input[type="email"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }
        
        input:focus {
            outline: none;
            border-color: #4CAF50;
        }
        
        .required {
            color: red;
        }
        
        .button-group {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        
        .submit-btn {
            background-color: #4CAF50;
            color: white;
            padding: 14px 35px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            flex: 1;
        }
        
        .submit-btn:hover {
            background-color: #45a049;
        }
        
        .cancel-btn {
            background-color: #9E9E9E;
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            text-align: center;
            border-radius: 4px;
            font-size: 16px;
            flex: 1;
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
    <h1>➕ Add Team Admin</h1>
    <p class="subtitle">Add another admin to manage this team</p>
    
    <div class="form-container">
        
        <div class="team-info-box">
            <strong>Team:</strong> @ViewBag.Team.Name<br>
            <strong>Description:</strong> @ViewBag.Team.Description
        </div>
        
        @if (ViewBag.Error != null)
        {
            <div class="error-message">
                ⚠️ @ViewBag.Error
            </div>
        }
        
        <form method="post" action="/Team/AddAdmin?teamId=@ViewBag.Team.Id">
            
            <div class="form-group">
                <label for="adminName">
                    Admin Name <span class="required">*</span>
                </label>
                <div class="field-description">
                    Full name of the new Team Admin
                </div>
                <input type="text" 
                       id="adminName" 
                       name="adminName" 
                       placeholder="e.g., Jane Doe"
                       required 
                       maxlength="100" />
            </div>
            
            <div class="form-group">
                <label for="adminEmail">
                    Admin Email <span class="required">*</span>
                </label>
                <div class="field-description">
                    Email address for the new Team Admin
                </div>
                <input type="email" 
                       id="adminEmail" 
                       name="adminEmail" 
                       placeholder="e.g., jane.doe@school.com"
                       required 
                       maxlength="100" />
            </div>
            
            <div class="button-group">
                <button type="submit" class="submit-btn">
                    ✅ Add Admin
                </button>
                <a href="/Team/Index" class="cancel-btn">
                    ❌ Cancel
                </a>
            </div>
            
        </form>
    </div>
</body>
</html>
