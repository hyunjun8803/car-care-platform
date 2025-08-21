import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';

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
      console.log('Existing Supabase user:', existingUser);
      
      if (existingUser) {
        // Supabase는 role 컬럼이 없을 수 있으므로 기본 필드만 업데이트
        const updateData = {
          password: hashedPassword,
          userType: 'ADMIN',
          name: '최고관리자'
        };
        
        // role 필드가 있으면 추가
        const updateDataWithRole = { ...updateData, role: 'SUPER_ADMIN' };
        
        let updatedUser;
        try {
          // role 포함해서 시도
          updatedUser = await supabaseUserStorage.update(existingUser.id, updateDataWithRole);
        } catch (roleError) {
          console.log('Role 필드 없음, 기본 필드만 업데이트:', roleError);
          // role 없이 업데이트
          updatedUser = await supabaseUserStorage.update(existingUser.id, updateData);
        }
        
        if (updatedUser) {
          // 메모리 저장소도 동기화 (role 포함)
          let memoryUser = await userStorage.findByEmail(email);
          if (memoryUser) {
            await userStorage.update(memoryUser.id, {
              password: hashedPassword,
              role: 'SUPER_ADMIN',
              userType: 'ADMIN',
              name: '최고관리자'
            });
          } else {
            // 메모리에 없으면 새로 생성
            await userStorage.create({
              name: '최고관리자',
              email: email,
              password: hashedPassword,
              userType: 'ADMIN',
              role: 'SUPER_ADMIN'
            });
          }

          return NextResponse.json({
            success: true,
            message: 'Supabase 계정이 최고관리자로 업그레이드되었습니다.',
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              role: 'SUPER_ADMIN', // 메모리 저장소에서 제공
              userType: updatedUser.userType
            }
          });
        }
      }
      
      console.log('Supabase user not found, trying memory storage');
      // Supabase에 없으면 메모리 저장소에서 처리
      let memoryUser = await userStorage.findByEmail(email);
      if (memoryUser) {
        const updatedMemoryUser = await userStorage.update(memoryUser.id, {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          userType: 'ADMIN',
          name: '최고관리자'
        });
        
        return NextResponse.json({
          success: true,
          message: '메모리 저장소 계정이 업데이트되었습니다.',
          source: 'memory',
          user: {
            id: updatedMemoryUser?.id,
            name: updatedMemoryUser?.name,
            email: updatedMemoryUser?.email,
            role: updatedMemoryUser?.role,
            userType: updatedMemoryUser?.userType
          }
        });
      }
      
      return NextResponse.json(
        { error: '두 저장소 모두에서 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );

    } catch (supabaseError) {
      console.log('Supabase 업그레이드 실패:', supabaseError);
      
      // 메모리 저장소에서 시도
      let memoryUser = await userStorage.findByEmail(email);
      if (memoryUser) {
        const updatedUser = await userStorage.update(memoryUser.id, {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          userType: 'ADMIN',
          name: '최고관리자'
        });
        
        return NextResponse.json({
          success: true,
          message: '메모리 저장소 계정이 업데이트되었습니다.',
          source: 'memory',
          user: {
            id: updatedUser?.id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            role: updatedUser?.role,
            userType: updatedUser?.userType
          }
        });
      }
      
      return NextResponse.json(
        { error: '계정을 업그레이드할 수 없습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('계정 업그레이드 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}