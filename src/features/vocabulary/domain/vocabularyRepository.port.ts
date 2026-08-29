import type {
  CreateVocabularyCategoryPayload,
  CreateVocabularyWordPayload,
  ImportVocabularyDuplicateMode,
  ImportVocabularyResponse,
  ReviewVocabularySentenceResponse,
  ReviewVocabularyResponse,
  SubmitVocabularySentenceResponse,
  UpdateVocabularyCategoryPayload,
  UpdateVocabularyWordPayload,
  UploadVocabularyAudioResponse,
  VocabularyCategory,
  VocabularySentenceClassInteraction,
  VocabularySentenceSubmission,
  VocabularyWord,
  VocabularyReviewDifficulty,
} from './vocabulary.types'

export type VocabularyRepository = {
  uploadAudio(file: File): Promise<UploadVocabularyAudioResponse>
  downloadTemplate(): Promise<Blob>
  createCategory(payload: CreateVocabularyCategoryPayload): Promise<{ message: string; category: VocabularyCategory }>
  updateCategory(categoryId: string, payload: UpdateVocabularyCategoryPayload): Promise<{ message: string; category: VocabularyCategory }>
  deleteCategory(categoryId: string): Promise<{ message: string }>
  getTeacherCategories(): Promise<VocabularyCategory[]>
  getCategoryDetail(categoryId: string): Promise<VocabularyCategory>
  assignClasses(categoryId: string, classIds: string[]): Promise<{ message: string; category: VocabularyCategory }>
  importWords(categoryId: string, file: File, duplicateMode?: ImportVocabularyDuplicateMode): Promise<ImportVocabularyResponse>
  createWord(categoryId: string, payload: CreateVocabularyWordPayload): Promise<{ message: string; word: VocabularyWord }>
  updateWord(wordId: string, payload: UpdateVocabularyWordPayload): Promise<{ message: string; word: VocabularyWord }>
  getTeacherSentenceInteractions(categoryId: string): Promise<VocabularySentenceClassInteraction[]>
  reviewSentenceSubmission(submissionId: string, feedback?: string | null): Promise<ReviewVocabularySentenceResponse>
  getStudentCategories(classId?: string): Promise<VocabularyCategory[]>
  getStudentClassCategories(classId: string): Promise<VocabularyCategory[]>
  reviewWord(wordId: string, difficulty: VocabularyReviewDifficulty): Promise<ReviewVocabularyResponse>
  submitSentence(wordId: string, sentence: string): Promise<SubmitVocabularySentenceResponse>
  getStudentSentenceSubmissions(categoryId: string): Promise<VocabularySentenceSubmission[]>
}
