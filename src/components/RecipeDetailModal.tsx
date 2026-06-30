'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Clock, ChefHat } from 'lucide-react'
import { Recipe } from '@/types'

interface RecipeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  recipe: Recipe
}

export default function RecipeDetailModal({ isOpen, onClose, recipe }: RecipeDetailModalProps) {
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
            인스타그램
          </span>
        )
      case 'image':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
            이미지
          </span>
        )
      case 'manual':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200">
            직접 작성
          </span>
        )
      default:
        return null
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-2 sm:p-4 pt-[5vh]">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="relative px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-br from-orange-50 to-pink-50 border-b border-orange-100">
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full transition-all duration-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="pr-12">
                    <div className="flex items-center space-x-3 mb-3">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-2">
                        {recipe.title}
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ChefHat className="w-4 h-4" />
                        <span>재료 {recipe.ingredients.length}개</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.instructions.length}단계</span>
                      </div>
                      {getSourceBadge(recipe.source_type)}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(recipe.created_at)} 추가
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto">
                  <div className="p-4 sm:p-6 space-y-6">
                    {/* Ingredients Section */}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                        재료
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-medium mr-3 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-gray-800 text-sm sm:text-base">{ingredient}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions Section */}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-orange-500" />
                        조리 순서
                      </h2>
                      <div className="space-y-4">
                        {recipe.instructions.map((instruction, index) => (
                          <div
                            key={index}
                            className="flex items-start p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border border-orange-100"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                              {instruction}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile-friendly bottom padding */}
                <div className="h-safe-area-inset-bottom" />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}