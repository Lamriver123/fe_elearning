import { httpClient } from '../../../shared/lib/httpClient';
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
} from '../domain/exam.types';
import type { TeacherExamRepository } from '../domain/examRepository.port';
import type { FullExamResult } from '../../student/domain/studentExam.types';

export const examApi: TeacherExamRepository = {
  getExamsByClass: async (classId: string): Promise<Exam[]> => {
    return httpClient.get(`/classes/${classId}/exams`) as Promise<Exam[]>;
  },

  getExamDetail: async (classId: string, examId: string): Promise<Exam> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}`) as Promise<Exam>;
  },

  createExam: async (classId: string, payload: CreateExamPayload): Promise<Exam> => {
    return httpClient.post(`/classes/${classId}/exams`, payload) as Promise<Exam>;
  },

  updateExam: async (classId: string, examId: string, payload: UpdateExamPayload): Promise<Exam> => {
    return httpClient.patch(`/classes/${classId}/exams/${examId}`, payload) as Promise<Exam>;
  },

  publishExam: async (classId: string, examId: string): Promise<void> => {
    return httpClient.patch(`/classes/${classId}/exams/${examId}/publish`) as Promise<void>;
  },

  deleteExam: async (classId: string, examId: string): Promise<void> => {
    return httpClient.delete(`/classes/${classId}/exams/${examId}`) as Promise<void>;
  },

  getSubmissions: async (classId: string, examId: string): Promise<ExamSubmissionSummary[]> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}/submissions`) as Promise<ExamSubmissionSummary[]>;
  },

  getStudentResult: async (classId: string, examId: string, studentId: string): Promise<FullExamResult> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}/results/${studentId}`) as Promise<FullExamResult>;
  },

  gradeExam: async (classId: string, examId: string, studentId: string, payload: GradePayload): Promise<void> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/grade/${studentId}`, payload) as Promise<void>;
  },

  addSection: async (classId: string, examId: string, payload: SectionPayload): Promise<ExamSection> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/sections`, payload) as Promise<ExamSection>;
  },

  updateSection: async (classId: string, examId: string, sectionId: string, payload: Partial<SectionPayload>): Promise<ExamSection> => {
    return httpClient.patch(`/classes/${classId}/exams/${examId}/sections/${sectionId}`, payload) as Promise<ExamSection>;
  },

  deleteSection: async (classId: string, examId: string, sectionId: string): Promise<void> => {
    return httpClient.delete(`/classes/${classId}/exams/${examId}/sections/${sectionId}`) as Promise<void>;
  },

  addQuestion: async (classId: string, examId: string, sectionId: string, payload: QuestionPayload): Promise<Question> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/sections/${sectionId}/questions`, payload) as Promise<Question>;
  },

  updateQuestion: async (classId: string, examId: string, sectionId: string, questionId: string, payload: Partial<QuestionPayload>): Promise<Question> => {
    return httpClient.patch(`/classes/${classId}/exams/${examId}/sections/${sectionId}/questions/${questionId}`, payload) as Promise<Question>;
  },

  deleteQuestion: async (classId: string, examId: string, sectionId: string, questionId: string): Promise<void> => {
    return httpClient.delete(`/classes/${classId}/exams/${examId}/sections/${sectionId}/questions/${questionId}`) as Promise<void>;
  },

  uploadExamFile: async (classId: string, examId: string, file: Blob, purpose: string, sectionId?: string, questionId?: string): Promise<ExamFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    if (sectionId) formData.append('sectionId', sectionId);
    if (questionId) formData.append('questionId', questionId);

    return httpClient.post(`/classes/${classId}/exams/${examId}/files`, formData) as Promise<ExamFile>;
  },

  deleteFile: async (classId: string, examId: string, fileId: string): Promise<void> => {
    return httpClient.delete(`/classes/${classId}/exams/${examId}/files/${fileId}`) as Promise<void>;
  },

  previewExcelImport: async (file: File): Promise<ExcelImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);

    return httpClient.post('/exams/import/excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as Promise<ExcelImportPreview>;
  },

  confirmExcelImport: async (examId: string, sections: ExcelImportPreview['sections']): Promise<void> => {
    return httpClient.post('/exams/import/excel/confirm', {
      examId,
      sections,
    }) as Promise<void>;
  },
};
