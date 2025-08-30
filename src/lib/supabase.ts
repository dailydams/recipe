import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have real values, not placeholders
const hasValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && 
                      supabaseKey !== 'placeholder-key' &&
                      !supabaseUrl.includes('your-supabase-url') &&
                      !supabaseKey.includes('your-supabase-anon-key')

export const supabase = hasValidConfig 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export type Recipe = {
  id: string
  title: string
  ingredients: string[]
  instructions: string[]
  source: string
  source_type: 'instagram' | 'image'
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: Recipe
        Insert: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}