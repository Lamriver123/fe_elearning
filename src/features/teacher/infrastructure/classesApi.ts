import { httpClient } from '../../../shared/lib/httpClient'
import type { ClassInfo } from '../domain/teacher.types'

export const classesApi = {
  getMyClasses: (): Promise<ClassInfo[]> => {
    return httpClient.get('/classes') as Promise<ClassInfo[]>
  },
  
  createClass: (formData: FormData): Promise<{ message: string, class: ClassInfo }> => {
    // Axios will automatically set Content-Type to multipart/form-data with boundary when passing FormData
    return httpClient.post('/classes', formData) as Promise<{ message: string, class: ClassInfo }>
  }
}
