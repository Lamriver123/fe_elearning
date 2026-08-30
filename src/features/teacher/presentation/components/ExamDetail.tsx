import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useExamDetail } from '../../application/useExamDetail.js';
import type { ExamSection, Question } from '../../domain/exam.types.js';
import { ImportExcelModal } from './ImportExcelModal.tsx';
import { ExamSubmissions } from './ExamSubmissions.tsx';
import { AddSectionModal } from './AddSectionModal.tsx';
import { AddQuestionModal } from './AddQuestionModal.tsx';
import { UploadExamFileModal } from './UploadExamFileModal.tsx';
import { EditExamInfoModal } from './EditExamInfoModal.tsx';

function ExamDetailSkeleton() {
  return (
    <div
      className="teacher-content-container exam-detail exam-detail-skeleton"
      aria-label="Đang tải đề thi"
      aria-live="polite"
    >
      <div className="teacher-page-header">
        <div className="exam-detail-skeleton__intro" aria-hidden="true">
          <span className="skeleton-chip" />
          <span className="skeleton-line skeleton-line--lg" />
          <span className="skeleton-line skeleton-line--md" />
          <div className="exam-detail-skeleton__meta">
            <span className="skeleton-chip" />
            <span className="skeleton-chip" />
          </div>
        </div>
        <div className="exam-detail-skeleton__actions" aria-hidden="true">
          <span className="skeleton-chip" />
          <span className="skeleton-chip" />
        </div>
      </div>

      <div className="page-tabs exam-detail__tabs" aria-hidden="true">
        <span className="skeleton-line skeleton-line--sm" />
        <span className="skeleton-line skeleton-line--sm" />
      </div>

      <div className="exam-detail__panel" aria-hidden="true">
        <div className="exam-detail__panel-header">
          <span className="skeleton-line skeleton-line--md" />
          <span className="skeleton-chip" />
        </div>
        {[1, 2].map((item) => (
          <div key={item} className="exam-detail-skeleton__section section-card">
            <div className="exam-detail__section-header">
              <span className="skeleton-avatar" />
              <span className="skeleton-line skeleton-line--md" />
            </div>
            <div className="exam-detail__section-body">
              <div className="skeleton-line skeleton-line--lg" />
              <div className="exam-detail-skeleton__questions">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExamDetail() {
  const { classId, examId } = useParams<{ classId: string; examId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { exam, isLoading, isPublishing, refreshExam, publishExam, deleteSection, deleteQuestion, deleteFile } =
    useExamDetail(classId, examId);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const activeTab = searchParams.get('tab') === 'submissions' ? 'submissions' : 'content';

  // Modals state
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  
  // To track which section to add a question to, or which section to upload a file to
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(undefined);

  // Edit states
  const [selectedSection, setSelectedSection] = useState<ExamSection | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const handlePublish = async () => {
    await publishExam();
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phần thi này? Toàn bộ câu hỏi và file đính kèm bên trong sẽ bị xóa.')) return;
    await deleteSection(sectionId);
  };

  const handleDeleteQuestion = async (sectionId: string, questionId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    await deleteQuestion(sectionId, questionId);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) return;
    await deleteFile(fileId);
  };

  const handleTabChange = (tab: 'content' | 'submissions') => {
    const nextParams = new URLSearchParams(searchParams);

    if (tab === 'submissions') {
      nextParams.set('tab', 'submissions');
    } else {
      nextParams.delete('tab');
    }

    setSearchParams(nextParams, { replace: true });
  };

  if (isLoading) {
    return <ExamDetailSkeleton />;
  }

  if (!exam) {
    return (
      <div className="teacher-content-container">
        <div className="page-state page-state--error">
          <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
          <p>Không tìm thấy đề thi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-content-container exam-detail">
      <div className="teacher-page-header">
        <div>
          <button 
            className="teacher-btn-outline back-button" 
            type="button"
            onClick={() => navigate(`/teacher/classes/${classId}/exams`)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Trở lại danh sách
          </button>
          <div className="exam-detail__title-row">
            <h1 className="exam-detail__title">{exam.title}</h1>
            <span className={`status-pill ${exam.status === 'PUBLISHED' ? 'status-pill--published' : 'status-pill--draft'}`}>
              {exam.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
            </span>
          </div>
          {exam.description && <p className="exam-detail__description">{exam.description}</p>}
          <div className="exam-detail__meta">
            <span className="metric-pill">
              <span className="material-symbols-outlined" aria-hidden="true">timer</span>
              {exam.classSettings?.durationMinutes ? `${exam.classSettings.durationMinutes} phút` : 'Không giới hạn thời gian'}
            </span>
            <span className="metric-pill">
              <span className="material-symbols-outlined" aria-hidden="true">construction</span>
              Cách tạo: {exam.createMethod === 'MANUAL' ? 'Thủ công' : exam.createMethod === 'FILE_UPLOAD' ? 'Đính kèm file' : 'Import Excel'}
            </span>
          </div>
        </div>

        <div className="exam-detail__actions page-action-row page-action-row--end">
          <button 
            className="teacher-btn-outline" 
            type="button"
            onClick={() => setIsEditInfoOpen(true)}
            title="Sửa thông tin đề thi"
          >
            <span className="material-symbols-outlined" aria-hidden="true">edit</span>
            Sửa thông tin
          </button>
          
          {exam.status === 'DRAFT' && (
            <>
              {exam.createMethod === 'FILE_UPLOAD' && (
                <button 
                  className="teacher-btn-primary" 
                  type="button"
                  onClick={() => {
                    setActiveSectionId(undefined);
                    setIsUploadFileOpen(true);
                  }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">attach_file</span>
                  Đính kèm File Đề
                </button>
              )}
              {exam.createMethod === 'EXCEL_IMPORT' && (
                <button 
                  className="teacher-btn-primary" 
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                  Import Excel
                </button>
              )}
              <button 
                className="teacher-btn-primary" 
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                <span className="material-symbols-outlined" aria-hidden="true">publish</span>
                {isPublishing ? 'Đang xử lý...' : 'Xuất bản'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="exam-detail__tabs page-tabs" role="tablist" aria-label="Quản lý đề thi">
        <button 
          className={`page-tab ${activeTab === 'content' ? 'page-tab--active' : ''}`}
          type="button"
          onClick={() => handleTabChange('content')}
        >
          Nội dung đề thi
        </button>
        <button 
          className={`page-tab ${activeTab === 'submissions' ? 'page-tab--active' : ''}`}
          type="button"
          onClick={() => handleTabChange('submissions')}
        >
          Bài nộp học sinh
        </button>
      </div>

      <div className="exam-detail__panel">
        {activeTab === 'content' && (
          <>
            <div className="exam-detail__panel-header">
              <h3 className="exam-detail__panel-title">Nội dung đề thi</h3>
              {exam.createMethod === 'MANUAL' && (
                <button 
                  className="teacher-btn-outline"
                  type="button"
                  onClick={() => {
                    setSelectedSection(null);
                    setIsAddSectionOpen(true);
                  }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">add</span>
                  Thêm phần thi (Section)
                </button>
              )}
            </div>

            {(!exam.sections || exam.sections.length === 0) ? (
              <div className="page-state page-state--soft">
                <span className="material-symbols-outlined page-state__icon" aria-hidden="true">post_add</span>
                <p>
                  {exam.createMethod === 'MANUAL' && 'Đề thi này chưa có phần thi nào. Hãy bấm "Thêm phần thi" để bắt đầu soạn đề.'}
                  {exam.createMethod === 'FILE_UPLOAD' && 'Vui lòng đính kèm File đề thi (PDF/Word) ở góc trên bên phải.'}
                  {exam.createMethod === 'EXCEL_IMPORT' && 'Hãy Import file Excel để nạp danh sách câu hỏi.'}
                </p>
              </div>
            ) : (
              <div>
                {exam.sections.map((section, idx) => (
                  <div key={section.id} className="exam-detail__section section-card">
                    <div className="exam-detail__section-header">
                      <div className="exam-detail__section-title-wrap">
                        <span className="material-symbols-outlined" aria-hidden="true">category</span>
                        <div>
                          <h4 className="exam-detail__section-title">Phần {idx + 1}: {section.title}</h4>
                          {section.skillType && <span className="exam-detail__section-skill">{section.skillType}</span>}
                        </div>
                      </div>
                      
                      <div className="exam-detail__section-actions">
                        <button 
                          className="icon-action"
                          type="button"
                          onClick={() => {
                            setSelectedSection(section);
                            setIsAddSectionOpen(true);
                          }}
                          title="Sửa phần thi"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                        </button>
                        <button 
                          className="icon-action icon-action--danger"
                          type="button"
                          onClick={() => handleDeleteSection(section.id)}
                          title="Xóa phần thi"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="exam-detail__section-body">
                      {/* Render attached files for this section */}
                      {section.files && section.files.length > 0 && (
                        <div className="exam-detail__file-list">
                          {section.files.map((f) => (
                            <div key={f.id}>
                              {f.fileType === 'AUDIO' ? (
                                <div className="exam-detail__file-item exam-detail__file-item--audio">
                                  <div className="exam-detail__audio-head">
                                    <span className="material-symbols-outlined" aria-hidden="true">audio_file</span>
                                    <span className="exam-detail__file-name">{f.fileName}</span>
                                    <button 
                                      className="icon-action icon-action--danger"
                                      type="button"
                                      onClick={() => handleDeleteFile(f.id)}
                                      title="Xóa file này"
                                    >
                                      <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                                    </button>
                                  </div>
                                  <audio controls src={f.fileUrl} />
                                </div>
                              ) : (
                                <div className="exam-detail__file-item">
                                  <span className="material-symbols-outlined" aria-hidden="true">attach_file</span>
                                  <a className="exam-detail__file-link" href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                                    {f.fileName}
                                  </a>
                                  <button 
                                    className="icon-action icon-action--danger"
                                    type="button"
                                    onClick={() => handleDeleteFile(f.id)}
                                    title="Xóa file này"
                                  >
                                    <span className="material-symbols-outlined" aria-hidden="true">close</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {section.instructions && (
                        <div className="exam-detail__instructions">
                          <span className="exam-detail__instructions-label">
                            {section.skillType === 'READING' ? 'Nội dung bài đọc:' : 'Hướng dẫn:'}
                          </span>
                          <div className="exam-detail__instructions-content">{section.instructions}</div>
                        </div>
                      )}
                      
                      {/* Liệt kê câu hỏi của phần thi */}
                      <div className="exam-detail__questions">
                        {section.questions?.map((q, qIdx) => (
                          <div key={q.id} className="exam-detail__question">
                            <div className="exam-detail__question-header">
                              <div className="exam-detail__question-main">
                                <div className="exam-detail__question-index">Câu {qIdx + 1}</div>
                                <div className="exam-detail__question-content">
                                  {q.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                </div>
                              </div>
                              <div className="exam-detail__question-tools">
                                <span className="metric-pill">{q.questionType}</span>
                                <span className="status-pill status-pill--success">{q.points} điểm</span>
                                
                                <button 
                                  className="icon-action"
                                  type="button"
                                  onClick={() => {
                                    setActiveSectionId(section.id);
                                    setSelectedQuestion(q);
                                    setIsAddQuestionOpen(true);
                                  }}
                                  title="Sửa câu hỏi"
                                >
                                  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                                </button>
                                <button 
                                  className="icon-action icon-action--danger"
                                  type="button"
                                  onClick={() => handleDeleteQuestion(section.id, q.id)}
                                  title="Xóa câu hỏi"
                                >
                                  <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                                </button>
                              </div>
                            </div>

                            {q.options && q.options.length > 0 && (
                              <div className="question-options-container">
                                {q.options.map((opt, oIdx) => (
                                  <div key={opt.id || oIdx} className={`exam-detail__option ${opt.isCorrect ? 'exam-detail__option--correct' : ''}`}>
                                    <span className="exam-detail__option-label">
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span className="exam-detail__option-text">{opt.content}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.explanation && (
                              <div className="question-explanation">
                                <div className="exam-detail__question-explanation">
                                  <span className="exam-detail__explanation-label">Giải thích:</span>
                                  <div className="exam-detail__explanation-content">{q.explanation}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {(!section.questions || section.questions.length === 0) && (
                          <div className="page-state page-state--soft">
                            <span className="material-symbols-outlined page-state__icon" aria-hidden="true">quiz</span>
                            <p>Chưa có câu hỏi nào trong phần này</p>
                          </div>
                        )}
                      </div>

                      <div className="question-actions exam-detail__section-footer page-action-row">
                          <button 
                            className="teacher-btn-outline"
                            type="button"
                            onClick={() => {
                              setActiveSectionId(section.id);
                              setSelectedQuestion(null);
                              setIsAddQuestionOpen(true);
                            }}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">add_circle</span>
                            Thêm câu hỏi mới
                          </button>
                          <button 
                            className="teacher-btn-outline"
                            type="button"
                            onClick={() => {
                              setActiveSectionId(section.id);
                              setIsUploadFileOpen(true);
                            }}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">attach_file</span>
                            Đính kèm file âm thanh / tài liệu
                          </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'submissions' && (
          <ExamSubmissions classId={classId!} examId={examId!} isPublished={exam.status === 'PUBLISHED'} />
        )}
      </div>

      <ImportExcelModal
        examId={examId || ''}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={refreshExam}
      />

      {isAddSectionOpen && examId && classId && (
        <AddSectionModal
          classId={classId}
          examId={examId}
          isOpen={isAddSectionOpen}
          initialData={selectedSection ?? undefined}
          onClose={() => {
            setIsAddSectionOpen(false);
            setSelectedSection(null);
          }}
          onSuccess={refreshExam}
        />
      )}

      {isAddQuestionOpen && examId && classId && activeSectionId && (
        <AddQuestionModal
          classId={classId}
          examId={examId}
          sectionId={activeSectionId}
          isOpen={isAddQuestionOpen}
          initialData={selectedQuestion ?? undefined}
          onClose={() => {
            setIsAddQuestionOpen(false);
            setSelectedQuestion(null);
          }}
          onSuccess={refreshExam}
        />
      )}
      {isEditInfoOpen && examId && classId && exam && (
        <EditExamInfoModal
          classId={classId}
          exam={exam}
          isOpen={isEditInfoOpen}
          onClose={() => setIsEditInfoOpen(false)}
          onSuccess={refreshExam}
        />
      )}

      <UploadExamFileModal
        classId={classId!}
        examId={examId!}
        sectionId={activeSectionId}
        isOpen={isUploadFileOpen}
        onClose={() => setIsUploadFileOpen(false)}
        onSuccess={refreshExam}
      />
    </div>
  );
}
