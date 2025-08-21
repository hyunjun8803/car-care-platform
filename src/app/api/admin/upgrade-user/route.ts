import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();
    
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: '이메일과 역할이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 역할입니다.' },
        { status: 400 }
      );
    }

    console.log(`Upgrading user ${email} to ${role}`);
    
    let user = null;
    let updated = false;

    // Supabase에서 먼저 시도
    try {
      user = await supabaseUserStorage.findByEmail(email);
      if (user) {
        const updatedUser = {
          ...user,
          role: role as 'ADMIN' | 'SUPER_ADMIN'
        };
        await supabaseUserStorage.update(user.id, updatedUser);
        console.log(`Supabase user ${email} upgraded to ${role}`);
        updated = true;
      }
    } catch (error) {
      console.log('Supabase update failed:', error);
    }

    // 메모리 저장소에서도 시도
    try {
      const memoryUser = await userStorage.findByEmail(email);
      if (memoryUser) {
        const updatedUser = {
          ...memoryUser,
          role: role as 'ADMIN' | 'SUPER_ADMIN'
        };
        await userStorage.update(memoryUser.id, updatedUser);
        console.log(`Memory user ${email} upgraded to ${role}`);
        updated = true;
      }
    } catch (error) {
      console.log('Memory storage update failed:', error);
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `사용자 ${email}의 권한이 ${role}로 업그레이드되었습니다.`
    });

  } catch (error) {
    console.error('Admin upgrade error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}