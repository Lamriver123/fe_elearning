import { vocabularyApi } from '../infrastructure/vocabularyApi'
import type {
  CreateVocabularyCategoryPayload,
  CreateVocabularyWordPayload,
  ImportVocabularyDuplicateMode,
  UpdateVocabularyCategoryPayload,
  UpdateVocabularyWordPayload,
  VocabularyReviewDifficulty,
} from '../domain/vocabulary.types'

export function uploadVocabularyAudio(file: File) {
  return vocabularyApi.uploadAudio(file)
}

export function downloadVocabularyTemplate() {
  return vocabularyApi.downloadTemplate()
}

export function createVocabularyCategory(payload: CreateVocabularyCategoryPayload) {
  return vocabularyApi.createCategory(payload)
}

export function updateVocabularyCategory(categoryId: string, payload: UpdateVocabularyCategoryPayload) {
  return vocabularyApi.updateCategory(categoryId, payload)
}

export function deleteVocabularyCategory(categoryId: string) {
  return vocabularyApi.deleteCategory(categoryId)
}

export function getTeacherVocabularyCategories() {
  return vocabularyApi.getTeacherCategories()
}

export function getTeacherVocabularyCategoryDetail(categoryId: string) {
  return vocabularyApi.getCategoryDetail(categoryId)
}

export function assignVocabularyClasses(categoryId: string, classIds: string[]) {
  return vocabularyApi.assignClasses(categoryId, classIds)
}

export function importVocabularyWords(
  categoryId: string,
  file: File,
  duplicateMode?: ImportVocabularyDuplicateMode,
) {
  return vocabularyApi.importWords(categoryId, file, duplicateMode)
}

export function createVocabularyWord(categoryId: string, payload: CreateVocabularyWordPayload) {
  return vocabularyApi.createWord(categoryId, payload)
}

export function updateVocabularyWord(wordId: string, payload: UpdateVocabularyWordPayload) {
  return vocabularyApi.updateWord(wordId, payload)
}

export function getTeacherVocabularySentenceInteractions(categoryId: string) {
  return vocabularyApi.getTeacherSentenceInteractions(categoryId)
}

export function reviewVocabularySentenceSubmission(submissionId: string, feedback?: string | null) {
  return vocabularyApi.reviewSentenceSubmission(submissionId, feedback)
}

export function getStudentVocabularyCategories(classId?: string) {
  return vocabularyApi.getStudentCategories(classId)
}

export function getStudentClassVocabularyCategories(classId: string) {
  return vocabularyApi.getStudentClassCategories(classId)
}

export function reviewVocabularyWord(wordId: string, difficulty: VocabularyReviewDifficulty) {
  return vocabularyApi.reviewWord(wordId, difficulty)
}

export function submitVocabularySentence(wordId: string, sentence: string) {
  return vocabularyApi.submitSentence(wordId, sentence)
}

export function getStudentVocabularySentenceSubmissions(categoryId: string) {
  return vocabularyApi.getStudentSentenceSubmissions(categoryId)
}
