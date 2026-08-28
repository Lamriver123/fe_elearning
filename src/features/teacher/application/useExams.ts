import { useState, useEffect, useCallback } from 'react';
import { examApi } from '../infrastructure/examApi.js';
import type { Exam } from '../domain/exam.types.js';
import { ApiError } from '../../../shared/lib/httpClient.js';
import { toast } from 'react-hot-toast';

export function useExams(classId: string) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    if (!classId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await examApi.getExamsByClass(classId);
      setExams(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải danh sách đề thi';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void fetchExams();
  }, [fetchExams]);

  const deleteExam = useCallback(async (examId: string) => {
    if (!classId) return false;

    try {
      await examApi.deleteExam(classId, examId);
      toast.success('Đã xóa đề thi thành công');
      await fetchExams();
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể xóa đề thi';
      toast.error(message);
      return false;
    }
  }, [classId, fetchExams]);

  return { exams, isLoading, error, refreshExams: fetchExams, deleteExam };
}
