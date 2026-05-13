import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMysqlPool();

    const [[totals]] = await pool.query<any[]>(
      `SELECT
         COUNT(*) AS totalComplaints,
         SUM(CASE WHEN status = 'diproses' THEN 1 ELSE 0 END) AS inProgress,
         SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS completed,
         SUM(CASE WHEN request_type = 'mbg' THEN 1 ELSE 0 END) AS mbgReports
       FROM case_requests
       WHERE request_type IN ('keluhan', 'mbg', 'bantuan_hukum')`
    );

    const [[newsCount]] = await pool.query<any[]>('SELECT COUNT(*) AS totalNews FROM news_posts WHERE status = \'published\'');
    const [[monthlyVisit]] = await pool.query<any[]>(
      `SELECT visits
       FROM site_visit_snapshots
       WHERE granularity = 'monthly'
       ORDER BY period_date DESC
       LIMIT 1`
    );

    const [recentComplaintsRows] = await pool.query<any[]>(
      `SELECT reporter_name, subject, status, created_at
       FROM case_requests
       WHERE request_type IN ('keluhan', 'mbg', 'bantuan_hukum')
       ORDER BY created_at DESC
       LIMIT 4`
    );

    const [recentNewsRows] = await pool.query<any[]>(
      `SELECT title, author_name, views_count, COALESCE(published_at, created_at) AS published_date
       FROM news_posts
       ORDER BY COALESCE(published_at, created_at) DESC
       LIMIT 4`
    );

    const [visitsRows] = await pool.query<any[]>(
      `SELECT granularity, period_label, visits
       FROM site_visit_snapshots
       ORDER BY period_date ASC, id ASC`
    );

    const visits = {
      daily: visitsRows.filter((r) => r.granularity === 'daily').map((r) => ({ day: r.period_label, visits: Number(r.visits) })),
      monthly: visitsRows.filter((r) => r.granularity === 'monthly').map((r) => ({ month: r.period_label, visits: Number(r.visits) })),
      yearly: visitsRows.filter((r) => r.granularity === 'yearly').map((r) => ({ year: r.period_label, visits: Number(r.visits) })),
    };

    return NextResponse.json({
      kpi: {
        totalComplaints: Number(totals.totalComplaints || 0),
        inProgress: Number(totals.inProgress || 0),
        completed: Number(totals.completed || 0),
        totalNews: Number(newsCount.totalNews || 0),
        monthlyVisits: Number(monthlyVisit?.visits || 0),
        mbgReports: Number(totals.mbgReports || 0),
      },
      recentComplaints: recentComplaintsRows,
      recentNews: recentNewsRows,
      visits,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memuat dashboard.', error: String(error) }, { status: 500 });
  }
}
