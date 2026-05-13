import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getUploadStorageRoot } from '@/lib/upload-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getContentType(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(_: Request, context: { params: { path: string[] } }) {
  try {
    const segments = context.params.path || [];

    if (segments.length === 0) {
      return NextResponse.json({ message: 'File tidak ditemukan.' }, { status: 404 });
    }

    const storageRoot = path.resolve(getUploadStorageRoot());
    const resolvedPath = path.resolve(path.join(storageRoot, ...segments));

    if (resolvedPath !== storageRoot && !resolvedPath.startsWith(`${storageRoot}${path.sep}`)) {
      return NextResponse.json({ message: 'Path file tidak valid.' }, { status: 400 });
    }

    const stat = await fs.stat(resolvedPath).catch(() => null);
    if (!stat || !stat.isFile()) {
      return NextResponse.json({ message: 'File tidak ditemukan.' }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(resolvedPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': getContentType(resolvedPath),
        'Content-Disposition': `attachment; filename="${path.basename(resolvedPath)}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal membuka file.', error: String(error) }, { status: 500 });
  }
}
