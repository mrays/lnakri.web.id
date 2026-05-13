import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200);
}

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT id, title, content, excerpt, author_name, category, status, image_url, image_alt, views_count, published_at, created_at
       FROM news_posts
       ORDER BY COALESCE(published_at, created_at) DESC`
    );

    const news = (rows as any[]).map((row) => ({
      id: String(row.id),
      title: row.title,
      content: row.content,
      excerpt: row.excerpt,
      author: row.author_name,
      category: row.category,
      status: row.status,
      image: row.image_url || '',
      imageAlt: row.image_alt || '',
      views: Number(row.views_count || 0),
      publishedAt: row.published_at,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ news });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memuat berita.', error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload.title || !payload.content || !payload.author) {
      return NextResponse.json({ message: 'Data berita belum lengkap.' }, { status: 400 });
    }

    const now = new Date();
    const pool = getMysqlPool();
    const [result] = await pool.query<any>(
      `INSERT INTO news_posts
      (slug, title, excerpt, content, author_name, category, status, image_url, image_alt, views_count, featured, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)` ,
      [
        `${slugify(payload.title)}-${Date.now()}`,
        payload.title,
        payload.excerpt || String(payload.content).slice(0, 180),
        payload.content,
        payload.author,
        payload.category || 'Investigasi',
        payload.status || 'draft',
        payload.image || '',
        payload.imageAlt || `Gambar berita ${payload.title}`,
        (payload.status || 'draft') === 'published' ? now : null,
      ]
    );

    return NextResponse.json({ id: String(result.insertId) });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal membuat berita.', error: String(error) }, { status: 500 });
  }
}
