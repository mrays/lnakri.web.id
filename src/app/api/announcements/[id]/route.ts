import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

type AnnPayload = {
  title: string;
  content: string;
  priority: 'urgent' | 'penting' | 'info';
  active?: boolean;
};

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as AnnPayload;

    const pool = getMysqlPool();

    // If payload has only 'active', it's a toggle.
    // If it has title/content, it's a full update.
    
    if (payload.title && payload.content) {
      await pool.query(
        `UPDATE announcements
         SET title = ?, content = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          payload.title,
          payload.content,
          payload.priority,
          Number(id),
        ]
      );
    } else if (payload.active !== undefined) {
      await pool.query(
        `UPDATE announcements
         SET is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          payload.active ? 1 : 0,
          Number(id),
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui data pengumuman.', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const pool = getMysqlPool();
    await pool.query('DELETE FROM announcements WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus data pengumuman.', error: String(error) }, { status: 500 });
  }
}
