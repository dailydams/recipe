'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { Recipe } from '@/types'

interface EditRecipeModalProps {
  isOpen: boolean
  onClose: () => void
  recipe: Recipe
  onRecipeUpdated: () => void
}

export default function EditRecipeModal({ isOpen, onClose, recipe, onRecipeUpdated }: EditRecipeModalProps) {
  const [title, setTitle] = useState(recipe.title)
  const [ingredients, setIngredients] = useState<string[]>([...recipe.ingredients])
  const [instructions, setInstructions] = useState<string[]>([...recipe.instructions])
  const [category, setCategory] = useState<'전체' | '소담' | '어른'>(recipe.category)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (isLoading) return
    setError(null)
    // Reset form to original recipe data
    setTitle(recipe.title)
    setIngredients([...recipe.ingredients])
    setInstructions([...recipe.instructions])
    setCategory(recipe.category)
    onClose()
  }

  const addIngredient = () => {
    setIngredients([...ingredients, ''])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients]
    updated[index] = value
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ''])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('레시피 제목을 입력해주세요.')
      return
    }

    const filteredIngredients = ingredients.filter(ing => ing.trim())
    const filteredInstructions = instructions.filter(inst => inst.trim())

    if (filteredIngredients.length === 0) {
      setError('최소 하나의 재료를 입력해주세요.')
      return
    }

    if (filteredInstructions.length === 0) {
      setError('최소 하나의 조리법을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          category: category
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update recipe')
      }

      onRecipeUpdated()
      handleClose()
    } catch (err) {
      console.error('Error updating recipe:', err)
      setError(err instanceof Error ? err.message : '레시피 업데이트에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">레시피 수정</h2>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Recipe Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      레시피 제목
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="레시피 제목을 입력하세요"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as '전체' | '소담' | '어른')}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900"
                    >
                      <option value="전체">🍽️ 전체</option>
                      <option value="소담">👶 소담</option>
                      <option value="어른">👨‍🍳 어른</option>
                    </select>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        재료
                      </label>
                      <button
                        onClick={addIngredient}
                        className="text-orange-600 hover:text-orange-700 active:text-orange-800 text-sm flex items-center space-x-1 cursor-pointer touch-manipulation p-1 rounded hover:bg-orange-50 active:bg-orange-100 transition-colors"
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4" />
                        <span>재료 추가</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => updateIngredient(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder={`재료 ${index + 1}`}
                            disabled={isLoading}
                          />
                          <button
                            onClick={() => removeIngredient(index)}
                            className="text-red-500 hover:text-red-700 active:text-red-800 p-2 rounded-full hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer touch-manipulation"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        조리법
                      </label>
                      <button
                        onClick={addInstruction}
                        className="text-orange-600 hover:text-orange-700 text-sm flex items-center space-x-1"
                        disabled={isLoading}
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
                            value={instruction}
                            onChange={(e) => updateInstruction(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[60px] resize-none"
                            placeholder={`${index + 1}단계 조리법을 입력하세요`}
                            disabled={isLoading}
                          />
                          <button
                            onClick={() => removeInstruction(index)}
                            className="text-red-500 hover:text-red-700 p-1 mt-1"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={isLoading}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
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
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}