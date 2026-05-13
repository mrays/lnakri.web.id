import mysql, { type Pool } from 'mysql2/promise';

let cachedPool: Pool | null = null;

function createPoolFromUrl(databaseUrl: string): Pool {
  const parsed = new URL(databaseUrl);
  const sslMode = parsed.searchParams.get('ssl-mode') || parsed.searchParams.get('sslMode');

  return mysql.createPool({
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, '') || 'defaultdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: sslMode && sslMode.toUpperCase() === 'REQUIRED' ? { rejectUnauthorized: false } : undefined,
  });
}

export function getMysqlPool(): Pool {
  if (cachedPool) return cachedPool;

  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or MYSQL_URL is not set.');
  }

  cachedPool = createPoolFromUrl(databaseUrl);
  return cachedPool;
}
