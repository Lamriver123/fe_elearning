import { httpClient } from '../../../shared/lib/httpClient'
import type { StudentClassInfo } from '../domain/studentClasses.types'

export const studentClassesApi = {
  getMyClasses: (): Promise<StudentClassInfo[]> => {
    return httpClient.get<any, StudentClassInfo[]>('/classes')
  },
  
  joinClass: (inviteCode: string): Promise<{ message: string }> => {
    return httpClient.post<any, { message: string }>(`/classes/join/${inviteCode}`)
  },
  
  previewClass: (inviteCode: string): Promise<StudentClassInfo> => {
    return httpClient.get<any, StudentClassInfo>(`/classes/invite/${inviteCode}/preview`)
  },
  
  acceptInvite: (classId: string): Promise<{ message: string }> => {
    return httpClient.post<any, { message: string }>(`/classes/${classId}/accept-invite`)
  }
}
