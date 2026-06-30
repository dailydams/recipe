import { NextRequest, NextResponse } from 'next/server'
import { updateRecipe, deleteRecipe } from '@/lib/google-sheets'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const updates = await request.json()
        const updatedRecipe = await updateRecipe(id, updates)

        if (!updatedRecipe) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(updatedRecipe)
    } catch (error) {
        console.error('Error updating recipe:', error)
        return NextResponse.json(
            { error: 'Failed to update recipe' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const success = await deleteRecipe(id)

        if (!success) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting recipe:', error)
        return NextResponse.json(
            { error: 'Failed to delete recipe' },
            { status: 500 }
        )
    }
}
