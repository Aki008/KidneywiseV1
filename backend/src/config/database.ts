import knex, { Knex } from 'knex';
import knexConfig from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Create database connection
const db: Knex = knex(config);

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    console.log('✓ Database connected successfully');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}

// Close connection
export async function closeConnection(): Promise<void> {
  await db.destroy();
  console.log('Database connection closed');
}

export default db;
