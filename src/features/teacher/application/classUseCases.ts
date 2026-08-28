import { classesApi } from '../infrastructure/classesApi'

export function createTeacherClass(formData: FormData) {
  return classesApi.createClass(formData)
}
