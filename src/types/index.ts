export type Recipe = {
    id: string
    title: string
    ingredients: string[]
    instructions: string[]
    source: string
    source_type: 'instagram' | 'image' | 'manual'
    category: '전체' | '소담' | '어른'
    favorite: boolean
    created_at: string
    updated_at: string
}
