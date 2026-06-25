public async Task<JsonResult> GetNextId()
{
    int nextId;
    var conn = _context.Database.GetDbConnection();
    await conn.OpenAsync();
    try
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT nextval(pg_get_serial_sequence('users', 'id'));";
        nextId = Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }
    finally
    {
        await conn.CloseAsync();
    }

    return Json(new { id = nextId });
}
