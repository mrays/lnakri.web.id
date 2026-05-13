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

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Ukuran file maksimal 5MB.' }, { status: 400 });
    }

    const extension = path.extname(file.name || '').toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
      return NextResponse.json({ message: 'Format file harus JPG, PNG, atau WEBP.' }, { status: 400 });
    }

    const safeName = path
      .basename(file.name, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 50);

    const filename = `founder-${Date.now()}-${safeName || 'image'}${extension}`;
    const relativeDir = path.join('public', 'uploads', 'founders');
    const absoluteDir = path.join(process.cwd(), relativeDir);
    const absolutePath = path.join(absoluteDir, filename);

    await fs.mkdir(absoluteDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await fs.writeFile(absolutePath, Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/founders/${filename}` });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal upload foto.', error: String(error) }, { status: 500 });
  }
}
