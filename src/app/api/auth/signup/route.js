import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, email, password, city } = await request.json();

    if (!username || !email || !password || !city) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    // 이메일 또는 사용자 이름 중복 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? '이메일' : '사용자 이름';
      return NextResponse.json({ error: `이미 사용 중인 ${field}입니다.` }, { status: 400 });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        city,
      },
    });

    return NextResponse.json({ 
      message: '회원가입이 완료되었습니다.', 
      user: { id: user.id, username: user.username } 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: '회원가입 처리 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
