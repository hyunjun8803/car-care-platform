# 📧 알림 시스템 설정 가이드

Car Care Platform의 이메일 및 SMS 알림 시스템을 설정하는 완전한 가이드입니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수들을 설정하세요:

```bash
# 이메일 설정 (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Car Care Platform <your-email@gmail.com>"

# SMS 설정 (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Cron Job 설정
CRON_SECRET_KEY="your-cron-secret-key-for-reminder-api"
```

### 2. Gmail 앱 비밀번호 생성

1. Gmail 계정에서 2단계 인증을 활성화하세요
2. Google 계정 설정 > 보안 > 앱 비밀번호로 이동
3. 새 앱 비밀번호를 생성하고 `SMTP_PASS`에 입력하세요

### 3. Twilio 계정 설정 (선택사항)

SMS 알림을 사용하려면:

1. [Twilio 콘솔](https://console.twilio.com/)에서 계정을 생성하세요
2. Account SID와 Auth Token을 복사하여 환경 변수에 설정
3. 전화번호를 구매하고 `TWILIO_PHONE_NUMBER`에 설정

## 📨 알림 종류

### 자동 알림
- **예약 생성**: 새 예약 생성시 고객에게 확인 이메일
- **예약 확정**: 정비소에서 예약을 승인했을 때
- **예약 취소**: 예약이 취소되었을 때
- **서비스 완료**: 정비 작업이 완료되었을 때

### 예약 리마인더
- 예약 전 설정된 시간에 자동으로 알림 전송
- 기본값: 24시간 전 (사용자가 설정 변경 가능)

## 🔄 리마인더 Cron Job 설정

### Vercel 배포시 (권장)

`vercel.json` 파일을 생성하세요:

```json
{
  "crons": [
    {
      "path": "/api/notifications/reminder",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 수동 Cron Job 설정

서버에서 다음 명령을 매일 실행하도록 설정:

```bash
# Linux/Mac crontab 설정
0 9 * * * curl -H "Authorization: Bearer your-cron-secret-key" https://your-domain.com/api/notifications/reminder

# Windows Task Scheduler
curl -H "Authorization: Bearer your-cron-secret-key" https://your-domain.com/api/notifications/reminder
```

### 외부 Cron 서비스

- [Cron-job.org](https://cron-job.org/)
- [EasyCron](https://www.easycron.com/)
- [Uptimerobot](https://uptimerobot.com/)

URL: `https://your-domain.com/api/notifications/reminder`
Header: `Authorization: Bearer your-cron-secret-key`

## 🛠️ API 엔드포인트

### 알림 전송
```
POST /api/notifications/send
{
  "bookingId": "booking-id",
  "type": "booking_confirmed|booking_cancelled|booking_completed|booking_reminder",
  "channels": ["email", "sms"]
}
```

### 리마인더 전송
```
GET /api/notifications/reminder
Headers: Authorization: Bearer your-cron-secret-key
```

### 사용자 알림 설정
```
GET /api/user/notification-settings
PUT /api/user/notification-settings
{
  "emailNotifications": {
    "bookingConfirmed": true,
    "bookingCancelled": true,
    "bookingCompleted": true,
    "bookingReminder": true
  },
  "smsNotifications": {
    "bookingConfirmed": false,
    "bookingCancelled": false,
    "bookingCompleted": false,
    "bookingReminder": true
  },
  "reminderTiming": 24
}
```

## 🎨 이메일 템플릿 커스터마이징

`src/lib/notifications.ts` 파일의 `generateEmailTemplate` 함수를 수정하여 이메일 템플릿을 커스터마이징할 수 있습니다.

### 브랜딩 변경
- 로고 이미지 URL 추가
- 브랜드 컬러 변경
- 회사 정보 업데이트

### 언어 지원
SMS와 이메일 템플릿에 다국어 지원을 추가할 수 있습니다.

## 🔍 테스트 방법

### 개발 환경에서 테스트

```bash
# 수동 리마인더 전송
curl -X POST http://localhost:3000/api/notifications/reminder

# 특정 예약 알림 전송
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "your-booking-id",
    "type": "booking_confirmed",
    "channels": ["email"]
  }'
```

### 로그 확인

서버 콘솔에서 알림 전송 로그를 확인할 수 있습니다:

```
이메일 전송 성공: 1234567890
SMS 전송 성공: SM1234567890abcdef
예약 상태 변경 알림 전송 완료: booking-id -> CONFIRMED
```

## 🚨 문제 해결

### 이메일 전송 실패
- Gmail 앱 비밀번호가 올바른지 확인
- 2단계 인증이 활성화되어 있는지 확인
- SMTP 설정이 올바른지 확인

### SMS 전송 실패
- Twilio 계정에 충분한 크레딧이 있는지 확인
- 전화번호 형식이 올바른지 확인 (+국가번호포함)
- Twilio 콘솔에서 에러 로그 확인

### Cron Job이 작동하지 않는 경우
- 비밀 키가 올바른지 확인
- API 엔드포인트 URL이 정확한지 확인
- 서버 로그에서 에러 메시지 확인

## 📊 모니터링

### 알림 전송 성공률 추적
- 데이터베이스에 알림 전송 로그 저장
- 실패한 알림에 대한 재시도 로직 구현
- 알림 전송 통계 대시보드 구성

### 성능 최적화
- 배치 처리로 대량 알림 효율적 처리
- 큐 시스템으로 알림 전송 부하 분산
- 캐싱으로 중복 처리 방지

## 🔒 보안 고려사항

- 환경 변수를 안전하게 관리
- Cron Job API에 적절한 인증 구현
- 개인정보가 포함된 알림 내용 암호화
- 스팸 방지를 위한 발송량 제한

## 📈 확장 가능성

- 푸시 알림 추가 (FCM, APNS)
- 슬랙, 디스코드 등 메신저 연동
- 웹훅을 통한 외부 시스템 연동
- A/B 테스트를 통한 알림 효과 최적화