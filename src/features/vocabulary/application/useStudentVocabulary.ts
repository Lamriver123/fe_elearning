import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { ApiError } from '../../../shared/lib/httpClient'
import type {
  VocabularyCategory,
  VocabularyProgress,
  VocabularyReviewDifficulty,
  VocabularySentenceSubmission,
} from '../domain/vocabulary.types'
import {
  getStudentVocabularyCategories,
  getStudentVocabularySentenceSubmissions,
  reviewVocabularyWord,
  submitVocabularySentence,
} from './vocabularyUseCases'

export function useStudentVocabulary(classId?: string) {
  const [categories, setCategories] = useState<VocabularyCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingReviewCount, setPendingReviewCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const isReviewing = pendingReviewCount > 0

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getStudentVocabularyCategories(classId)
      setCategories(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải từ vựng'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshCategories()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [refreshCategories])

  const applyProgress = (
    wordId: string,
    progress: VocabularyProgress,
    sentenceSubmission?: VocabularySentenceSubmission,
  ) => {
    setCategories((currentCategories) =>
      currentCategories.map((category) => ({
        ...category,
        words: category.words?.map((word) =>
          word.id === wordId
            ? {
                ...word,
                progress,
                sentenceSubmissionCount: sentenceSubmission
                  ? (word.sentenceSubmissionCount ?? 0) + 1
                  : word.sentenceSubmissionCount,
                latestSentenceSubmission: sentenceSubmission ?? word.latestSentenceSubmission,
              }
            : word,
        ),
      })),
    )
  }

  const reviewWord = async (wordId: string, difficulty: VocabularyReviewDifficulty) => {
    setPendingReviewCount((currentCount) => currentCount + 1)
    try {
      const response = await reviewVocabularyWord(wordId, difficulty)
      applyProgress(wordId, response.progress, response.sentenceSubmission)
      return response.progress
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể lưu tiến độ học'
      toast.error(message)
      return null
    } finally {
      setPendingReviewCount((currentCount) => Math.max(0, currentCount - 1))
    }
  }

  const submitSentence = async (wordId: string, sentence: string) => {
    try {
      const response = await submitVocabularySentence(wordId, sentence)
      setCategories((currentCategories) =>
        currentCategories.map((category) => ({
          ...category,
          words: category.words?.map((word) =>
            word.id === wordId
              ? {
                  ...word,
                  sentenceSubmissionCount: (word.sentenceSubmissionCount ?? 0) + 1,
                  latestSentenceSubmission: response.submission,
                }
              : word,
          ),
        })),
      )
      return response.submission
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể gửi câu đặt'
      toast.error(message)
      return null
    }
  }

  const loadSentenceSubmissions = async (categoryId: string) => {
    try {
      return await getStudentVocabularySentenceSubmissions(categoryId)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải nhận xét từ vựng'
      toast.error(message)
      return []
    }
  }

  return {
    categories,
    isLoading,
    isReviewing,
    error,
    refreshCategories,
    reviewWord,
    submitSentence,
    loadSentenceSubmissions,
  }
}
