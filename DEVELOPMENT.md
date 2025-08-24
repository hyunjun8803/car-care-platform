# 개발 환경 셋업 가이드

다른 PC에서 개발을 이어가기 위한 상세 가이드

## 🛠 필수 요구사항

- **Node.js**: v18.0.0 이상
- **npm**: v8.0.0 이상
- **Git**: 최신 버전
- **Supabase 계정**: [supabase.com](https://supabase.com)

## 🚀 단계별 셋업

### 1. 저장소 클론

```bash
git clone https://github.com/[USERNAME]/car-care-platform.git
cd car-care-platform
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 `.env.example`을 참조하여 설정:

```bash
cp .env.example .env.local
```

**필수 환경 변수:**
- `NEXTAUTH_URL`: 개발 서버 URL (http://localhost:3000)
- `NEXTAUTH_SECRET`: 임의의 보안 키 (최소 32자)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonymous 키

### 4. Supabase 설정

#### 4.1 Supabase 프로젝트 생성
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. **New project** 클릭
3. 프로젝트 이름 입력 (예: car-care-platform)
4. 데이터베이스 비밀번호 설정
5. 지역 선택 (Seoul 권장)

#### 4.2 API 키 확인
1. 프로젝트 **Settings** → **API**
2. **Project URL**과 **anon public** 키 복사
3. `.env.local`에 추가

#### 4.3 데이터베이스 테이블 생성
1. Supabase 대시보드에서 **SQL Editor** 접속
2. 다음 파일들의 내용을 순서대로 실행:
   - `create-cars-table.sql`
   - `create-expenses-table.sql`

또는 개발 서버 실행 후 API를 통해 생성:
```bash
npm run dev

# 다른 터미널에서
curl -X POST http://localhost:3000/api/admin/create-cars-table
curl -X POST http://localhost:3000/api/admin/create-expenses-table
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 🔍 개발 중 확인사항

### 테스트용 데이터 확인
- 차량 등록 테스트
- 지출 기록 테스트  
- 대시보드 데이터 표시 확인

### API 엔드포인트 테스트
```bash
# 차량 목록 조회 (로그인 필요)
curl http://localhost:3000/api/cars

# 정비소 목록 조회
curl http://localhost:3000/api/shops
```

## 🐛 문제 해결

### 1. Supabase 연결 오류
```bash
# Supabase 연결 테스트
node test-supabase-connection.js
```

**해결 방법:**
- 환경 변수 확인
- Supabase 프로젝트 상태 확인
- 방화벽/네트워크 설정 확인

### 2. 테이블 없음 오류
**증상**: "Could not find the table 'public.cars'" 에러

**해결 방법:**
1. Supabase SQL Editor에서 테이블 생성 확인
2. 관리자 API로 테이블 생성:
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-cars-table
   ```

### 3. NextAuth 오류
**해결 방법:**
- `NEXTAUTH_SECRET` 환경 변수 확인
- `NEXTAUTH_URL` 확인 (http://localhost:3000)

### 4. 빌드 오류
```bash
# TypeScript 타입 체크
npm run type-check

# 린트 검사
npm run lint
```

## 📁 프로젝트 구조 이해

```
src/
├── app/                    # App Router 페이지
│   ├── api/               # API 라우트
│   ├── dashboard/         # 대시보드
│   ├── cars/             # 차량 관리
│   ├── booking/          # 정비 예약
│   └── expenses/         # 차계부
├── components/           # 재사용 컴포넌트
├── lib/                 # 유틸리티 및 설정
└── types/               # TypeScript 타입
```

### 주요 파일들
- `src/middleware.ts` - 인증 미들웨어
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/lib/auth.ts` - NextAuth 설정
- `create-*.sql` - 데이터베이스 스키마

## 🚀 배포

### Vercel 배포 (권장)
1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. 환경 변수 설정:
   - `NEXTAUTH_URL`: https://your-domain.vercel.app
   - `NEXTAUTH_SECRET`: 프로덕션용 시크릿
   - Supabase 키들

### 로컬 배포 테스트
```bash
npm run build
npm start
```

## 📋 체크리스트

새 환경에서 개발 시작 전 확인:

- [ ] Node.js v18+ 설치
- [ ] 저장소 클론 완료
- [ ] npm install 실행
- [ ] .env.local 파일 생성 및 설정
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 테이블 생성
- [ ] 개발 서버 실행 (npm run dev)
- [ ] 기본 페이지 접속 확인
- [ ] 로그인 기능 테스트
- [ ] 차량 등록 기능 테스트
- [ ] 지출 기록 기능 테스트

## 🤝 팀 개발

### 코드 동기화
```bash
# 최신 코드 받기
git pull origin main

# 변경사항 커밋
git add .
git commit -m "feat: 새 기능 추가"
git push origin main
```

### 브랜치 전략
```bash
# 새 기능 개발
git checkout -b feature/새기능명
git push -u origin feature/새기능명
```

## 📞 문의

개발 중 문제가 발생하면 GitHub Issues를 활용하세요.