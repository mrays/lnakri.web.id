import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mysql from 'mysql2/promise';

// Guard: disable migration by default to avoid accidental runs
if (process.env.MIGRATE_FOUNDERS !== 'true') {
  console.log('Migration script disabled. Set MIGRATE_FOUNDERS=true to enable.');
  process.exit(0);
}

async function main() {
  const {
    R2_ENDPOINT,
    R2_BUCKET_NAME,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_PUBLIC_URL,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_NAME,
  } = process.env;

  if (!R2_BUCKET_NAME || !R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL) {
    console.error('Missing R2 env variables. Set R2_* in .env');
    process.exit(1);
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });

  let pool;
  if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
    const dbUrl = new URL(process.env.DATABASE_URL || process.env.MYSQL_URL);
    pool = await mysql.createPool({
      host: dbUrl.hostname,
      port: Number(dbUrl.port || 3306),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password || ''),
      database: dbUrl.pathname.replace(/^\//, '') || undefined,
      waitForConnections: true,
      connectionLimit: 5,
    });
  } else {
    pool = await mysql.createPool({
      host: DATABASE_HOST || '127.0.0.1',
      port: Number(DATABASE_PORT || 3306),
      user: DATABASE_USER || 'root',
      password: DATABASE_PASSWORD || '',
      database: DATABASE_NAME || 'lnakri',
      waitForConnections: true,
      connectionLimit: 5,
    });
  }

  const [rows] = await pool.query(
    "SELECT id, photo_url FROM founders WHERE photo_url LIKE '/api/uploads/founders/%' OR photo_url LIKE '/uploads/founders/%'"
  );

  const founders = rows;
  if (!founders || founders.length === 0) {
    console.log('No legacy founder photos to migrate.');
    process.exit(0);
  }

  for (const row of founders) {
    const id = row.id;
    const photoUrl = row.photo_url;
    const base = path.basename(photoUrl);
    const localPath = path.join(process.cwd(), 'public', 'uploads', 'founders', base);
    try {
      const data = await fs.readFile(localPath);
      const key = `founders/${base}`;
      await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, Body: data }));
      const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
      await pool.query('UPDATE founders SET photo_url = ? WHERE id = ?', [publicUrl, id]);
      console.log(`Migrated id=${id} -> ${publicUrl}`);
    } catch (err) {
      console.error(`Failed id=${id} local=${localPath} error=${String(err)}`);
    }
  }

  await pool.end();
  console.log('Migration finished.');
}

main().catch((e) => { console.error(e); process.exit(1); });
