import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { examApi } from '../../infrastructure/examApi.js';
import type { Exam } from '../../domain/exam.types.js';
import { toast } from 'react-hot-toast';
import { ImportExcelModal } from './ImportExcelModal.tsx';
import { ExamSubmissions } from './ExamSubmissions.tsx';
import { AddSectionModal } from './AddSectionModal.tsx';
import { AddQuestionModal } from './AddQuestionModal.tsx';
import { UploadExamFileModal } from './UploadExamFileModal.tsx';

export function ExamDetail() {
  const { classId, examId } = useParams<{ classId: string; examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'submissions'>('content');

  // Modals state
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  
  // To track which section to add a question to, or which section to upload a file to
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(undefined);

  const fetchExamDetail = () => {
    if (classId && examId) {
      examApi.getExamDetail(classId, examId)
        .then(setExam)
        .catch(() => toast.error('Lỗi khi tải thông tin đề thi'))
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    fetchExamDetail();
  }, [classId, examId]);

  const handlePublish = async () => {
    if (!classId || !examId) return;
    try {
      setIsPublishing(true);
      await examApi.publishExam(classId, examId);
      toast.success('Xuất bản đề thi thành công');
      setExam(prev => prev ? { ...prev, status: 'PUBLISHED' } : null);
    } catch (err) {
      toast.error('Không thể xuất bản đề thi');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>;
  if (!exam) return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy đề thi</div>;

  return (
    <div className="teacher-content-container">
      <div className="teacher-page-header">
        <div>
          <button 
            className="teacher-btn-outline" 
            style={{ marginBottom: '16px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate(`/teacher/classes/${classId}/exams`)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Trở lại danh sách
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(24px, 5vw, 32px)' }}>{exam.title}</h1>
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: exam.status === 'PUBLISHED' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
              color: exam.status === 'PUBLISHED' ? '#4caf50' : '#ff9800'
            }}>
              {exam.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
            </span>
          </div>
          {exam.description && <p style={{ marginTop: '12px', fontSize: '15px' }}>{exam.description}</p>}
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface-soft)', padding: '6px 12px', borderRadius: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span>
              {exam.classSettings?.durationMinutes ? `${exam.classSettings.durationMinutes} phút` : 'Không giới hạn thời gian'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface-soft)', padding: '6px 12px', borderRadius: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>construction</span>
              Cách tạo: {exam.createMethod === 'MANUAL' ? 'Thủ công' : exam.createMethod === 'FILE_UPLOAD' ? 'Đính kèm file' : 'Import Excel'}
            </span>
          </div>
        </div>
        
        {exam.status === 'DRAFT' && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            {exam.createMethod === 'FILE_UPLOAD' && (
              <button 
                className="teacher-btn-primary" 
                style={{ backgroundColor: '#ff9800', border: 'none' }}
                onClick={() => {
                  setActiveSectionId(undefined);
                  setIsUploadFileOpen(true);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>attach_file</span>
                Đính kèm File Đề
              </button>
            )}
            {exam.createMethod === 'EXCEL_IMPORT' && (
              <button 
                className="teacher-btn-primary" 
                style={{ backgroundColor: '#2196f3', border: 'none' }}
                onClick={() => setIsImportModalOpen(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span>
                Import Excel
              </button>
            )}
            <button 
              className="teacher-btn-primary" 
              onClick={handlePublish}
              disabled={isPublishing}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>publish</span>
              {isPublishing ? 'Đang xử lý...' : 'Xuất bản'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
        <button 
          style={{ 
            padding: '12px 0', 
            background: 'none', 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer',
            color: activeTab === 'content' ? 'var(--color-primary)' : 'var(--color-muted)',
            borderBottom: activeTab === 'content' ? '2px solid var(--color-primary)' : '2px solid transparent'
          }}
          onClick={() => setActiveTab('content')}
        >
          Nội dung đề thi
        </button>
        <button 
          style={{ 
            padding: '12px 0', 
            background: 'none', 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer',
            color: activeTab === 'submissions' ? 'var(--color-primary)' : 'var(--color-muted)',
            borderBottom: activeTab === 'submissions' ? '2px solid var(--color-primary)' : '2px solid transparent'
          }}
          onClick={() => setActiveTab('submissions')}
        >
          Bài nộp học sinh
        </button>
      </div>

      <div style={{ marginTop: '32px', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
        {activeTab === 'content' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Nội dung đề thi</h3>
              {exam.status === 'DRAFT' && exam.createMethod === 'MANUAL' && (
                <button 
                  className="teacher-btn-outline"
                  onClick={() => setIsAddSectionOpen(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                  Thêm phần thi (Section)
                </button>
              )}
            </div>

            {(!exam.sections || exam.sections.length === 0) ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--color-surface-soft)', borderRadius: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-muted-soft)', marginBottom: '16px' }}>post_add</span>
                <p style={{ color: 'var(--color-muted)' }}>
                  {exam.createMethod === 'MANUAL' && 'Đề thi này chưa có phần thi nào. Hãy bấm "Thêm phần thi" để bắt đầu soạn đề.'}
                  {exam.createMethod === 'FILE_UPLOAD' && 'Vui lòng đính kèm File đề thi (PDF/Word) ở góc trên bên phải.'}
                  {exam.createMethod === 'EXCEL_IMPORT' && 'Hãy Import file Excel để nạp danh sách câu hỏi.'}
                </p>
              </div>
            ) : (
              <div>
                {exam.sections.map((section, idx) => (
                  <div key={section.id} style={{ marginBottom: '32px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-soft)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                    <div style={{ backgroundColor: 'var(--color-primary-soft)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--color-border-soft)' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>category</span>
                      <div>
                        <h4 style={{ margin: '0', fontSize: '18px', color: 'var(--color-primary-strong)' }}>Phần {idx + 1}: {section.title}</h4>
                        {section.skillType && <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>{section.skillType}</span>}
                      </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                      {section.instructions && (
                        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderLeft: '4px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text)' }}>
                          <span style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--color-muted)' }}>Hướng dẫn:</span>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{section.instructions}</div>
                        </div>
                      )}
                      
                      {/* Liệt kê câu hỏi của phần thi */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {section.questions?.map((q, qIdx) => (
                          <div key={q.id} style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1, minWidth: '200px' }}>
                                <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '4px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>Câu {qIdx + 1}</div>
                                <div style={{ fontWeight: 500, fontSize: '16px', lineHeight: '1.6', marginTop: '2px' }}>
                                  {q.content.split('\n').map((line, i) => <p key={i} style={{ margin: '0 0 4px 0' }}>{line}</p>)}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{q.questionType}</span>
                                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: 'rgba(76,175,80,0.1)', color: '#4caf50', whiteSpace: 'nowrap' }}>{q.points} điểm</span>
                              </div>
                            </div>

                            {q.options && q.options.length > 0 && (
                              <div className="question-options-container">
                                {q.options.map((opt, oIdx) => (
                                  <div key={opt.id || oIdx} style={{ 
                                    padding: '12px 16px', 
                                    backgroundColor: opt.isCorrect ? 'rgba(76,175,80,0.08)' : 'var(--color-surface-soft)',
                                    border: opt.isCorrect ? '1px solid #4caf50' : '1px solid transparent',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                  }}>
                                    <span style={{ 
                                      width: '28px', height: '28px', flexShrink: 0,
                                      borderRadius: '50%', 
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      backgroundColor: opt.isCorrect ? '#4caf50' : 'var(--color-surface-strong)',
                                      color: opt.isCorrect ? 'white' : 'inherit',
                                      fontWeight: 600, fontSize: '13px'
                                    }}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span style={{ fontWeight: opt.isCorrect ? 600 : 400, lineHeight: '1.4' }}>{opt.content}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.explanation && (
                              <div className="question-explanation">
                                <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: '8px', fontSize: '14px' }}>
                                  <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'block', marginBottom: '4px' }}>Giải thích: </span>
                                  <div style={{ color: 'var(--color-muted)', whiteSpace: 'pre-wrap' }}>{q.explanation}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {(!section.questions || section.questions.length === 0) && (
                          <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed var(--color-border-soft)', borderRadius: '12px', backgroundColor: 'var(--color-surface-soft)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-border)' }}>quiz</span>
                            <p style={{ color: 'var(--color-muted)', margin: '12px 0 0 0', fontWeight: 500 }}>Chưa có câu hỏi nào trong phần này</p>
                          </div>
                        )}
                      </div>

                      {exam.status === 'DRAFT' && (
                        <div className="question-actions">
                          <button 
                            className="teacher-btn-outline" 
                            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600 }}
                            onClick={() => {
                              setActiveSectionId(section.id);
                              setIsAddQuestionOpen(true);
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
                            Thêm câu hỏi
                          </button>
                          <button 
                            className="teacher-btn-outline"
                            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                            onClick={() => {
                              setActiveSectionId(section.id);
                              setIsUploadFileOpen(true);
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>attach_file</span>
                            Đính kèm file âm thanh / tài liệu
                          </button>
                        </div>
                      )}
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
        onSuccess={fetchExamDetail}
      />

      <AddSectionModal
        classId={classId!}
        examId={examId!}
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onSuccess={fetchExamDetail}
      />

      <AddQuestionModal
        classId={classId!}
        examId={examId!}
        sectionId={activeSectionId!}
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        onSuccess={fetchExamDetail}
      />

      <UploadExamFileModal
        classId={classId!}
        examId={examId!}
        sectionId={activeSectionId}
        isOpen={isUploadFileOpen}
        onClose={() => setIsUploadFileOpen(false)}
        onSuccess={fetchExamDetail}
      />
    </div>
  );
}
