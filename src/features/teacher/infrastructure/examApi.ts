import { httpClient } from '../../../shared/lib/httpClient';
import type { Exam, CreateExamPayload } from '../domain/exam.types';

export const examApi = {
  getExamsByClass: async (classId: string): Promise<Exam[]> => {
    return httpClient.get(`/classes/${classId}/exams`) as Promise<Exam[]>;
  },

  getExamDetail: async (classId: string, examId: string): Promise<Exam> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}`) as Promise<Exam>;
  },

  createExam: async (classId: string, payload: CreateExamPayload): Promise<Exam> => {
    return httpClient.post(`/classes/${classId}/exams`, payload) as Promise<Exam>;
  },

  publishExam: async (classId: string, examId: string): Promise<void> => {
    return httpClient.patch(`/classes/${classId}/exams/${examId}/publish`) as Promise<void>;
  },

  deleteExam: async (classId: string, examId: string): Promise<void> => {
    return httpClient.delete(`/classes/${classId}/exams/${examId}`) as Promise<void>;
  },

  getSubmissions: async (classId: string, examId: string): Promise<any[]> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}/submissions`) as Promise<any[]>;
  },

  getStudentResult: async (classId: string, examId: string, studentId: string): Promise<any> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}/results/${studentId}`) as Promise<any>;
  },

  gradeExam: async (classId: string, examId: string, studentId: string, payload: { grades: any[] }): Promise<void> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/grade/${studentId}`, payload) as Promise<void>;
  },

  addSection: async (classId: string, examId: string, payload: any): Promise<any> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/sections`, payload) as Promise<any>;
  },

  addQuestion: async (classId: string, examId: string, sectionId: string, payload: any): Promise<any> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/sections/${sectionId}/questions`, payload) as Promise<any>;
  },

  uploadExamFile: async (classId: string, examId: string, file: Blob, purpose: string, sectionId?: string, questionId?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    if (sectionId) formData.append('sectionId', sectionId);
    if (questionId) formData.append('questionId', questionId);

    return httpClient.post(`/classes/${classId}/exams/${examId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }) as Promise<any>;
  }
};
