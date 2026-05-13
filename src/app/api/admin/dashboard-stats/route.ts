import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMysqlPool();
    
    // 1. Total Keluhan Masuk
    const [totalComplaints]: any = await pool.query(`SELECT COUNT(*) as count FROM case_requests`);
    
    // 2. Sedang Diproses
    const [diprosesComplaints]: any = await pool.query(`SELECT COUNT(*) as count FROM case_requests WHERE status = 'diproses'`);
    
    // 3. Keluhan Selesai
    const [selesaiComplaints]: any = await pool.query(`SELECT COUNT(*) as count FROM case_requests WHERE status = 'selesai'`);
    
    // 4. Berita Dipublikasikan
    const [totalNews]: any = await pool.query(`SELECT COUNT(*) as count FROM news_posts WHERE status = 'published'`);
    
    // 5. Laporan MBG Masuk
    const [mbgComplaints]: any = await pool.query(`SELECT COUNT(*) as count FROM case_requests WHERE request_type = 'mbg'`);

    // 6. Recent Complaints (4 items)
    const [recentComplaints]: any = await pool.query(
      `SELECT id, reporter_name as name, subject, status, created_at FROM case_requests ORDER BY created_at DESC LIMIT 4`
    );

    // 7. Recent News (4 items)
    const [recentNews]: any = await pool.query(
      `SELECT id, title, author_name as author, created_at, views_count as views FROM news_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 4`
    );

    // Format dates for recent items
    const formattedComplaints = recentComplaints.map((c: any) => ({
      id: String(c.id),
      name: c.name,
      subject: c.subject,
      status: c.status,
      time: getTimeAgo(new Date(c.created_at))
    }));

    const formattedNews = recentNews.map((n: any) => ({
      id: String(n.id),
      title: n.title,
      author: n.author,
      date: new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      views: n.views
    }));

    return NextResponse.json({
      totalComplaints: totalComplaints[0].count,
      diprosesComplaints: diprosesComplaints[0].count,
      selesaiComplaints: selesaiComplaints[0].count,
      totalNews: totalNews[0].count,
      mbgComplaints: mbgComplaints[0].count,
      visits: 6341, // Mock value for now
      recentComplaints: formattedComplaints,
      recentNews: formattedNews
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " tahun lalu";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " bulan lalu";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " hari lalu";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " jam lalu";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " menit lalu";
  return Math.floor(seconds) + " detik lalu";
}
