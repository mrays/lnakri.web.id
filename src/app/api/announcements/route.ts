import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

type AnnPayload = {
  title: string;
  content: string;
  priority: 'urgent' | 'penting' | 'info';
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT id, title, content, priority, is_active, published_at, created_at
       FROM announcements
       ORDER BY created_at DESC`
    );

    const announcements = (rows as any[]).map((row) => ({
      id: String(row.id),
      title: row.title,
      content: row.content,
      priority: row.priority,
      active: Boolean(row.is_active),
      date: row.published_at ? new Date(row.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    }));

    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data pengumuman.', error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnnPayload;
    if (!payload.title || !payload.content) {
      return NextResponse.json({ message: 'Data wajib belum lengkap.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    const publishedAt = new Date();

    const [insertResult] = await pool.query<any>(
      `INSERT INTO announcements (title, content, priority, is_active, published_at)
       VALUES (?, ?, ?, 1, ?)`,
      [
        payload.title,
        payload.content,
        payload.priority || 'info',
        publishedAt,
      ]
    );

    return NextResponse.json({
      announcement: {
        id: String(insertResult.insertId),
        title: payload.title,
        content: payload.content,
        priority: payload.priority || 'info',
        active: true,
        date: publishedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menambah data pengumuman.', error: String(error) }, { status: 500 });
  }
}
