import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getUploadStorageRoot } from '@/lib/upload-storage';
import { getFromR2 } from '@/lib/r2-storage';

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

export async function GET(_: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: segments = [] } = await context.params;

    if (segments.length === 0) {
      return NextResponse.json({ message: 'File tidak ditemukan.' }, { status: 404 });
    }

    // Try local storage first
    const storageRoot = path.resolve(getUploadStorageRoot());
    const resolvedPath = path.resolve(path.join(storageRoot, ...segments));

    if (resolvedPath !== storageRoot && !resolvedPath.startsWith(`${storageRoot}${path.sep}`)) {
      return NextResponse.json({ message: 'Path file tidak valid.' }, { status: 400 });
    }

    const stat = await fs.stat(resolvedPath).catch(() => null);
    if (stat && stat.isFile()) {
      const fileBuffer = await fs.readFile(resolvedPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': getContentType(resolvedPath),
          'Content-Disposition': `attachment; filename="${path.basename(resolvedPath)}"`,
        },
      });
    }

    // Try legacy public uploads folder
    const publicUploadsRoot = path.resolve(path.join(process.cwd(), 'public', 'uploads'));
    const publicResolvedPath = path.resolve(path.join(publicUploadsRoot, ...segments));

    if (publicResolvedPath === publicUploadsRoot || publicResolvedPath.startsWith(`${publicUploadsRoot}${path.sep}`)) {
      const publicStat = await fs.stat(publicResolvedPath).catch(() => null);
      if (publicStat && publicStat.isFile()) {
        const fileBuffer = await fs.readFile(publicResolvedPath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': getContentType(publicResolvedPath),
            'Content-Disposition': `attachment; filename="${path.basename(publicResolvedPath)}"`,
          },
        });
      }
    }

    // Fallback to R2
    const r2Key = segments.join('/');
    const fileBuffer = await getFromR2(r2Key);

    if (!fileBuffer) {
      return NextResponse.json({ message: 'File tidak ditemukan.' }, { status: 404 });
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': getContentType(r2Key),
        'Content-Disposition': `attachment; filename="${path.basename(r2Key)}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal membuka file.', error: String(error) }, { status: 500 });
  }
}
