import { NextResponse } from 'next/server';
import path from 'node:path';
import { buildStoredFileName } from '@/lib/upload-storage';
import { uploadToR2, getPublicUrl } from '@/lib/r2-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const requestCode = formData.get('requestCode');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'File tidak valid.' }, { status: 400 });
    }

    if (!requestCode || typeof requestCode !== 'string') {
      return NextResponse.json({ message: 'Request code diperlukan.' }, { status: 400 });
    }

    const extension = path.extname(file.name || '').toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json({ message: 'Format file tidak didukung.' }, { status: 400 });
    }

    const filename = `${buildStoredFileName(file.name || 'document')}${extension}`;
    const r2Key = `cases/${requestCode}/${filename}`;
    const contentType = file.type || 'application/octet-stream';

    const bytes = await file.arrayBuffer();
    const result = await uploadToR2(r2Key, Buffer.from(bytes), { contentType });

    if (!result.success) {
      return NextResponse.json({ message: 'Gagal upload file ke R2.', error: result.error }, { status: 500 });
    }

    return NextResponse.json({ url: getPublicUrl(r2Key), filename });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal upload file.', error: String(error) }, { status: 500 });
  }
}
