import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const now = new Date();
    const pool = getMysqlPool();

    await pool.query(
      `UPDATE news_posts
       SET title = ?,
           excerpt = ?,
           content = ?,
           author_name = ?,
           category = ?,
           status = ?,
           image_url = ?,
           image_alt = ?,
           published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE published_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        payload.title,
        payload.excerpt || String(payload.content || '').slice(0, 180),
        payload.content,
        payload.author,
        payload.category || 'Investigasi',
        payload.status || 'draft',
        payload.image || '',
        payload.imageAlt || `Gambar berita ${payload.title}`,
        payload.status || 'draft',
        now,
        Number(id),
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui berita.', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const pool = getMysqlPool();
    await pool.query('DELETE FROM news_posts WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus berita.', error: String(error) }, { status: 500 });
  }
}
