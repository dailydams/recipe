# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recipe Saver (담이네레시피) is a modern web application that extracts and saves recipes from images using AI-powered OCR. Built with Next.js 15, it allows users to upload recipe images and automatically extract structured recipe data (title, ingredients, instructions) using Google's Gemini AI model.

## Essential Commands

### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack  
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Database Management
```sql
-- Run in Supabase SQL Editor to set up tables
-- File: supabase-schema.sql contains full schema
```

## Environment Setup

Required environment variables in `.env.local`:
```env
# Supabase (required for database operations)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API (required for image processing)
GOOGLE_API_KEY=your-google-gemini-api-key
```

## Architecture Overview

### Core Technologies
- **Next.js 15** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Supabase** for PostgreSQL database and API
- **Google Gemini 1.5 Flash** for image analysis and text extraction
- **Headless UI** for accessible UI components

### Directory Structure
```
src/
├── app/
│   ├── api/
│   │   └── process-image/route.ts    # Image processing endpoint
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main application page
├── components/
│   ├── AddRecipeModal.tsx           # Image upload modal
│   ├── EditRecipeModal.tsx          # Recipe editing modal  
│   ├── RecipeCard.tsx               # Individual recipe display
│   ├── RecipeDetailModal.tsx        # Full recipe view
│   ├── RecipeGrid.tsx               # Recipe list with filtering
│   └── SearchBar.tsx                # Search functionality
└── lib/
    ├── gemini.ts                    # Gemini AI utilities (unused)
    ├── supabase.ts                  # Database client & types
    └── utils.ts                     # Common utilities (cn function)
```

## Key Data Flow

1. **Image Upload**: User drops/selects image in `AddRecipeModal`
2. **AI Processing**: Image sent to `/api/process-image` route 
3. **Gemini Analysis**: Google Gemini 1.5 Flash extracts recipe data
4. **Database Storage**: Structured data saved to Supabase `recipes` table
5. **UI Updates**: `RecipeGrid` refreshes to display new recipe

## Database Schema

### recipes table
```sql
- id: UUID (Primary Key)
- title: TEXT (recipe title)  
- ingredients: TEXT[] (ingredient array)
- instructions: TEXT[] (cooking steps array)
- source: TEXT (original filename/identifier)
- source_type: ENUM ('instagram' | 'image') 
- raw_content: TEXT (original AI response)
- created_at/updated_at: TIMESTAMP
```

Key indexes for performance:
- Full-text search on title
- GIN index on ingredients array for fast filtering
- Source type and creation date indexes

## Component Architecture

### State Management Pattern
- React state for UI interactions (modals, loading states)
- Supabase real-time subscriptions for data synchronization  
- No external state management library needed

### Modal System
Three main modals using Headless UI Dialog:
- `AddRecipeModal`: Image upload with drag & drop
- `EditRecipeModal`: In-place recipe editing
- `RecipeDetailModal`: Full recipe view

### Search & Filtering
Real-time client-side filtering in `RecipeGrid`:
- Searches recipe titles and ingredients arrays
- Case-insensitive matching
- No backend search API needed for current scale

## AI Integration Details

### Gemini API Configuration
- Model: `gemini-1.5-flash` (fast, cost-effective)
- Input: Base64-encoded images up to 10MB
- Output: Structured JSON with title, ingredients, instructions
- Error handling for parsing failures and API limits

### Prompt Engineering
The system uses a structured prompt that:
- Requests JSON-only responses to avoid parsing issues
- Handles both Korean and English recipes automatically  
- Includes validation rules and fallback formats
- Specifies ingredient quantities and step separation

## Development Patterns

### Error Handling
- API routes return structured error responses with Korean messages
- UI components show loading states and error boundaries
- Database operations include proper error logging
- Image validation (type, size) before processing

### TypeScript Usage
- Strict type checking enabled
- Database types generated from Supabase schema
- Component prop interfaces for all major components
- Utility functions properly typed

### Performance Considerations  
- Turbopack for faster builds and hot reloading
- Image processing offloaded to API routes
- Client-side filtering for immediate search results
- Proper loading states to prevent UI blocking

## Styling System

### Tailwind Configuration
- Tailwind CSS v4 with PostCSS integration
- Custom utility classes for consistent spacing
- Gradient backgrounds and glassmorphism effects
- Mobile-first responsive design patterns

### Design Tokens
- Orange to pink gradient for primary actions
- Consistent border radius (rounded-xl, rounded-2xl)
- Gray scale for neutral colors
- Touch-friendly button sizes and spacing

## Testing Strategy

Currently no automated tests. For manual testing:
1. Test image upload with various formats (PNG, JPG, JPEG)
2. Verify Korean and English recipe extraction
3. Test search functionality with ingredients and titles
4. Validate CRUD operations (edit, delete recipes)
5. Check responsive design on mobile devices

## Deployment Notes

The application is configured for Vercel deployment:
- Automatic builds from Git pushes
- Environment variables configured in Vercel dashboard
- API routes become serverless functions
- Static assets served from CDN

Critical for production:
- Supabase Row Level Security policies configured
- API rate limiting for Gemini usage
- Image upload size restrictions enforced
- Database connection pooling for scale