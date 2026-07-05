# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recipe Saver (담이네레시피) is a family recipe web app that extracts and saves recipes from images using AI. Built with Next.js 15, it lets users upload recipe images (Gemini extracts title/ingredients/instructions automatically) or write recipes manually. Data is stored in a Google Sheet via a service account — there is no traditional database.

## Essential Commands

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Production build with Turbopack
npm start        # Start production server
npm run lint     # Run ESLint
```

## Environment Setup

Required environment variables in `.env.local`:
```env
# Google Sheets storage (required)
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Google Gemini API (required for image extraction)
GOOGLE_API_KEY=your-google-gemini-api-key
```

## Architecture Overview

### Core Technologies
- **Next.js 15** with App Router and Turbopack
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **Google Sheets** as the data store (via `googleapis` service account)
- **Google Gemini** (`gemini-3-flash-preview`) for image → recipe extraction
- **Headless UI** for modals/menus, **lucide-react** for icons

### Directory Structure
```
src/
├── app/
│   ├── api/
│   │   ├── process-image/route.ts   # Gemini image extraction + save
│   │   └── recipes/
│   │       ├── route.ts             # GET (list) / POST (create)
│   │       └── [id]/route.ts        # PUT (update) / DELETE
│   ├── layout.tsx
│   └── page.tsx                     # Main page (search/category/refresh state)
├── components/
│   ├── AddRecipeModal.tsx           # Image upload + manual entry tabs
│   ├── EditRecipeModal.tsx          # Recipe editing
│   ├── RecipeCard.tsx               # Card with favorite star + edit/delete menu
│   ├── RecipeDetailModal.tsx        # Cooking mode: checklists, share, wake lock
│   ├── RecipeGrid.tsx               # List + filtering/sorting/favorites/random pick
│   ├── CategoryFilter.tsx           # 전체/소담/어른 category buttons
│   └── SearchBar.tsx
├── lib/
│   ├── google-sheets.ts             # Sheet client + recipe CRUD
│   └── utils.ts                     # cn() helper
└── types/index.ts                   # Recipe type (single source of truth)
```

## Data Storage (Google Sheets)

All recipes live in one sheet (`시트1`), one row per recipe, headers in row 1:

| Col | Field        | Notes                          |
|-----|--------------|--------------------------------|
| A   | id           | UUID                           |
| B   | title        |                                |
| C   | ingredients  | JSON-stringified string array  |
| D   | instructions | JSON-stringified string array  |
| E   | source       | filename or '직접 작성'         |
| F   | source_type  | 'instagram' \| 'image' \| 'manual' |
| G   | category     | '전체' \| '소담' \| '어른'       |
| H   | created_at   | ISO timestamp                  |
| I   | updated_at   | ISO timestamp                  |
| J   | favorite     | 'TRUE' \| 'FALSE'              |

`updateRecipe`/`deleteRecipe` locate rows by re-fetching and matching the id, so they assume no concurrent writers (fine for family-scale use).

## Key Data Flow

1. **Image upload**: `AddRecipeModal` → POST `/api/process-image` (multipart)
2. **AI extraction**: Gemini returns JSON; the route normalizes/validates it
3. **Storage**: `addRecipe()` appends a row to the Google Sheet
4. **UI refresh**: modal calls `onRecipeAdded` → `page.tsx` bumps `refreshTrigger` → `RecipeGrid` refetches (no full page reload)

## Component Patterns

- Plain React state only; no state-management library
- `RecipeGrid` owns the recipe list plus client-side search, category filter, favorites filter, sorting (최신순/오래된순/가나다순), and the random-pick button
- Favorite toggle uses optimistic update with rollback on API failure
- `RecipeDetailModal` is a "cooking mode": tappable ingredient checklist, per-step completion, share/copy (Web Share API → clipboard fallback), and a screen wake lock while open (best-effort, session-only state)
- Modals are conditionally mounted (`{editingRecipe && <EditRecipeModal ...>}`) so their state resets naturally

## Error Handling Conventions

- API routes return `{ error: '...' }` with Korean user-facing messages
- Never log secrets or key fragments
- Image validation (type, ≤10MB) happens server-side before calling Gemini
- Gemini output is normalized defensively (non-arrays → empty arrays, values coerced to strings)

## Testing

No automated tests. Manual checklist:
1. Image upload (PNG/JPG/WebP) extracts a recipe
2. Manual recipe entry saves correctly
3. Search by title and ingredient
4. Category + favorites filters, sorting, random pick
5. Edit/delete, favorite persistence after reload
6. Detail modal checklists and share button
7. Mobile responsive layout

## Deployment

Configured for Vercel: env vars in the dashboard, API routes as serverless functions. `GOOGLE_PRIVATE_KEY` may contain literal `\n` sequences — `google-sheets.ts` converts them to real newlines.
