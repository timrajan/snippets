 Microsoft.EntityFrameworkCore.Query[10100]
      An exception occurred while iterating over the results of a query for context type 'ClientDataManagement.Data.AppDbContext'.
      System.OverflowException: Arithmetic operation resulted in an overflow.
         at Npgsql.Internal.Converters.Int8Converter`1.ReadCore(PgReader reader)
         at Npgsql.Internal.PgBufferedConverter`1.Read(PgReader reader)
         at Npgsql.NpgsqlDataReader.GetFieldValueCore[T](Int32 ordinal)
         at Npgsql.NpgsqlDataReader.GetInt32(Int32 ordinal)
         at lambda_method12(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
         at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
      System.OverflowException: Arithmetic operation resulted in an overflow.
         at Npgsql.Internal.Converters.Int8Converter`1.ReadCore(PgReader reader)
         at Npgsql.Internal.PgBufferedConverter`1.Read(PgReader reader)
         at Npgsql.NpgsqlDataReader.GetFieldValueCore[T](Int32 ordinal)
         at Npgsql.NpgsqlDataReader.GetInt32(Int32 ordinal)
         at lambda_method12(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
         at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
