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

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT id, slug, title, excerpt, content, author_name, category, status, image_url, image_alt, views_count, featured, published_at, created_at
       FROM news_posts
       ORDER BY created_at DESC`
    );

    const news = (rows as any[]).map((row) => ({
      id: String(row.id),
      slug: row.slug,
      title: row.title,
      content: row.content,
      excerpt: row.excerpt,
      author: row.author_name,
      category: row.category,
      status: row.status,
      image: row.image_url,
      imageAlt: row.image_alt,
      views: row.views_count,
      date: row.published_at ? new Date(row.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: row.published_at ? new Date(row.published_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    }));

    return NextResponse.json({ news });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data berita.', error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as NewsPayload;
    if (!payload.title || !payload.content || !payload.author) {
      return NextResponse.json({ message: 'Data wajib belum lengkap.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    
    // Generate slug
    let slug = slugify(payload.title);
    
    // Check if slug exists
    const [existing] = await pool.query<any[]>(
      'SELECT id FROM news_posts WHERE slug = ?',
      [slug]
    );
    
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const excerpt = payload.content.slice(0, 150) + (payload.content.length > 150 ? '...' : '');
    const publishedAt = payload.status === 'published' ? new Date() : null;

    const [insertResult] = await pool.query<any>(
      `INSERT INTO news_posts (slug, title, excerpt, content, author_name, category, status, image_url, image_alt, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        payload.title,
        excerpt,
        payload.content,
        payload.author,
        payload.category || 'Umum',
        payload.status || 'draft',
        payload.image || '',
        payload.imageAlt || `Gambar berita ${payload.title}`,
        publishedAt,
      ]
    );

    return NextResponse.json({
      news: {
        id: String(insertResult.insertId),
        slug,
        title: payload.title,
        content: payload.content,
        excerpt,
        author: payload.author,
        category: payload.category || 'Umum',
        status: payload.status || 'draft',
        image: payload.image || '',
        imageAlt: payload.imageAlt || `Gambar berita ${payload.title}`,
        views: 0,
        date: publishedAt ? publishedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: publishedAt ? publishedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menambah data berita.', error: String(error) }, { status: 500 });
  }
}
