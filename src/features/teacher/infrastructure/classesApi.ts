import { httpClient } from '../../../shared/lib/httpClient'
import type { ClassInfo } from '../domain/teacher.types'

export const classesApi = {
  getMyClasses: (): Promise<ClassInfo[]> => {
    return httpClient.get<ClassInfo[]>('/classes')
  },
  
  createClass: (formData: FormData): Promise<{ message: string, class: ClassInfo }> => {
    // Axios will automatically set Content-Type to multipart/form-data with boundary when passing FormData
    return httpClient.post<{ message: string, class: ClassInfo }>('/classes', formData)
  }
}
