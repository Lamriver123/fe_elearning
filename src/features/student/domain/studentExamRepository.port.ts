import type {
  ExamResult,
  FullExamResult,
  StudentAnswerPayload,
  StudentExamDetail,
  StudentExamInfo,
} from './studentExam.types'

export type StartExamResult = {
  startTime: string
  isSubmitted: boolean
  autoSavedAnswers: Record<string, string>
}

export type SubmitExamResult = {
  message: string
  result: ExamResult
}

export type StudentExamRepository = {
  getExamsForClass(classId: string): Promise<StudentExamInfo[]>
  getExamDetail(classId: string, examId: string): Promise<StudentExamDetail>
  startExam(classId: string, examId: string): Promise<StartExamResult>
  autoSaveExam(classId: string, examId: string, data: Record<string, string>): Promise<{ success: boolean }>
  submitExam(classId: string, examId: string, payload: StudentAnswerPayload): Promise<SubmitExamResult>
  uploadAudio(classId: string, examId: string, audioBlob: Blob): Promise<string>
  getExamResult(classId: string, examId: string, studentId: string): Promise<FullExamResult>
}
