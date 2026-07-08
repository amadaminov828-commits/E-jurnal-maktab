import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { login, password, role } = await request.json();

    if (!login || !password || !role) {
      return NextResponse.json(
        { error: 'Barcha maydonlarni to\'ldiring' },
        { status: 400 }
      );
    }

    let user = null;
    let dbRole = '';

    if (role === 'admin') {
      user = await prisma.schoolAdmin.findUnique({
        where: { login },
        include: { school: true },
      });
      dbRole = 'ADMIN';
    } else if (role === 'teacher') {
      user = await prisma.teacher.findUnique({
        where: { login },
        include: { school: true },
      });
      dbRole = 'TEACHER';
    } else {
      return NextResponse.json(
        { error: 'Noto\'g\'ri rol tanlandi' },
        { status: 400 }
      );
    }

    if (!user || !comparePassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Login yoki parol noto\'g\'ri' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      role: dbRole,
      schoolId: user.schoolId,
      schoolName: user.school.name,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: dbRole,
        schoolId: user.schoolId,
        schoolName: user.school.name,
      },
    });

    // Set cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Tizimda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
