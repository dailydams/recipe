'use client'

import { Clock, ChefHat, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import { Recipe } from '@/lib/supabase'

interface RecipeCardProps {
  recipe: Recipe
  className?: string
  onEdit?: (recipe: Recipe) => void
  onDelete?: (recipe: Recipe) => void
  onClick?: (recipe: Recipe) => void
}

export default function RecipeCard({ recipe, className, onEdit, onDelete, onClick }: RecipeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  const getSourceBadge = (sourceType: Recipe['source_type']) => {
    switch (sourceType) {
      case 'instagram':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
            인스타그램
          </span>
        )
      case 'image':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
            이미지
          </span>
        )
      default:
        return null
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on menu button or menu items
    if ((e.target as HTMLElement).closest('[data-menu]')) {
      return
    }
    onClick?.(recipe)
  }

  return (
    <div 
      className={cn(
        "group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer select-none",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 flex-1 mr-2">
            {recipe.title}
          </h3>
          <div className="flex items-center space-x-2">
            {getSourceBadge(recipe.source_type)}
            {(onEdit || onDelete) && (
              <Menu as="div" className="relative" data-menu>
                <Menu.Button className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer" data-menu>
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-100" data-menu>
                    <div className="py-1" data-menu>
                      {onEdit && (
                        <Menu.Item data-menu>
                          {({ active }) => (
                            <button
                              onClick={() => onEdit(recipe)}
                              className={cn(
                                "w-full text-left px-4 py-3 text-sm flex items-center space-x-3 cursor-pointer transition-colors",
                                active ? "bg-orange-50 text-orange-700" : "text-gray-700 hover:bg-gray-50"
                              )}
                              data-menu
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>수정</span>
                            </button>
                          )}
                        </Menu.Item>
                      )}
                      {onDelete && (
                        <Menu.Item data-menu>
                          {({ active }) => (
                            <button
                              onClick={() => onDelete(recipe)}
                              className={cn(
                                "w-full text-left px-4 py-3 text-sm flex items-center space-x-3 cursor-pointer transition-colors",
                                active ? "bg-red-50 text-red-700" : "text-red-600 hover:bg-red-50"
                              )}
                              data-menu
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>삭제</span>
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <ChefHat className="w-4 h-4 mr-1" />
          <span>재료 {recipe.ingredients.length}개</span>
        </div>
      </div>

      {/* Ingredients Preview */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4">
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1.5 bg-orange-50 text-orange-800 text-xs sm:text-sm rounded-full border border-orange-200 font-medium"
            >
              {ingredient}
            </span>
          ))}
          {recipe.ingredients.length > 4 && (
            <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-full border border-gray-200 font-medium">
              +{recipe.ingredients.length - 4}개 더
            </span>
          )}
        </div>
      </div>

      {/* Instructions Preview */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4">
        <p className="text-gray-600 text-sm sm:text-base line-clamp-2 leading-relaxed">
          {recipe.instructions[0] || '조리법이 없습니다'}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50/80 to-orange-50/30 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">
          {formatDate(recipe.created_at)} 추가
        </span>
        <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{recipe.instructions.length}단계</span>
          </div>
        </div>
      </div>
    </div>
  )
}