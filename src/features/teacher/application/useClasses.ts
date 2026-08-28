import { useState, useEffect } from 'react'
import type { ClassInfo } from '../domain/teacher.types'
import { ApiError } from '../../../shared/lib/httpClient'
import { toast } from 'react-hot-toast'
import { getTeacherClasses } from './classUseCases'

export function useClasses() {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTeacherClasses()
      
      const classesWithMock = data.map((cls, index) => {
        // Ánh xạ trạng thái từ backend: ACTIVE -> ongoing, DELETE -> finished
        const statusMock = cls.status === 'DELETE' ? 'finished' : 'ongoing'
        return {
          ...cls,
          statusMock,
          scheduleMock: index === 0 ? 'T2, T4, T6' : index === 1 ? 'T3, T5, CN' : undefined,
        }
      })
      setClasses(classesWithMock as ClassInfo[])
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải danh sách lớp học'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchClasses()
  }, [])

  return { classes, isLoading, error, refreshClasses: fetchClasses }
}
