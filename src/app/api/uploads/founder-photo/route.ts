import { NextResponse } from 'next/server';
import path from 'node:path';
import { buildStoredFileName, getUploadUrl } from '@/lib/upload-storage';
import { uploadToR2, getPublicUrl } from '@/lib/r2-storage';

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

    const filename = `${buildStoredFileName(file.name || 'image')}${extension}`;
    const r2Key = `founders/${filename}`;
    const contentType = file.type || 'application/octet-stream';

    const bytes = await file.arrayBuffer();
    const result = await uploadToR2(r2Key, Buffer.from(bytes), { contentType });

    if (!result.success) {
      return NextResponse.json({ message: 'Gagal upload foto ke R2.', error: result.error }, { status: 500 });
    }

    return NextResponse.json({ url: getPublicUrl(r2Key) });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal upload foto.', error: String(error) }, { status: 500 });
  }
}
