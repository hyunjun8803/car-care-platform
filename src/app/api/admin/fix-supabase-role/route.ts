import { NextRequest, NextResponse } from 'next/server';
import { supabaseUserStorage } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: '이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`Fixing Supabase role for user ${email}`);
    
    // Supabase에서 사용자 찾기
    const user = await supabaseUserStorage.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Supabase에서 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('Found user:', user);
    console.log('Current role:', user.role);

    // 역할을 SUPER_ADMIN으로 업데이트
    const updatedUser = await supabaseUserStorage.update(user.id, { role: 'SUPER_ADMIN' });
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Supabase 사용자 역할 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('Updated user:', updatedUser);

    return NextResponse.json({
      success: true,
      message: `Supabase 사용자 ${email}의 역할이 SUPER_ADMIN으로 업데이트되었습니다.`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Supabase role fix error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}