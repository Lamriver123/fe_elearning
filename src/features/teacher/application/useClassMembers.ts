import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { ClassInviteCandidate, ClassMemberStatus, StudentMember } from '../domain/classMember.types'
import { handleApiError } from '../../../shared/lib/handleApiError'
import {
  cancelClassInvitation,
  getClassMembers,
  inviteStudentToClass,
  removeClassMember,
  searchClassInviteCandidates,
  updateClassMemberStatus,
} from './classMemberUseCases'

export function useClassMembers(classId: string) {
  const [members, setMembers] = useState<StudentMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteCandidates, setInviteCandidates] = useState<ClassInviteCandidate[]>([])
  const [isSearchingInviteCandidates, setIsSearchingInviteCandidates] = useState(false)
  const [inviteSearchError, setInviteSearchError] = useState<string | null>(null)
  const [isInvitingStudent, setIsInvitingStudent] = useState(false)

  const refreshMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getClassMembers(classId)
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

  const searchInviteCandidates = useCallback(async (query: string) => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      setInviteCandidates([])
      setInviteSearchError(null)
      setIsSearchingInviteCandidates(false)
      return
    }

    try {
      setIsSearchingInviteCandidates(true)
      setInviteSearchError(null)
      const data = await searchClassInviteCandidates(classId, trimmedQuery)
      setInviteCandidates(data)
    } catch (err) {
      setInviteCandidates([])
      setInviteSearchError(handleApiError(err, 'Không thể tìm học sinh'))
    } finally {
      setIsSearchingInviteCandidates(false)
    }
  }, [classId])

  const inviteStudent = useCallback(async (candidate: ClassInviteCandidate) => {
    try {
      setIsInvitingStudent(true)
      const result = await inviteStudentToClass(classId, candidate.email)
      toast.success(result.message || `Đã gửi lời mời tới ${candidate.fullName}`)
      setInviteCandidates((currentCandidates) => (
        currentCandidates.filter((item) => item.id !== candidate.id)
      ))
      await refreshMembers()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể gửi lời mời'))
      return false
    } finally {
      setIsInvitingStudent(false)
    }
  }, [classId, refreshMembers])

  const updateMemberStatus = useCallback(async (
    studentId: string,
    status: Extract<ClassMemberStatus, 'APPROVED' | 'REJECTED'>,
  ) => {
    try {
      await updateClassMemberStatus(classId, studentId, status)
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
      await removeClassMember(classId, studentId)
      toast.success('Đã xóa học sinh khỏi lớp')
      await refreshMembers()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Có lỗi xảy ra'))
      return false
    }
  }, [classId, refreshMembers])

  const cancelInvitation = useCallback(async (studentId: string) => {
    try {
      const result = await cancelClassInvitation(classId, studentId)
      toast.success(result.message || 'Đã hủy lời mời')
      await refreshMembers()
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể hủy lời mời'))
      return false
    }
  }, [classId, refreshMembers])

  return {
    members,
    isLoading,
    error,
    inviteCandidates,
    isSearchingInviteCandidates,
    inviteSearchError,
    isInvitingStudent,
    refreshMembers,
    searchInviteCandidates,
    inviteStudent,
    updateMemberStatus,
    removeMember,
    cancelInvitation,
  }
}
