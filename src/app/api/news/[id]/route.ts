import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

type NewsPayload = {
  title: string;
  content: string;
  author: string;
  category: string;
  status: 'published' | 'draft';
  image?: string;
  imageAlt?: string;
};

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as NewsPayload;

    if (!payload.title || !payload.content || !payload.author) {
      return NextResponse.json({ message: 'Data wajib belum lengkap.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    
    const excerpt = payload.content.slice(0, 150) + (payload.content.length > 150 ? '...' : '');

    await pool.query(
      `UPDATE news_posts
       SET title = ?, excerpt = ?, content = ?, author_name = ?, category = ?, status = ?, image_url = ?, image_alt = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        payload.title,
        excerpt,
        payload.content,
        payload.author,
        payload.category,
        payload.status,
        payload.image || '',
        payload.imageAlt || `Gambar berita ${payload.title}`,
        Number(id),
      ]
    );

    return NextResponse.json({
      news: {
        id,
        title: payload.title,
        content: payload.content,
        excerpt,
        author: payload.author,
        category: payload.category,
        status: payload.status,
        image: payload.image || '',
        imageAlt: payload.imageAlt || `Gambar berita ${payload.title}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui data berita.', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const pool = getMysqlPool();
    await pool.query('DELETE FROM news_posts WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus data berita.', error: String(error) }, { status: 500 });
  }
}
