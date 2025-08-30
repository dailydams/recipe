# Recipe Saver 배포 가이드 🚀

이 가이드는 Recipe Saver 애플리케이션을 Vercel과 Supabase를 사용하여 배포하는 과정을 설명합니다.

## 1. Supabase 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. Organization 선택
4. 프로젝트 정보 입력:
   - **Name**: `recipe-saver` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성
   - **Region**: 가장 가까운 지역 선택

### 1.2 데이터베이스 스키마 설정
1. Supabase 대시보드에서 "SQL Editor" 이동
2. "New query" 클릭
3. `supabase-schema.sql` 파일 내용을 복사하여 붙여넣기
4. "Run" 클릭하여 스키마 생성

### 1.3 API 키 및 URL 확인
1. Supabase 대시보드에서 "Settings" → "API" 이동
2. 다음 값들을 복사해두세요:
   - **Project URL**: `https://xxx.supabase.co`
   - **Project API Key (anon public)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 2. Vercel 배포

### 2.1 GitHub 연동 (권장)
1. 프로젝트를 GitHub에 푸시:
```bash
cd recipe-saver
git init
git add .
git commit -m "Initial commit: Recipe Saver app"
git branch -M main
git remote add origin https://github.com/yourusername/recipe-saver.git
git push -u origin main
```

### 2.2 Vercel 프로젝트 생성
1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소에서 `recipe-saver` 선택
4. "Import" 클릭

### 2.3 환경 변수 설정
배포 설정에서 다음 환경 변수들을 추가하세요:

#### 필수 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 선택적 환경 변수
```env
OPENAI_API_KEY=your-openai-api-key  # OCR 후처리 개선용 (선택사항)
```

### 2.4 빌드 설정 확인
Vercel은 자동으로 Next.js를 감지하지만, 다음 설정을 확인하세요:

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

### 2.5 배포 실행
"Deploy" 버튼을 클릭하여 배포를 시작하세요.

## 3. 배포 후 확인사항

### 3.1 기본 기능 테스트
1. 배포된 URL로 접속
2. 메인 페이지 로딩 확인
3. "Add Recipe" 버튼 클릭하여 모달 동작 확인
4. 검색 바 동작 확인

### 3.2 Instagram 스크래핑 테스트
1. Instagram 포스트 URL로 테스트
2. 에러가 발생하면 Vercel Functions 로그 확인
3. 타임아웃 이슈가 있다면 Vercel Pro 플랜 고려

### 3.3 이미지 OCR 테스트
1. 레시피가 포함된 이미지 업로드
2. OCR 처리 시간 확인 (보통 5-10초)
3. 추출된 레시피 데이터 확인

## 4. 성능 최적화

### 4.1 Vercel Functions 설정
`vercel.json` 파일을 프로젝트 루트에 생성:

```json
{
  "functions": {
    "src/app/api/process-image/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/scrape-instagram/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### 4.2 이미지 최적화
Next.js의 자동 이미지 최적화를 활용:

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['instagram.com', 'scontent.cdninstagram.com'],
    formats: ['image/webp', 'image/avif'],
  }
}
```

### 4.3 캐싱 전략
API 응답 캐싱을 위해 헤더 설정:

```typescript
// API 라우트에서
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59'
  }
})
```

## 5. 모니터링 및 디버깅

### 5.1 Vercel 로그 확인
1. Vercel 대시보드 → Functions 탭
2. 각 함수의 로그 확인
3. 에러 발생시 스택 트레이스 분석

### 5.2 Supabase 로그 확인
1. Supabase 대시보드 → Logs
2. Database, API, Auth 로그 확인
3. 쿼리 성능 모니터링

### 5.3 일반적인 문제 해결

#### Instagram 스크래핑 실패
```
Error: Navigation timeout of 15000 ms exceeded
```
- 해결방안: 더 간단한 Instagram URL 형태 사용
- 대안: 사용자에게 스크린샷 업로드 권장

#### OCR 처리 시간 초과
```
Error: Function execution timed out
```
- 해결방안: Vercel Pro 플랜으로 업그레이드 (60초 타임아웃)
- 최적화: 이미지 크기 제한 강화

#### 데이터베이스 연결 오류
```
Error: Failed to connect to Supabase
```
- 확인사항: 환경 변수 값 정확성
- 확인사항: Supabase 프로젝트 상태

## 6. 사용자 정의 도메인 (선택사항)

### 6.1 도메인 연결
1. Vercel 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 및 DNS 설정 적용

### 6.2 HTTPS 인증서
Vercel이 자동으로 Let's Encrypt 인증서를 생성하고 갱신합니다.

## 7. 지속적 배포 (CI/CD)

### 7.1 자동 배포 설정
GitHub 연동시 자동으로 설정되는 항목들:
- `main` 브랜치 푸시 → 프로덕션 배포
- PR 생성 → 미리보기 배포
- 커밋별 배포 히스토리 추적

### 7.2 배포 브랜치 전략
```bash
# 개발 브랜치
git checkout -b develop
git push origin develop

# 프로덕션 배포
git checkout main
git merge develop
git push origin main
```

## 8. 비용 관리

### 8.1 Vercel 요금
- **Hobby 플랜**: 무료 (개인 프로젝트)
- **Pro 플랜**: $20/월 (상용 프로젝트)

### 8.2 Supabase 요금
- **Free Tier**: 월 500MB 데이터베이스, 50MB 파일 저장
- **Pro 플랜**: $25/월 (상용 프로젝트)

### 8.3 비용 최적화 팁
1. 이미지 파일 크기 제한으로 대역폭 절약
2. 불필요한 API 호출 방지
3. 데이터베이스 쿼리 최적화

---

## 배포 체크리스트 ✅

배포 전 다음 항목들을 확인하세요:

### 코드 준비
- [ ] 모든 기능이 로컬에서 정상 동작
- [ ] TypeScript 에러 없음 (`npm run build` 성공)
- [ ] ESLint 경고 최소화

### 환경 설정
- [ ] Supabase 프로젝트 생성 및 스키마 설정
- [ ] 환경 변수 확인 (URL, API 키)
- [ ] `.env.local` 파일이 `.gitignore`에 포함

### Vercel 설정
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정
- [ ] 빌드 설정 확인
- [ ] 도메인 설정 (선택사항)

### 테스트
- [ ] 프로덕션 환경에서 기본 기능 테스트
- [ ] Instagram URL 처리 테스트
- [ ] 이미지 OCR 처리 테스트
- [ ] 검색 기능 테스트
- [ ] 모바일 반응형 테스트

축하합니다! 🎉 Recipe Saver가 성공적으로 배포되었습니다.