# 현재 환경 설정 정보

**⚠️ 보안 주의: 실제 키 값들은 별도로 전달하거나 각자 생성하세요**

## 현재 사용 중인 Supabase 설정

- **Supabase Project**: oxqwzitldabsstxhojeg
- **Region**: 아시아 태평양
- **Database**: PostgreSQL

## 필요한 환경 변수

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000  # 개발 시
NEXTAUTH_SECRET=임의의-32자-이상-보안키

# Supabase (실제 값은 별도 전달)
NEXT_PUBLIC_SUPABASE_URL=https://oxqwzitldabsstxhojeg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[실제 키는 별도 전달]
```

## Supabase 대시보드 접근

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 `oxqwzitldabsstxhojeg` 접근
3. Settings → API에서 키 확인

## 현재 생성된 테이블

✅ **cars** - 차량 정보
✅ **expenses** - 차계부 데이터

## 배포 정보

- **Current Domain**: https://car-care-platform-a44iq7vbo-hyunjuns-projects-8d97c512.vercel.app
- **Vercel Project**: car-care-platform
- **GitHub**: 아직 설정 필요

## 다음 단계

1. GitHub 저장소 생성
2. 코드 푸시
3. 다른 PC에서 클론
4. 환경 변수 설정 (실제 키 값들)
5. 개발 환경 구축