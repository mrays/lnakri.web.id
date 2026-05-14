import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

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

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) return `${interval} tahun lalu`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} bulan lalu`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} hari lalu`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} jam lalu`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} menit lalu`;

  return `${Math.floor(seconds)} detik lalu`;
}

function currentJakartaMonthStart() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value || '2026';
  const month = parts.find((part) => part.type === 'month')?.value || '01';

  return `${year}-${month}-01`;
}

export async function GET() {
  try {
    await ensureAnalyticsTables();

    const pool = getMysqlPool();
    const [[totalComplaints]] = await pool.query<any[]>(
      'SELECT COUNT(*) as count FROM case_requests'
    );
    const [[diprosesComplaints]] = await pool.query<any[]>(
      "SELECT COUNT(*) as count FROM case_requests WHERE status = 'diproses'"
    );
    const [[selesaiComplaints]] = await pool.query<any[]>(
      "SELECT COUNT(*) as count FROM case_requests WHERE status = 'selesai'"
    );
    const [[totalNews]] = await pool.query<any[]>(
      "SELECT COUNT(*) as count FROM news_posts WHERE status = 'published'"
    );
    const [[mbgComplaints]] = await pool.query<any[]>(
      "SELECT COUNT(*) as count FROM case_requests WHERE request_type = 'mbg'"
    );
    const [[monthlyVisit]] = await pool.query<any[]>(
      `SELECT visits
       FROM site_visit_snapshots
       WHERE granularity = 'monthly' AND period_date = ?
       LIMIT 1`,
      [currentJakartaMonthStart()]
    );
    const [[uniqueVisitors]] = await pool.query<any[]>(
      `SELECT COUNT(DISTINCT visitor_hash) as count
       FROM site_visit_daily_visitors
       WHERE period_date >= ?`,
      [currentJakartaMonthStart()]
    );

    const [recentComplaints] = await pool.query<any[]>(
      `SELECT id, reporter_name as name, subject, status, created_at
       FROM case_requests
       ORDER BY created_at DESC
       LIMIT 4`
    );
    const [recentNews] = await pool.query<any[]>(
      `SELECT id, title, author_name as author, created_at, views_count as views
       FROM news_posts
       WHERE status = 'published'
       ORDER BY created_at DESC
       LIMIT 4`
    );
    const [dailyVisits] = await pool.query<any[]>(
      `SELECT period_label as day, visits
       FROM site_visit_snapshots
       WHERE granularity = 'daily'
       ORDER BY period_date DESC
       LIMIT 7`
    );
    const [monthlyVisits] = await pool.query<any[]>(
      `SELECT period_label as month, visits
       FROM site_visit_snapshots
       WHERE granularity = 'monthly'
       ORDER BY period_date DESC
       LIMIT 12`
    );
    const [yearlyVisits] = await pool.query<any[]>(
      `SELECT period_label as year, visits
       FROM site_visit_snapshots
       WHERE granularity = 'yearly'
       ORDER BY period_date DESC
       LIMIT 7`
    );
    const [topPages] = await pool.query<any[]>(
      `SELECT path, COALESCE(MAX(title), path) as title, SUM(visits) as visits, SUM(unique_visitors) as uniqueVisitors
       FROM site_visit_page_snapshots
       WHERE period_date >= ?
       GROUP BY path
       ORDER BY visits DESC
       LIMIT 5`,
      [currentJakartaMonthStart()]
    );

    return NextResponse.json({
      totalComplaints: Number(totalComplaints.count || 0),
      diprosesComplaints: Number(diprosesComplaints.count || 0),
      selesaiComplaints: Number(selesaiComplaints.count || 0),
      totalNews: Number(totalNews.count || 0),
      mbgComplaints: Number(mbgComplaints.count || 0),
      visits: Number(monthlyVisit?.visits || 0),
      uniqueVisitors: Number(uniqueVisitors.count || 0),
      visitsData: {
        daily: dailyVisits
          .reverse()
          .map((row: any) => ({ day: row.day, visits: Number(row.visits) })),
        monthly: monthlyVisits
          .reverse()
          .map((row: any) => ({ month: row.month, visits: Number(row.visits) })),
        yearly: yearlyVisits
          .reverse()
          .map((row: any) => ({ year: row.year, visits: Number(row.visits) })),
      },
      topPages: topPages.map((row: any) => ({
        path: row.path,
        title: row.title,
        visits: Number(row.visits || 0),
        uniqueVisitors: Number(row.uniqueVisitors || 0),
      })),
      recentComplaints: recentComplaints.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        subject: item.subject,
        status: item.status,
        time: getTimeAgo(new Date(item.created_at)),
      })),
      recentNews: recentNews.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        author: item.author,
        date: new Date(item.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        views: Number(item.views || 0),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
