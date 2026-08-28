import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { TeacherClassDetailInfo } from '../domain/teacher.types'
import { handleApiError } from '../../../shared/lib/handleApiError'
import { getTeacherClassDetail } from './classUseCases'

export function useTeacherClassDetail(classId: string) {
  const [classDetail, setClassDetail] = useState<TeacherClassDetailInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClassDetail = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTeacherClassDetail(classId)
      setClassDetail(data)
    } catch (err) {
      const message = handleApiError(err, 'Không thể tải thông tin lớp học')
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchClassDetail()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [fetchClassDetail])

  return {
    classDetail,
    isLoading,
    error,
    refreshClassDetail: fetchClassDetail,
  }
}
