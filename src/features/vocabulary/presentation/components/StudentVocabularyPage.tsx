import { useStudentVocabulary } from '../../application/useStudentVocabulary'
import { VocabularyFlashcards } from './VocabularyFlashcards'

export function StudentVocabularyPage() {
  const { categories, isLoading, error, reviewWord, submitSentence, loadSentenceSubmissions } = useStudentVocabulary()

  return (
    <div className="student-content-container vocabulary-page">
      <VocabularyFlashcards
        categories={categories}
        isLoading={isLoading}
      error={error}
      onReview={reviewWord}
      onSubmitSentence={submitSentence}
      onLoadSentenceSubmissions={loadSentenceSubmissions}
      headerTitle="Từ vựng"
      headerDescription="Ôn tập các danh mục từ vựng từ lớp học của bạn."
      />
    </div>
  )
}
