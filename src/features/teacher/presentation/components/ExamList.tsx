import { useNavigate } from 'react-router-dom';
import { useExams } from '../../application/useExams.js';
import { examApi } from '../../infrastructure/examApi.js';
import { toast } from 'react-hot-toast';

type ExamListProps = {
  classId: string;
};

export function ExamList({ classId }: ExamListProps) {
  const { exams, isLoading, error, refreshExams } = useExams(classId);
  const navigate = useNavigate();

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa đề thi này không? Mọi dữ liệu liên quan và bài làm của học sinh sẽ bị xóa vĩnh viễn.')) {
      return;
    }
    try {
      await examApi.deleteExam(classId, examId);
      toast.success('Đã xóa đề thi thành công');
      refreshExams();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa đề thi');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải danh sách đề thi...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'var(--color-error)', backgroundColor: 'rgba(186,26,26,0.1)', borderRadius: '8px' }}>
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="teacher-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Danh sách Đề thi & Bài kiểm tra</h2>
        </div>
        <button 
          className="teacher-btn-primary" 
          onClick={() => navigate(`/teacher/classes/${classId}/exams/create`)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          Tạo đề thi
        </button>
      </div>

      {exams.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-muted-soft)', marginBottom: '16px' }}>assignment</span>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>Lớp học chưa có đề thi nào</h3>
          <p style={{ color: 'var(--color-muted)' }}>Tạo đề thi mới bằng cách click vào nút "Tạo đề thi" ở trên.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {exams.map(exam => (
            <div key={exam.id} style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  backgroundColor: 'rgba(33, 150, 243, 0.1)', color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>quiz</span>
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: exam.status === 'PUBLISHED' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                  color: exam.status === 'PUBLISHED' ? '#4caf50' : '#ff9800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {exam.status === 'PUBLISHED' ? 'check_circle' : 'edit'}
                  </span>
                  {exam.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
              
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>{exam.title}</h3>
                {exam.description ? (
                  <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {exam.description}
                  </p>
                ) : (
                  <p style={{ color: 'var(--color-muted-soft)', margin: 0, fontSize: '14px', fontStyle: 'italic' }}>Chưa có mô tả</p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-muted)', fontSize: '13px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
                <span>Tạo lúc: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface-soft)', padding: '4px 8px', borderRadius: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>timer</span>
                  {exam.classSettings?.durationMinutes ? `${exam.classSettings.durationMinutes} phút` : 'Không giới hạn thời gian'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface-soft)', padding: '4px 8px', borderRadius: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>category</span>
                  {exam.skillType}
                </span>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <button 
                  className="teacher-btn-outline" 
                  style={{ flex: 1, padding: '8px', display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center', fontSize: '13px' }}
                  onClick={() => navigate(`/teacher/classes/${classId}/exams/${exam.id}`)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                  Chi tiết
                </button>
                <button 
                  className="teacher-btn-primary" 
                  style={{ flex: 1, padding: '8px', display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center', fontSize: '13px' }}
                  onClick={() => navigate(`/teacher/classes/${classId}/exams/${exam.id}`)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                  Sửa đề
                </button>
                <button 
                  className="teacher-btn-outline" 
                  style={{ flex: 1, padding: '8px', display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center', fontSize: '13px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                  onClick={() => handleDeleteExam(exam.id)}
                  title="Xóa đề thi"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
