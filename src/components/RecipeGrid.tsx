'use client'

import { useState, useEffect } from 'react'
import { Recipe } from '@/types'
import RecipeCard from './RecipeCard'
import EditRecipeModal from './EditRecipeModal'
import RecipeDetailModal from './RecipeDetailModal'
import { Loader2, ChefHat } from 'lucide-react'

interface RecipeGridProps {
  searchQuery: string
  selectedCategory: string
}

export default function RecipeGrid({ searchQuery, selectedCategory }: RecipeGridProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/recipes')
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }

      const data = await response.json()
      setRecipes(data || [])
    } catch (err) {
      console.error('Error loading recipes:', err)
      setError('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
  }

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
  }

  const handleDelete = async (recipe: Recipe) => {
    if (!confirm(`&quot;${recipe.title}&quot; 레시피를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }

      // Remove recipe from local state
      setRecipes(prev => prev.filter(r => r.id !== recipe.id))
    } catch (err) {
      console.error('Error deleting recipe:', err)
      setError('레시피 삭제에 실패했습니다.')
    }
  }

  const handleRecipeUpdated = () => {
    loadRecipes() // Reload recipes after edit
  }

  // Filter recipes based on search query and category
  const filteredRecipes = recipes.filter((recipe) => {
    // Category filter
    if (selectedCategory !== '전체' && recipe.category !== selectedCategory) {
      return false
    }

    // Search query filter
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      recipe.title.toLowerCase().includes(query) ||
      recipe.ingredients.some(ingredient =>
        ingredient.toLowerCase().includes(query)
      )
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">레시피를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">레시피를 불러올 수 없어요</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRecipes}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (filteredRecipes.length === 0 && searchQuery) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없어요</h3>
          <p className="text-gray-600">
            &quot;{searchQuery}&quot;와 일치하는 레시피가 없어요. 다른 재료로 검색해보세요.
          </p>
        </div>
      </div>
    )
  }

  if (filteredRecipes.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 레시피가 없어요</h3>
          <p className="text-gray-600">
            첫 번째 레시피 이미지를 업로드해보세요!
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClick={handleRecipeClick}
          />
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          recipe={selectedRecipe}
        />
      )}

      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <EditRecipeModal
          isOpen={!!editingRecipe}
          onClose={() => setEditingRecipe(null)}
          recipe={editingRecipe}
          onRecipeUpdated={handleRecipeUpdated}
        />
      )}
    </>
  )
}