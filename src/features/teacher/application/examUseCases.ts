import type {
  CreateExamPayload,
  ExcelImportPreview,
  QuestionPayload,
  SectionPayload,
  UpdateExamPayload,
} from '../domain/exam.types'
import { examApi } from '../infrastructure/examApi'

export function createTeacherExam(classId: string, payload: CreateExamPayload) {
  return examApi.createExam(classId, payload)
}

export function updateTeacherExam(classId: string, examId: string, payload: UpdateExamPayload) {
  return examApi.updateExam(classId, examId, payload)
}

export function addTeacherExamSection(classId: string, examId: string, payload: SectionPayload) {
  return examApi.addSection(classId, examId, payload)
}

export function updateTeacherExamSection(
  classId: string,
  examId: string,
  sectionId: string,
  payload: Partial<SectionPayload>,
) {
  return examApi.updateSection(classId, examId, sectionId, payload)
}

export function addTeacherExamQuestion(
  classId: string,
  examId: string,
  sectionId: string,
  payload: QuestionPayload,
) {
  return examApi.addQuestion(classId, examId, sectionId, payload)
}

export function updateTeacherExamQuestion(
  classId: string,
  examId: string,
  sectionId: string,
  questionId: string,
  payload: Partial<QuestionPayload>,
) {
  return examApi.updateQuestion(classId, examId, sectionId, questionId, payload)
}

export function uploadTeacherExamFile(
  classId: string,
  examId: string,
  file: Blob,
  purpose: string,
  sectionId?: string,
  questionId?: string,
) {
  return examApi.uploadExamFile(classId, examId, file, purpose, sectionId, questionId)
}

export function previewTeacherExamExcelImport(file: File) {
  return examApi.previewExcelImport(file)
}

export function confirmTeacherExamExcelImport(examId: string, sections: ExcelImportPreview['sections']) {
  return examApi.confirmExcelImport(examId, sections)
}
