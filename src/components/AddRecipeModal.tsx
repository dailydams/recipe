'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Upload, Loader2, Plus, Trash2, Save, PenLine } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

interface AddRecipeModalProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'image' | 'manual'
type Category = '전체' | '소담' | '어른'

export default function AddRecipeModal({ isOpen, onClose }: AddRecipeModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('image')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체')

  // Manual entry state
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState<string[]>([''])

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', selectedCategory)

      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image')
      }

      console.log('Recipe extracted successfully:', data.recipe)

      // Close modal after processing
      handleClose()

      // Refresh the page to show new recipe
      window.location.reload()
    } catch (err) {
      console.error('Error processing image:', err)
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: isProcessing
  })

  // Manual entry handlers
  const instructionRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const [focusIndex, setFocusIndex] = useState<number | null>(null)

  useEffect(() => {
    if (focusIndex !== null) {
      instructionRefs.current[focusIndex]?.focus()
      setFocusIndex(null)
    }
  }, [focusIndex, instructions])

  const addInstruction = () => {
    setInstructions([...instructions, ''])
    setFocusIndex(instructions.length)
  }
  const removeInstruction = (index: number) =>
    setInstructions(instructions.filter((_, i) => i !== index))
  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }
  const handleInstructionKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // Enter -> next step, Shift+Enter -> newline within a step
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (index === instructions.length - 1) {
        setInstructions([...instructions, ''])
      }
      setFocusIndex(index + 1)
    }
  }

  const handleManualSave = async () => {
    if (!title.trim()) {
      setError('레시피 제목을 입력해주세요.')
      return
    }

    const filteredIngredients = ingredients
      .split(/[,\n]/)
      .map((ing) => ing.trim())
      .filter(Boolean)
    const filteredInstructions = instructions.filter((inst) => inst.trim())

    if (filteredIngredients.length === 0) {
      setError('최소 하나의 재료를 입력해주세요.')
      return
    }

    if (filteredInstructions.length === 0) {
      setError('최소 하나의 조리법을 입력해주세요.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          source: '직접 작성',
          source_type: 'manual',
          category: selectedCategory,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || '레시피 저장에 실패했습니다.')
      }

      handleClose()
      window.location.reload()
    } catch (err) {
      console.error('Error saving recipe:', err)
      setError(err instanceof Error ? err.message : '레시피 저장에 실패했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (isProcessing) return
    setError(null)
    setActiveTab('image')
    setSelectedCategory('전체')
    setTitle('')
    setIngredients('')
    setInstructions([''])
    onClose()
  }

  const switchTab = (tab: Tab) => {
    if (isProcessing) return
    setError(null)
    setActiveTab(tab)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">레시피 추가</h2>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors p-2 rounded-full cursor-pointer touch-manipulation"
                      disabled={isProcessing}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tab Selector */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => switchTab('image')}
                      disabled={isProcessing}
                      className={cn(
                        'flex items-center justify-center space-x-1.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer touch-manipulation disabled:cursor-not-allowed',
                        activeTab === 'image'
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      <Upload className="w-4 h-4" />
                      <span>이미지 업로드</span>
                    </button>
                    <button
                      onClick={() => switchTab('manual')}
                      disabled={isProcessing}
                      className={cn(
                        'flex items-center justify-center space-x-1.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer touch-manipulation disabled:cursor-not-allowed',
                        activeTab === 'manual'
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      <PenLine className="w-4 h-4" />
                      <span>직접 작성</span>
                    </button>
                  </div>

                  {/* Category Selection (shared) */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">카테고리 선택</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as Category)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900"
                    >
                      <option value="전체">🍽️ 전체</option>
                      <option value="소담">👶 소담</option>
                      <option value="어른">👨‍🍳 어른</option>
                    </select>
                  </div>

                  {/* Image Upload Tab */}
                  {activeTab === 'image' && (
                    <div
                      {...getRootProps()}
                      className={cn(
                        'relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 touch-manipulation',
                        isDragActive
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/30 active:bg-orange-50/50',
                        isProcessing && 'opacity-50 cursor-not-allowed pointer-events-none'
                      )}
                    >
                      <input {...getInputProps()} />

                      {isProcessing ? (
                        <div className="space-y-4">
                          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
                          <div>
                            <p className="text-base sm:text-lg font-medium text-gray-900">이미지 처리중...</p>
                            <p className="text-xs sm:text-sm text-gray-600">레시피 정보를 추출하고 있어요</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-medium text-gray-900">
                              {isDragActive ? '여기에 이미지를 놓아주세요' : '드래그하거나 클릭해서 이미지 업로드'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              PNG, JPG, JPEG, GIF, WebP (최대 10MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual Entry Tab */}
                  {activeTab === 'manual' && (
                    <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">레시피 제목</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                          placeholder="레시피 제목을 입력하세요"
                          disabled={isProcessing}
                        />
                      </div>

                      {/* Ingredients */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">재료</label>
                        <textarea
                          value={ingredients}
                          onChange={(e) => setIngredients(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[80px] resize-none text-gray-900"
                          placeholder="쉼표로 구분해서 입력하세요&#10;예: 양파 1개, 당근 2개, 소금 약간"
                          disabled={isProcessing}
                        />
                        <p className="text-xs text-gray-500 mt-1">쉼표(,) 또는 줄바꿈으로 재료를 구분해주세요.</p>
                      </div>

                      {/* Instructions */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">조리법</label>
                          <button
                            onClick={addInstruction}
                            className="text-orange-600 hover:text-orange-700 active:text-orange-800 text-sm flex items-center space-x-1 cursor-pointer touch-manipulation p-1 rounded hover:bg-orange-50 active:bg-orange-100 transition-colors"
                            disabled={isProcessing}
                          >
                            <Plus className="w-4 h-4" />
                            <span>단계 추가</span>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {instructions.map((instruction, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-medium mt-1">
                                {index + 1}
                              </div>
                              <textarea
                                ref={(el) => {
                                  instructionRefs.current[index] = el
                                }}
                                value={instruction}
                                onChange={(e) => updateInstruction(index, e.target.value)}
                                onKeyDown={(e) => handleInstructionKeyDown(index, e)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[60px] resize-none text-gray-900"
                                placeholder={`${index + 1}단계 조리법 (Enter: 다음 단계)`}
                                disabled={isProcessing}
                              />
                              <button
                                onClick={() => removeInstruction(index)}
                                className="text-red-500 hover:text-red-700 active:text-red-800 p-2 mt-1 rounded-full hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
                                disabled={isProcessing || instructions.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Manual Save Button */}
                  {activeTab === 'manual' && (
                    <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
                        disabled={isProcessing}
                      >
                        취소
                      </button>
                      <button
                        onClick={handleManualSave}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all flex items-center space-x-2 cursor-pointer touch-manipulation disabled:opacity-50"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>저장 중...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>저장</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
