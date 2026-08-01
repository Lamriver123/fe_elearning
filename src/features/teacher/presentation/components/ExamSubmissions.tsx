import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../../infrastructure/examApi';
import { toast } from 'react-hot-toast';

type SubmissionInfo = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalScore: number;
  submittedAt: string;
};

type ExamSubmissionsProps = {
  classId: string;
  examId: string;
  isPublished: boolean;
};

export function ExamSubmissions({ classId, examId, isPublished }: ExamSubmissionsProps) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (classId && examId && isPublished) {
      examApi.getSubmissions(classId, examId)
        .then(setSubmissions)
        .catch(() => toast.error('Không thể lấy danh sách bài nộp'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [classId, examId, isPublished]);

  if (!isPublished) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--color-surface-soft)', borderRadius: '12px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-muted-soft)', marginBottom: '16px' }}>visibility_off</span>
        <p style={{ color: 'var(--color-muted)' }}>Đề thi này chưa được xuất bản. Học sinh chưa thể làm bài.</p>
      </div>
    );
  }

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải danh sách bài nộp...</div>;

  if (submissions.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--color-surface-soft)', borderRadius: '12px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-muted-soft)', marginBottom: '16px' }}>inbox</span>
        <p style={{ color: 'var(--color-muted)' }}>Chưa có học sinh nào nộp bài.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '24px' }}>Danh sách bài nộp ({submissions.length})</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {submissions.map(sub => (
          <div key={sub.studentId} style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px' }}>{sub.studentName}</h4>
                <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '14px' }}>{sub.studentEmail}</p>
              </div>
              <div style={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: '#2196f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                fontWeight: 700
              }}>
                {sub.totalScore || 0}
              </div>
            </div>
            
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-muted)' }}>
              Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}
            </p>
            
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <button 
                className="teacher-btn-outline" 
                style={{ width: '100%', padding: '8px' }}
                onClick={() => navigate(`/teacher/classes/${classId}/exams/${examId}/grade/${sub.studentId}`)}
              >
                Chấm điểm / Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
