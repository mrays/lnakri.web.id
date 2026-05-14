import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

type TrackPayload = {
  path?: string;
  title?: string;
  referrer?: string;
  visitorId?: string;
};

function jakartaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value || '2026';
  const month = parts.find((part) => part.type === 'month')?.value || '01';
  const day = parts.find((part) => part.type === 'day')?.value || '01';

  return { year, month, day, isoDate: `${year}-${month}-${day}` };
}

function formatLabel(date: Date, granularity: 'daily' | 'monthly' | 'yearly') {
  if (granularity === 'daily') {
    return date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: 'numeric',
    });
  }

  if (granularity === 'monthly') {
    return date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      month: 'short',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
  });
}

function sanitizePath(value: unknown) {
  if (typeof value !== 'string') return '/';

  const path = value.trim().slice(0, 255);
  if (!path.startsWith('/')) return '/';
  if (path.startsWith('/admin-dashboard-content-management-panel')) return null;

  return path;
}

function sanitizeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 255) : fallback;
}

function hashVisitor(visitorId: string, userAgent: string, ipAddress: string) {
  return createHash('sha256').update(`${visitorId}:${userAgent}:${ipAddress}`).digest('hex');
}

async function ensureAnalyticsTables() {
  const pool = getMysqlPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_visit_page_snapshots (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      period_date DATE NOT NULL,
      path VARCHAR(255) NOT NULL,
      title VARCHAR(255) DEFAULT NULL,
      visits INT UNSIGNED NOT NULL DEFAULT 0,
      unique_visitors INT UNSIGNED NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_site_visit_page_period_path (period_date, path),
      KEY idx_site_visit_page_period_visits (period_date, visits)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_visit_daily_visitors (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      period_date DATE NOT NULL,
      visitor_hash CHAR(64) NOT NULL,
      first_path VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_site_visit_daily_visitor (period_date, visitor_hash),
      KEY idx_site_visit_daily_period (period_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function incrementVisitSnapshot(
  granularity: 'daily' | 'monthly' | 'yearly',
  periodLabel: string,
  periodDate: string
) {
  const pool = getMysqlPool();
  const [rows] = await pool.query<any[]>(
    `SELECT id
     FROM site_visit_snapshots
     WHERE granularity = ? AND period_date = ?
     ORDER BY id ASC
     LIMIT 1`,
    [granularity, periodDate]
  );

  if (rows[0]?.id) {
    await pool.query('UPDATE site_visit_snapshots SET visits = visits + 1 WHERE id = ?', [
      rows[0].id,
    ]);
    return;
  }

  await pool.query(
    `INSERT INTO site_visit_snapshots (granularity, period_label, period_date, visits)
     VALUES (?, ?, ?, 1)`,
    [granularity, periodLabel, periodDate]
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TrackPayload;
    const path = sanitizePath(payload.path);

    if (!path) {
      return NextResponse.json({ ok: true });
    }

    await ensureAnalyticsTables();

    const title = sanitizeText(payload.title, path);
    const { year, month, isoDate } = jakartaDateParts();
    const today = new Date(`${isoDate}T00:00:00+07:00`);
    const monthDate = `${year}-${month}-01`;
    const yearDate = `${year}-01-01`;
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const visitorSeed = sanitizeText(payload.visitorId, ipAddress || 'anonymous');
    const visitorHash = hashVisitor(visitorSeed, userAgent, ipAddress);
    const pool = getMysqlPool();

    const [visitorInsert] = await pool.query<any>(
      `INSERT IGNORE INTO site_visit_daily_visitors (period_date, visitor_hash, first_path)
       VALUES (?, ?, ?)`,
      [isoDate, visitorHash, path]
    );
    const isNewDailyVisitor = Number(visitorInsert.affectedRows || 0) > 0;

    await incrementVisitSnapshot('daily', formatLabel(today, 'daily'), isoDate);
    await incrementVisitSnapshot('monthly', formatLabel(today, 'monthly'), monthDate);
    await incrementVisitSnapshot('yearly', formatLabel(today, 'yearly'), yearDate);

    await pool.query(
      `INSERT INTO site_visit_page_snapshots (period_date, path, title, visits, unique_visitors)
       VALUES (?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         visits = visits + 1,
         unique_visitors = unique_visitors + ?`,
      [isoDate, path, title, isNewDailyVisitor ? 1 : 0, isNewDailyVisitor ? 1 : 0]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to track analytics visit:', error);
    return NextResponse.json({ ok: true });
  }
}
