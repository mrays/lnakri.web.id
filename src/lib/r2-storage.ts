import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

function isMissingR2Object(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'Code' in error &&
      (error as { Code?: string }).Code === 'NoSuchKey'
  );
}

/**
 * Test R2 connection
 */
export async function testR2Connection(): Promise<boolean> {
  try {
    console.log('Testing R2 connection...');
    console.log('Endpoint:', process.env.R2_ENDPOINT);
    console.log('Bucket:', process.env.R2_BUCKET_NAME);
    
    const command = new HeadBucketCommand({
      Bucket: process.env.R2_BUCKET_NAME,
    });
    
    const result = await r2Client.send(command);
    console.log('R2 connection successful:', result);
    return true;
  } catch (error) {
    console.error('R2 Connection Error:', error);
    return false;
  }
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | string,
  options?: UploadOptions
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: options?.contentType || 'application/octet-stream',
      Metadata: options?.metadata,
    });

    await r2Client.send(command);

    // Construct public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('R2 Upload Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get file from R2
 */
export async function getFromR2(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (response.Body) {
      const chunks: Uint8Array[] = [];
      const reader = response.Body.getReader?.();

      if (reader) {
        let result = await reader.read();
        while (!result.done) {
          chunks.push(result.value);
          result = await reader.read();
        }
      } else if (response.Body instanceof Buffer) {
        return response.Body;
      }

      return Buffer.concat(chunks);
    }

    return null;
  } catch (error) {
    if (!isMissingR2Object(error)) {
      console.error('R2 Get Error:', error);
    }
    return null;
  }
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('R2 Delete Error:', error);
    return false;
  }
}

/**
 * Generate presigned URL for file
 */
export async function getPresignedUrl(
  key: string,
  expirationSeconds: number = 3600
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(r2Client, command, {
      expiresIn: expirationSeconds,
    });

    return url;
  } catch (error) {
    console.error('R2 Presigned URL Error:', error);
    return null;
  }
}

/**
 * Get public URL for file
 */
export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
