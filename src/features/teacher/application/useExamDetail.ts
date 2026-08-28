import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { Exam } from '../domain/exam.types'
import { examApi } from '../infrastructure/examApi'
import { handleApiError } from '../../../shared/lib/handleApiError'

export function useExamDetail(classId?: string, examId?: string) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)

  const refreshExam = useCallback(async () => {
    if (!classId || !examId) {
      setIsLoading(false)
      setExam(null)
      return
    }

    try {
      setIsLoading(true)
      const data = await examApi.getExamDetail(classId, examId)
      setExam(data)
    } catch (err) {
      toast.error(handleApiError(err, 'Lỗi khi tải thông tin đề thi'))
      setExam(null)
    } finally {
      setIsLoading(false)
    }
  }, [classId, examId])

  useEffect(() => {
    void refreshExam()
  }, [refreshExam])

  const publishExam = useCallback(async () => {
    if (!classId || !examId) return false

    try {
      setIsPublishing(true)
      await examApi.publishExam(classId, examId)
      toast.success('Xuất bản đề thi thành công')
      setExam((prev) => prev ? { ...prev, status: 'PUBLISHED' } : null)
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể xuất bản đề thi'))
      return false
    } finally {
      setIsPublishing(false)
    }
  }, [classId, examId])

  const deleteSection = useCallback(async (sectionId: string) => {
    if (!classId || !examId) return false

    try {
      await examApi.deleteSection(classId, examId, sectionId)
      toast.success('Xóa phần thi thành công')
      await refreshExam()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể xóa phần thi'))
      return false
    }
  }, [classId, examId, refreshExam])

  const deleteQuestion = useCallback(async (sectionId: string, questionId: string) => {
    if (!classId || !examId) return false

    try {
      await examApi.deleteQuestion(classId, examId, sectionId, questionId)
      toast.success('Xóa câu hỏi thành công')
      await refreshExam()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể xóa câu hỏi'))
      return false
    }
  }, [classId, examId, refreshExam])

  const deleteFile = useCallback(async (fileId: string) => {
    if (!classId || !examId) return false

    try {
      await examApi.deleteFile(classId, examId, fileId)
      toast.success('Xóa file thành công')
      await refreshExam()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể xóa file'))
      return false
    }
  }, [classId, examId, refreshExam])

  return {
    exam,
    isLoading,
    isPublishing,
    refreshExam,
    publishExam,
    deleteSection,
    deleteQuestion,
    deleteFile,
  }
}
