import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { classMembersApi } from '../infrastructure/classMembersApi'
import type { ClassMemberStatus, StudentMember } from '../domain/classMember.types'
import { handleApiError } from '../../../shared/lib/handleApiError'

export function useClassMembers(classId: string) {
  const [members, setMembers] = useState<StudentMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await classMembersApi.getMembers(classId)
      setMembers(data)
    } catch (err) {
      setError(handleApiError(err, 'Lỗi khi tải danh sách'))
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    void refreshMembers()
  }, [refreshMembers])

  const updateMemberStatus = useCallback(async (
    studentId: string,
    status: Extract<ClassMemberStatus, 'APPROVED' | 'REJECTED'>,
  ) => {
    try {
      await classMembersApi.updateMemberStatus(classId, studentId, status)
      toast.success(status === 'APPROVED' ? 'Đã duyệt học sinh' : 'Đã từ chối học sinh')
      await refreshMembers()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Có lỗi xảy ra'))
      return false
    }
  }, [classId, refreshMembers])

  const removeMember = useCallback(async (studentId: string) => {
    try {
      await classMembersApi.removeMember(classId, studentId)
      toast.success('Đã xóa học sinh khỏi lớp')
      await refreshMembers()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Có lỗi xảy ra'))
      return false
    }
  }, [classId, refreshMembers])

  return {
    members,
    isLoading,
    error,
    refreshMembers,
    updateMemberStatus,
    removeMember,
  }
}
