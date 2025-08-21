# 🚗 Car Care Platform

스마트 차량 관리 및 정비 예약 플랫폼

## ✨ 주요 기능

- **🔍 차량번호 검색**: CODEF API 연동으로 자동 제원 정보 조회
- **📊 스마트 대시보드**: 차량별 정비 현황 및 예측 분석
- **🚙 차량 관리**: 다중 차량 등록 및 상세 정보 관리
- **📅 정비소 예약**: 온라인 예약 시스템
- **📸 OCR 영수증 인식**: 자동 지출 입력 시스템
- **💰 지출 관리**: 차량 관련 비용 추적 및 분석
- **⭐ 리뷰 시스템**: 정비소 평가 및 후기
- **🔔 알림 서비스**: 이메일/SMS 정비 일정 및 비용 알림
- **🔐 비밀번호 재설정**: 6자리 코드 기반 안전한 비밀번호 재설정

## 🛠 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Authentication**: NextAuth.js (Google, Kakao, Naver OAuth)
- **Database**: Prisma ORM with SQLite/PostgreSQL
- **Notifications**: Nodemailer (Email), Twilio (SMS)
- **OCR**: 영수증 자동 인식 시뮬레이터
- **External API**: CODEF 자동차 제원 정보 API

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd car-care-platform
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 다음 값들을 설정하세요:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"

# Email Settings (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="Car Care Platform <your-email@gmail.com>"

# CODEF API (자동차 제원 정보)
CODEF_CLIENT_ID="your-codef-client-id"
CODEF_CLIENT_SECRET="your-codef-client-secret"
CODEF_PUBLIC_KEY="your-codef-public-key"
```

### 4. 데이터베이스 설정
```bash
npx prisma db push
npx prisma generate
```

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속하세요.

## 📱 주요 페이지

- **홈페이지**: `/` - 메인 랜딩 페이지
- **로그인**: `/auth/signin` - 다중 OAuth 로그인
- **회원가입**: `/auth/signup` - 고객 전용 회원가입
- **대시보드**: `/dashboard` - 차량 관리 대시보드
- **차량 등록**: `/cars/register` - 차량번호 검색 기능 포함
- **지출 추가**: `/expenses/add` - OCR 영수증 인식
- **정비소 찾기**: `/shops` - 예약 가능한 정비소

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/forgot-password` - 비밀번호 재설정 요청
- `POST /api/auth/reset-password` - 비밀번호 재설정

### 차량 관리
- `GET /api/cars` - 차량 목록 조회
- `POST /api/cars` - 차량 등록
- `POST /api/vehicles/search` - 차량번호 검색 (CODEF API)

### 대시보드
- `GET /api/dashboard/stats` - 대시보드 통계

### 예약 관리
- `GET /api/bookings` - 예약 목록
- `POST /api/bookings` - 새 예약 생성

### OCR 및 지출
- `POST /api/ocr/receipt` - 영수증 OCR 처리
- `GET /api/expenses` - 지출 목록
- `POST /api/expenses` - 지출 추가

### 알림
- `POST /api/notifications/reminder` - 예약 리마인더 전송
- `GET /api/user/notification-settings` - 알림 설정 조회
- `PUT /api/user/notification-settings` - 알림 설정 변경

## 🚀 배포

### Vercel 배포 (추천)
1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포

### 환경 변수 (프로덕션)
```env
NEXTAUTH_URL="https://your-domain.vercel.app"
DATABASE_URL="your-production-database-url"
# ... 기타 환경 변수
```

## 📋 자동 알림 시스템

### Cron Job 설정
- **시간**: 매일 오전 9시 (KST)
- **기능**: 예약 전날 자동 리마인더 발송
- **설정**: `vercel.json`에 정의됨

### 수동 테스트
```bash
curl -X POST http://localhost:3000/api/notifications/reminder
```

## 🧪 테스트 데이터

### 차량번호 검색 테스트
- 임의의 차량번호 입력 (예: "12가3456")
- 시뮬레이션 데이터로 자동 응답

### OCR 테스트
- 임의의 영수증 이미지 업로드
- 시뮬레이션 데이터로 자동 파싱

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 Issues를 통해 연락주세요.

---

## 🔮 향후 계획

- [ ] 정비소 사업자 계정 기능
- [ ] 실시간 채팅 상담
- [ ] 모바일 앱 개발
- [ ] AI 기반 정비 예측
- [ ] 블록체인 정비 이력 관리