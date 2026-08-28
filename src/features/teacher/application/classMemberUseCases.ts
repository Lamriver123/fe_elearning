import type { ClassMemberStatus } from '../domain/classMember.types'
import { classMembersApi } from '../infrastructure/classMembersApi'

export function getClassMembers(classId: string) {
  return classMembersApi.getMembers(classId)
}

export function searchClassInviteCandidates(classId: string, query: string) {
  return classMembersApi.searchInviteCandidates(classId, query)
}

export function inviteStudentToClass(classId: string, email: string) {
  return classMembersApi.inviteStudent(classId, email)
}

export function cancelClassInvitation(classId: string, studentId: string) {
  return classMembersApi.cancelInvitation(classId, studentId)
}

export function updateClassMemberStatus(
  classId: string,
  studentId: string,
  status: Extract<ClassMemberStatus, 'APPROVED' | 'REJECTED'>,
) {
  return classMembersApi.updateMemberStatus(classId, studentId, status)
}

export function removeClassMember(classId: string, studentId: string) {
  return classMembersApi.removeMember(classId, studentId)
}
