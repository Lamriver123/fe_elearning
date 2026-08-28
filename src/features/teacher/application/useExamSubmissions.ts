import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { ExamSubmissionSummary } from '../domain/exam.types'
import { examApi } from '../infrastructure/examApi'

export function useExamSubmissions(classId: string, examId: string, isPublished: boolean) {
  const [submissions, setSubmissions] = useState<ExamSubmissionSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!classId || !examId || !isPublished) {
      setSubmissions([])
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    examApi.getSubmissions(classId, examId)
      .then((data) => {
        if (isMounted) setSubmissions(data)
      })
      .catch(() => {
        if (isMounted) toast.error('Không thể lấy danh sách bài nộp')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [classId, examId, isPublished])

  return { submissions, isLoading }
}
