'use client'

import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { id: '전체', label: '전체', emoji: '🍽️' },
  { id: '소담', label: '소담', emoji: '👶' },
  { id: '어른', label: '어른', emoji: '👨‍🍳' }
]

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-4 sm:mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium transition-all duration-200 cursor-pointer touch-manipulation text-sm sm:text-base",
            selectedCategory === category.id
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl active:scale-95"
              : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100 shadow-sm"
          )}
        >
          <span className="text-base sm:text-lg">{category.emoji}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  )
}