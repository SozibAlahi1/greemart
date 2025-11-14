import { NextRequest, NextResponse } from 'next/server';

// Simple authentication (in production, use proper authentication with hashed passwords)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // In production, this should be hashed
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check credentials
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Generate a simple token (in production, use JWT or session tokens)
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        token,
        user: {
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}


