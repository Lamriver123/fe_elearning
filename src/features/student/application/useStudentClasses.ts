import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import type { StudentClassInfo } from '../domain/studentClasses.types'
import { studentClassesApi } from '../infrastructure/studentClassesApi'
import { handleApiError } from '../../../shared/lib/handleApiError'

export function useStudentClasses() {
  const [classes, setClasses] = useState<StudentClassInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await studentClassesApi.getMyClasses()
      setClasses(data)
    } catch (err) {
      const msg = handleApiError(err, 'Đã xảy ra lỗi khi tải danh sách lớp học')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchClasses()
  }, [fetchClasses])

  const handleJoinClass = async (inviteCode: string) => {
    if (!inviteCode.trim()) {
      toast.error('Vui lòng nhập mã lớp')
      return false
    }

    try {
      setIsJoining(true)
      const res = await studentClassesApi.joinClass(inviteCode.trim())
      toast.success(res.message)
      await fetchClasses()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Lỗi kết nối khi xin vào lớp'))
      return false
    } finally {
      setIsJoining(false)
    }
  }

  const handlePreviewClass = async (inviteCode: string) => {
    if (!inviteCode.trim()) {
      toast.error('Vui lòng nhập mã lớp')
      return null
    }

    try {
      setIsJoining(true)
      const res = await studentClassesApi.previewClass(inviteCode.trim())
      return res
    } catch (err) {
      toast.error(handleApiError(err, 'Lỗi kết nối khi tìm lớp học'))
      return null
    } finally {
      setIsJoining(false)
    }
  }

  const handleAcceptInvite = async (classId: string) => {
    try {
      const res = await studentClassesApi.acceptInvite(classId)
      toast.success(res.message)
      await fetchClasses()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Lỗi kết nối khi nhận lời mời'))
      return false
    }
  }

  return {
    classes,
    isLoading,
    error,
    isJoining,
    refreshClasses: fetchClasses,
    handleJoinClass,
    handlePreviewClass,
    handleAcceptInvite
  }
}
