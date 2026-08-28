import { httpClient } from '../../../shared/lib/httpClient'
import type { StudentClassDetailInfo, StudentClassInfo } from '../domain/studentClasses.types'
import type { StudentClassesRepository } from '../domain/studentClassesRepository.port'

export const studentClassesApi: StudentClassesRepository = {
  getMyClasses: (): Promise<StudentClassInfo[]> => {
    return httpClient.get('/classes') as Promise<StudentClassInfo[]>
  },

  getClassDetail: (classId: string): Promise<StudentClassDetailInfo> => {
    return httpClient.get(`/classes/${classId}`) as Promise<StudentClassDetailInfo>
  },
  
  joinClass: (inviteCode: string): Promise<{ message: string }> => {
    return httpClient.post(`/classes/join/${inviteCode}`) as Promise<{ message: string }>
  },
  
  previewClass: (inviteCode: string): Promise<StudentClassInfo> => {
    return httpClient.get(`/classes/invite/${inviteCode}/preview`) as Promise<StudentClassInfo>
  },
  
  acceptInvite: (classId: string): Promise<{ message: string }> => {
    return httpClient.post(`/classes/${classId}/accept-invite`) as Promise<{ message: string }>
  }
}
