const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    if (process.env.NODE_ENV === 'test' || !process.env.NEON_DATABASE_URL) {
      // Use mock for testing
      this.sql = this.mockSql;
    } else {
      this.sql = neon(process.env.NEON_DATABASE_URL);
    }
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