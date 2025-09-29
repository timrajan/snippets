 conn.Open();
    
    using (var cmd = new NpgsqlCommand())
    {
        cmd.Connection = conn;
        cmd.CommandText = "UPDATE student SET email = @email, status = @status WHERE id = @id";
        
        cmd.Parameters.AddWithValue("@email", "tim@gmail.com");
        cmd.Parameters.AddWithValue("@status", "active");
        cmd.Parameters.AddWithValue("@id", 123);
        
        int rowsAffected = cmd.ExecuteNonQuery();
        Console.WriteLine($"{rowsAffected} row(s) updated");
    }
