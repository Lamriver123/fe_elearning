import type { StudentClassDetailInfo, StudentClassInfo } from './studentClasses.types'

export type StudentClassesRepository = {
  getMyClasses(): Promise<StudentClassInfo[]>
  getClassDetail(classId: string): Promise<StudentClassDetailInfo>
  joinClass(inviteCode: string): Promise<{ message: string }>
  previewClass(inviteCode: string): Promise<StudentClassInfo>
  acceptInvite(classId: string): Promise<{ message: string }>
}
