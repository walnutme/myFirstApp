import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: '가입되지 않은 이메일입니다.' }, { status: 401 });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    // 로그인 성공 (실제 앱에서는 세션이나 JWT를 설정해야 함)
    // 여기서는 간단하게 성공 메시지와 사용자 정보 반환
    return NextResponse.json({ 
      message: '로그인 성공', 
      user: { id: user.id, username: user.username, email: user.email, city: user.city } 
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '로그인 처리 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
