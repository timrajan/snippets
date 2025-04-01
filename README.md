/**
 * A class for building and executing database queries.
 */
class DBQuery {
  private tableName: string;
  private whereConditions: string[] = [];
  private limitRows: number | null = null;

  /**
   * Creates an instance of DBQuery for a specific table.
   *
   * @param {string} tableName - The name of the database table to query.
   */
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Adds a WHERE condition to the query.
   *
   * @param {string} column - The column name to filter on.
   * @param {string} operator - The comparison operator (e.g., '=', '>', '<').
   * @param {string | number} value - The value to compare against.
   *
   * @returns {DBQuery} Returns the current instance for method chaining.
   *
   * @example
   * query.where('age', '>', 25).where('status', '=', 'active');
   */
  public where(column: string, operator: string, value: string | number): DBQuery {
    const condition = `${column} ${operator} '${value}'`;
    this.whereConditions.push(condition);
    return this;
  }

  /**
   * Sets the maximum number of rows to fetch.
   *
   * @param {number} limit - The number of rows to fetch.
   *
   * @returns {DBQuery} Returns the current instance for method chaining.
   *
   * @example
   * query.limit(10);
   */
  public limit(limit: number): DBQuery {
    this.limitRows = limit;
    return this;
  }

  /**
   * Builds the SQL query string based on the provided conditions and limits.
   *
   * @returns {string} The constructed SQL query string.
   */
  private buildQuery(): string {
    let query = `SELECT * FROM ${this.tableName}`;
    
    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.limitRows !== null) {
      query += ` LIMIT ${this.limitRows}`;
    }
    
    return query;
  }

  /**
   * Executes the constructed SQL query and fetches results from the database.
   *
   * @returns {Promise<any[]>} A promise that resolves to an array of results.
   *
   * @example
   * const results = await query.where('age', '>', 25).limit(5).execute();
   */
  public async execute(): Promise<any[]> {
    const sqlQuery = this.buildQuery();
    console.log(`Executing Query: ${sqlQuery}`);
    
    // Simulating database execution. Replace with actual DB logic (e.g., using a library like `pg` for PostgreSQL).
    return new Promise((resolve) => {
      setTimeout(() => resolve([{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Doe" }]), 1000);
    });
  }
}

// Example Usage:
(async () => {
  const query = new DBQuery("users");
  const results = await query
    .where("age", ">", 25)
    .where("status", "=", "active")
    .limit(5)
    .execute();

  console.log(results); // Output simulated results
})();
