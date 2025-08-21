# Supabase PostgreSQL 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 방문
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New Project" 클릭
5. 프로젝트 설정:
   - Organization: 본인의 organization 선택
   - Name: `car-care-platform`
   - Database Password: 강력한 비밀번호 생성 (꼭 복사해두세요!)
   - Region: `Northeast Asia (Seoul)` 선택
   - Pricing Plan: Free tier 선택
6. "Create new project" 클릭

## 2. 데이터베이스 연결 정보 확인

프로젝트 생성 후:
1. 왼쪽 사이드바에서 "Settings" → "Database" 클릭
2. "Connection string" 섹션에서 다음 정보 확인:
   - Host
   - Database name
   - Port
   - User
   - Password (프로젝트 생성 시 설정한 것)

## 3. 환경 변수 설정

`.env.local` 파일에 다음 정보 추가:

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

## 4. Prisma 스키마 업데이트

`prisma/schema.prisma` 파일의 datasource를 다음과 같이 수정:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 5. 마이그레이션 실행

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma db push
```

## 6. Supabase 클라이언트 설치 (선택사항)

```bash
npm install @supabase/supabase-js
```

## 무료 티어 제한사항

- 데이터베이스: 500MB
- 월간 활성 사용자: 50,000명
- 파일 저장소: 1GB
- 총 송신량: 5GB
- 실시간 연결: 200개 동시 연결
- 프로젝트 수: 2개
- 1주일 비활성 시 일시 정지

## 주의사항

1. **비밀번호 보관**: 데이터베이스 비밀번호는 프로젝트 생성 시에만 표시되므로 반드시 안전한 곳에 보관하세요.
2. **연결 정보**: 모든 연결 정보는 Supabase 대시보드의 Settings → Database에서 확인할 수 있습니다.
3. **보안**: production 환경에서는 환경 변수를 통해 민감한 정보를 관리하세요.