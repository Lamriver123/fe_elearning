import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { FullExamResult, StudentAnswerResult } from '../../student/domain/studentExam.types'
import { examApi } from '../infrastructure/examApi'
import { handleApiError } from '../../../shared/lib/handleApiError'

export type GradeDraft = {
  score: number
  comment: string
}

export function useSubmissionGrader(classId?: string, examId?: string, studentId?: string) {
  const [result, setResult] = useState<FullExamResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [grades, setGrades] = useState<Record<string, GradeDraft>>({})

  useEffect(() => {
    if (!classId || !examId || !studentId) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    examApi.getStudentResult(classId, examId, studentId)
      .then((data) => {
        if (!isMounted) return

        const initialGrades: Record<string, GradeDraft> = {}
        data.answers.forEach((answer: StudentAnswerResult) => {
          initialGrades[answer.id] = { score: answer.score || 0, comment: answer.teacherComment || '' }
        })

        setResult(data)
        setGrades(initialGrades)
      })
      .catch((err) => {
        if (isMounted) toast.error(handleApiError(err, 'Lỗi khi tải bài nộp'))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [classId, examId, studentId])

  const currentTotal = useMemo(
    () => Object.values(grades).reduce((acc, curr) => acc + curr.score, 0),
    [grades],
  )

  const updateScore = (answerId: string, score: number) => {
    setGrades((prev) => ({
      ...prev,
      [answerId]: { ...(prev[answerId] ?? { score: 0, comment: '' }), score },
    }))
  }

  const updateComment = (answerId: string, comment: string) => {
    setGrades((prev) => ({
      ...prev,
      [answerId]: { ...(prev[answerId] ?? { score: 0, comment: '' }), comment },
    }))
  }

  const saveGrades = async () => {
    if (!classId || !examId || !studentId) return false

    try {
      setIsSaving(true)
      const gradePayload = Object.keys(grades).map((answerId) => ({
        answerId,
        score: grades[answerId].score,
        teacherComment: grades[answerId].comment,
      }))

      await examApi.gradeExam(classId, examId, studentId, { grades: gradePayload })
      toast.success('Lưu điểm thành công')
      return true
    } catch (err) {
      toast.error(handleApiError(err, 'Không thể lưu điểm'))
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    result,
    isLoading,
    isSaving,
    grades,
    currentTotal,
    updateScore,
    updateComment,
    saveGrades,
  }
}
