import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.',
        details: 'NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.'
      }, { status: 500 });
    }
    
    console.log('Adding role column to Supabase users table...');
    
    // role 컬럼 추가 시도
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';
        
        UPDATE users 
        SET role = 'SUPER_ADMIN' 
        WHERE email = 'hyunjun2@naver.com';
      `
    });

    if (error) {
      console.error('Supabase SQL execution error:', error);
      
      // RPC가 없는 경우 직접 테이블 업데이트 시도
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ role: 'SUPER_ADMIN' })
        .eq('email', 'hyunjun2@naver.com')
        .select();

      if (updateError) {
        console.error('Direct update also failed:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Supabase 테이블 업데이트에 실패했습니다.',
          details: updateError.message,
          suggestion: 'Supabase 대시보드에서 수동으로 role 컬럼을 추가해주세요.'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'role 컬럼 추가는 실패했지만 사용자 역할 업데이트는 성공했습니다.',
        data: updateData
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 테이블에 role 컬럼을 추가하고 hyunjun2@naver.com을 SUPER_ADMIN으로 설정했습니다.',
      data
    });

  } catch (error) {
    console.error('Add role column error:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: String(error)
    }, { status: 500 });
  }
}