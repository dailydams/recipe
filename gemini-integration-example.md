# Gemini API 통합 예시

현재 앱은 Gemini API 없이도 잘 작동합니다. 하지만 추출 품질을 향상시키고 싶다면 다음과 같이 통합할 수 있습니다:

## 1. 환경 변수 설정

```env
# .env.local
GEMINI_API_KEY=your-gemini-api-key
```

## 2. Instagram API에 통합

```typescript
// src/app/api/scrape-instagram/route.ts 수정 예시

import { enhanceRecipeWithGemini } from '@/lib/gemini'

// processInstagramContent 함수 내부에서
async function processInstagramContent(content: string, url: string) {
  // 기본 파싱 시도
  const basicRecipe = { /* 기존 파싱 로직 */ }
  
  // Gemini로 개선 시도 (선택사항)
  const enhancedRecipe = await enhanceRecipeWithGemini(content)
  
  // Gemini 결과가 더 좋으면 사용, 아니면 기본 파싱 사용
  return enhancedRecipe && enhancedRecipe.ingredients.length > 0 
    ? enhancedRecipe 
    : basicRecipe
}
```

## 3. OCR API에 통합

```typescript
// src/app/api/process-image/route.ts 수정 예시

import { enhanceRecipeWithGemini } from '@/lib/gemini'

// OCR 처리 후
const ocrText = await worker.recognize(imageBuffer)
const basicRecipe = await processOCRText(ocrText)

// Gemini로 개선 시도
const enhancedRecipe = await enhanceRecipeWithGemini(ocrText)

const finalRecipe = enhancedRecipe && enhancedRecipe.title 
  ? enhancedRecipe 
  : basicRecipe
```

## 비용 고려사항

- **현재 방식**: 완전 무료 (Tesseract.js + 정규식)
- **Gemini 추가시**: API 호출당 소량 비용 발생

## 추천 사항

1. **먼저 현재 방식으로 테스트**해보세요 - 대부분의 경우 충분합니다
2. **추출 품질이 아쉬울 때만** Gemini API 추가
3. **Gemini를 추가하더라도 fallback**으로 기본 파싱 유지