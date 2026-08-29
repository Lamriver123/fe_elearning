export type VocabularyReviewDifficulty = 'EASY' | 'GOOD' | 'HARD' | 'RELEARN'
export type VocabularySentenceRequirement = 'OFF' | 'ONCE' | 'ALWAYS'
export type VocabularySentenceReviewStatus = 'PENDING' | 'REVIEWED'

export type VocabularyClassInfo = {
  id: string
  name: string
}

export type VocabularyTeacherInfo = {
  id: string
  fullName: string
  email: string
}

export type VocabularyProgress = {
  id: string
  lastDifficulty: VocabularyReviewDifficulty | null
  intervalMinutes: number
  reviewCount: number
  masteryScore: number
  lastReviewedAt: string | null
  nextReviewAt: string | null
}

export type VocabularySentenceSubmission = {
  id: string
  sentence: string
  status: VocabularySentenceReviewStatus
  feedback?: string | null
  createdAt: string
  updatedAt: string
  reviewedAt?: string | null
  reviewer?: VocabularyTeacherInfo | null
  word?: {
    id: string
    orderIndex: number
    term: string
    meaning: string
  }
  student?: {
    id: string
    fullName: string
    email: string
    avatar?: string | null
  }
}

export type VocabularySentenceInteraction = {
  student: {
    id: string
    fullName: string
    email: string
    avatar?: string | null
  }
  studyTotal: number
  studiedCount: number
  sentenceTotal: number
  sentenceSubmittedCount: number
  isCompleted: boolean
  totalSentences: number
  pendingCount: number
  reviewedCount: number
  sentences: VocabularySentenceSubmission[]
}

export type VocabularySentenceClassInteraction = {
  classInfo: VocabularyClassInfo
  totalStudents: number
  totalSentences: number
  pendingCount: number
  reviewedCount: number
  students: VocabularySentenceInteraction[]
}

export type VocabularyWord = {
  id: string
  orderIndex: number
  term: string
  wordType: string
  phoneticUs?: string | null
  phoneticUk?: string | null
  audioUsUrl?: string | null
  audioUkUrl?: string | null
  meaning: string
  example?: string | null
  exampleMeaning?: string | null
  synonyms?: string | null
  antonyms?: string | null
  sentenceRequirement: VocabularySentenceRequirement
  sentenceSubmissionCount?: number
  latestSentenceSubmission?: VocabularySentenceSubmission | null
  progress?: VocabularyProgress | null
}

export type VocabularyCategory = {
  id: string
  name: string
  description?: string | null
  teacher?: VocabularyTeacherInfo
  classes: VocabularyClassInfo[]
  words?: VocabularyWord[]
  wordCount: number
  dueCount?: number
  createdAt: string
  updatedAt: string
}

export type CreateVocabularyCategoryPayload = {
  name: string
  description?: string
}

export type UpdateVocabularyCategoryPayload = Partial<CreateVocabularyCategoryPayload>

export type CreateVocabularyWordPayload = {
  orderIndex: number
  term: string
  wordType: string
  phoneticUs?: string | null
  phoneticUk?: string | null
  audioUsUrl?: string | null
  audioUkUrl?: string | null
  meaning: string
  example?: string | null
  exampleMeaning?: string | null
  synonyms?: string | null
  antonyms?: string | null
  sentenceRequirement?: VocabularySentenceRequirement
}

export type UpdateVocabularyWordPayload = Partial<CreateVocabularyWordPayload>

export type ImportVocabularyDuplicateMode = 'append' | 'overwrite'

export type ImportVocabularyDuplicateConflict = {
  requiresDuplicateDecision: true
  message: string
  duplicateTerms: string[]
}

export type ImportVocabularyResult = ImportVocabularyResponse | ImportVocabularyDuplicateConflict

export type ImportVocabularyResponse = {
  message: string
  importedCount: number
  duplicateTerms?: string[]
  skippedRows: Array<{ rowNumber: number; reason: string }>
  words: VocabularyWord[]
}

export type UploadVocabularyAudioResponse = {
  url: string
  message: string
}

export type ReviewVocabularyResponse = {
  message: string
  progress: VocabularyProgress
  sentenceSubmission?: VocabularySentenceSubmission
}

export type ReviewVocabularySentenceResponse = {
  message: string
  submission: VocabularySentenceSubmission
}

export type SubmitVocabularySentenceResponse = {
  message: string
  submission: VocabularySentenceSubmission
}
