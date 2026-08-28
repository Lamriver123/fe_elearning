import { studentClassesApi } from '../infrastructure/studentClassesApi'

export function getStudentClasses() {
  return studentClassesApi.getMyClasses()
}

export function getStudentClassDetail(classId: string) {
  return studentClassesApi.getClassDetail(classId)
}

export function joinStudentClass(inviteCode: string) {
  return studentClassesApi.joinClass(inviteCode)
}

export function previewStudentClass(inviteCode: string) {
  return studentClassesApi.previewClass(inviteCode)
}

export function acceptStudentClassInvite(classId: string) {
  return studentClassesApi.acceptInvite(classId)
}
