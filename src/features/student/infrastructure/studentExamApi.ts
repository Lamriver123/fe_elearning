import { httpClient } from '../../../shared/lib/httpClient';
import type { StudentExamInfo, StudentExamDetail, StudentAnswerPayload, ExamResult, FullExamResult } from '../domain/studentExam.types';
import type { StudentExamRepository, StartExamResult } from '../domain/studentExamRepository.port';

export const studentExamApi: StudentExamRepository = {
  getExamsForClass: async (classId: string): Promise<StudentExamInfo[]> => {
    return httpClient.get(`/classes/${classId}/exams`) as Promise<StudentExamInfo[]>;
  },

  getExamDetail: async (classId: string, examId: string): Promise<StudentExamDetail> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}`) as Promise<StudentExamDetail>;
  },

  startExam: async (classId: string, examId: string): Promise<StartExamResult> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/start`) as Promise<StartExamResult>;
  },

  autoSaveExam: async (classId: string, examId: string, data: Record<string, string>): Promise<{ success: boolean }> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/auto-save`, data) as Promise<{ success: boolean }>;
  },

  submitExam: async (classId: string, examId: string, payload: StudentAnswerPayload): Promise<{ message: string, result: ExamResult }> => {
    return httpClient.post(`/classes/${classId}/exams/${examId}/submit`, payload) as Promise<{ message: string, result: ExamResult }>;
  },

  uploadAudio: async (classId: string, examId: string, audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    
    // Note: classId is not used in the route for upload-audio according to exams.controller.ts
    // Wait, the route is @Controller('classes/:classId/exams'), so the full path is /classes/:classId/exams/:examId/upload-audio
    const res = await httpClient.post<{ url: string }>(`/classes/${classId}/exams/${examId}/upload-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as unknown as { url: string };
    
    return res.url;
  },

  getExamResult: async (classId: string, examId: string, studentId: string): Promise<FullExamResult> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}/results/${studentId}`) as Promise<FullExamResult>;
  }
};
