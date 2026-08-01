import { useState, useEffect, useCallback } from 'react';
import { studentExamApi } from '../infrastructure/studentExamApi';
import type { StudentExamInfo, StudentExamDetail } from '../domain/studentExam.types';

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
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách bài thi');
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchExams();
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
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải đề thi');
    } finally {
      setIsLoading(false);
    }
  }, [classId, examId]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  return { exam, isLoading, error };
}
