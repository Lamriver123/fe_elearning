export type ClassInfo = {
  id: string
  name: string
  description?: string
  poster?: string
  inviteCode: string
  status: 'ACTIVE' | 'DELETE'
  createdAt: string
  studentsCount?: number
  // Tạm thời thêm các trường mock cho UI vì API chưa trả về
  statusMock?: 'ongoing' | 'finished' | 'upcoming'
  scheduleMock?: string
}
