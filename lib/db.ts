import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sikat_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    });
  }
  return pool;
}

// Test database connection
export async function testConnection() {
  try {
    const connection = getConnection();
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const connection = getConnection();
    
    // Handle SELECT queries
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      const [rows] = await connection.execute(query, params);
      return rows;
    }
    
    // Handle INSERT, UPDATE, DELETE queries
    const [result] = await connection.execute(query, params);
    const resultInfo = result as mysql.ResultSetHeader;
    
    // For INSERT queries, return the inserted row
    if (query.trim().toUpperCase().startsWith('INSERT')) {
      return { insertId: resultInfo.insertId, affectedRows: resultInfo.affectedRows };
    }
    
    return { affectedRows: resultInfo.affectedRows };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
