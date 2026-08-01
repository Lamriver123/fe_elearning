import { useParams, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { StudentExamList } from './StudentExamList';
import { ExamTaker } from './ExamTaker';
import { StudentExamResult } from './StudentExamResult';

export function StudentClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Simple tabs
  const tabs = [
    { id: 'overview', label: 'Thông tin chung', path: `/student/courses/${classId}` },
    { id: 'exams', label: 'Bài kiểm tra', path: `/student/courses/${classId}/exams` },
    { id: 'materials', label: 'Tài liệu', path: `/student/courses/${classId}/materials` },
  ];

  const currentTab = location.pathname.includes('/exams') ? 'exams' : 
                     location.pathname.includes('/materials') ? 'materials' : 'overview';

  // If we are taking an exam, we probably want to hide the standard tabs and header
  // so we check if the path matches exactly `/exams/:examId`
  const isTakingExam = location.pathname.match(/\/exams\/[a-zA-Z0-9-]+(\/result)?$/);

  if (isTakingExam) {
    return (
      <Routes>
        <Route path="exams/:examId" element={<ExamTaker classId={classId!} />} />
        <Route path="exams/:examId/result" element={<StudentExamResult classId={classId!} />} />
      </Routes>
    );
  }

  return (
    <div className="student-content-container" style={{ padding: '24px' }}>
      <div className="teacher-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <button 
            className="teacher-btn-outline" 
            style={{ marginBottom: '16px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate('/student/courses')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Trở lại danh sách lớp
          </button>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Lớp học của tôi</h1>
        </div>
      </div>

      <div className="teacher-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '24px' }}>
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            style={{
              padding: '12px 0',
              textDecoration: 'none',
              fontWeight: 600,
              color: currentTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted)',
              borderBottom: currentTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent'
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="/" element={
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-muted-soft)', marginBottom: '16px' }}>info</span>
            <h3>Thông tin lớp học đang được cập nhật</h3>
          </div>
        } />
        <Route path="exams" element={<StudentExamList classId={classId!} />} />
        <Route path="materials" element={
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-muted-soft)', marginBottom: '16px' }}>folder_open</span>
            <h3>Chưa có tài liệu nào</h3>
          </div>
        } />
      </Routes>
    </div>
  );
}
