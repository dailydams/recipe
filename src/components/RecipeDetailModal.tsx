'use client'

import { Fragment, useState, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Clock, ChefHat, Check, Share2, ClipboardCheck, RotateCcw } from 'lucide-react'
import { Recipe } from '@/types'
import { cn } from '@/lib/utils'

interface RecipeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  recipe: Recipe
}

export default function RecipeDetailModal({ isOpen, onClose, recipe }: RecipeDetailModalProps) {
  // Cooking-mode progress (session-only, resets when modal reopens)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Reset progress when a different recipe opens
  useEffect(() => {
    setCheckedIngredients(new Set())
    setCompletedSteps(new Set())
    setCopied(false)
  }, [recipe.id, isOpen])

  // Keep the screen on while cooking (supported browsers only)
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const sentinel = await navigator.wakeLock.request('screen')
          if (cancelled) {
            sentinel.release()
          } else {
            wakeLockRef.current = sentinel
          }
        }
      } catch {
        // Wake lock is best-effort; ignore failures (e.g. low battery mode)
      }
    }

    requestWakeLock()

    return () => {
      cancelled = true
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [isOpen])

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const hasProgress = checkedIngredients.size > 0 || completedSteps.size > 0

  const resetProgress = () => {
    setCheckedIngredients(new Set())
    setCompletedSteps(new Set())
  }

  const buildShareText = () => {
    const lines = [
      `🍳 ${recipe.title}`,
      '',
      '[재료]',
      ...recipe.ingredients.map(ing => `- ${ing}`),
      '',
      '[조리 순서]',
      ...recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`),
    ]
    return lines.join('\n')
  }

  const handleShare = async () => {
    const text = buildShareText()

    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text })
        return
      } catch {
        // User cancelled or share failed — fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('복사에 실패했습니다. 브라우저 권한을 확인해주세요.')
    }
  }

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
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-1">
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-white/80 rounded-full transition-all duration-200 cursor-pointer touch-manipulation"
                      aria-label="레시피 공유"
                    >
                      {copied ? (
                        <ClipboardCheck className="w-5 h-5 text-green-500" />
                      ) : (
                        <Share2 className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full transition-all duration-200 cursor-pointer touch-manipulation"
                      aria-label="닫기"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="pr-20">
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

                  {copied && (
                    <p className="absolute bottom-2 right-4 text-xs text-green-600 font-medium">
                      레시피가 복사되었어요!
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto">
                  <div className="p-4 sm:p-6 space-y-6">
                    {/* Ingredients Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                          <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                          재료
                          <span className="ml-2 text-sm font-normal text-gray-400">
                            {checkedIngredients.size}/{recipe.ingredients.length} 준비됨
                          </span>
                        </h2>
                        {hasProgress && (
                          <button
                            onClick={resetProgress}
                            className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer touch-manipulation p-1 rounded transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>체크 초기화</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">재료를 탭하면 준비 완료로 표시돼요.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {recipe.ingredients.map((ingredient, index) => {
                          const checked = checkedIngredients.has(index)
                          return (
                            <button
                              key={index}
                              onClick={() => toggleIngredient(index)}
                              className={cn(
                                'flex items-center p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer touch-manipulation',
                                checked
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0 transition-colors',
                                  checked
                                    ? 'bg-green-500 text-white'
                                    : 'bg-orange-100 text-orange-600'
                                )}
                              >
                                {checked ? <Check className="w-4 h-4" /> : index + 1}
                              </div>
                              <span
                                className={cn(
                                  'text-sm sm:text-base transition-colors',
                                  checked ? 'text-gray-400 line-through' : 'text-gray-800'
                                )}
                              >
                                {ingredient}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Instructions Section */}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-orange-500" />
                        조리 순서
                        <span className="ml-2 text-sm font-normal text-gray-400">
                          {completedSteps.size}/{recipe.instructions.length} 완료
                        </span>
                      </h2>
                      <p className="text-xs text-gray-400 mb-3">완료한 단계를 탭하면 표시해둘 수 있어요.</p>
                      <div className="space-y-4">
                        {recipe.instructions.map((instruction, index) => {
                          const done = completedSteps.has(index)
                          return (
                            <button
                              key={index}
                              onClick={() => toggleStep(index)}
                              className={cn(
                                'w-full flex items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer touch-manipulation',
                                done
                                  ? 'bg-green-50 border-green-200 opacity-70'
                                  : 'bg-gradient-to-br from-orange-50 to-pink-50 border-orange-100'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 flex-shrink-0 mt-0.5 transition-colors',
                                  done
                                    ? 'bg-green-500'
                                    : 'bg-gradient-to-br from-orange-500 to-pink-500'
                                )}
                              >
                                {done ? <Check className="w-4 h-4" /> : index + 1}
                              </div>
                              <p
                                className={cn(
                                  'text-sm sm:text-base leading-relaxed transition-colors',
                                  done ? 'text-gray-400 line-through' : 'text-gray-800'
                                )}
                              >
                                {instruction}
                              </p>
                            </button>
                          )
                        })}
                      </div>

                      {recipe.instructions.length > 0 &&
                        completedSteps.size === recipe.instructions.length && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center">
                            <p className="text-green-700 font-semibold">🎉 요리 완성! 맛있게 드세요!</p>
                          </div>
                        )}
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
