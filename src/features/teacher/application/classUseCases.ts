import { classesApi } from '../infrastructure/classesApi'

export function getTeacherClasses() {
  return classesApi.getMyClasses()
}

export function getTeacherClassDetail(classId: string) {
  return classesApi.getClassDetail(classId)
}

export function createTeacherClass(formData: FormData) {
  return classesApi.createClass(formData)
}
