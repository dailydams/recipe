'use client'

import { useState } from 'react'
import { Plus, BookOpen } from 'lucide-react'
import AddRecipeModal from '@/components/AddRecipeModal'
import RecipeGrid from '@/components/RecipeGrid'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 sticky top-0 z-40 backdrop-blur-xl bg-white/95">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">담이네레시피</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">어디서든 레시피를 저장하세요</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium hover:from-orange-600 hover:to-pink-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-1 sm:space-x-2 cursor-pointer touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm sm:text-base">레시피 추가</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 lg:px-8 pb-safe">
        {/* Search Section */}
        <div className="mb-6 sm:mb-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 text-center">
              완벽한 레시피를 찾아보세요
            </h2>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
              재료나 레시피 이름으로 검색해보세요
            </p>
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              placeholder="재료나 요리명으로 검색..."
            />
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Recipe Grid */}
        <RecipeGrid
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRecipeAdded={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  )
}