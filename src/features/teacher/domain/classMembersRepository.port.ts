import type { ClassInviteCandidate, ClassMemberStatus, StudentMember } from './classMember.types'

export type ClassMembersRepository = {
  getMembers(classId: string): Promise<StudentMember[]>
  searchInviteCandidates(classId: string, query: string): Promise<ClassInviteCandidate[]>
  inviteStudent(classId: string, email: string): Promise<{ message: string }>
  cancelInvitation(classId: string, studentId: string): Promise<{ message: string }>
  updateMemberStatus(
    classId: string,
    studentId: string,
    status: Extract<ClassMemberStatus, 'APPROVED' | 'REJECTED'>,
  ): Promise<void>
  removeMember(classId: string, studentId: string): Promise<void>
}
