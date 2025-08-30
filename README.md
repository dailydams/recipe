# Recipe Saver 🍳

Instagram 링크나 이미지를 업로드해서 레시피를 추출하고 저장하는 현대적인 웹 애플리케이션입니다.

## 주요 기능

### 🔗 Instagram 레시피 추출
- Instagram 포스트 URL을 붙여넣으면 자동으로 레시피 정보를 추출
- 로그인 제한을 우회하는 스마트 스크래핑
- 재료와 조리법을 구조화된 데이터로 변환

### 📸 이미지 OCR 처리
- 레시피 스크린샷이나 사진을 업로드
- Tesseract.js를 사용한 한국어/영어 텍스트 인식
- 재료와 조리 과정 자동 분류

### 🔍 스마트 검색
- 재료 이름으로 레시피 검색
- 레시피 제목으로 검색
- 실시간 필터링

### 📱 현대적인 UI/UX
- 2024년 디자인 트렌드 반영
- 반응형 디자인 (모바일/태블릿/데스크탑)
- 미니멀하고 깔끔한 인터페이스
- 카드형 레시피 목록
- 그라디언트와 유리 형태(glassmorphism) 효과

## 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS v4** - 유틸리티 우선 CSS
- **Headless UI** - 접근성 좋은 UI 컴포넌트
- **Lucide React** - 아이콘
- **React Dropzone** - 파일 업로드

### Backend & Database
- **Supabase** - PostgreSQL 데이터베이스 및 API
- **Next.js API Routes** - 서버리스 API

### 이미지/텍스트 처리
- **Tesseract.js** - OCR (광학 문자 인식)
- **Puppeteer** - Instagram 스크래핑
- **Cheerio** - HTML 파싱

## 프로젝트 구조

```
recipe-saver/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── process-image/     # 이미지 OCR API
│   │   │   └── scrape-instagram/  # Instagram 스크래핑 API
│   │   ├── globals.css           # 전역 스타일
│   │   └── page.tsx              # 메인 페이지
│   ├── components/
│   │   ├── AddRecipeModal.tsx    # 레시피 추가 모달
│   │   ├── RecipeCard.tsx        # 레시피 카드
│   │   ├── RecipeGrid.tsx        # 레시피 그리드
│   │   └── SearchBar.tsx         # 검색 바
│   └── lib/
│       ├── supabase.ts           # Supabase 클라이언트
│       └── utils.ts              # 유틸리티 함수
├── supabase-schema.sql           # 데이터베이스 스키마
└── package.json
```

## 설치 및 실행

### 1. 저장소 클론 및 의존성 설치
```bash
git clone <repository-url>
cd recipe-saver
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI API Key (선택사항 - OCR 향상용)
OPENAI_API_KEY=your-openai-api-key
```

### 3. Supabase 데이터베이스 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL 에디터에서 `supabase-schema.sql` 파일 내용 실행
3. RLS(Row Level Security) 정책 설정

### 4. 개발 서버 실행
```bash
npm run dev
```

앱이 http://localhost:3000 에서 실행됩니다.

## 데이터베이스 스키마

### recipes 테이블
```sql
- id: UUID (Primary Key)
- title: TEXT (레시피 제목)
- ingredients: TEXT[] (재료 배열)
- instructions: TEXT[] (조리법 배열)
- source: TEXT (원본 URL 또는 파일명)
- source_type: ENUM ('instagram' | 'image')
- raw_content: TEXT (원본 추출 텍스트)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 주요 기능 설명

### Instagram 스크래핑
- Puppeteer를 사용해서 Instagram 포스트 접근
- 로그인 제한 우회를 위한 다중 접근 방식
- 텍스트 추출 및 레시피 정보 파싱
- 재료와 조리법 자동 분류

### 이미지 OCR
- 드래그 앤 드롭 파일 업로드
- 한국어/영어 동시 인식
- 레시피 구조 자동 파싱
- 재료와 조리 과정 분리

### 검색 기능
- PostgreSQL 전문 검색
- 재료 배열 기반 검색
- 실시간 클라이언트 사이드 필터링

## 배포

### Vercel 배포
```bash
npm install -g vercel
vercel
```

### 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 개발 고려사항

### Instagram 스크래핑 제한
- Instagram은 봇 차단이 강화되어 있어 100% 성공을 보장하지 않습니다
- 프록시나 다른 우회 방법이 필요할 수 있습니다
- 대안으로 사용자가 스크린샷을 업로드하는 방식을 권장합니다

### OCR 정확도
- 이미지 품질에 따라 인식률이 달라집니다
- 명확하고 대조가 뚜렷한 이미지일수록 좋습니다
- 필요시 OpenAI API를 통한 후처리 개선 가능

### 성능 최적화
- 이미지 파일 크기 제한 (10MB)
- API 요청 레이트 리미팅
- 데이터베이스 인덱스 최적화

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Recipe Saver**로 Instagram과 이미지에서 손쉽게 레시피를 저장하고 관리하세요! 🚀
