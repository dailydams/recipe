'use client'

import { useState, useEffect, useCallback } from 'react'
import { Recipe } from '@/types'
import RecipeCard from './RecipeCard'
import EditRecipeModal from './EditRecipeModal'
import RecipeDetailModal from './RecipeDetailModal'
import { Loader2, ChefHat, Star, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecipeGridProps {
  searchQuery: string
  selectedCategory: string
  refreshTrigger?: number
}

type SortOption = 'newest' | 'oldest' | 'title'

const sortLabels: Record<SortOption, string> = {
  newest: '최신순',
  oldest: '오래된순',
  title: '가나다순',
}

export default function RecipeGrid({ searchQuery, selectedCategory, refreshTrigger }: RecipeGridProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const loadRecipes = useCallback(async () => {
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
      setError('레시피를 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes, refreshTrigger])

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
  }

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
  }

  const handleDelete = async (recipe: Recipe) => {
    if (!confirm(`"${recipe.title}" 레시피를 삭제하시겠습니까?`)) {
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
      alert('레시피 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleToggleFavorite = async (recipe: Recipe) => {
    const newFavorite = !recipe.favorite

    // Optimistic update for instant feedback
    setRecipes(prev =>
      prev.map(r => (r.id === recipe.id ? { ...r, favorite: newFavorite } : r))
    )

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: newFavorite }),
      })

      if (!response.ok) {
        throw new Error('Failed to update favorite')
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
      // Roll back on failure
      setRecipes(prev =>
        prev.map(r => (r.id === recipe.id ? { ...r, favorite: recipe.favorite } : r))
      )
    }
  }

  const handleRecipeUpdated = () => {
    loadRecipes() // Reload recipes after edit
  }

  // Filter recipes based on search query, category and favorites
  const filteredRecipes = recipes.filter((recipe) => {
    if (selectedCategory !== '전체' && recipe.category !== selectedCategory) {
      return false
    }

    if (favoritesOnly && !recipe.favorite) {
      return false
    }

    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      recipe.title.toLowerCase().includes(query) ||
      recipe.ingredients.some(ingredient =>
        ingredient.toLowerCase().includes(query)
      )
    )
  })

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'title':
        return a.title.localeCompare(b.title, 'ko')
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const handleRandomPick = () => {
    if (sortedRecipes.length === 0) return
    const randomRecipe = sortedRecipes[Math.floor(Math.random() * sortedRecipes.length)]
    setSelectedRecipe(randomRecipe)
  }

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
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const emptyState = () => {
    if (searchQuery) {
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

    if (favoritesOnly) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">즐겨찾기한 레시피가 없어요</h3>
            <p className="text-gray-600">
              레시피 카드의 별표를 눌러 즐겨찾기에 추가해보세요!
            </p>
          </div>
        </div>
      )
    }

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
      {/* Toolbar: count, favorites filter, random pick, sort */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
        <p className="text-sm text-gray-500 font-medium">
          레시피 <span className="text-orange-600 font-semibold">{sortedRecipes.length}</span>개
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFavoritesOnly(prev => !prev)}
            className={cn(
              'flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer touch-manipulation',
              favoritesOnly
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700 shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-yellow-300 hover:bg-yellow-50/50'
            )}
          >
            <Star className={cn('w-4 h-4', favoritesOnly && 'fill-yellow-400 text-yellow-400')} />
            <span>즐겨찾기</span>
          </button>

          <button
            onClick={handleRandomPick}
            disabled={sortedRecipes.length === 0}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50 active:scale-95 transition-all cursor-pointer touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4" />
            <span>오늘 뭐 먹지?</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 cursor-pointer touch-manipulation"
          >
            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
              <option key={option} value={option}>
                {sortLabels[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sortedRecipes.length === 0 ? (
        emptyState()
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={handleRecipeClick}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

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
