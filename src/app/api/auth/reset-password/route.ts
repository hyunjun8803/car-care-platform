import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 토큰 검증
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: token,
        expires: {
          gte: new Date()
        }
      }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 토큰입니다." },
        { status: 400 }
      );
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 비밀번호 업데이트 및 토큰 삭제 (트랜잭션)
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: email }
      })
    ]);

    console.log(`비밀번호 재설정 완료: ${email}`);

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 재설정되었습니다."
    });

  } catch (error) {
    console.error("비밀번호 재설정 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}