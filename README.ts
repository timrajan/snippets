public async Task<JsonResult> GetNextId()
{
    int nextId, nextCode;
    var conn = _context.Database.GetDbConnection();
    await conn.OpenAsync();
    try
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT nextval(pg_get_serial_sequence('users', 'id')) AS new_id,
                   nextval('table_name_code_seq')                AS new_code;";

        using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync();

        nextId   = reader.GetInt32(0);
        nextCode = reader.GetInt32(1);
    }
    finally
    {
        await conn.CloseAsync();
    }

    return Json(new { id = nextId, code = nextCode });
}


function launchForm() {
    fetch('/User/GetNextId')
        .then(response => response.json())
        .then(data => {
            document.getElementById('userIdField').value = data.id;
            document.getElementById('codeField').value = data.code;
        })
        .catch(error => console.error('Error:', error));
}
