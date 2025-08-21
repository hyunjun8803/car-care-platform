import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userStorage } from '@/lib/storage';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { fileUserStorage } from '@/lib/file-storage';

// 파일 업로드를 위한 유틸리티 함수
async function saveUploadedFile(file: File): Promise<string> {
  // 실제 구현에서는 AWS S3, Cloudinary 등에 업로드
  // 지금은 파일명만 반환
  const fileName = `business_license_${Date.now()}_${file.name}`;
  
  // TODO: 실제 파일 업로드 로직 구현
  // const uploadResult = await uploadToS3(file, fileName);
  
  return fileName;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 폼 데이터 추출
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const userType = formData.get('userType') as string;
    
    // 정비소 정보
    const shopName = formData.get('shopName') as string;
    const businessNumber = formData.get('businessNumber') as string;
    const address = formData.get('address') as string;
    const description = formData.get('description') as string;
    
    // 파일
    const businessLicense = formData.get('businessLicense') as File;

    // 필수 필드 검증
    if (!name || !email || !password || !phone || !shopName || !businessNumber || !address) {
      return NextResponse.json(
        { error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!businessLicense) {
      return NextResponse.json(
        { error: '사업자등록증을 업로드해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    try {
      const existingUser = await supabaseUserStorage.findByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: '이미 가입된 이메일입니다.' },
          { status: 400 }
        );
      }
    } catch (error) {
      // Supabase 실패 시 메모리 저장소에서 확인
      const existingUser = await userStorage.findByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: '이미 가입된 이메일입니다.' },
          { status: 400 }
        );
      }
    }

    // 사업자등록번호 중복 확인 (메모리 저장소에서)
    // TODO: Supabase에 shops 테이블 추가 시 중복 확인 로직 개선
    
    // 파일 업로드 처리
    let businessLicenseUrl: string;
    try {
      businessLicenseUrl = await saveUploadedFile(businessLicense);
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 정보 생성
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      userType: 'SHOP_OWNER',
      // 정비소 관련 정보는 별도 테이블에 저장 예정
      shopInfo: {
        shopName,
        businessNumber,
        address,
        description,
        businessLicenseUrl,
        status: 'PENDING', // 승인 대기 상태
        createdAt: new Date().toISOString()
      }
    };

    console.log('정비소 회원가입 시도:', { 
      email, 
      userType: userData.userType, 
      shopName: userData.shopInfo?.shopName 
    });

    try {
      // Supabase에 사용자 저장 시도
      console.log('Supabase 저장 시도 중...');
      console.log('저장할 사용자 데이터:', {
        email: userData.email,
        userType: userData.userType,
        hasShopInfo: !!userData.shopInfo,
        shopInfo: userData.shopInfo
      });
      const newUser = await supabaseUserStorage.create(userData);
      console.log('Supabase 저장 성공:', newUser.id, newUser.email);
      
      return NextResponse.json({
        success: true,
        message: '정비소 회원가입이 완료되었습니다. 승인 후 이용 가능합니다.',
        source: 'supabase',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          userType: newUser.userType,
          shopInfo: {
            shopName,
            status: 'PENDING'
          }
        }
      }, { status: 201 });

    } catch (supabaseError) {
      console.error('Supabase 저장 실패:', supabaseError);
      console.error('Supabase 오류 상세:', {
        message: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        stack: supabaseError instanceof Error ? supabaseError.stack : undefined
      });
      // 프로덕션 환경에서는 파일 저장소를 건너뛰고 메모리 저장소로 직접
      if (process.env.NODE_ENV === 'production') {
        console.log('프로덕션 환경: 메모리 저장소에 직접 저장 시도 중...');
        try {
          const newUser = await userStorage.create(userData);
          console.log('메모리 저장소 저장 성공:', newUser.id, newUser.email);
          
          return NextResponse.json({
            success: true,
            message: '정비소 회원가입이 완료되었습니다. 승인 후 이용 가능합니다.',
            source: 'memory',
            warning: 'Supabase 연결 실패로 임시 메모리 저장소 사용 중',
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              userType: newUser.userType,
              shopInfo: {
                shopName,
                status: 'PENDING'
              }
            }
          }, { status: 201 });
        } catch (memoryError) {
          console.error('메모리 저장소 저장 실패:', memoryError);
          return NextResponse.json(
            { 
              error: '회원가입 처리 중 오류가 발생했습니다.',
              details: 'Supabase와 메모리 저장소 모두 실패'
            },
            { status: 500 }
          );
        }
      }
      
      console.log('개발 환경: 파일 저장소 폴백 시도 중...');
      try {
        // 파일 저장소에 저장 (폴백)
        const newUser = await fileUserStorage.create(userData);
        console.log('파일 저장소 저장 성공:', newUser.id, newUser.email);
        
        // 메모리 저장소에도 저장 (세션 호환성)
        try {
          await userStorage.create(userData);
          console.log('메모리 저장소 동기화 완료');
        } catch (memSyncError) {
          console.warn('메모리 저장소 동기화 실패:', memSyncError);
        }
        
        return NextResponse.json({
          success: true,
          message: '정비소 회원가입이 완료되었습니다. 승인 후 이용 가능합니다.',
          source: 'file',
          warning: 'Supabase 연결 실패로 파일 저장소 사용 중',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            userType: newUser.userType,
            shopInfo: {
              shopName,
              status: 'PENDING'
            }
          }
        }, { status: 201 });
        
      } catch (fileError) {
        console.error('파일 저장소도 실패:', fileError);
        
        // 최후의 수단: 메모리 저장소만 사용
        try {
          const newUser = await userStorage.create(userData);
          console.log('메모리 저장소만 저장 성공:', newUser.id, newUser.email);
          
          return NextResponse.json({
            success: true,
            message: '정비소 회원가입이 완료되었습니다. 승인 후 이용 가능합니다.',
            source: 'memory',
            warning: 'Supabase와 파일 저장소 연결 실패로 임시 메모리 저장소 사용 중',
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              userType: newUser.userType,
              shopInfo: {
                shopName,
                status: 'PENDING'
              }
            }
          }, { status: 201 });
          
        } catch (memoryError) {
          console.error('모든 저장소 실패:', { supabaseError, fileError, memoryError });
          return NextResponse.json(
            { 
              success: false,
              error: '데이터 저장에 실패했습니다.',
              details: {
                supabase: String(supabaseError),
                file: String(fileError),
                memory: String(memoryError)
              }
            },
            { status: 500 }
          );
        }
      }
    }

  } catch (error) {
    console.error('정비소 회원가입 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}