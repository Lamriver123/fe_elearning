import { useState, useEffect, useCallback } from 'react';
import { studentExamApi } from '../infrastructure/studentExamApi';
import type {
  FullExamResult,
  StudentAnswerPayload,
  StudentExamDetail,
  StudentExamInfo,
} from '../domain/studentExam.types';
import { handleApiError } from '../../../shared/lib/handleApiError';

export function useStudentExams(classId: string) {
  const [exams, setExams] = useState<StudentExamInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    if (!classId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentExamApi.getExamsForClass(classId);
      setExams(data);
    } catch (err) {
      setError(handleApiError(err, 'Lỗi khi tải danh sách bài thi'));
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void fetchExams();
  }, [fetchExams]);

  return { exams, isLoading, error, refreshExams: fetchExams };
}

export function useStudentExamDetail(classId: string, examId: string) {
  const [exam, setExam] = useState<StudentExamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExam = useCallback(async () => {
    if (!classId || !examId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentExamApi.getExamDetail(classId, examId);
      setExam(data);
    } catch (err) {
      setError(handleApiError(err, 'Lỗi khi tải đề thi'));
    } finally {
      setIsLoading(false);
    }
  }, [classId, examId]);

  useEffect(() => {
    void fetchExam();
  }, [fetchExam]);

  return { exam, isLoading, error };
}

export function useStudentExamResult(classId: string, examId?: string, studentId?: string) {
  const [result, setResult] = useState<FullExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async () => {
    if (!classId || !examId || !studentId) {
      setIsLoading(false);
      setResult(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await studentExamApi.getExamResult(classId, examId, studentId);
      setResult(data);
    } catch (err) {
      setError(handleApiError(err, 'Lỗi khi tải kết quả'));
    } finally {
      setIsLoading(false);
    }
  }, [classId, examId, studentId]);

  useEffect(() => {
    void fetchResult();
  }, [fetchResult]);

  return { result, isLoading, error, refreshResult: fetchResult };
}

export function startStudentExam(classId: string, examId: string) {
  return studentExamApi.startExam(classId, examId);
}

export function autoSaveStudentExam(classId: string, examId: string, answers: Record<string, string>) {
  return studentExamApi.autoSaveExam(classId, examId, answers);
}

export function uploadStudentExamAudio(classId: string, examId: string, audioBlob: Blob) {
  return studentExamApi.uploadAudio(classId, examId, audioBlob);
}

export function submitStudentExam(classId: string, examId: string, payload: StudentAnswerPayload) {
  return studentExamApi.submitExam(classId, examId, payload);
}
