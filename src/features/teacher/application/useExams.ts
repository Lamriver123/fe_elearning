import { useState, useEffect } from 'react';
import { examApi } from '../infrastructure/examApi.js';
import type { Exam } from '../domain/exam.types.js';
import { ApiError } from '../../../shared/lib/httpClient.js';
import { toast } from 'react-hot-toast';

export function useExams(classId: string) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = async () => {
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
  };

  useEffect(() => {
    if (classId) {
      void fetchExams();
    }
  }, [classId]);

  return { exams, isLoading, error, refreshExams: fetchExams };
}
