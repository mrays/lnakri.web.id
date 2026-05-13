import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createConnection } from 'mysql2/promise';

function getConnectionConfig(databaseUrl) {
  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get('ssl-mode') || url.searchParams.get('sslMode');

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '') || 'defaultdb',
    multipleStatements: true,
    ssl: sslMode && sslMode.toUpperCase() === 'REQUIRED' ? { rejectUnauthorized: false } : undefined,
  };
}

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
if (!databaseUrl) {
  throw new Error('Set DATABASE_URL or MYSQL_URL before running this script.');
}

const schemaPath = path.join(process.cwd(), 'database', 'lnakri_schema.sql');
const schema = await fs.readFile(schemaPath, 'utf8');
const connection = await createConnection(getConnectionConfig(databaseUrl));

try {
  await connection.query(schema);
  console.log(`Applied schema from ${schemaPath}`);
} finally {
  await connection.end();
}