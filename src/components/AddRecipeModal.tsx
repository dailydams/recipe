'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Upload, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

interface AddRecipeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddRecipeModal({ isOpen, onClose }: AddRecipeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

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


  const handleClose = () => {
    if (isProcessing) return
    setError(null)
    onClose()
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
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">레시피 이미지 업로드</h2>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors p-2 rounded-full cursor-pointer touch-manipulation"
                      disabled={isProcessing}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div
                    {...getRootProps()}
                    className={cn(
                      "relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 touch-manipulation",
                      isDragActive 
                        ? "border-orange-400 bg-orange-50" 
                        : "border-gray-300 hover:border-orange-400 hover:bg-orange-50/30 active:bg-orange-50/50",
                      isProcessing && "opacity-50 cursor-not-allowed pointer-events-none"
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

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
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