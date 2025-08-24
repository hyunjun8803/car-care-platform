# 🚗 Car Care Platform

스마트 차량 관리 및 정비 예약 플랫폼

## ✨ 주요 기능

- **🚙 차량 관리**: 다중 차량 등록 및 상세 정보 관리
- **📅 정비소 예약**: 위치 기반 정비소 검색 및 온라인 예약  
- **💰 차계부**: 차량 관련 지출 관리 및 통계 제공
- **📊 스마트 대시보드**: 차량별 정비 현황 및 지출 분석
- **🔐 사용자 인증**: NextAuth.js 기반 안전한 로그인

## 🛠 기술 스택

- **Frontend**: Next.js 15.4.6, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

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

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. 데이터베이스 설정

Supabase 프로젝트에서 다음 SQL 파일들을 실행하세요:

1. **차량 테이블 생성**: `create-cars-table.sql`
2. **차계부 테이블 생성**: `create-expenses-table.sql`

Supabase 대시보드 → SQL Editor에서 해당 파일의 내용을 복사하여 실행하세요.

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속하세요.

## 📱 주요 페이지

- **홈페이지**: `/` - 메인 랜딩 페이지
- **로그인**: `/auth/signin` - NextAuth 기반 로그인
- **대시보드**: `/dashboard` - 차량 관리 및 지출 현황 대시보드
- **차량 관리**: `/cars` - 차량 등록 및 관리
- **정비 예약**: `/booking` - 위치 기반 정비소 검색 및 예약
- **차계부**: `/expenses` - 차량 지출 관리 및 통계
- **지출 추가**: `/expenses/add` - 새 지출 기록 추가

## 🔧 API 엔드포인트

### 차량 관리
- `GET /api/cars` - 사용자 차량 목록 조회
- `POST /api/cars` - 새 차량 등록
- `PUT /api/cars/[id]` - 차량 정보 수정
- `DELETE /api/cars/[id]` - 차량 삭제

### 대시보드
- `GET /api/dashboard` - 대시보드 데이터 조회

### 정비소 및 예약
- `GET /api/shops` - 정비소 목록 조회 (위치 기반)
- `POST /api/bookings` - 새 예약 생성
- `GET /api/bookings` - 예약 목록 조회

### 차계부
- `GET /api/expenses` - 지출 목록 조회 (필터링 지원)
- `POST /api/expenses` - 새 지출 기록 추가  
- `GET /api/expenses/stats` - 지출 통계 조회

### 관리자 도구
- `POST /api/admin/create-cars-table` - 차량 테이블 생성
- `POST /api/admin/create-expenses-table` - 차계부 테이블 생성

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