const { neon } = require('@neondatabase/serverless');

class DatabaseConnection {
  constructor() {
    this._sql = null;
  }

  get sql() {
    // Lazy initialization for serverless environments
    if (!this._sql) {
      if (process.env.NODE_ENV === 'test' || !process.env.NEON_DATABASE_URL) {
        // Use mock for testing
        this._sql = this.mockSql;
      } else {
        this._sql = neon(process.env.NEON_DATABASE_URL);
      }
    }
    return this._sql;
  }

  async mockSql(strings, ...values) {
    // Handle template literal syntax (sql`query`) and regular function calls
    const query = Array.isArray(strings) ? strings.join('') : strings;
    const params = Array.isArray(strings) ? values : (values.length > 0 ? values : []);
    
    console.log('Mock SQL:', query, params);
    
    // Return appropriate mock data based on query
    if (query.includes('COUNT(*)')) {
      return [{ count: 0 }];
    } else if (query.includes('SELECT 1')) {
      return [{ test: 1 }];
    } else if (query.includes('SELECT id, file_name')) {
      return []; // Empty array for test files
    } else {
      return [];
    }
  }

  async query(text, params = []) {
    try {
      const result = await this.sql(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      if (process.env.NODE_ENV === 'test') {
        return true;
      }
      const result = await this.sql`SELECT 1 as test`;
      return result && result.length > 0;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

module.exports = new DatabaseConnection();