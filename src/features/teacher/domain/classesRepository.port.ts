import type { ClassInfo } from './teacher.types'

export type CreateClassResult = {
  message: string
  class: ClassInfo
}

export type TeacherClassesRepository = {
  getMyClasses(): Promise<ClassInfo[]>
  createClass(formData: FormData): Promise<CreateClassResult>
}
