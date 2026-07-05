import { NextRequest, NextResponse } from 'next/server'
import { getRecipes, addRecipe } from '@/lib/google-sheets'

export async function GET() {
    try {
        const recipes = await getRecipes()

        // Sort by created_at desc
        recipes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        return NextResponse.json(recipes)
    } catch (error) {
        console.error('Error fetching recipes:', error)
        return NextResponse.json(
            { error: 'Failed to fetch recipes', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const newRecipe = await addRecipe(body)

        return NextResponse.json(newRecipe)
    } catch (error) {
        console.error('Error creating recipe:', error)
        return NextResponse.json(
            { error: 'Failed to create recipe', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
