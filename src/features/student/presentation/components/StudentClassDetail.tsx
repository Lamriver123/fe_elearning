import { useParams, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { StudentExamList } from './StudentExamList';
import { ExamTaker } from './ExamTaker';
import { StudentExamResult } from './StudentExamResult';
import { StudentClassOverview } from './StudentClassOverview';

export function StudentClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  if (!classId) {
    return (
      <div className="student-content-container student-class-detail">
        <div className="page-state page-state--error">
          <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
          <p>Không tìm thấy lớp học</p>
        </div>
      </div>
    );
  }

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
        <Route path="exams/:examId" element={<ExamTaker classId={classId} />} />
        <Route path="exams/:examId/result" element={<StudentExamResult classId={classId} />} />
      </Routes>
    );
  }

  return (
    <div className="student-content-container student-class-detail">
      <div className="student-class-detail__header">
        <div>
          <button 
            className="teacher-btn-outline back-button" 
            type="button"
            onClick={() => navigate('/student/courses')}
          >
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Trở lại danh sách lớp
          </button>
          <h1 className="student-class-detail__title">Lớp học của tôi</h1>
        </div>
      </div>

      <div className="student-class-detail__tabs page-tabs" role="tablist" aria-label="Chi tiết lớp học">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`page-tab ${currentTab === tab.id ? 'page-tab--active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<StudentClassOverview classId={classId} />} />
        <Route path="exams" element={<StudentExamList classId={classId} />} />
        <Route path="materials" element={
          <div className="page-state student-class-detail__empty">
            <span className="material-symbols-outlined page-state__icon" aria-hidden="true">folder_open</span>
            <h3 className="page-state__title">Chưa có tài liệu nào</h3>
          </div>
        } />
      </Routes>
    </div>
  );
}
