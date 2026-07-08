import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Avtorizatsiyadan o\'tilmagan' },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: 'Yaroqsiz token' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      id: decoded.id,
      fullName: decoded.fullName,
      role: decoded.role,
      schoolId: decoded.schoolId,
      schoolName: decoded.schoolName,
    },
  });
}
