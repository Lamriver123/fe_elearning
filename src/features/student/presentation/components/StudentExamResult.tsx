import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { httpClient } from '../../../../shared/lib/httpClient';
import { useStudentExamDetail } from '../../../student/application/useStudentExams';
import { useAuth } from '../../../auth/application/useAuth';

type StudentAnswerResult = {
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
    explanation?: string;
  };
  selectedOption?: {
    id: string;
    content: string;
    isCorrect: boolean;
  };
};

type FullExamResult = {
  totalScore: number;
  answers: StudentAnswerResult[];
};

export function StudentExamResult({ classId }: { classId: string }) {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exam, isLoading: examLoading, error: examError } = useStudentExamDetail(classId, examId!);
  
  const [result, setResult] = useState<FullExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setIsLoading(true);
        if (!user) return; // Wait until user is loaded

        const data = await httpClient.get(`/classes/${classId}/exams/${examId}/results/${user.id}`) as FullExamResult;
        setResult(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải kết quả');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchResult();
  }, [classId, examId, user]);

  if (examLoading || isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải kết quả...</div>;
  if (examError || error || !exam || !result) return <div style={{ padding: '40px', textAlign: 'center' }}>Lỗi tải kết quả</div>;

  const totalExamPoints = exam?.totalPoints || exam?.sections?.reduce((acc, sec) => 
    acc + sec.questions.reduce((qAcc, q) => qAcc + (q.points || 1), 0)
  , 0) || 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate(`/student/courses/${classId}/exams`)}
          style={{ marginBottom: '24px', padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Trở về danh sách
        </button>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>Kết quả: {exam.title}</h1>
          <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {result.totalScore} / {totalExamPoints}
          </div>
          <p style={{ color: 'var(--color-muted)', margin: '8px 0 0 0' }}>Tổng điểm</p>
        </div>

        {exam.sections.map((section, sIdx) => (
          <div key={section.id} style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', borderBottom: '2px solid var(--color-border)', paddingBottom: '16px', marginBottom: '24px' }}>
              Phần {sIdx + 1}: {section.title}
            </h3>

            {section.questions.map((q, qIdx) => {
              const ans = result.answers.find(a => a.question.id === q.id);
              
              // Find the correct option if it's multiple choice. 
              // Wait, the student's GET Exam endpoint does NOT include `isCorrect`.
              // But the `results` endpoint could include the full question info. 
              // The backend result includes studentAnswer with relation to question and selectedOption.
              // We'd better make sure the backend result returns the correct answer as well.
              // For now, let's just show what they selected and if they got points.
              
              const isCorrect = ans && ans.score === q.points && q.points > 0;
              const hasBeenGraded = ans && (ans.isAutoGraded || ans.teacherComment || ans.score > 0);

              return (
                <div key={q.id} style={{ 
                  marginBottom: '24px', 
                  padding: '24px', 
                  backgroundColor: 'var(--color-surface)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--color-border)',
                  borderLeft: hasBeenGraded ? (isCorrect ? '4px solid #4caf50' : '4px solid #f44336') : '4px solid var(--color-warning)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>Câu {qIdx + 1}:</h4>
                    <span style={{ fontWeight: 600, color: isCorrect ? '#4caf50' : 'inherit' }}>
                      {ans?.score || 0} / {q.points} điểm
                    </span>
                  </div>
                  
                  <p style={{ margin: '0 0 16px 0', fontSize: '16px', whiteSpace: 'pre-wrap' }}>{q.content}</p>

                  {q.questionType === 'MULTIPLE_CHOICE' && (
                    <div style={{ marginBottom: '16px' }}>
                      {q.options?.map(opt => {
                        const isSelected = ans?.selectedOption?.id === opt.id;
                        return (
                          <div key={opt.id} style={{
                            padding: '12px',
                            marginBottom: '8px',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? (isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)') : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span className="material-symbols-outlined" style={{ 
                              color: isSelected ? (isCorrect ? '#4caf50' : '#f44336') : 'var(--color-muted)' 
                            }}>
                              {isSelected ? (isCorrect ? 'check_circle' : 'cancel') : 'radio_button_unchecked'}
                            </span>
                            <span>{opt.content}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.questionType === 'ESSAY' && (
                    <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: '8px', marginBottom: '16px' }}>
                      <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text)' }}>
                        {ans?.textAnswer || 'Không có câu trả lời.'}
                      </p>
                    </div>
                  )}

                  {q.questionType === 'AUDIO_RESPONSE' && ans?.fileUrl && (
                    <div style={{ marginBottom: '16px' }}>
                      <audio controls src={ans.fileUrl} style={{ width: '100%' }} />
                    </div>
                  )}

                  {ans?.teacherComment && (
                    <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(255, 152, 0, 0.1)', borderLeft: '4px solid #ff9800', borderRadius: '4px' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '14px', color: '#e65100' }}>Nhận xét của giáo viên:</p>
                      <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '14px' }}>{ans.teacherComment}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
