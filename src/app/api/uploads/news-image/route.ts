import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'File tidak valid.' }, { status: 400 });
    }

    const extension = path.extname(file.name || '').toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
      return NextResponse.json({ message: 'Format file tidak didukung.' }, { status: 400 });
    }

    const safeName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 50);
    const filename = `news-${Date.now()}-${safeName || 'image'}${extension}`;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'news');
    await fs.mkdir(dir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await fs.writeFile(path.join(dir, filename), Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/news/${filename}` });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal upload gambar berita.', error: String(error) }, { status: 500 });
  }
}
