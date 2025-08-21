import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 이메일과 패스워드 검증
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 패스워드를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // hyunjun2@naver.com만 허용
    if (email !== 'hyunjun2@naver.com') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 패스워드 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      // Supabase에서 기존 사용자 확인
      let existingUser = await supabaseUserStorage.findByEmail(email);
      
      if (existingUser) {
        // 기존 사용자 업데이트
        const updatedUser = await supabaseUserStorage.update(existingUser.id, {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          userType: 'ADMIN'
        });
        
        return NextResponse.json({
          success: true,
          message: '최고관리자 계정이 활성화되었습니다.',
          user: {
            id: updatedUser?.id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            role: updatedUser?.role
          }
        });
      } else {
        // 새 관리자 계정 생성
        const newAdmin = await supabaseUserStorage.create({
          name: '최고관리자',
          email: email,
          password: hashedPassword,
          userType: 'ADMIN',
          role: 'SUPER_ADMIN'
        });

        return NextResponse.json({
          success: true,
          message: '최고관리자 계정이 생성되었습니다.',
          user: {
            id: newAdmin.id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: 'SUPER_ADMIN'
          }
        });
      }
    } catch (supabaseError) {
      console.log('Supabase 오류, 메모리 저장소 사용:', supabaseError);
      
      // 메모리 저장소 폴백
      let existingUser = await userStorage.findByEmail(email);
      
      if (existingUser) {
        // 기존 사용자 업데이트
        const updatedUser = await userStorage.update(existingUser.id, {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          userType: 'ADMIN'
        });
        
        return NextResponse.json({
          success: true,
          message: '최고관리자 계정이 활성화되었습니다. (임시 저장소)',
          source: 'memory',
          user: {
            id: updatedUser?.id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            role: updatedUser?.role
          }
        });
      } else {
        // 새 관리자 계정 생성
        const newAdmin = await userStorage.create({
          name: '최고관리자',
          email: email,
          password: hashedPassword,
          userType: 'ADMIN',
          role: 'SUPER_ADMIN'
        });

        return NextResponse.json({
          success: true,
          message: '최고관리자 계정이 생성되었습니다. (임시 저장소)',
          source: 'memory',
          user: {
            id: newAdmin.id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role
          }
        });
      }
    }
  } catch (error) {
    console.error('관리자 계정 활성화 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}