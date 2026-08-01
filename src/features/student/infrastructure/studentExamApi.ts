import { httpClient } from '../../../shared/lib/httpClient';
import type { StudentExamInfo, StudentExamDetail, StudentAnswerPayload, ExamResult } from '../domain/studentExam.types';

export const studentExamApi = {
  getExamsForClass: async (classId: string): Promise<StudentExamInfo[]> => {
    return httpClient.get(`/classes/${classId}/exams`) as Promise<StudentExamInfo[]>;
  },

  getExamDetail: async (classId: string, examId: string): Promise<StudentExamDetail> => {
    return httpClient.get(`/classes/${classId}/exams/${examId}`) as Promise<StudentExamDetail>;
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
  }
};
