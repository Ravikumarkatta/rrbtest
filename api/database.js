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

  async mockSql(text, params = []) {
    // Mock implementation for testing
    console.log('Mock SQL:', text, params);
    return [];
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
      return result.length > 0;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

module.exports = new DatabaseConnection();