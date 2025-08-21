import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseUserStorage } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    // 이메일 검증
    if (email !== 'hyunjun2@naver.com') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: '새 패스워드는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 패스워드 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    try {
      // Supabase에서 기존 사용자 조회
      const existingUser = await supabaseUserStorage.findByEmail(email);
      console.log('Found user in Supabase:', existingUser?.id);
      
      if (existingUser) {
        // 기본 필드만 업데이트 (role은 제외)
        const updatedUser = await supabaseUserStorage.update(existingUser.id, {
          password: hashedPassword,
          userType: 'ADMIN',
          name: '최고관리자'
        });
        
        console.log('Updated user:', updatedUser);

        if (updatedUser) {
          return NextResponse.json({
            success: true,
            message: 'Supabase 계정의 패스워드와 권한이 업데이트되었습니다.',
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              userType: updatedUser.userType
            }
          });
        } else {
          return NextResponse.json(
            { error: 'Supabase 업데이트에 실패했습니다.' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Supabase에서 사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error('Supabase 업데이트 오류:', error);
      return NextResponse.json(
        { error: `Supabase 오류: ${error}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}