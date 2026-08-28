import type { FullExamResult } from '../../student/domain/studentExam.types'
import type {
  CreateExamPayload,
  Exam,
  ExamFile,
  ExcelImportPreview,
  ExamSection,
  ExamSubmissionSummary,
  GradePayload,
  Question,
  QuestionPayload,
  SectionPayload,
  UpdateExamPayload,
} from './exam.types'

export type TeacherExamRepository = {
  getExamsByClass(classId: string): Promise<Exam[]>
  getExamDetail(classId: string, examId: string): Promise<Exam>
  createExam(classId: string, payload: CreateExamPayload): Promise<Exam>
  updateExam(classId: string, examId: string, payload: UpdateExamPayload): Promise<Exam>
  publishExam(classId: string, examId: string): Promise<void>
  deleteExam(classId: string, examId: string): Promise<void>
  getSubmissions(classId: string, examId: string): Promise<ExamSubmissionSummary[]>
  getStudentResult(classId: string, examId: string, studentId: string): Promise<FullExamResult>
  gradeExam(classId: string, examId: string, studentId: string, payload: GradePayload): Promise<void>
  addSection(classId: string, examId: string, payload: SectionPayload): Promise<ExamSection>
  updateSection(classId: string, examId: string, sectionId: string, payload: Partial<SectionPayload>): Promise<ExamSection>
  deleteSection(classId: string, examId: string, sectionId: string): Promise<void>
  addQuestion(classId: string, examId: string, sectionId: string, payload: QuestionPayload): Promise<Question>
  updateQuestion(
    classId: string,
    examId: string,
    sectionId: string,
    questionId: string,
    payload: Partial<QuestionPayload>,
  ): Promise<Question>
  deleteQuestion(classId: string, examId: string, sectionId: string, questionId: string): Promise<void>
  uploadExamFile(
    classId: string,
    examId: string,
    file: Blob,
    purpose: string,
    sectionId?: string,
    questionId?: string,
  ): Promise<ExamFile>
  deleteFile(classId: string, examId: string, fileId: string): Promise<void>
  previewExcelImport(file: File): Promise<ExcelImportPreview>
  confirmExcelImport(examId: string, sections: ExcelImportPreview['sections']): Promise<void>
}
