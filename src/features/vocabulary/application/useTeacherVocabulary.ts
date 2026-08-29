import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { ApiError } from '../../../shared/lib/httpClient'
import type {
  CreateVocabularyWordPayload,
  ImportVocabularyDuplicateMode,
  ImportVocabularyResult,
  UpdateVocabularyWordPayload,
  VocabularyCategory,
  VocabularySentenceClassInteraction,
} from '../domain/vocabulary.types'
import {
  assignVocabularyClasses,
  createVocabularyCategory,
  createVocabularyWord,
  deleteVocabularyCategory,
  getTeacherVocabularyCategories,
  getTeacherVocabularyCategoryDetail,
  getTeacherVocabularySentenceInteractions,
  importVocabularyWords,
  reviewVocabularySentenceSubmission,
  updateVocabularyCategory,
  updateVocabularyWord,
} from './vocabularyUseCases'

export function useTeacherVocabulary() {
  const [categories, setCategories] = useState<VocabularyCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isInteractionLoading, setIsInteractionLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upsertCategory = useCallback((category: VocabularyCategory) => {
    setCategories((currentCategories) => {
      const categoryIndex = currentCategories.findIndex((item) => item.id === category.id)
      if (categoryIndex === -1) return [category, ...currentCategories]
      return currentCategories.map((item) => (item.id === category.id ? category : item))
    })
  }, [])

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTeacherVocabularyCategories()
      setCategories(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải danh mục từ vựng'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadCategoryDetail = useCallback(async (categoryId: string) => {
    setIsDetailLoading(true)
    try {
      const category = await getTeacherVocabularyCategoryDetail(categoryId)
      upsertCategory(category)
      return category
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải chi tiết danh mục'
      toast.error(message)
      return null
    } finally {
      setIsDetailLoading(false)
    }
  }, [upsertCategory])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshCategories()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [refreshCategories])

  const createCategory = async (name: string, description?: string) => {
    setIsMutating(true)
    try {
      const response = await createVocabularyCategory({ name, description })
      toast.success(response.message)
      await refreshCategories()
      return response.category
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tạo danh mục'
      toast.error(message)
      return null
    } finally {
      setIsMutating(false)
    }
  }

  const updateCategory = async (categoryId: string, name: string, description?: string) => {
    setIsMutating(true)
    try {
      const response = await updateVocabularyCategory(categoryId, { name, description })
      toast.success(response.message)
      await refreshCategories()
      return response.category
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể cập nhật danh mục'
      toast.error(message)
      return null
    } finally {
      setIsMutating(false)
    }
  }

  const removeCategory = async (categoryId: string) => {
    setIsMutating(true)
    try {
      const response = await deleteVocabularyCategory(categoryId)
      toast.success(response.message)
      await refreshCategories()
      return true
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể xóa danh mục'
      toast.error(message)
      return false
    } finally {
      setIsMutating(false)
    }
  }

  const assignClasses = async (categoryId: string, classIds: string[]) => {
    setIsMutating(true)
    try {
      const response = await assignVocabularyClasses(categoryId, classIds)
      toast.success(response.message)
      await refreshCategories()
      return response.category
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể cập nhật lớp học'
      toast.error(message)
      return null
    } finally {
      setIsMutating(false)
    }
  }

  const importWords = async (
    categoryId: string,
    file: File,
    duplicateMode?: ImportVocabularyDuplicateMode,
  ): Promise<ImportVocabularyResult | null> => {
    setIsMutating(true)
    try {
      const response = await importVocabularyWords(categoryId, file, duplicateMode)
      toast.success(`Đã import ${response.importedCount} từ vựng`)
      if (response.duplicateTerms?.length && duplicateMode === 'overwrite') {
        toast(`Đã ghi đè ${response.duplicateTerms.length} từ trùng`)
      }
      if (response.skippedRows.length > 0) {
        toast(`Bỏ qua ${response.skippedRows.length} dòng thiếu dữ liệu bắt buộc`)
      }
      await refreshCategories()
      return response
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409 && err.payload?.duplicateTerms?.length) {
        return {
          requiresDuplicateDecision: true,
          message: err.message,
          duplicateTerms: err.payload.duplicateTerms,
        }
      }

      const message = err instanceof ApiError ? err.message : 'Không thể import từ vựng'
      toast.error(message)
      return null
    } finally {
      setIsMutating(false)
    }
  }

  const createWord = async (categoryId: string, payload: CreateVocabularyWordPayload) => {
    setIsMutating(true)
    try {
      const response = await createVocabularyWord(categoryId, payload)
      toast.success(response.message)
      await refreshCategories()
      return response.word
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tạo từ vựng'
      toast.error(message)
      return null
    } finally {
      setIsMutating(false)
    }
  }

  const updateWord = async (wordId: string, payload: UpdateVocabularyWordPayload) => {
    setIsMutating(true)
    try {
      const response = await updateVocabularyWord(wordId, payload)
      toast.success(response.message)
      await refreshCategories()
      return response.word
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể cập nhật từ vựng'
      toast.error(message)
      return null
    } finally {
      setIsMutating(false)
    }
  }

  const loadSentenceInteractions = async (categoryId: string): Promise<VocabularySentenceClassInteraction[]> => {
    setIsInteractionLoading(true)
    try {
      return await getTeacherVocabularySentenceInteractions(categoryId)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải tương tác học sinh'
      toast.error(message)
      return []
    } finally {
      setIsInteractionLoading(false)
    }
  }

  const reviewSentenceSubmission = async (submissionId: string, feedback?: string | null) => {
    setIsMutating(true)
    try {
      const response = await reviewVocabularySentenceSubmission(submissionId, feedback)
      toast.success(response.message)
      return response.submission
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể lưu nhận xét'
      toast.error(message)
      return null
    } finally {
      setIsMutating(false)
    }
  }

  return {
    categories,
    isLoading,
    isDetailLoading,
    isInteractionLoading,
    isMutating,
    error,
    refreshCategories,
    loadCategoryDetail,
    createCategory,
    updateCategory,
    removeCategory,
    assignClasses,
    importWords,
    createWord,
    updateWord,
    loadSentenceInteractions,
    reviewSentenceSubmission,
  }
}
