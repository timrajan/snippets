try
{
    await _stagingDbContext.SaveChangesAsync();
}
catch (DbUpdateException ex)
{
    // The real error from Postgres is here
    var inner = ex.InnerException;
    Console.WriteLine($"Outer: {ex.Message}");
    Console.WriteLine($"Inner: {inner?.Message}");

    if (inner is Npgsql.PostgresException pgEx)
    {
        Console.WriteLine($"SqlState: {pgEx.SqlState}");
        Console.WriteLine($"Detail: {pgEx.Detail}");
        Console.WriteLine($"Table: {pgEx.TableName}, Column: {pgEx.ColumnName}");
        Console.WriteLine($"Constraint: {pgEx.ConstraintName}");
    }

    // Also dump which entities failed
    foreach (var entry in ex.Entries)
    {
        Console.WriteLine($"Failed entity: {entry.Entity.GetType().Name}, State: {entry.State}");
    }
    throw;
}
