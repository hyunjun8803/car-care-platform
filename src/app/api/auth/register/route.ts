import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseUserStorage } from "@/lib/supabase-storage";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, userType } = await request.json();

    // 입력값 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = await supabaseUserStorage.findByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const newUser = await supabaseUserStorage.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType: userType || "CUSTOMER",
    });

    const user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다.", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // 더 자세한 오류 정보 제공 (개발 단계에서만)
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    
    return NextResponse.json(
      { 
        error: "서버 오류가 발생했습니다.",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}