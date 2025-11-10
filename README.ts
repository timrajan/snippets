 @if (User.IsInRole("SuperAdmin") || !User.IsInRole("TeamAdmin"))
    {
        <option value="admin">Admin</option>
    }
