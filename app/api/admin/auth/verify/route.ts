import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Simple token validation (in production, verify JWT token)
  if (token && token.startsWith('admin_')) {
    return NextResponse.json({
      authenticated: true,
      user: {
        username: 'admin',
        role: 'admin',
      },
    });
  }

  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}


