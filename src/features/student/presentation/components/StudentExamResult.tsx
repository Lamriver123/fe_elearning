import { useParams, useNavigate } from 'react-router-dom';
import { useStudentExamDetail, useStudentExamResult } from '../../../student/application/useStudentExams';
import { useAuth } from '../../../auth/application/useAuth';

function StudentExamResultSkeleton() {
  return (
    <div
      className="exam-result-page result-skeleton"
      aria-label="Đang tải kết quả"
      aria-live="polite"
    >
      <div className="exam-result-page__inner" aria-hidden="true">
        <span className="skeleton-chip" />
        <section className="exam-result-summary surface-card">
          <span className="skeleton-line skeleton-line--lg" />
          <span className="skeleton-line skeleton-line--md" />
          <span className="skeleton-line skeleton-line--sm" />
        </section>
        {[1, 2, 3].map((item) => (
          <section key={item} className="exam-result-section">
            <span className="skeleton-line skeleton-line--lg" />
            <article className="exam-result-question">
              <div className="exam-result-question__head">
                <span className="skeleton-line skeleton-line--md" />
                <span className="skeleton-chip" />
              </div>
              <span className="skeleton-line skeleton-line--lg" />
              <div className="exam-result-options">
                <span className="skeleton-line" />
                <span className="skeleton-line" />
                <span className="skeleton-line" />
              </div>
            </article>
          </section>
        ))}
      </div>
    </div>
  );
}

export function StudentExamResult({ classId }: { classId: string }) {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exam, isLoading: examLoading, error: examError } = useStudentExamDetail(classId, examId!);
  const { result, isLoading: resultLoading, error: resultError } = useStudentExamResult(classId, examId, user?.id);

  if (examLoading || resultLoading) {
    return <StudentExamResultSkeleton />;
  }

  if (examError || resultError || !exam || !result) {
    return (
      <div className="exam-result-page">
        <div className="page-state page-state--error">
          <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
          <p>{examError || resultError || 'Lỗi tải kết quả'}</p>
        </div>
      </div>
    );
  }

  const totalExamPoints = exam?.totalPoints || exam?.sections?.reduce((acc, sec) => 
    acc + sec.questions.reduce((qAcc, q) => qAcc + (q.points || 1), 0)
  , 0) || 0;

  return (
    <div className="exam-result-page">
      <div className="exam-result-page__inner">
        <button 
          className="teacher-btn-outline back-button"
          type="button"
          onClick={() => navigate(`/student/courses/${classId}/exams`)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Trở về danh sách
        </button>

        <section className="exam-result-summary surface-card">
          <h1>Kết quả: {exam.title}</h1>
          <div className="exam-result-summary__score">
            {result.totalScore} / {totalExamPoints}
          </div>
          <p>Tổng điểm</p>
        </section>

        {exam.sections.map((section, sIdx) => (
          <section key={section.id} className="exam-result-section">
            <h3 className="exam-result-section__title">
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
                <article key={q.id} className={`exam-result-question ${hasBeenGraded ? (isCorrect ? 'exam-result-question--correct' : 'exam-result-question--incorrect') : 'exam-result-question--pending'}`}>
                  <div className="exam-result-question__head">
                    <h4>Câu {qIdx + 1}:</h4>
                    <span className={`status-pill ${isCorrect ? 'status-pill--success' : 'status-pill--warning'}`}>
                      {ans?.score || 0} / {q.points} điểm
                    </span>
                  </div>
                  
                  <p className="exam-result-question__content">{q.content}</p>

                  {q.questionType === 'MULTIPLE_CHOICE' && (
                    <div className="exam-result-options">
                      {q.options?.map(opt => {
                        const isSelected = ans?.selectedOption?.id === opt.id;
                        return (
                          <div key={opt.id} className={`exam-result-option ${isSelected ? (isCorrect ? 'exam-result-option--correct' : 'exam-result-option--incorrect') : ''}`}>
                            <span className="material-symbols-outlined" aria-hidden="true">
                              {isSelected ? (isCorrect ? 'check_circle' : 'cancel') : 'radio_button_unchecked'}
                            </span>
                            <span>{opt.content}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.questionType === 'ESSAY' && (
                    <div className="exam-result-answer">
                      <p>
                        {ans?.textAnswer || 'Không có câu trả lời.'}
                      </p>
                    </div>
                  )}

                  {q.questionType === 'AUDIO_RESPONSE' && ans?.fileUrl && (
                    <div className="exam-result-answer">
                      <audio controls src={ans.fileUrl} />
                    </div>
                  )}

                  {ans?.teacherComment && (
                    <div className="exam-result-comment">
                      <p className="exam-result-comment__label">Nhận xét của giáo viên:</p>
                      <p>{ans.teacherComment}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
