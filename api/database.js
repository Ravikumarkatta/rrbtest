const { neon } = require('@neondatabase/serverless');

class DatabaseConnection {
  constructor() {
    this._sql = null;
    this._connectionTested = false;
  }

  get sql() {
    // Lazy initialization for serverless environments
    if (!this._sql) {
      if (process.env.NODE_ENV === 'test') {
        // Use mock for automated tests only
        this._sql = this.mockSql.bind(this);
      } else {
        if (!process.env.NEON_DATABASE_URL) {
          // Fail fast: environment required for DB operations
          throw new Error('NEON_DATABASE_URL is not set. Set this environment variable to your Neon connection string.');
        }
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
      // Ensure connection is tested first
      if (!this._connectionTested && process.env.NODE_ENV !== 'test') {
        console.log('Testing database connection...');
        await this.testConnection();
        this._connectionTested = true;
      }

      // For neon, we need to use the sql function directly with parameters
      let result;
      if (params && params.length > 0) {
        // Use parameterized query
        result = await this.sql(text, params);
      } else {
        // Use template literal for queries without parameters
        result = await this.sql([text]);
      }
      
      console.log(`Query executed: ${text.substring(0, 100)}... with ${params.length} params`);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  }

  async testConnection() {
    try {
      if (process.env.NODE_ENV === 'test') {
        return true;
      }
      
      console.log('Testing database connection with URL:', process.env.NEON_DATABASE_URL ? 'Set' : 'Not set');
      const result = await this.sql`SELECT 1 as test`;
      console.log('Database connection test successful:', result);
      return result && result.length > 0;
    } catch (error) {
      console.error('Database connection test failed:', error);
      console.error('Environment variables:', {
        NEON_DATABASE_URL: process.env.NEON_DATABASE_URL ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV
      });
      return false;
    }
  }
}

module.exports = new DatabaseConnection();