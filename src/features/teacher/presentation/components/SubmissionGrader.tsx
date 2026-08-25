import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { examApi } from '../../infrastructure/examApi';

type AnswerResult = {
  id: string;
  score: number;
  isAutoGraded: boolean;
  textAnswer?: string;
  fileUrl?: string;
  teacherComment?: string;
  question: {
    id: string;
    content: string;
    questionType: string;
    points: number;
  };
};

export function SubmissionGrader() {
  const { classId, examId, studentId } = useParams<{ classId: string, examId: string, studentId: string }>();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<{ totalScore: number, answers: AnswerResult[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // local edits for grades
  const [grades, setGrades] = useState<{ [answerId: string]: { score: number, comment: string } }>({});

  useEffect(() => {
    if (classId && examId && studentId) {
      examApi.getStudentResult(classId, examId, studentId)
        .then(data => {
          setResult(data);
          const initialGrades: any = {};
          data.answers.forEach((ans: AnswerResult) => {
            initialGrades[ans.id] = { score: ans.score || 0, comment: ans.teacherComment || '' };
          });
          setGrades(initialGrades);
        })
        .catch(() => toast.error('Lỗi khi tải bài nộp'))
        .finally(() => setIsLoading(false));
    }
  }, [classId, examId, studentId]);

  const handleScoreChange = (answerId: string, newScore: number) => {
    setGrades(prev => ({
      ...prev,
      [answerId]: { ...prev[answerId], score: newScore }
    }));
  };

  const handleCommentChange = (answerId: string, comment: string) => {
    setGrades(prev => ({
      ...prev,
      [answerId]: { ...prev[answerId], comment }
    }));
  };

  const handleSaveGrades = async () => {
    if (!classId || !examId || !studentId) return;
    try {
      setIsSaving(true);
      const gradePayload = Object.keys(grades).map(ansId => ({
        answerId: ansId,
        score: grades[ansId].score,
        teacherComment: grades[ansId].comment
      }));
      
      await examApi.gradeExam(classId, examId, studentId, { grades: gradePayload });
      toast.success('Lưu điểm thành công');
      navigate(`/teacher/classes/${classId}/exams/${examId}`);
    } catch (err) {
      toast.error('Không thể lưu điểm');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải bài nộp...</div>;
  if (!result) return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy bài nộp</div>;

  const currentTotal = Object.values(grades).reduce((acc, curr) => acc + curr.score, 0);

  return (
    <div className="teacher-content-container">
      <div className="teacher-page-header">
        <div>
          <button 
            className="teacher-btn-outline" 
            style={{ marginBottom: '16px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate(`/teacher/classes/${classId}/exams/${examId}`)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Trở lại đề thi
          </button>
          <h1 style={{ margin: 0 }}>Chấm bài học sinh</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px 24px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)', fontWeight: 700, fontSize: '18px', color: 'var(--color-primary)' }}>
            Điểm hiện tại: {currentTotal}
          </div>
          <button 
            className="teacher-btn-primary" 
            onClick={handleSaveGrades}
            disabled={isSaving}
          >
            {isSaving ? 'Đang lưu...' : 'Hoàn tất chấm điểm'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        {result.answers.map((ans, idx) => {
          const maxPoints = ans.question.points || 0;
          return (
            <div key={ans.id} style={{
              marginBottom: '24px',
              padding: '24px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Câu {idx + 1}:</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>Tối đa: {maxPoints} điểm</span>
                  {!ans.isAutoGraded && (
                    <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#ff9800', color: '#fff', fontSize: '12px', fontWeight: 600 }}>Cần chấm</span>
                  )}
                </div>
              </div>
              
              <p style={{ margin: '0 0 16px 0', fontSize: '16px', whiteSpace: 'pre-wrap' }}>{ans.question.content}</p>

              {ans.question.questionType === 'MULTIPLE_CHOICE' && (
                <div style={{ padding: '12px', backgroundColor: 'var(--color-background)', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ margin: 0, color: 'var(--color-muted)', fontStyle: 'italic' }}>
                    Câu hỏi trắc nghiệm đã được tự động chấm điểm.
                  </p>
                </div>
              )}

              {ans.question.questionType === 'ESSAY' && (
                <div style={{ padding: '16px', backgroundColor: 'var(--color-background)', borderLeft: '4px solid var(--color-primary)', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ margin: 0 }}>{ans.textAnswer || 'Không có câu trả lời'}</p>
                </div>
              )}

              {ans.question.questionType === 'AUDIO_RESPONSE' && ans.fileUrl && (
                <div style={{ marginBottom: '16px' }}>
                  <audio controls src={ans.fileUrl} style={{ width: '100%' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--color-border)' }}>
                <div style={{ width: '150px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Chấm điểm</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number"
                      min={0}
                      max={maxPoints}
                      value={grades[ans.id]?.score ?? 0}
                      onChange={(e) => handleScoreChange(ans.id, parseFloat(e.target.value) || 0)}
                      className="form-input"
                      style={{ width: '80px', padding: '8px' }}
                    />
                    <span style={{ color: 'var(--color-muted)' }}>/ {maxPoints}</span>
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Nhận xét (Tùy chọn)</label>
                  <textarea 
                    rows={2}
                    placeholder="Nhận xét của giáo viên..."
                    value={grades[ans.id]?.comment || ''}
                    onChange={(e) => handleCommentChange(ans.id, e.target.value)}
                    className="form-textarea"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
