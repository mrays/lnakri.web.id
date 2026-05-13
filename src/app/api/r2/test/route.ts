import { testR2Connection } from '@/lib/r2-storage';

export async function GET() {
  try {
    const isConnected = await testR2Connection();

    if (isConnected) {
      return Response.json(
        {
          success: true,
          message: 'R2 connection successful',
          config: {
            bucket: process.env.R2_BUCKET_NAME,
            endpoint: process.env.R2_ENDPOINT,
            publicUrl: process.env.R2_PUBLIC_URL,
          },
        },
        { status: 200 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: 'R2 connection failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
