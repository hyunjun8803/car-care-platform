import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일 주소를 입력해주세요." },
        { status: 400 }
      );
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // 보안상 사용자가 존재하지 않아도 성공 메시지 반환
      return NextResponse.json({
        success: true,
        message: "비밀번호 재설정 이메일이 발송되었습니다."
      });
    }

    // 재설정 토큰 생성 (6자리 숫자)
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15분 후 만료

    // 기존 토큰 삭제 후 새 토큰 저장
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email
      }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: resetTokenExpiry
      }
    });

    // 이메일 발송
    try {
      await sendNotification(
        {
          customer: {
            name: user.name,
            email: user.email,
            phone: user.phone
          },
          resetToken,
          resetTokenExpiry: resetTokenExpiry.toISOString()
        },
        'password_reset',
        ['email']
      );
      
      console.log(`비밀번호 재설정 이메일 발송 성공: ${email}`);
    } catch (emailError) {
      console.error('비밀번호 재설정 이메일 발송 실패:', emailError);
      // 이메일 발송 실패해도 토큰은 생성되었으므로 에러를 숨김
    }

    return NextResponse.json({
      success: true,
      message: "비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요."
    });

  } catch (error) {
    console.error("비밀번호 재설정 요청 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}