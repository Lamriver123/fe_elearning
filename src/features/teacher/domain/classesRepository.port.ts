import type { ClassInfo, TeacherClassDetailInfo } from './teacher.types'

export type CreateClassResult = {
  message: string
  class: ClassInfo
}

export type TeacherClassesRepository = {
  getMyClasses(): Promise<ClassInfo[]>
  getClassDetail(classId: string): Promise<TeacherClassDetailInfo>
  createClass(formData: FormData): Promise<CreateClassResult>
}
