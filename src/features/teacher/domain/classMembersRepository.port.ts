import type { ClassMemberStatus, StudentMember } from './classMember.types'

export type ClassMembersRepository = {
  getMembers(classId: string): Promise<StudentMember[]>
  updateMemberStatus(
    classId: string,
    studentId: string,
    status: Extract<ClassMemberStatus, 'APPROVED' | 'REJECTED'>,
  ): Promise<void>
  removeMember(classId: string, studentId: string): Promise<void>
}
