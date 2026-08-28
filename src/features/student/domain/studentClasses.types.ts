export type StudentClassInfo = {
  id: string
  name: string
  description?: string
  poster?: string
  inviteCode: string
  status: 'ACTIVE' | 'DELETE'
  createdAt: string
  teacherName: string
  joinedAt: string
  memberStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'INVITED'
}

export type StudentClassDetailInfo = StudentClassInfo & {
  teacherEmail?: string
  studentsCount?: number
}
