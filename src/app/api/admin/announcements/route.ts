import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT id, title, content, priority, is_active, published_at, created_at
       FROM announcements
       ORDER BY COALESCE(published_at, created_at) DESC`
    );

    const announcements = (rows as any[]).map((row) => ({
      id: String(row.id),
      title: row.title,
      content: row.content,
      priority: row.priority,
      active: Boolean(row.is_active),
      publishedAt: row.published_at,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memuat pengumuman.', error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const pool = getMysqlPool();
    const now = new Date();

    const [result] = await pool.query<any>(
      `INSERT INTO announcements (title, content, priority, is_active, published_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payload.title,
        payload.content,
        payload.priority || 'info',
        payload.active === false ? 0 : 1,
        now,
      ]
    );

    return NextResponse.json({ id: String(result.insertId) });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal membuat pengumuman.', error: String(error) }, { status: 500 });
  }
}
