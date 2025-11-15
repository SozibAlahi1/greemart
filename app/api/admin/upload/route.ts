import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// GET /api/admin/upload - Return method not allowed message
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload files.' },
    { status: 405 }
  );
}

// POST /api/admin/upload
export async function POST(request: NextRequest) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json(
        { 
          error: 'Blob storage token not configured. Please set BLOB_READ_WRITE_TOKEN in your Vercel environment variables.',
          hint: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables and ensure BLOB_READ_WRITE_TOKEN is set.'
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `products/product-${timestamp}-${randomString}.${extension}`;

    console.log('Uploading file to Vercel Blob Storage:', filename);

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    console.log('File uploaded successfully:', blob.url);

    // Return the public URL
    return NextResponse.json({ 
      url: blob.url, 
      filename: filename.split('/').pop() 
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    });
    
    // Handle specific Vercel Blob errors
    if (error.message?.includes('BLOB_STORE_NOT_FOUND') || error.message?.includes('store not found')) {
      return NextResponse.json(
        { 
          error: 'Blob storage not configured. Please create a Blob store in your Vercel project.',
          hint: 'Go to Vercel Dashboard → Your Project → Storage → Create Database → Select "Blob"'
        },
        { status: 500 }
      );
    }

    if (error.message?.includes('token') || error.message?.includes('unauthorized') || error.message?.includes('401')) {
      return NextResponse.json(
        { 
          error: 'Blob storage authentication failed. Please check your BLOB_READ_WRITE_TOKEN.',
          hint: 'Ensure BLOB_READ_WRITE_TOKEN is correctly set in Vercel environment variables.'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          name: error.name,
          code: error.code
        } : undefined
      },
      { status: 500 }
    );
  }
}



