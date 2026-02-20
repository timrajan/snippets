public int RowFunc(string tableName)
{
    var count = _context.Database
        .SqlQueryRaw<int>($"SELECT COUNT(*) FROM \"{tableName}\"")
        .AsEnumerable()
        .First();
    return count - 1;
}

public int PrevRowFunc(string tableName)
{
    var count = _context.Database
        .SqlQueryRaw<int>($"SELECT COUNT(*) FROM \"{tableName}\"")
        .AsEnumerable()
        .First();
    return count - 2;
}
