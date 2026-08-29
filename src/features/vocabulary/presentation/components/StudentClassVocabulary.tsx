import { useStudentVocabulary } from '../../application/useStudentVocabulary'
import { VocabularyFlashcards } from './VocabularyFlashcards'

type StudentClassVocabularyProps = {
  classId: string
}

export function StudentClassVocabulary({ classId }: StudentClassVocabularyProps) {
  const { categories, isLoading, error, reviewWord, submitSentence, loadSentenceSubmissions } = useStudentVocabulary(classId)

  return (
    <VocabularyFlashcards
      categories={categories}
      isLoading={isLoading}
      error={error}
      onReview={reviewWord}
      onSubmitSentence={submitSentence}
      onLoadSentenceSubmissions={loadSentenceSubmissions}
    />
  )
}
