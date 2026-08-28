import type { StudentClassInfo } from './studentClasses.types'

export type StudentClassesRepository = {
  getMyClasses(): Promise<StudentClassInfo[]>
  joinClass(inviteCode: string): Promise<{ message: string }>
  previewClass(inviteCode: string): Promise<StudentClassInfo>
  acceptInvite(classId: string): Promise<{ message: string }>
}
