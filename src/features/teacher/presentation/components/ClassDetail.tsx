import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ExamList } from './ExamList.tsx';
import { ExamDetail } from './ExamDetail.tsx';
import { CreateExam } from './CreateExam.tsx';
import { SubmissionGrader } from './SubmissionGrader.tsx';
import { StudentListTab } from './StudentListTab.tsx';

export function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  
  if (!classId) {
    return (
      <div className="teacher-content-container">
        <div className="page-state page-state--error">
          <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
          <p>Không tìm thấy lớp học</p>
        </div>
      </div>
    );
  }

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
      <div className="teacher-page-header">
        <div>
          <h1>Chi tiết lớp học</h1>
        </div>
      </div>
      
      <div className="teacher-tabs page-tabs" role="tablist" aria-label="Chi tiết lớp học">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id || (tab.id === 'info' && location.pathname === `/teacher/classes/${classId}`);
          return (
            <Link 
              key={tab.id} 
              to={tab.path}
              className={`page-tab ${isActive ? 'page-tab--active' : ''}`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <Routes>
        <Route path="/" element={
          <div className="page-state">
            <span className="material-symbols-outlined page-state__icon" aria-hidden="true">info</span>
            <h3 className="page-state__title">Thông tin chung đang được phát triển</h3>
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
