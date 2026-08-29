import { httpClient } from '../../../shared/lib/httpClient'
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
  VocabularyReviewDifficulty,
  VocabularySentenceClassInteraction,
  VocabularySentenceSubmission,
  VocabularyWord,
} from '../domain/vocabulary.types'
import type { VocabularyRepository } from '../domain/vocabularyRepository.port'

export const vocabularyApi: VocabularyRepository = {
  uploadAudio(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/vocabulary/audio', formData) as Promise<UploadVocabularyAudioResponse>
  },

  downloadTemplate() {
    return httpClient.get('/vocabulary/template', { responseType: 'blob' }) as Promise<Blob>
  },

  createCategory(payload: CreateVocabularyCategoryPayload) {
    return httpClient.post('/vocabulary/categories', payload) as Promise<{ message: string; category: VocabularyCategory }>
  },

  updateCategory(categoryId: string, payload: UpdateVocabularyCategoryPayload) {
    return httpClient.patch(`/vocabulary/categories/${categoryId}`, payload) as Promise<{ message: string; category: VocabularyCategory }>
  },

  deleteCategory(categoryId: string) {
    return httpClient.delete(`/vocabulary/categories/${categoryId}`) as Promise<{ message: string }>
  },

  getTeacherCategories() {
    return httpClient.get('/vocabulary/categories') as Promise<VocabularyCategory[]>
  },

  getCategoryDetail(categoryId: string) {
    return httpClient.get(`/vocabulary/categories/${categoryId}`) as Promise<VocabularyCategory>
  },

  assignClasses(categoryId: string, classIds: string[]) {
    return httpClient.put(`/vocabulary/categories/${categoryId}/classes`, { classIds }) as Promise<{ message: string; category: VocabularyCategory }>
  },

  importWords(categoryId: string, file: File, duplicateMode?: ImportVocabularyDuplicateMode) {
    const formData = new FormData()
    formData.append('file', file)
    if (duplicateMode) formData.append('duplicateMode', duplicateMode)
    return httpClient.post(`/vocabulary/categories/${categoryId}/import`, formData) as Promise<ImportVocabularyResponse>
  },

  createWord(categoryId: string, payload: CreateVocabularyWordPayload) {
    return httpClient.post(`/vocabulary/categories/${categoryId}/words`, payload) as Promise<{ message: string; word: VocabularyWord }>
  },

  updateWord(wordId: string, payload: UpdateVocabularyWordPayload) {
    return httpClient.patch(`/vocabulary/words/${wordId}`, payload) as Promise<{ message: string; word: VocabularyWord }>
  },

  getTeacherSentenceInteractions(categoryId: string) {
    return httpClient.get(`/vocabulary/categories/${categoryId}/sentence-interactions`) as Promise<VocabularySentenceClassInteraction[]>
  },

  reviewSentenceSubmission(submissionId: string, feedback?: string | null) {
    return httpClient.patch(`/vocabulary/sentence-submissions/${submissionId}/review`, {
      feedback,
    }) as Promise<ReviewVocabularySentenceResponse>
  },

  getStudentCategories(classId?: string) {
    const query = classId ? `?classId=${encodeURIComponent(classId)}` : ''
    return httpClient.get(`/vocabulary/student/categories${query}`) as Promise<VocabularyCategory[]>
  },

  getStudentClassCategories(classId: string) {
    return httpClient.get(`/vocabulary/student/classes/${classId}/categories`) as Promise<VocabularyCategory[]>
  },

  reviewWord(wordId: string, difficulty: VocabularyReviewDifficulty) {
    return httpClient.post(`/vocabulary/student/words/${wordId}/review`, {
      difficulty,
    }) as Promise<ReviewVocabularyResponse>
  },

  submitSentence(wordId: string, sentence: string) {
    return httpClient.post(`/vocabulary/student/words/${wordId}/sentence-submissions`, {
      sentence,
    }) as Promise<SubmitVocabularySentenceResponse>
  },

  getStudentSentenceSubmissions(categoryId: string) {
    return httpClient.get(`/vocabulary/student/categories/${categoryId}/sentence-submissions`) as Promise<VocabularySentenceSubmission[]>
  },
}
