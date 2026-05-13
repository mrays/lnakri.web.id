import os from 'node:os';
import path from 'node:path';

const DEFAULT_STORAGE_ROOT = path.join(os.tmpdir(), 'lnakri-uploads');

export function getUploadStorageRoot() {
  const configuredRoot = process.env.UPLOAD_STORAGE_DIR?.trim();

  if (!configuredRoot) {
    return DEFAULT_STORAGE_ROOT;
  }

  return path.isAbsolute(configuredRoot)
    ? configuredRoot
    : path.join(process.cwd(), configuredRoot);
}

export function getComplaintUploadDir(requestCode: string) {
  return path.join(getUploadStorageRoot(), 'cases', requestCode);
}

export function getUploadUrl(...segments: string[]) {
  return `/api/uploads/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
}

export function getComplaintUploadUrl(requestCode: string, fileName: string) {
  return getUploadUrl('cases', requestCode, fileName);
}

export function buildStoredFileName(fileName: string) {
  const safeName = path.basename(fileName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();

  return `${timestamp}-${safeName || 'file'}`;
}
