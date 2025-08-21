import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { BookingStatus } from '@prisma/client';

// 이메일 전송자 설정
let emailTransporter: nodemailer.Transporter | null = null;

// 환경변수가 있을 때만 이메일 전송자 생성
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// SMS 클라이언트 설정
let smsClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  try {
    smsClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (error) {
    console.log('Twilio 설정 오류, SMS 기능을 비활성화합니다:', error);
    smsClient = null;
  }
}

export interface NotificationData {
  booking?: {
    id: string;
    bookingDate: string;
    bookingTime: string;
    status: BookingStatus;
    finalCost?: number;
    estimatedCost?: number;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shop?: {
    businessName: string;
    phone: string;
    address: string;
  };
  service?: {
    name: string;
    basePrice: number;
  };
  car?: {
    name: string;
    licensePlate: string;
  };
  // 비밀번호 재설정용 필드
  resetToken?: string;
  resetTokenExpiry?: string;
}

// 이메일 템플릿 생성
const generateEmailTemplate = (
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'booking_completed' | 'password_reset',
  data: NotificationData
) => {
  const { booking, customer, shop, service, car, resetToken, resetTokenExpiry } = data;
  const bookingDate = booking ? new Date(booking.bookingDate).toLocaleDateString('ko-KR') : '';
  
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
      .footer { background: #1e293b; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
      .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
      .status { padding: 5px 10px; border-radius: 4px; font-weight: bold; }
      .status.confirmed { background: #dcfce7; color: #16a34a; }
      .status.cancelled { background: #fee2e2; color: #dc2626; }
      .status.completed { background: #dbeafe; color: #2563eb; }
      .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
  `;

  const templates = {
    booking_confirmed: {
      subject: `[예약 확정] ${shop.businessName} - ${service.name}`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🎉 예약이 확정되었습니다!</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${customer.name}님!</p>
            <p>요청하신 예약이 정비소에서 확정되었습니다.</p>
            
            <div class="info-box">
              <h3>📅 예약 정보</h3>
              <p><strong>정비소:</strong> ${shop.businessName}</p>
              <p><strong>서비스:</strong> ${service.name}</p>
              <p><strong>날짜:</strong> ${bookingDate} ${booking.bookingTime}</p>
              <p><strong>차량:</strong> ${car.name} (${car.licensePlate})</p>
              <p><strong>상태:</strong> <span class="status confirmed">예약 확정</span></p>
            </div>

            <div class="info-box">
              <h3>🏪 정비소 정보</h3>
              <p><strong>주소:</strong> ${shop.address}</p>
              <p><strong>연락처:</strong> ${shop.phone}</p>
            </div>

            <p>예약 시간에 맞춰 정비소에 방문해 주시기 바랍니다.</p>
            <p>문의사항이 있으시면 정비소로 직접 연락해 주세요.</p>
          </div>
          <div class="footer">
            <p>Car Care Platform | 차량 관리의 새로운 기준</p>
          </div>
        </div>
      `
    },
    booking_cancelled: {
      subject: `[예약 취소] ${shop.businessName} - ${service.name}`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>❌ 예약이 취소되었습니다</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${customer.name}님!</p>
            <p>아쉽게도 예약이 취소되었습니다.</p>
            
            <div class="info-box">
              <h3>📅 취소된 예약 정보</h3>
              <p><strong>정비소:</strong> ${shop.businessName}</p>
              <p><strong>서비스:</strong> ${service.name}</p>
              <p><strong>날짜:</strong> ${bookingDate} ${booking.bookingTime}</p>
              <p><strong>차량:</strong> ${car.name} (${car.licensePlate})</p>
              <p><strong>상태:</strong> <span class="status cancelled">예약 취소</span></p>
            </div>

            <p>다른 정비소에서 서비스를 예약하시거나, 다른 날짜에 재예약을 원하시면 언제든지 플랫폼을 이용해 주세요.</p>
            
            <a href="${process.env.NEXTAUTH_URL}/shops" class="button">다른 정비소 찾기</a>
          </div>
          <div class="footer">
            <p>Car Care Platform | 차량 관리의 새로운 기준</p>
          </div>
        </div>
      `
    },
    booking_reminder: {
      subject: `[예약 알림] 내일 ${shop.businessName} 방문 예정`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🔔 예약 알림</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${customer.name}님!</p>
            <p>내일 예약된 서비스를 알려드립니다.</p>
            
            <div class="info-box">
              <h3>📅 내일의 예약</h3>
              <p><strong>정비소:</strong> ${shop.businessName}</p>
              <p><strong>서비스:</strong> ${service.name}</p>
              <p><strong>날짜:</strong> ${bookingDate} ${booking.bookingTime}</p>
              <p><strong>차량:</strong> ${car.name} (${car.licensePlate})</p>
              <p><strong>주소:</strong> ${shop.address}</p>
            </div>

            <div class="info-box">
              <h3>💡 방문 전 확인사항</h3>
              <ul>
                <li>차량 키와 신분증을 준비해 주세요</li>
                <li>예약 시간 10분 전 도착을 권장합니다</li>
                <li>궁금한 사항은 정비소에 미리 연락해 주세요</li>
              </ul>
            </div>

            <p>정비소 연락처: ${shop.phone}</p>
          </div>
          <div class="footer">
            <p>Car Care Platform | 차량 관리의 새로운 기준</p>
          </div>
        </div>
      `
    },
    booking_completed: {
      subject: `[서비스 완료] ${shop.businessName}에서 서비스가 완료되었습니다`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>✅ 서비스가 완료되었습니다!</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${customer.name}님!</p>
            <p>${shop.businessName}에서 서비스가 성공적으로 완료되었습니다.</p>
            
            <div class="info-box">
              <h3>📋 완료된 서비스</h3>
              <p><strong>정비소:</strong> ${shop.businessName}</p>
              <p><strong>서비스:</strong> ${service.name}</p>
              <p><strong>날짜:</strong> ${bookingDate} ${booking.bookingTime}</p>
              <p><strong>차량:</strong> ${car.name} (${car.licensePlate})</p>
              <p><strong>최종 비용:</strong> ${(booking.finalCost || booking.estimatedCost || service.basePrice).toLocaleString()}원</p>
              <p><strong>상태:</strong> <span class="status completed">서비스 완료</span></p>
            </div>

            <p>서비스를 이용해 주셔서 감사합니다!</p>
            <p>서비스 품질 향상을 위해 리뷰를 남겨주시면 큰 도움이 됩니다.</p>
            
            <a href="${process.env.NEXTAUTH_URL}/bookings" class="button">리뷰 작성하기</a>
          </div>
          <div class="footer">
            <p>Car Care Platform | 차량 관리의 새로운 기준</p>
          </div>
        </div>
      `
    },
    password_reset: {
      subject: '[Car Care] 비밀번호 재설정 요청',
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🔐 비밀번호 재설정</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${customer.name}님!</p>
            <p>Car Care 계정의 비밀번호 재설정을 요청하셨습니다.</p>
            
            <div class="info-box">
              <h3>🔑 인증 코드</h3>
              <p style="font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; padding: 20px; background: #f0f9ff; border-radius: 8px; margin: 15px 0;">
                ${resetToken}
              </p>
              <p style="text-align: center; color: #dc2626; font-weight: bold;">
                이 코드는 15분 후 만료됩니다
              </p>
            </div>

            <div class="info-box">
              <h3>📋 비밀번호 재설정 방법</h3>
              <ol>
                <li>아래 링크를 클릭하거나 수동으로 접속하세요</li>
                <li>이메일과 위의 6자리 인증 코드를 입력하세요</li>
                <li>새로운 비밀번호를 설정하세요</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXTAUTH_URL}/auth/reset-password?email=${encodeURIComponent(customer.email)}&token=${resetToken}" class="button">
                비밀번호 재설정하기
              </a>
            </div>

            <div class="info-box" style="background: #fef3c7; border-left-color: #f59e0b;">
              <h3>⚠️ 보안 안내</h3>
              <ul>
                <li>이 요청을 하지 않으셨다면 이 이메일을 무시하세요</li>
                <li>인증 코드를 다른 사람과 공유하지 마세요</li>
                <li>의심스러운 활동이 있다면 고객센터로 연락해 주세요</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 14px;">
              링크가 작동하지 않는다면 다음 주소로 직접 접속하세요:<br>
              ${process.env.NEXTAUTH_URL}/auth/reset-password
            </p>
          </div>
          <div class="footer">
            <p>Car Care Platform | 차량 관리의 새로운 기준</p>
            <p style="font-size: 12px; margin-top: 5px;">
              문의사항: support@carcare.co.kr
            </p>
          </div>
        </div>
      `
    }
  };

  return templates[type];
};

// SMS 템플릿 생성
const generateSMSTemplate = (
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'booking_completed',
  data: NotificationData
) => {
  const { booking, customer, shop, service, car } = data;
  const bookingDate = new Date(booking.bookingDate).toLocaleDateString('ko-KR');

  const templates = {
    booking_confirmed: `[Car Care] ${customer.name}님, ${shop.businessName}에서 예약이 확정되었습니다. 📅${bookingDate} ${booking.bookingTime} / 서비스: ${service.name} / 차량: ${car.licensePlate}`,
    
    booking_cancelled: `[Car Care] ${customer.name}님, ${shop.businessName} 예약이 취소되었습니다. 📅${bookingDate} ${booking.bookingTime} / 다른 정비소를 찾아보세요.`,
    
    booking_reminder: `[Car Care] ${customer.name}님, 내일 ${shop.businessName} 방문 예정입니다. ⏰${booking.bookingTime} / 서비스: ${service.name} / 주소: ${shop.address}`,
    
    booking_completed: `[Car Care] ${customer.name}님, ${shop.businessName}에서 서비스가 완료되었습니다. 💰${(booking.finalCost || booking.estimatedCost || service.basePrice).toLocaleString()}원 / 리뷰 작성 부탁드립니다.`
  };

  return templates[type];
};

// 이메일 전송 함수
export async function sendEmail(
  to: string,
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'booking_completed' | 'password_reset',
  data: NotificationData
) {
  if (!emailTransporter) {
    console.log('이메일 설정이 없어 전송을 건너뜁니다.');
    return { success: false, error: 'Email configuration not found' };
  }

  try {
    const template = generateEmailTemplate(type, data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@carcare.com',
      to,
      subject: template.subject,
      html: template.html
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('이메일 전송 성공:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// SMS 전송 함수
export async function sendSMS(
  to: string,
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'booking_completed',
  data: NotificationData
) {
  if (!smsClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('SMS 설정이 없어 전송을 건너뜁니다.');
    return { success: false, error: 'SMS configuration not found' };
  }

  try {
    const message = generateSMSTemplate(type, data);
    
    const result = await smsClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log('SMS 전송 성공:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS 전송 오류:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// 통합 알림 전송 함수
export async function sendNotification(
  data: NotificationData,
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'booking_completed' | 'password_reset',
  channels: ('email' | 'sms')[] = ['email']
) {
  const results: { channel: string; success: boolean; error?: string }[] = [];

  for (const channel of channels) {
    try {
      if (channel === 'email') {
        const result = await sendEmail(data.customer.email, type, data);
        results.push({ channel: 'email', success: result.success, error: result.error });
      } else if (channel === 'sms' && data.customer.phone) {
        const result = await sendSMS(data.customer.phone, type, data);
        results.push({ channel: 'sms', success: result.success, error: result.error });
      }
    } catch (error) {
      results.push({ 
        channel, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return results;
}

// 예약 리마인더 체크 (cron job에서 사용)
export async function checkAndSendReminders() {
  const { prisma } = await import('./prisma');
  
  try {
    // 내일 예약된 항목들을 조회
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: tomorrowStart,
          lt: tomorrowEnd
        },
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        shop: {
          select: {
            businessName: true,
            phone: true,
            address: true
          }
        },
        service: {
          select: {
            name: true,
            basePrice: true
          }
        },
        car: {
          select: {
            name: true,
            licensePlate: true
          }
        }
      }
    });

    const results = [];
    for (const booking of bookings) {
      const notificationData: NotificationData = {
        booking: {
          id: booking.id,
          bookingDate: booking.bookingDate.toISOString(),
          bookingTime: booking.bookingTime,
          status: booking.status,
          finalCost: booking.finalCost || undefined,
          estimatedCost: booking.estimatedCost || undefined
        },
        customer: booking.user,
        shop: booking.shop,
        service: booking.service,
        car: booking.car
      };

      const result = await sendNotification(notificationData, 'booking_reminder', ['email', 'sms']);
      results.push({ bookingId: booking.id, result });
    }

    console.log(`리마인더 전송 완료: ${results.length}건`);
    return results;
  } catch (error) {
    console.error('리마인더 전송 오류:', error);
    throw error;
  }
}