import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { toast } from 'react-hot-toast'
import type {
  VocabularyCategory,
  VocabularyProgress,
  VocabularyReviewDifficulty,
  VocabularySentenceSubmission,
  VocabularyWord,
} from '../../domain/vocabulary.types'

type VocabularyActivityMode = 'study' | 'sentences'

type VocabularyFlashcardsProps = {
  categories: VocabularyCategory[]
  isLoading: boolean
  error: string | null
  onReview: (wordId: string, difficulty: VocabularyReviewDifficulty) => Promise<VocabularyProgress | null>
  onSubmitSentence?: (wordId: string, sentence: string) => Promise<VocabularySentenceSubmission | null>
  onLoadSentenceSubmissions?: (categoryId: string) => Promise<VocabularySentenceSubmission[]>
  headerTitle?: string
  headerDescription?: string
}

type ReviewOption = {
  difficulty: VocabularyReviewDifficulty
  label: string
  note: string
  icon: string
}

const REVIEW_OPTIONS: ReviewOption[] = [
  { difficulty: 'RELEARN', label: 'Học lại', note: '1 phút', icon: 'restart_alt' },
  { difficulty: 'HARD', label: 'Khó', note: '6 giờ', icon: 'psychology_alt' },
  { difficulty: 'GOOD', label: 'Tốt', note: '1 ngày', icon: 'thumb_up' },
  { difficulty: 'EASY', label: 'Dễ', note: '3 ngày', icon: 'check_circle' },
]

function splitValues(value?: string | null) {
  return (value ?? '')
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function isDue(word: VocabularyWord) {
  const nextReviewAt = word.progress?.nextReviewAt
  return !nextReviewAt || new Date(nextReviewAt).getTime() <= Date.now()
}

function getStudyWords(category?: VocabularyCategory) {
  return (category?.words ?? [])
    .slice()
    .sort((left, right) => {
      const leftDue = isDue(left) ? 0 : 1
      const rightDue = isDue(right) ? 0 : 1
      if (leftDue !== rightDue) return leftDue - rightDue
      return left.orderIndex - right.orderIndex
    })
}

function getSentenceWords(category?: VocabularyCategory) {
  return (category?.words ?? [])
    .filter((word) => (word.sentenceRequirement ?? 'ONCE') !== 'OFF')
    .slice()
    .sort((left, right) => left.orderIndex - right.orderIndex)
}

function getCategoryProgress(category: VocabularyCategory) {
  const words = category.words ?? []
  const total = category.wordCount || words.length
  const learnedCount = getLearnedWordCount(category)

  return `Học: ${learnedCount}/${total}`
}

function getLearnedWordCount(category: VocabularyCategory) {
  return (category.words ?? []).filter(
    (word) => word.progress && word.progress.lastDifficulty !== 'RELEARN' && word.progress.masteryScore > 0,
  ).length
}

function getCategoryProgressPercent(category: VocabularyCategory) {
  const words = category.words ?? []
  const studyTotal = category.wordCount || words.length
  const sentenceProgress = getSentenceProgress(category)
  const totalTasks = studyTotal + sentenceProgress.total

  if (totalTasks === 0) return 0

  const completedTasks = getLearnedWordCount(category) + sentenceProgress.submittedCount
  return Math.min(100, Math.round((completedTasks / totalTasks) * 100))
}

function getSentenceProgress(category: VocabularyCategory) {
  const words = getSentenceWords(category)
  const submittedCount = words.filter((word) => (word.sentenceSubmissionCount ?? 0) > 0).length

  return {
    total: words.length,
    submittedCount,
    text: `${submittedCount}/${words.length}`,
  }
}

function isCategoryComplete(category: VocabularyCategory) {
  const words = category.words ?? []
  const studyTotal = category.wordCount || words.length
  const sentenceProgress = getSentenceProgress(category)

  return (
    studyTotal > 0 &&
    getLearnedWordCount(category) >= studyTotal &&
    sentenceProgress.submittedCount >= sentenceProgress.total
  )
}

function getCategoryStatusClass(category: VocabularyCategory) {
  if ((category.wordCount || category.words?.length || 0) === 0) {
    return 'vocabulary-category-card--empty'
  }

  return isCategoryComplete(category)
    ? 'vocabulary-category-card--complete'
    : 'vocabulary-category-card--incomplete'
}

function getCategoryStatusText(category: VocabularyCategory) {
  if ((category.wordCount || category.words?.length || 0) === 0) {
    return 'Chưa có từ'
  }

  if (isCategoryComplete(category)) {
    return 'Đã xong'
  }

  if (category.dueCount) {
    return `${category.dueCount} cần ôn`
  }

  return 'Đang học'
}

function getCategoryDescription(category: VocabularyCategory) {
  return category.description?.trim() || 'Danh mục từ vựng'
}

function sentenceContainsTerm(sentence: string, term: string) {
  return sentence.trim().toLocaleLowerCase('vi-VN').includes(term.trim().toLocaleLowerCase('vi-VN'))
}

function getSentenceStatusText(status: string) {
  return status === 'REVIEWED' ? 'Đã review' : 'Chờ review'
}

export function VocabularyFlashcards({
  categories,
  isLoading,
  error,
  onReview,
  onSubmitSentence,
  onLoadSentenceSubmissions,
  headerTitle,
  headerDescription,
}: VocabularyFlashcardsProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<VocabularyActivityMode | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyWords, setStudyWords] = useState<VocabularyWord[]>([])
  const [sentenceDraft, setSentenceDraft] = useState('')
  const [isSubmittingSentence, setIsSubmittingSentence] = useState(false)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [isSentenceSessionComplete, setIsSentenceSessionComplete] = useState(false)
  const [isReviewPanelOpen, setIsReviewPanelOpen] = useState(false)
  const [isLoadingSentenceSubmissions, setIsLoadingSentenceSubmissions] = useState(false)
  const [sentenceSubmissions, setSentenceSubmissions] = useState<VocabularySentenceSubmission[]>([])
  const pronunciationAudioRef = useRef<HTMLAudioElement | null>(null)
  const pronunciationSequenceRef = useRef(0)
  const pendingReviewWordIdsRef = useRef<Set<string>>(new Set())
  const pendingReviewPromisesRef = useRef<Set<Promise<unknown>>>(new Set())

  const activeCategoryId =
    selectedCategoryId && categories.some((category) => category.id === selectedCategoryId)
      ? selectedCategoryId
      : null
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId),
    [categories, activeCategoryId],
  )
  const words = selectedCategory && activeMode === 'study' ? studyWords : []
  const sentenceWords = useMemo(
    () => (selectedCategory && activeMode === 'sentences' ? getSentenceWords(selectedCategory) : []),
    [selectedCategory, activeMode],
  )
  const safeCurrentIndex = words.length > 0 ? Math.min(currentIndex, words.length - 1) : 0
  const safeSentenceIndex = sentenceWords.length > 0 ? Math.min(sentenceIndex, sentenceWords.length - 1) : 0
  const currentWord = words[safeCurrentIndex]
  const currentSentenceWord = sentenceWords[safeSentenceIndex]
  const currentWordId = currentWord?.id ?? null
  const currentAudioUsUrl = currentWord?.audioUsUrl ?? null
  const currentAudioUkUrl = currentWord?.audioUkUrl ?? null
  const dueCount = words.filter(isDue).length
  const vocabularyHeader = headerTitle || headerDescription ? (
    <div className="profile-page__header">
      {headerTitle && <h1>{headerTitle}</h1>}
      {headerDescription && <p>{headerDescription}</p>}
    </div>
  ) : null

  const stopPronunciationAudio = useCallback(() => {
    pronunciationSequenceRef.current += 1
    const currentAudio = pronunciationAudioRef.current
    if (!currentAudio) return
    currentAudio.pause()
    currentAudio.currentTime = 0
    pronunciationAudioRef.current = null
  }, [])

  const playPronunciationAudio = useCallback((url?: string | null) => {
    if (!url) return
    stopPronunciationAudio()

    const sequenceId = pronunciationSequenceRef.current
    const nextAudio = new Audio(url)
    pronunciationAudioRef.current = nextAudio
    nextAudio.onended = () => {
      if (pronunciationSequenceRef.current === sequenceId && pronunciationAudioRef.current === nextAudio) {
        pronunciationAudioRef.current = null
      }
    }
    void nextAudio.play().catch(() => {
      if (pronunciationSequenceRef.current === sequenceId && pronunciationAudioRef.current === nextAudio) {
        pronunciationAudioRef.current = null
      }
    })
  }, [stopPronunciationAudio])

  useEffect(() => {
    return stopPronunciationAudio
  }, [stopPronunciationAudio])

  useEffect(() => {
    if (!currentWordId || isFlipped || activeMode !== 'study') {
      stopPronunciationAudio()
      return undefined
    }

    playPronunciationAudio(currentAudioUsUrl || currentAudioUkUrl)
    return stopPronunciationAudio
  }, [
    activeMode,
    currentWordId,
    currentAudioUsUrl,
    currentAudioUkUrl,
    isFlipped,
    playPronunciationAudio,
    stopPronunciationAudio,
  ])

  const resetDetailState = () => {
    stopPronunciationAudio()
    setCurrentIndex(0)
    setSentenceIndex(0)
    setIsFlipped(false)
    setSentenceDraft('')
    setIsSubmittingSentence(false)
    setIsSessionComplete(false)
    setIsSentenceSessionComplete(false)
    setIsReviewPanelOpen(false)
    setSentenceSubmissions([])
  }

  const selectCategory = (categoryId: string, mode: VocabularyActivityMode) => {
    const category = categories.find((item) => item.id === categoryId)
    resetDetailState()
    setSelectedCategoryId(categoryId)
    setActiveMode(mode)
    setStudyWords(mode === 'study' ? getStudyWords(category) : [])
  }

  const backToCategories = () => {
    resetDetailState()
    setSelectedCategoryId(null)
    setActiveMode(null)
    setStudyWords([])
  }

  const goToWord = (nextIndex: number) => {
    if (words.length === 0) return
    stopPronunciationAudio()
    const normalizedIndex = (nextIndex + words.length) % words.length
    setCurrentIndex(normalizedIndex)
    setIsFlipped(false)
  }

  const goToSentenceWord = (nextIndex: number) => {
    if (sentenceWords.length === 0) return
    const normalizedIndex = Math.max(0, Math.min(nextIndex, sentenceWords.length - 1))
    setSentenceIndex(normalizedIndex)
    setSentenceDraft('')
  }

  const toggleCard = () => {
    if (!currentWord) return
    setIsFlipped((currentValue) => !currentValue)
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggleCard()
  }

  const submitReview = (reviewedWord: VocabularyWord, difficulty: VocabularyReviewDifficulty) => {
    if (!reviewedWord || pendingReviewWordIdsRef.current.has(reviewedWord.id)) return

    pendingReviewWordIdsRef.current.add(reviewedWord.id)
    const reviewPromise = onReview(reviewedWord.id, difficulty)
    pendingReviewPromisesRef.current.add(reviewPromise)
    void reviewPromise.finally(() => {
      pendingReviewWordIdsRef.current.delete(reviewedWord.id)
      pendingReviewPromisesRef.current.delete(reviewPromise)
    })

    if (safeCurrentIndex === words.length - 1) {
      toast.success('Đã hoàn thành vòng học')
      stopPronunciationAudio()
      setIsSessionComplete(true)
      setIsFlipped(false)
      return
    }
    goToWord(safeCurrentIndex + 1)
  }

  const handleReview = (difficulty: VocabularyReviewDifficulty) => {
    if (!currentWord) return
    submitReview(currentWord, difficulty)
  }

  const submitCurrentSentence = async () => {
    if (!currentSentenceWord || !onSubmitSentence) return

    const sentence = sentenceDraft.trim()
    if (!sentence) {
      toast.error('Vui lòng đặt một câu có sử dụng từ này')
      return
    }

    if (!sentenceContainsTerm(sentence, currentSentenceWord.term)) {
      toast.error(`Câu đặt cần có từ "${currentSentenceWord.term}"`)
      return
    }

    setIsSubmittingSentence(true)
    const submission = await onSubmitSentence(currentSentenceWord.id, sentence)
    setIsSubmittingSentence(false)
    if (!submission) return

    setSentenceDraft('')
    toast.success('Đã gửi câu đặt')
    if (safeSentenceIndex === sentenceWords.length - 1) {
      setIsSentenceSessionComplete(true)
      return
    }

    goToSentenceWord(safeSentenceIndex + 1)
  }

  const openReviewPanel = async () => {
    if (!selectedCategory || !onLoadSentenceSubmissions) return

    setIsReviewPanelOpen(true)
    setIsLoadingSentenceSubmissions(true)
    try {
      const pendingReviews = Array.from(pendingReviewPromisesRef.current)
      if (pendingReviews.length > 0) {
        await Promise.allSettled(pendingReviews)
      }
      const submissions = await onLoadSentenceSubmissions(selectedCategory.id)
      setSentenceSubmissions(submissions)
    } finally {
      setIsLoadingSentenceSubmissions(false)
    }
  }

  if (isLoading) {
    return (
      <div className="vocabulary-study">
        {vocabularyHeader}
        <div className="vocabulary-category-grid" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="vocabulary-category-card vocabulary-category-card--loading" key={index}>
              <span className="skeleton-line skeleton-line--md" />
              <span className="skeleton-line skeleton-line--lg" />
              <span className="skeleton-line skeleton-line--sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="vocabulary-study">
        {vocabularyHeader}
        <div className="page-state page-state--error">
          <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="vocabulary-study">
        {vocabularyHeader}
        <div className="page-state">
          <span className="material-symbols-outlined page-state__icon" aria-hidden="true">style</span>
          <h3 className="page-state__title">Chưa có từ vựng</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="vocabulary-study">
      {!selectedCategory && vocabularyHeader}

      {!selectedCategory && (
        <div className="vocabulary-category-grid" role="list" aria-label="Danh mục từ vựng">
          {categories.map((category) => {
            const sentenceProgress = getSentenceProgress(category)

            return (
              <article
                key={category.id}
                role="listitem"
                className={`vocabulary-category-card vocabulary-category-card--has-actions ${getCategoryStatusClass(category)}`}
              >
                <span className="vocabulary-category-card__description">
                  {getCategoryDescription(category)}
                </span>
                <h3>{category.name}</h3>
                <p>
                  <strong>{getCategoryProgress(category)}</strong>
                  <span> · {getCategoryStatusText(category)}</span>
                </p>
                {onSubmitSentence && sentenceProgress.total > 0 && (
                  <p className="vocabulary-category-card__sentence-progress">
                    Đặt câu: {sentenceProgress.text}
                  </p>
                )}
                <span className="vocabulary-category-card__progress" aria-hidden="true">
                  <span style={{ width: `${getCategoryProgressPercent(category)}%` }} />
                </span>
                <div className="vocabulary-category-card__actions">
                  <button type="button" onClick={() => selectCategory(category.id, 'study')}>
                    <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
                    Học
                  </button>
                  {onSubmitSentence && (
                    <button
                      type="button"
                      className="vocabulary-category-card__action--sentence"
                      onClick={() => selectCategory(category.id, 'sentences')}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
                      Đặt câu
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {selectedCategory && (
        <>
          <div className="vocabulary-study-detail-actions">
            <button type="button" className="teacher-btn-outline" onClick={backToCategories}>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Quay lại
            </button>
            {onLoadSentenceSubmissions && (
              <button type="button" className="teacher-btn-outline" onClick={() => void openReviewPanel()}>
                <span className="material-symbols-outlined" aria-hidden="true">rate_review</span>
                Xem review
              </button>
            )}
          </div>

          {activeMode === 'study' && (
            <>
              {isSessionComplete ? (
                <div className="surface-card vocabulary-session-complete">
                  <span className="material-symbols-outlined" aria-hidden="true">verified</span>
                  <h3>Hoàn thành vòng học</h3>
                  <p>Tiến độ đã được lưu ngầm. Bạn có thể xem nhận xét của giáo viên cho các câu đã đặt.</p>
                  <div>
                    {onLoadSentenceSubmissions && (
                      <button type="button" className="teacher-btn-primary" onClick={() => void openReviewPanel()}>
                        <span className="material-symbols-outlined" aria-hidden="true">rate_review</span>
                        Xem review
                      </button>
                    )}
                    <button type="button" className="teacher-btn-outline" onClick={backToCategories}>
                      Quay lại danh mục
                    </button>
                  </div>
                </div>
              ) : currentWord ? (
                <>
                  <section
                    key={currentWord.id}
                    className={`surface-card vocabulary-flashcard ${isFlipped ? 'is-flipped' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={toggleCard}
                    onKeyDown={handleCardKeyDown}
                  >
                    <div className="vocabulary-flashcard__topbar">
                      <span>{safeCurrentIndex + 1}/{words.length}</span>
                      <span>{dueCount} cần ôn</span>
                    </div>

                    <div className="vocabulary-flashcard__stage">
                      <div className="vocabulary-flashcard__inner">
                        <div
                          className="vocabulary-flashcard__face vocabulary-flashcard__front"
                          aria-hidden={isFlipped}
                        >
                          <h2>
                            {currentWord.term}
                            <span>{currentWord.wordType}</span>
                          </h2>

                          <div className="vocabulary-phonetics">
                            <div className="vocabulary-phonetic-row vocabulary-phonetic-row--us">
                              <button
                                type="button"
                                className="vocabulary-sound-btn vocabulary-sound-btn--us"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  playPronunciationAudio(currentWord.audioUsUrl)
                                }}
                                disabled={!currentWord.audioUsUrl}
                                tabIndex={isFlipped ? -1 : 0}
                                aria-label="Nghe phát âm US"
                              >
                                <span className="material-symbols-outlined" aria-hidden="true">volume_up</span>
                              </button>
                              <span className="vocabulary-phonetic-badge">US</span>
                              <span className="vocabulary-phonetic-text">{currentWord.phoneticUs || 'Chưa có phiên âm'}</span>
                            </div>
                            <div className="vocabulary-phonetic-row vocabulary-phonetic-row--uk">
                              <button
                                type="button"
                                className="vocabulary-sound-btn vocabulary-sound-btn--uk"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  playPronunciationAudio(currentWord.audioUkUrl)
                                }}
                                disabled={!currentWord.audioUkUrl}
                                tabIndex={isFlipped ? -1 : 0}
                                aria-label="Nghe phát âm UK"
                              >
                                <span className="material-symbols-outlined" aria-hidden="true">volume_up</span>
                              </button>
                              <span className="vocabulary-phonetic-badge">UK</span>
                              <span className="vocabulary-phonetic-text">{currentWord.phoneticUk || 'Chưa có phiên âm'}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="vocabulary-flashcard__face vocabulary-flashcard__back"
                          aria-hidden={!isFlipped}
                        >
                          <h2>{currentWord.meaning}</h2>

                          {(currentWord.example || currentWord.exampleMeaning) && (
                            <div className="vocabulary-example">
                              <div>
                                {currentWord.example && (
                                  <p className="vocabulary-example__sentence">"{currentWord.example}"</p>
                                )}
                                {currentWord.exampleMeaning && (
                                  <p className="vocabulary-example__meaning">({currentWord.exampleMeaning})</p>
                                )}
                              </div>
                            </div>
                          )}

                          {splitValues(currentWord.synonyms).length > 0 && (
                            <div className="vocabulary-related">
                              <span>Đồng nghĩa:</span>
                              {splitValues(currentWord.synonyms).map((value) => (
                                <em key={value}>{value}</em>
                              ))}
                            </div>
                          )}

                          {splitValues(currentWord.antonyms).length > 0 && (
                            <div className="vocabulary-related vocabulary-related--danger">
                              <span>Trái nghĩa:</span>
                              {splitValues(currentWord.antonyms).map((value) => (
                                <em key={value}>{value}</em>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {isFlipped && (
                    <div className="vocabulary-card-actions">
                      {REVIEW_OPTIONS.map((option) => (
                        <button
                          key={option.difficulty}
                          type="button"
                          className={`vocabulary-review-btn vocabulary-review-btn--${option.difficulty.toLowerCase()}`}
                          onClick={() => handleReview(option.difficulty)}
                          aria-label={`${option.label}, nhắc lại sau ${option.note}`}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">{option.icon}</span>
                          <span className="vocabulary-review-btn__copy">
                            <strong>{option.label}</strong>
                            <small>Nhắc lại sau {option.note}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="page-state">
                  <span className="material-symbols-outlined page-state__icon" aria-hidden="true">playlist_add</span>
                  <h3 className="page-state__title">Danh mục chưa có từ vựng</h3>
                </div>
              )}
            </>
          )}

          {activeMode === 'sentences' && (
            <>
              {isSentenceSessionComplete ? (
                <div className="surface-card vocabulary-session-complete">
                  <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
                  <h3>Hoàn thành đặt câu</h3>
                  <p>Các câu đã được gửi tới giáo viên. Bạn có thể mở phần review để xem feedback khi giáo viên nhận xét.</p>
                  <div>
                    {onLoadSentenceSubmissions && (
                      <button type="button" className="teacher-btn-primary" onClick={() => void openReviewPanel()}>
                        <span className="material-symbols-outlined" aria-hidden="true">rate_review</span>
                        Xem review
                      </button>
                    )}
                    <button type="button" className="teacher-btn-outline" onClick={backToCategories}>
                      Quay lại danh mục
                    </button>
                  </div>
                </div>
              ) : currentSentenceWord ? (
                <section className="surface-card vocabulary-sentence-practice">
                  <div className="vocabulary-sentence-practice__topbar">
                    <span>{safeSentenceIndex + 1}/{sentenceWords.length}</span>
                    <span>{currentSentenceWord.sentenceSubmissionCount ?? 0} câu đã gửi</span>
                  </div>

                  <div className="vocabulary-sentence-practice__nav" aria-label="Chuyển từ đặt câu">
                    <button
                      type="button"
                      className="teacher-btn-outline"
                      onClick={() => goToSentenceWord(safeSentenceIndex - 1)}
                      disabled={safeSentenceIndex === 0 || isSubmittingSentence}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                      Từ trước
                    </button>
                    <button
                      type="button"
                      className="teacher-btn-outline"
                      onClick={() => goToSentenceWord(safeSentenceIndex + 1)}
                      disabled={safeSentenceIndex === sentenceWords.length - 1 || isSubmittingSentence}
                    >
                      Từ tiếp
                      <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                    </button>
                  </div>

                  <div className="vocabulary-sentence-practice__word">
                    <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
                    <div>
                      <h2>{currentSentenceWord.term}</h2>
                      <p>{currentSentenceWord.meaning}</p>
                    </div>
                  </div>

                  {currentSentenceWord.example && (
                    <div className="vocabulary-sentence-practice__hint">
                      <span>Ví dụ</span>
                      <p>"{currentSentenceWord.example}"</p>
                    </div>
                  )}

                  {currentSentenceWord.latestSentenceSubmission && (
                    <div className="vocabulary-sentence-practice__latest">
                      <strong>Câu gần nhất</strong>
                      <p>"{currentSentenceWord.latestSentenceSubmission.sentence}"</p>
                      <span>{getSentenceStatusText(currentSentenceWord.latestSentenceSubmission.status)}</span>
                    </div>
                  )}

                  <label className="vocabulary-sentence-input">
                    Câu của bạn
                    <textarea
                      className="form-input"
                      rows={5}
                      value={sentenceDraft}
                      onChange={(event) => setSentenceDraft(event.target.value)}
                      placeholder={`Đặt một câu có sử dụng "${currentSentenceWord.term}"`}
                    />
                  </label>

                  <div className="vocabulary-sentence-practice__actions">
                    <button type="button" className="teacher-btn-outline" onClick={backToCategories}>
                      Thoát
                    </button>
                    <button
                      type="button"
                      className="teacher-btn-primary"
                      onClick={() => void submitCurrentSentence()}
                      disabled={isSubmittingSentence}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">send</span>
                      Gửi câu
                    </button>
                  </div>
                </section>
              ) : (
                <div className="page-state">
                  <span className="material-symbols-outlined page-state__icon" aria-hidden="true">edit_note</span>
                  <h3 className="page-state__title">Danh mục chưa có từ cần đặt câu</h3>
                </div>
              )}
            </>
          )}
        </>
      )}

      {isReviewPanelOpen && (
        <div className="modal-overlay modal-overlay--raised" onClick={() => setIsReviewPanelOpen(false)}>
          <div className="modal-content vocabulary-review-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Review câu đặt</h2>
                <p className="modal-hint">Nhận xét của giáo viên cho danh mục đang học.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsReviewPanelOpen(false)}
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            <div className="modal-body vocabulary-review-modal__body">
              {isLoadingSentenceSubmissions ? (
                <div className="vocabulary-review-loading">
                  <span className="skeleton-line skeleton-line--lg" />
                  <span className="skeleton-line skeleton-line--md" />
                  <span className="skeleton-line skeleton-line--lg" />
                </div>
              ) : sentenceSubmissions.length > 0 ? (
                <div className="vocabulary-student-review-list">
                  {sentenceSubmissions.map((submission) => (
                    <article className="vocabulary-student-review-card" key={submission.id}>
                      <div>
                        <span>{submission.word?.term}</span>
                        <strong className={`vocabulary-sentence-status vocabulary-sentence-status--${submission.status.toLowerCase()}`}>
                          {getSentenceStatusText(submission.status)}
                        </strong>
                      </div>
                      <p className="vocabulary-student-review-card__sentence">"{submission.sentence}"</p>
                      <div className="vocabulary-student-review-card__feedback">
                        <span className="material-symbols-outlined" aria-hidden="true">rate_review</span>
                        <p>{submission.feedback || 'Giáo viên chưa để lại feedback.'}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="page-state vocabulary-empty-small">
                  <span className="material-symbols-outlined page-state__icon" aria-hidden="true">rate_review</span>
                  <h3 className="page-state__title">Chưa có câu đặt nào</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
