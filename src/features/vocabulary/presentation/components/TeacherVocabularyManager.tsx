import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { ApiError } from '../../../../shared/lib/httpClient'
import { useClasses } from '../../../teacher/application/useClasses'
import { downloadVocabularyTemplate } from '../../application/vocabularyUseCases'
import { useTeacherVocabulary } from '../../application/useTeacherVocabulary'
import type {
  CreateVocabularyWordPayload,
  ImportVocabularyDuplicateConflict,
  ImportVocabularyDuplicateMode,
  ImportVocabularyResult,
  UpdateVocabularyWordPayload,
  VocabularyCategory,
  VocabularySentenceClassInteraction,
  VocabularySentenceInteraction,
  VocabularySentenceRequirement,
  VocabularyWord,
} from '../../domain/vocabulary.types'

type WordDraft = {
  orderIndex: string
  term: string
  wordType: string
  phoneticUs: string
  phoneticUk: string
  audioUsUrl: string
  audioUkUrl: string
  meaning: string
  example: string
  exampleMeaning: string
  synonyms: string
  antonyms: string
  sentenceRequirement: VocabularySentenceRequirement
}

type PendingDuplicateImport = {
  categoryId: string
  file: File
  duplicateTerms: string[]
}

type TeacherVocabularyDetailTab = 'detail' | 'interactions'

function createEmptyWordDraft(nextOrderIndex: number): WordDraft {
  return {
    orderIndex: String(nextOrderIndex),
    term: '',
    wordType: '',
    phoneticUs: '',
    phoneticUk: '',
    audioUsUrl: '',
    audioUkUrl: '',
    meaning: '',
    example: '',
    exampleMeaning: '',
    synonyms: '',
    antonyms: '',
    sentenceRequirement: 'ONCE',
  }
}

function createWordDraft(word: VocabularyWord): WordDraft {
  return {
    orderIndex: String(word.orderIndex),
    term: word.term,
    wordType: word.wordType,
    phoneticUs: word.phoneticUs ?? '',
    phoneticUk: word.phoneticUk ?? '',
    audioUsUrl: word.audioUsUrl ?? '',
    audioUkUrl: word.audioUkUrl ?? '',
    meaning: word.meaning,
    example: word.example ?? '',
    exampleMeaning: word.exampleMeaning ?? '',
    synonyms: word.synonyms ?? '',
    antonyms: word.antonyms ?? '',
    sentenceRequirement: word.sentenceRequirement ?? 'ONCE',
  }
}

function nullableText(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue || null
}

function getNextOrderIndex(category: VocabularyCategory) {
  const orderIndexes = (category.words ?? []).map((word) => word.orderIndex)
  return Math.max(0, ...orderIndexes) + 1
}

function getTeacherCategoryStatus(category: VocabularyCategory) {
  if (category.wordCount === 0) {
    return {
      className: 'vocabulary-category-card--empty',
      label: 'Chưa có từ',
      progressText: '0 từ',
      progressPercent: 0,
    }
  }

  if (category.classes.length === 0) {
    return {
      className: 'vocabulary-category-card--incomplete',
      label: 'Chưa gán lớp',
      progressText: `${category.wordCount} từ`,
      progressPercent: 55,
    }
  }

  return {
    className: 'vocabulary-category-card--complete',
    label: 'Sẵn sàng',
    progressText: `${category.wordCount} từ · ${category.classes.length} lớp`,
    progressPercent: 100,
  }
}

function getSentenceRequirementLabel(requirement: VocabularySentenceRequirement) {
  if (requirement === 'OFF') return 'Không bắt buộc'
  if (requirement === 'ALWAYS') return 'Mỗi lần học'
  return 'Một lần đầu'
}

function getSentenceStatusLabel(status: string) {
  return status === 'REVIEWED' ? 'Đã review' : 'Chờ review'
}

function getInteractionCompletionLabel(interaction: VocabularySentenceInteraction) {
  return interaction.isCompleted ? 'Hoàn thành' : 'Chưa hoàn thành'
}

function getInteractionSentenceProgress(interaction: VocabularySentenceInteraction) {
  return interaction.sentenceTotal > 0
    ? `Đặt câu: ${interaction.sentenceSubmittedCount}/${interaction.sentenceTotal}`
    : 'Đặt câu: không yêu cầu'
}

function isDuplicateImportConflict(
  result: ImportVocabularyResult | null,
): result is ImportVocabularyDuplicateConflict {
  return Boolean(result && 'requiresDuplicateDecision' in result)
}

export function TeacherVocabularyManager() {
  const {
    categories,
    isLoading,
    isDetailLoading,
    isInteractionLoading,
    isMutating,
    error,
    loadCategoryDetail,
    createCategory,
    updateCategory,
    removeCategory,
    assignClasses,
    importWords,
    createWord,
    updateWord,
    loadSentenceInteractions,
    reviewSentenceSubmission,
  } = useTeacherVocabulary()
  const { classes } = useClasses()
  const classComboboxRef = useRef<HTMLDivElement | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [draftCategoryId, setDraftCategoryId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [assignmentDraftCategoryId, setAssignmentDraftCategoryId] = useState<string | null>(null)
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([])
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const [classSearch, setClassSearch] = useState('')
  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const [isCreatingWord, setIsCreatingWord] = useState(false)
  const [wordDraft, setWordDraft] = useState<WordDraft | null>(null)
  const [pendingImport, setPendingImport] = useState<PendingDuplicateImport | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<TeacherVocabularyDetailTab>('detail')
  const [interactions, setInteractions] = useState<VocabularySentenceClassInteraction[]>([])
  const [selectedInteractionClassId, setSelectedInteractionClassId] = useState<string | null>(null)
  const [selectedInteractionStudentId, setSelectedInteractionStudentId] = useState<string | null>(null)
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  )
  const selectedWords = selectedCategory?.words ?? []
  const isEditingSelectedCategory = draftCategoryId === selectedCategory?.id
  const selectedDraftName = isEditingSelectedCategory ? draftName : selectedCategory?.name ?? ''
  const selectedDraftDescription = isEditingSelectedCategory
    ? draftDescription
    : selectedCategory?.description ?? ''
  const selectedAssignedClassIds =
    assignmentDraftCategoryId === selectedCategory?.id
      ? assignedClassIds
      : selectedCategory?.classes.map((classInfo) => classInfo.id) ?? []
  const selectedAssignedClasses = classes.filter((classInfo) =>
    selectedAssignedClassIds.includes(classInfo.id),
  )
  const filteredClasses = classes.filter((classInfo) =>
    classInfo.name.toLowerCase().includes(classSearch.trim().toLowerCase()),
  )
  const selectedInteractionClass = useMemo(
    () => interactions.find((interaction) => interaction.classInfo.id === selectedInteractionClassId) ?? null,
    [interactions, selectedInteractionClassId],
  )
  const selectedInteraction = useMemo(
    () =>
      selectedInteractionClass?.students.find(
        (interaction) => interaction.student.id === selectedInteractionStudentId,
      ) ?? null,
    [selectedInteractionClass, selectedInteractionStudentId],
  )
  const totalPendingInteractions = useMemo(
    () => interactions.reduce((total, classInteraction) => total + classInteraction.pendingCount, 0),
    [interactions],
  )

  useEffect(() => {
    if (!isClassDropdownOpen) return undefined

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (
        classComboboxRef.current &&
        event.target instanceof Node &&
        !classComboboxRef.current.contains(event.target)
      ) {
        setIsClassDropdownOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointerDown)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointerDown)
  }, [isClassDropdownOpen])

  const refreshInteractions = async (categoryId: string) => {
    const data = await loadSentenceInteractions(categoryId)
    setInteractions(data)
    setFeedbackDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts }
      data.forEach((classInteraction) => {
        classInteraction.students.forEach((interaction) => {
          interaction.sentences.forEach((submission) => {
            if (nextDrafts[submission.id] === undefined) {
              nextDrafts[submission.id] = submission.feedback ?? ''
            }
          })
        })
      })
      return nextDrafts
    })

    const nextClassId =
      selectedInteractionClassId && data.some((interaction) => interaction.classInfo.id === selectedInteractionClassId)
        ? selectedInteractionClassId
        : data[0]?.classInfo.id ?? null
    const nextClassInteraction = data.find((interaction) => interaction.classInfo.id === nextClassId)
    const nextStudentId =
      selectedInteractionStudentId &&
      nextClassInteraction?.students.some((interaction) => interaction.student.id === selectedInteractionStudentId)
        ? selectedInteractionStudentId
        : nextClassInteraction?.students[0]?.student.id ?? null
    setSelectedInteractionClassId(nextClassId)
    setSelectedInteractionStudentId(nextStudentId)
  }

  const resetDetailDrafts = () => {
    setDraftCategoryId(null)
    setAssignmentDraftCategoryId(null)
    setIsClassDropdownOpen(false)
    setClassSearch('')
    setEditingWordId(null)
    setIsCreatingWord(false)
    setWordDraft(null)
    setPendingImport(null)
    setActiveDetailTab('detail')
    setInteractions([])
    setSelectedInteractionClassId(null)
    setSelectedInteractionStudentId(null)
    setFeedbackDrafts({})
  }

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    resetDetailDrafts()
    void loadCategoryDetail(categoryId)
    void refreshInteractions(categoryId)
  }

  const backToCategories = () => {
    setSelectedCategoryId(null)
    resetDetailDrafts()
  }

  const updateDraftNameValue = (value: string) => {
    if (!selectedCategory) return
    const hasDraft = draftCategoryId === selectedCategory.id
    setDraftCategoryId(selectedCategory.id)
    setDraftName(value)
    setDraftDescription(hasDraft ? draftDescription : selectedCategory.description ?? '')
  }

  const updateDraftDescriptionValue = (value: string) => {
    if (!selectedCategory) return
    const hasDraft = draftCategoryId === selectedCategory.id
    setDraftCategoryId(selectedCategory.id)
    setDraftName(hasDraft ? draftName : selectedCategory.name)
    setDraftDescription(value)
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    const name = newName.trim()
    if (!name) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    const category = await createCategory(name, newDescription.trim())
    if (category) {
      setNewName('')
      setNewDescription('')
    }
  }

  const handleUpdate = async () => {
    if (!selectedCategory) return
    const name = selectedDraftName.trim()
    if (!name) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    const category = await updateCategory(selectedCategory.id, name, selectedDraftDescription.trim())
    if (category) setDraftCategoryId(null)
  }

  const toggleClass = (classId: string) => {
    if (!selectedCategory) return
    const nextClassIds = selectedAssignedClassIds.includes(classId)
      ? selectedAssignedClassIds.filter((id) => id !== classId)
      : [...selectedAssignedClassIds, classId]

    setAssignmentDraftCategoryId(selectedCategory.id)
    setAssignedClassIds(nextClassIds)
  }

  const selectInteractionClass = (classId: string) => {
    const classInteraction = interactions.find((interaction) => interaction.classInfo.id === classId)
    setSelectedInteractionClassId(classId)
    setSelectedInteractionStudentId(classInteraction?.students[0]?.student.id ?? null)
  }

  const startCreateWord = () => {
    if (!selectedCategory) return
    setIsCreatingWord(true)
    setEditingWordId(null)
    setWordDraft(createEmptyWordDraft(getNextOrderIndex(selectedCategory)))
  }

  const startEditWord = (word: VocabularyWord) => {
    setIsCreatingWord(false)
    setEditingWordId(word.id)
    setWordDraft(createWordDraft(word))
  }

  const updateWordDraft = (key: keyof WordDraft, value: string) => {
    setWordDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, [key]: value } : currentDraft,
    )
  }

  const cancelWordEditor = () => {
    setEditingWordId(null)
    setIsCreatingWord(false)
    setWordDraft(null)
  }

  const buildWordPayload = (): CreateVocabularyWordPayload | null => {
    if (!wordDraft) return null

    const orderIndex = Number.parseInt(wordDraft.orderIndex, 10)
    if (!Number.isInteger(orderIndex) || orderIndex < 1) {
      toast.error('Thứ tự phải là số lớn hơn 0')
      return null
    }

    const term = wordDraft.term.trim()
    const wordType = wordDraft.wordType.trim()
    const meaning = wordDraft.meaning.trim()
    if (!term || !wordType || !meaning) {
      toast.error('Vui lòng nhập đủ Từ vựng, Loại từ và Nghĩa')
      return null
    }

    return {
      orderIndex,
      term,
      wordType,
      phoneticUs: nullableText(wordDraft.phoneticUs),
      phoneticUk: nullableText(wordDraft.phoneticUk),
      audioUsUrl: nullableText(wordDraft.audioUsUrl),
      audioUkUrl: nullableText(wordDraft.audioUkUrl),
      meaning,
      example: nullableText(wordDraft.example),
      exampleMeaning: nullableText(wordDraft.exampleMeaning),
      synonyms: nullableText(wordDraft.synonyms),
      antonyms: nullableText(wordDraft.antonyms),
      sentenceRequirement: wordDraft.sentenceRequirement,
    }
  }

  const handleCreateWord = async () => {
    if (!selectedCategory) return
    const payload = buildWordPayload()
    if (!payload) return

    const word = await createWord(selectedCategory.id, payload)
    if (word) cancelWordEditor()
  }

  const handleSaveWord = async (wordId: string) => {
    const payload = buildWordPayload()
    if (!payload) return

    const word = await updateWord(wordId, payload as UpdateVocabularyWordPayload)
    if (word) cancelWordEditor()
  }

  const handleSaveClasses = async () => {
    if (!selectedCategory) return
    const category = await assignClasses(selectedCategory.id, selectedAssignedClassIds)
    if (category) {
      setAssignmentDraftCategoryId(null)
      setIsClassDropdownOpen(false)
      void refreshInteractions(category.id)
    }
  }

  const handleSaveSentenceFeedback = async (submissionId: string) => {
    if (!selectedCategory) return
    const savedSubmission = await reviewSentenceSubmission(
      submissionId,
      feedbackDrafts[submissionId] ?? '',
    )
    if (savedSubmission) {
      await refreshInteractions(selectedCategory.id)
    }
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!selectedCategory || !file) return

    cancelWordEditor()
    const result = await importWords(selectedCategory.id, file)
    if (isDuplicateImportConflict(result)) {
      setPendingImport({
        categoryId: selectedCategory.id,
        file,
        duplicateTerms: result.duplicateTerms,
      })
    }
  }

  const resolveDuplicateImport = async (duplicateMode: ImportVocabularyDuplicateMode) => {
    if (!pendingImport) return

    const result = await importWords(pendingImport.categoryId, pendingImport.file, duplicateMode)
    if (!isDuplicateImportConflict(result)) {
      setPendingImport(null)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadVocabularyTemplate()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = 'mau-import-tu-vung.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
      toast.success('Đã tải mẫu Excel')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải mẫu Excel'
      toast.error(message)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return
    const accepted = window.confirm(`Xóa danh mục "${selectedCategory.name}"?`)
    if (!accepted) return

    const removed = await removeCategory(selectedCategory.id)
    if (removed) {
      backToCategories()
    }
  }

  const renderWordEditor = (submitLabel: string, onSubmit: () => Promise<void>) => {
    if (!wordDraft) return null

    return (
      <div className="vocabulary-word-editor">
        <label>
          Thứ tự
          <input
            className="form-input"
            type="number"
            min="1"
            value={wordDraft.orderIndex}
            onChange={(event) => updateWordDraft('orderIndex', event.target.value)}
          />
        </label>
        <label>
          Từ vựng
          <input
            className="form-input"
            value={wordDraft.term}
            onChange={(event) => updateWordDraft('term', event.target.value)}
          />
        </label>
        <label>
          Loại từ
          <input
            className="form-input"
            value={wordDraft.wordType}
            onChange={(event) => updateWordDraft('wordType', event.target.value)}
          />
        </label>
        <label>
          Phiên âm US
          <input
            className="form-input"
            value={wordDraft.phoneticUs}
            onChange={(event) => updateWordDraft('phoneticUs', event.target.value)}
          />
        </label>
        <label>
          Phiên âm UK
          <input
            className="form-input"
            value={wordDraft.phoneticUk}
            onChange={(event) => updateWordDraft('phoneticUk', event.target.value)}
          />
        </label>
        <label>
          Audio US URL
          <input
            className="form-input"
            value={wordDraft.audioUsUrl}
            onChange={(event) => updateWordDraft('audioUsUrl', event.target.value)}
          />
        </label>
        <label>
          Audio UK URL
          <input
            className="form-input"
            value={wordDraft.audioUkUrl}
            onChange={(event) => updateWordDraft('audioUkUrl', event.target.value)}
          />
        </label>
        <label className="vocabulary-word-editor__wide">
          Nghĩa
          <textarea
            className="form-input"
            rows={2}
            value={wordDraft.meaning}
            onChange={(event) => updateWordDraft('meaning', event.target.value)}
          />
        </label>
        <label className="vocabulary-word-editor__wide">
          Ví dụ
          <textarea
            className="form-input"
            rows={2}
            value={wordDraft.example}
            onChange={(event) => updateWordDraft('example', event.target.value)}
          />
        </label>
        <label className="vocabulary-word-editor__wide">
          Nghĩa ví dụ
          <textarea
            className="form-input"
            rows={2}
            value={wordDraft.exampleMeaning}
            onChange={(event) => updateWordDraft('exampleMeaning', event.target.value)}
          />
        </label>
        <label>
          Đồng nghĩa
          <input
            className="form-input"
            value={wordDraft.synonyms}
            onChange={(event) => updateWordDraft('synonyms', event.target.value)}
          />
        </label>
        <label>
          Trái nghĩa
          <input
            className="form-input"
            value={wordDraft.antonyms}
            onChange={(event) => updateWordDraft('antonyms', event.target.value)}
          />
        </label>
        <label>
          Yêu cầu đặt câu
          <select
            className="form-input"
            value={wordDraft.sentenceRequirement}
            onChange={(event) =>
              updateWordDraft('sentenceRequirement', event.target.value as VocabularySentenceRequirement)
            }
          >
            <option value="ONCE">Một lần đầu</option>
            <option value="ALWAYS">Mỗi lần học thuộc</option>
            <option value="OFF">Không bắt buộc</option>
          </select>
        </label>
        <div className="vocabulary-word-editor__actions">
          <button type="button" className="teacher-btn-outline" onClick={cancelWordEditor}>
            Hủy
          </button>
          <button
            type="button"
            className="teacher-btn-primary"
            disabled={isMutating}
            onClick={() => void onSubmit()}
          >
            <span className="material-symbols-outlined" aria-hidden="true">save</span>
            {submitLabel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="teacher-content-container vocabulary-page">
      {!selectedCategoryId && (
        <div className="teacher-page-header">
          <div>
            <h1>Quản lý từ vựng</h1>
            <p>Tạo danh mục, import Excel và gán lớp học.</p>
          </div>
        </div>
      )}

      {!selectedCategoryId && (
        <div className="vocabulary-admin-list-view">
          <div className="vocabulary-category-grid vocabulary-category-grid--teacher">
            <form className="vocabulary-create-card" onSubmit={handleCreate}>
              <span className="material-symbols-outlined vocabulary-create-card__icon" aria-hidden="true">
                add_circle
              </span>
              <label className="form-label" htmlFor="vocabulary-category-name">Danh mục mới</label>
              <input
                id="vocabulary-category-name"
                className="form-input"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ví dụ: TOEIC cơ bản"
              />
              <textarea
                className="form-input"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Mô tả ngắn"
                rows={3}
              />
              <button type="submit" className="teacher-btn-primary" disabled={isMutating}>
                <span className="material-symbols-outlined" aria-hidden="true">add</span>
                Tạo danh mục
              </button>
            </form>

            {isLoading && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="vocabulary-category-card vocabulary-category-card--loading" key={index}>
                    <span className="skeleton-line skeleton-line--md" />
                    <span className="skeleton-line skeleton-line--lg" />
                    <span className="skeleton-line skeleton-line--sm" />
                  </div>
                ))}
              </>
            )}

            {!isLoading && categories.map((category) => {
              const status = getTeacherCategoryStatus(category)

              return (
                <article
                  key={category.id}
                  role="button"
                  tabIndex={0}
                  className={`vocabulary-category-card vocabulary-category-card--teacher ${status.className}`}
                  onClick={() => selectCategory(category.id)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    selectCategory(category.id)
                  }}
                >
                  <span className="vocabulary-category-card__description">{category.description || 'Danh mục từ vựng'}</span>
                  <h3>{category.name}</h3>
                  <p>
                    <strong>{status.progressText}</strong>
                    <span> · {status.label}</span>
                  </p>
                  <span className="vocabulary-category-card__progress" aria-hidden="true">
                    <span style={{ width: `${status.progressPercent}%` }} />
                  </span>
                </article>
              )
            })}
          </div>

          {!isLoading && error && <p className="page-state page-state--error">{error}</p>}

          {!isLoading && !error && categories.length === 0 && (
            <div className="page-state vocabulary-empty-small">
              <span className="material-symbols-outlined page-state__icon" aria-hidden="true">library_books</span>
              <h3 className="page-state__title">Chưa có danh mục</h3>
            </div>
          )}
        </div>
      )}

      {selectedCategoryId && (
        <div className="vocabulary-admin-detail-view">
          <div className="vocabulary-study-detail-header vocabulary-study-detail-header--minimal">
            <button type="button" className="teacher-btn-outline" onClick={backToCategories}>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Quay lại danh mục
            </button>
          </div>

          {isDetailLoading && !selectedCategory && (
            <div className="surface-card vocabulary-admin-detail vocabulary-admin-detail--loading">
              <span className="skeleton-line skeleton-line--lg" />
              <span className="skeleton-line skeleton-line--md" />
              <span className="skeleton-line skeleton-line--lg" />
            </div>
          )}

          {selectedCategory && (
            <section className="surface-card vocabulary-admin-detail">
              <div className="vocabulary-admin-detail__header">
                <div className="vocabulary-admin-detail__identity">
                  <span className="material-symbols-outlined vocabulary-admin-detail__icon" aria-hidden="true">
                    menu_book
                  </span>
                  <div>
                    <span className="vocabulary-category-card__description">
                      {selectedCategory.description || 'Danh mục từ vựng'}
                    </span>
                    <h2>{selectedCategory.name}</h2>
                    <p>{selectedCategory.wordCount} từ vựng · {selectedCategory.classes.length} lớp được học</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="teacher-btn-secondary vocabulary-danger-btn"
                  onClick={() => void handleDelete()}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                  Xóa
                </button>
              </div>

              <div className="vocabulary-admin-tabs" role="tablist" aria-label="Nội dung danh mục từ vựng">
                <button
                  type="button"
                  role="tab"
                  className={activeDetailTab === 'detail' ? 'is-active' : ''}
                  aria-selected={activeDetailTab === 'detail'}
                  onClick={() => setActiveDetailTab('detail')}
                >
                  Chi tiết
                </button>
                <button
                  type="button"
                  role="tab"
                  className={activeDetailTab === 'interactions' ? 'is-active' : ''}
                  aria-selected={activeDetailTab === 'interactions'}
                  onClick={() => setActiveDetailTab('interactions')}
                >
                  Quản lý tương tác
                  {totalPendingInteractions > 0 && <span>{totalPendingInteractions}</span>}
                </button>
              </div>

              {activeDetailTab === 'detail' && (
                <>
              <div className="vocabulary-admin-section vocabulary-category-info-section">
                <div className="vocabulary-section-title-row">
                  <h3>Thông tin danh mục</h3>
                  <span>{selectedCategory.wordCount} từ · {selectedCategory.classes.length} lớp</span>
                </div>
                <div className="vocabulary-category-info-grid">
                  <label className="vocabulary-category-field">
                    <span>Tên danh mục</span>
                    <input
                      className="form-input"
                      value={selectedDraftName}
                      onChange={(event) => updateDraftNameValue(event.target.value)}
                      placeholder="Tên danh mục"
                    />
                  </label>
                  <label className="vocabulary-category-field vocabulary-category-field--wide">
                    <span>Mô tả</span>
                    <input
                      className="form-input"
                      value={selectedDraftDescription}
                      onChange={(event) => updateDraftDescriptionValue(event.target.value)}
                      placeholder="Mô tả"
                    />
                  </label>
                  <button
                    type="button"
                    className="teacher-btn-primary vocabulary-category-save-btn"
                    onClick={() => void handleUpdate()}
                    disabled={isMutating}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">save</span>
                    Lưu
                  </button>
                </div>
              </div>

              <div className="vocabulary-admin-section">
                <h3>Import Excel</h3>
                <div className="vocabulary-import-actions">
                  <label className="vocabulary-import-box">
                    <input type="file" accept=".xlsx" onChange={(event) => void handleImport(event)} />
                    <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                    <strong>Chọn file Excel</strong>
                    <small>Import sẽ thêm vào danh sách hiện tại. Nếu có từ trùng, hệ thống sẽ hỏi cách xử lý.</small>
                  </label>
                  <button
                    type="button"
                    className="vocabulary-template-link"
                    onClick={() => void handleDownloadTemplate()}
                  >
                    Bạn chưa có mẫu từ vựng? <span>Tải xuống</span>
                  </button>
                </div>
              </div>

              <div className="vocabulary-admin-section">
                <h3>Lớp học</h3>
                <div className="vocabulary-class-combobox" ref={classComboboxRef}>
                  <button
                    type="button"
                    className="vocabulary-class-trigger"
                    onClick={() => setIsClassDropdownOpen((isOpen) => !isOpen)}
                    aria-expanded={isClassDropdownOpen}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">school</span>
                    <strong>{selectedAssignedClassIds.length} lớp được học</strong>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {isClassDropdownOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {isClassDropdownOpen && (
                    <div className="vocabulary-class-menu">
                      <div className="vocabulary-class-search">
                        <span className="material-symbols-outlined" aria-hidden="true">search</span>
                        <input
                          value={classSearch}
                          onChange={(event) => setClassSearch(event.target.value)}
                          placeholder="Tìm lớp học"
                        />
                      </div>

                      <div className="vocabulary-class-options">
                        {filteredClasses.length > 0 ? (
                          filteredClasses.map((classInfo) => {
                            const isSelected = selectedAssignedClassIds.includes(classInfo.id)

                            return (
                              <div key={classInfo.id} className="vocabulary-class-option-row">
                                <span>{classInfo.name}</span>
                                <button
                                  type="button"
                                  className={isSelected ? 'is-remove' : 'is-add'}
                                  onClick={() => toggleClass(classInfo.id)}
                                >
                                  <span className="material-symbols-outlined" aria-hidden="true">
                                    {isSelected ? 'remove' : 'add'}
                                  </span>
                                  {isSelected ? 'Remove' : 'Add'}
                                </button>
                              </div>
                            )
                          })
                        ) : (
                          <p className="vocabulary-class-empty">Không tìm thấy lớp</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedAssignedClasses.length > 0 && (
                  <div className="vocabulary-class-selected">
                    {selectedAssignedClasses.map((classInfo) => (
                      <span key={classInfo.id} className="vocabulary-class-chip">
                        {classInfo.name}
                        <button
                          type="button"
                          onClick={() => toggleClass(classInfo.id)}
                          aria-label={`Xóa lớp ${classInfo.name}`}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="teacher-btn-primary vocabulary-class-save"
                  onClick={() => void handleSaveClasses()}
                  disabled={isMutating}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">school</span>
                  Cập nhật lớp học
                </button>
              </div>
                </>
              )}

              {activeDetailTab === 'interactions' && (
              <div className="vocabulary-admin-section vocabulary-interactions-section">
                <div className="vocabulary-word-section-head">
                  <div>
                    <h3> </h3>
                    <p> </p>
                  </div>
                  <button
                    type="button"
                    className="teacher-btn-outline"
                    onClick={() => void refreshInteractions(selectedCategory.id)}
                    disabled={isInteractionLoading}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
                    Làm mới
                  </button>
                </div>

                {isInteractionLoading ? (
                  <div className="vocabulary-interactions-loading">
                    <span className="skeleton-line skeleton-line--lg" />
                    <span className="skeleton-line skeleton-line--md" />
                    <span className="skeleton-line skeleton-line--lg" />
                  </div>
                ) : interactions.length > 0 ? (
                  <div className="vocabulary-interactions-layout">
                    <div className="vocabulary-interaction-classes" role="list">
                      {interactions.map((classInteraction) => {
                        const isActiveClass = classInteraction.classInfo.id === selectedInteractionClassId

                        return (
                          <section
                            className={`vocabulary-interaction-class-group ${isActiveClass ? 'is-active' : ''}`}
                            key={classInteraction.classInfo.id}
                          >
                            <button
                              type="button"
                              className="vocabulary-interaction-class-btn"
                              onClick={() => selectInteractionClass(classInteraction.classInfo.id)}
                              aria-expanded={isActiveClass}
                            >
                              <span className="material-symbols-outlined" aria-hidden="true">school</span>
                              <span className="vocabulary-interaction-class-copy">
                                <strong>{classInteraction.classInfo.name}</strong>
                                <small>
                                  {classInteraction.totalStudents} học sinh · {classInteraction.totalSentences} câu
                                </small>
                              </span>
                              <span className="vocabulary-interaction-class-stats">
                                {classInteraction.pendingCount}
                              </span>
                            </button>

                            {isActiveClass && (
                              <div className="vocabulary-interaction-students vocabulary-interaction-students--nested" role="list">
                                {classInteraction.students.length > 0 ? (
                                  classInteraction.students.map((interaction) => (
                                    <button
                                      type="button"
                                      key={interaction.student.id}
                                      className={
                                        interaction.student.id === selectedInteractionStudentId ? 'is-active' : ''
                                      }
                                      onClick={() => setSelectedInteractionStudentId(interaction.student.id)}
                                    >
                                      {interaction.student.avatar ? (
                                        <img src={interaction.student.avatar} alt="" aria-hidden="true" />
                                      ) : (
                                        <span className="vocabulary-interaction-avatar" aria-hidden="true">
                                          <span className="material-symbols-outlined">person</span>
                                        </span>
                                      )}
                                      <span className="vocabulary-interaction-student-copy">
                                        <strong>{interaction.student.fullName}</strong>
                                        <small>{interaction.student.email}</small>
                                        <small>
                                          Học: {interaction.studiedCount}/{interaction.studyTotal} · {getInteractionSentenceProgress(interaction)}
                                        </small>
                                        <span className={`vocabulary-interaction-status ${interaction.isCompleted ? 'is-complete' : 'is-incomplete'}`}>
                                          {getInteractionCompletionLabel(interaction)}
                                        </span>
                                      </span>
                                      <em>{interaction.pendingCount}</em>
                                    </button>
                                  ))
                                ) : (
                                  <p className="vocabulary-interaction-class-empty">Lớp chưa có học sinh được duyệt</p>
                                )}
                              </div>
                            )}
                          </section>
                        )
                      })}
                    </div>

                    <div className="vocabulary-interaction-detail">
                      {selectedInteraction ? (
                        <>
                          <div className="vocabulary-interaction-detail__head">
                            <div>
                              <span>{selectedInteractionClass?.classInfo.name}</span>
                              <h4>{selectedInteraction.student.fullName}</h4>
                              <p>
                                Học: {selectedInteraction.studiedCount}/{selectedInteraction.studyTotal} ·{' '}
                                {getInteractionSentenceProgress(selectedInteraction)} ·{' '}
                                {selectedInteraction.pendingCount} chờ review
                              </p>
                              <strong className={`vocabulary-interaction-status ${selectedInteraction.isCompleted ? 'is-complete' : 'is-incomplete'}`}>
                                {getInteractionCompletionLabel(selectedInteraction)}
                              </strong>
                            </div>
                          </div>

                          {selectedInteraction.sentences.length > 0 ? (
                            <div className="vocabulary-sentence-list">
                              {selectedInteraction.sentences.map((submission) => (
                                <article className="vocabulary-sentence-card" key={submission.id}>
                                  <div className="vocabulary-sentence-card__top">
                                    <div>
                                      <span>Từ #{submission.word?.orderIndex}</span>
                                      <h5>{submission.word?.term}</h5>
                                    </div>
                                    <strong className={`vocabulary-sentence-status vocabulary-sentence-status--${submission.status.toLowerCase()}`}>
                                      {getSentenceStatusLabel(submission.status)}
                                    </strong>
                                  </div>
                                  <p className="vocabulary-sentence-card__sentence">"{submission.sentence}"</p>
                                  <label className="vocabulary-sentence-feedback">
                                    Feedback
                                    <textarea
                                      className="form-input"
                                      rows={3}
                                      value={feedbackDrafts[submission.id] ?? submission.feedback ?? ''}
                                      onChange={(event) =>
                                        setFeedbackDrafts((currentDrafts) => ({
                                          ...currentDrafts,
                                          [submission.id]: event.target.value,
                                        }))
                                      }
                                      placeholder="Nhận xét ngắn cho học sinh"
                                    />
                                  </label>
                                  <div className="vocabulary-sentence-card__footer">
                                    <span>
                                      {submission.reviewedAt
                                        ? `Review: ${new Date(submission.reviewedAt).toLocaleString('vi-VN')}`
                                        : 'Chưa có feedback'}
                                    </span>
                                    <button
                                      type="button"
                                      className="teacher-btn-primary"
                                      disabled={isMutating}
                                      onClick={() => void handleSaveSentenceFeedback(submission.id)}
                                    >
                                      <span className="material-symbols-outlined" aria-hidden="true">rate_review</span>
                                      Lưu review
                                    </button>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : (
                            <div className="page-state vocabulary-empty-small">
                              <span className="material-symbols-outlined page-state__icon" aria-hidden="true">edit_note</span>
                              <h3 className="page-state__title">Học sinh chưa đặt câu</h3>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="page-state vocabulary-empty-small">
                          <span className="material-symbols-outlined page-state__icon" aria-hidden="true">group</span>
                          <h3 className="page-state__title">Chọn học sinh để xem câu</h3>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="page-state vocabulary-empty-small">
                    <span className="material-symbols-outlined page-state__icon" aria-hidden="true">group_add</span>
                    <h3 className="page-state__title">Chưa có học sinh trong các lớp được gán</h3>
                  </div>
                )}
              </div>
              )}

              {activeDetailTab === 'detail' && (
              <div className="vocabulary-admin-section">
                <div className="vocabulary-word-section-head">
                  <h3>Danh sách từ</h3>
                  <button
                    type="button"
                    className="teacher-btn-outline"
                    onClick={startCreateWord}
                    disabled={isMutating}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">add</span>
                    Tạo từ mới
                  </button>
                </div>

                {isCreatingWord && renderWordEditor('Tạo từ', handleCreateWord)}

                {selectedWords.length > 0 ? (
                  <div className="vocabulary-word-table">
                    {selectedWords.slice(0, 80).map((word) => (
                      <div className="vocabulary-word-item" key={word.id}>
                        <div className="vocabulary-word-row">
                          <span>{word.orderIndex}</span>
                          <strong>{word.term}</strong>
                          <span>{word.wordType}</span>
                          <span className="vocabulary-word-row__sentence-rule">
                            {getSentenceRequirementLabel(word.sentenceRequirement ?? 'ONCE')}
                          </span>
                          <p>{word.meaning}</p>
                          <button
                            type="button"
                            className="vocabulary-word-edit-btn"
                            onClick={() => startEditWord(word)}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                            Sửa
                          </button>
                        </div>

                        {editingWordId === word.id && renderWordEditor('Lưu từ', () => handleSaveWord(word.id))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="page-state vocabulary-empty-small">
                    <span className="material-symbols-outlined page-state__icon" aria-hidden="true">playlist_add</span>
                    <h3 className="page-state__title">Chưa có từ vựng</h3>
                  </div>
                )}
              </div>
              )}
            </section>
          )}
        </div>
      )}

      {pendingImport && (
        <div className="modal-overlay modal-overlay--raised" onClick={() => setPendingImport(null)}>
          <div className="modal-content modal-content--compact" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">File có từ trùng</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setPendingImport(null)}
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            <div className="modal-body">
              <p className="vocabulary-duplicate-note">
                {pendingImport.duplicateTerms.slice(0, 6).join(', ')}
                {pendingImport.duplicateTerms.length > 6 ? ` và ${pendingImport.duplicateTerms.length - 6} từ khác` : ''}
              </p>
              <p className="modal-hint">
                Chọn ghi đè để cập nhật từ cũ, hoặc thêm mới để giữ từ cũ và tạo thêm bản mới từ file Excel.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="teacher-btn-outline" onClick={() => setPendingImport(null)}>
                Hủy
              </button>
              <button
                type="button"
                className="teacher-btn-outline"
                disabled={isMutating}
                onClick={() => void resolveDuplicateImport('append')}
              >
                Thêm mới
              </button>
              <button
                type="button"
                className="teacher-btn-primary"
                disabled={isMutating}
                onClick={() => void resolveDuplicateImport('overwrite')}
              >
                Ghi đè
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
