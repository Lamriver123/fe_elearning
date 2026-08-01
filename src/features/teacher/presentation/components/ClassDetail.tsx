import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ExamList } from './ExamList.tsx';
import { ExamDetail } from './ExamDetail.tsx';
import { CreateExam } from './CreateExam.tsx';
import { SubmissionGrader } from './SubmissionGrader.tsx';
import { StudentListTab } from './StudentListTab.tsx';

export function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  
  if (!classId) return <div>Không tìm thấy lớp học</div>;

  const tabs = [
    { id: 'info', label: 'Thông tin chung', path: `/teacher/classes/${classId}` },
    { id: 'exams', label: 'Đề thi & Kiểm tra', path: `/teacher/classes/${classId}/exams` },
    { id: 'students', label: 'Danh sách học sinh', path: `/teacher/classes/${classId}/students` }
  ];

  let currentTab = 'info';
  if (location.pathname.includes('/exams')) {
    currentTab = 'exams';
  } else if (location.pathname.includes('/students')) {
    currentTab = 'students';
  }

  return (
    <div className="teacher-content-container">
      <div className="teacher-page-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div>
          <h1>Chi tiết lớp học</h1>
        </div>
      </div>
      
      <div className="tabs-container" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {tabs.map(tab => {
            const isActive = currentTab === tab.id || (tab.id === 'info' && location.pathname === `/teacher/classes/${classId}`);
            return (
              <Link 
                key={tab.id} 
                to={tab.path}
                style={{
                  padding: '12px 0',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      <Routes>
        <Route path="/" element={
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h3>Tính năng "Thông tin chung" đang được phát triển</h3>
          </div>
        } />
        <Route path="exams" element={<ExamList classId={classId} />} />
        <Route path="exams/create" element={<CreateExam />} />
        <Route path="exams/:examId" element={<ExamDetail />} />
        <Route path="exams/:examId/grade/:studentId" element={<SubmissionGrader />} />
        <Route path="students" element={<StudentListTab classId={classId} />} />
      </Routes>
    </div>
  );
}
