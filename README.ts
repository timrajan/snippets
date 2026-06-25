// NEW — ask the sequence instead:
var nextId = await _context.Database
    .SqlQueryRaw<int>("SELECT nextval(pg_get_serial_sequence('users', 'id')) AS \"Value\"")
    .SingleAsync();
