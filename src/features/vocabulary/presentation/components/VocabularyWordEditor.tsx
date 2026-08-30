import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'react-hot-toast'
import { useVocabularyAudioUpload } from '../../application/useVocabularyAudioUpload'
import type { VocabularySentenceRequirement } from '../../domain/vocabulary.types'

export type VocabularyWordDraft = {
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

type VocabularyWordEditorProps = {
  draft: VocabularyWordDraft
  isMutating: boolean
  submitLabel: string
  onCancel: () => void
  onChange: <K extends keyof VocabularyWordDraft>(key: K, value: VocabularyWordDraft[K]) => void
  onSubmit: () => Promise<void>
}

type AudioUrlFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

const sentenceRequirementOptions: Array<{
  value: VocabularySentenceRequirement
  label: string
  hint: string
}> = [
  {
    value: 'ONCE',
    label: 'Một lần đầu',
    hint: 'Hỏi đặt câu ở lần học đầu tiên',
  },
  {
    value: 'ALWAYS',
    label: 'Mỗi lần học thuộc',
    hint: 'Luôn yêu cầu câu mới khi học thuộc',
  },
  {
    value: 'OFF',
    label: 'Không bắt buộc',
    hint: 'Chỉ học flash card, không cần đặt câu',
  },
]

function pauseOtherEditorAudio(currentAudio: HTMLAudioElement) {
  document.querySelectorAll<HTMLAudioElement>('audio[data-vocabulary-word-audio]').forEach((audio) => {
    if (audio === currentAudio) return
    audio.pause()
  })
}

function AudioUrlField({ id, label, value, onChange }: AudioUrlFieldProps) {
  const { uploadAudio, isUploading } = useVocabularyAudioUpload()
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [previewUrl])

  const replacePreviewFile = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    replacePreviewFile(file)
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Trình duyệt chưa hỗ trợ ghi âm')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      streamRef.current = stream
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const extension = recorder.mimeType.includes('mp4') ? 'm4a' : 'webm'
        replacePreviewFile(new File([blob], `${id}-${Date.now()}.${extension}`, { type: blob.type }))
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      recorder.start()
      setIsRecording(true)
    } catch {
      toast.error('Không thể truy cập micro')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleUpload = async () => {
    if (!previewFile) {
      toast.error('Vui lòng chọn file hoặc ghi âm trước')
      return
    }

    const uploadedUrl = await uploadAudio(previewFile)
    if (uploadedUrl) {
      onChange(uploadedUrl)
      setPreviewFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
  }

  return (
    <div className="vocabulary-audio-field">
      <label className="vocabulary-audio-field__input" htmlFor={id}>
        <span>{label}</span>
        <input
          id={id}
          className="form-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Dán URL audio hoặc upload/ghi âm để thay thế"
        />
      </label>

      <div className="vocabulary-audio-field__preview">
        {value ? (
          <audio
            controls
            src={value}
            data-vocabulary-word-audio
            onPlay={(event) => pauseOtherEditorAudio(event.currentTarget)}
          />
        ) : (
          <span className="vocabulary-audio-field__empty">Chưa có audio</span>
        )}
      </div>

      {previewUrl && (
        <div className="vocabulary-audio-field__pending">
          <span>Audio mới</span>
          <audio
            controls
            src={previewUrl}
            data-vocabulary-word-audio
            onPlay={(event) => pauseOtherEditorAudio(event.currentTarget)}
          />
        </div>
      )}

      <div className="vocabulary-audio-field__actions">
        <label className="teacher-btn-outline vocabulary-audio-field__file-btn">
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/ogg,audio/mp4,.mp3,.wav,.webm,.ogg,.m4a"
            onChange={handleFileChange}
          />
          <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
          Chọn file
        </label>
        <button
          type="button"
          className={`teacher-btn-outline ${isRecording ? 'vocabulary-audio-field__recording' : ''}`}
          onClick={isRecording ? stopRecording : () => void startRecording()}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {isRecording ? 'stop_circle' : 'mic'}
          </span>
          {isRecording ? 'Dừng' : 'Ghi âm'}
        </button>
        <button
          type="button"
          className="teacher-btn-primary"
          disabled={!previewFile || isUploading}
          onClick={() => void handleUpload()}
        >
          <span className="material-symbols-outlined" aria-hidden="true">cloud_upload</span>
          {isUploading ? 'Đang upload' : 'Dùng audio mới'}
        </button>
      </div>
    </div>
  )
}

export function VocabularyWordEditor({
  draft,
  isMutating,
  submitLabel,
  onCancel,
  onChange,
  onSubmit,
}: VocabularyWordEditorProps) {
  const [isRequirementOpen, setIsRequirementOpen] = useState(false)
  const requirementRef = useRef<HTMLDivElement | null>(null)
  const selectedRequirement =
    sentenceRequirementOptions.find((option) => option.value === draft.sentenceRequirement) ??
    sentenceRequirementOptions[0]

  useEffect(() => {
    if (!isRequirementOpen) return undefined

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (
        requirementRef.current &&
        event.target instanceof Node &&
        !requirementRef.current.contains(event.target)
      ) {
        setIsRequirementOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointerDown)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointerDown)
  }, [isRequirementOpen])

  return (
    <div className="vocabulary-word-editor">
      <label>
        Thứ tự
        <input
          className="form-input"
          type="number"
          min="1"
          value={draft.orderIndex}
          onChange={(event) => onChange('orderIndex', event.target.value)}
        />
      </label>
      <label>
        Từ vựng
        <input
          className="form-input"
          value={draft.term}
          onChange={(event) => onChange('term', event.target.value)}
        />
      </label>
      <label>
        Loại từ
        <input
          className="form-input"
          value={draft.wordType}
          onChange={(event) => onChange('wordType', event.target.value)}
        />
      </label>
      <label>
        Phiên âm US
        <input
          className="form-input"
          value={draft.phoneticUs}
          onChange={(event) => onChange('phoneticUs', event.target.value)}
        />
      </label>
      <label>
        Phiên âm UK
        <input
          className="form-input"
          value={draft.phoneticUk}
          onChange={(event) => onChange('phoneticUk', event.target.value)}
        />
      </label>
      <div className="vocabulary-word-editor__field vocabulary-word-editor__requirement" ref={requirementRef}>
        <span className="vocabulary-word-editor__field-label">Yêu cầu đặt câu</span>
        <button
          type="button"
          className="vocabulary-word-editor__select-trigger"
          aria-expanded={isRequirementOpen}
          onClick={() => setIsRequirementOpen((isOpen) => !isOpen)}
        >
          <span>{selectedRequirement.label}</span>
          <small>{selectedRequirement.hint}</small>
          <span className="material-symbols-outlined" aria-hidden="true">
            {isRequirementOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {isRequirementOpen && (
          <div className="vocabulary-word-editor__select-menu" role="listbox">
            {sentenceRequirementOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  option.value === draft.sentenceRequirement
                    ? 'vocabulary-word-editor__select-option is-selected'
                    : 'vocabulary-word-editor__select-option'
                }
                role="option"
                aria-selected={option.value === draft.sentenceRequirement}
                onClick={() => {
                  onChange('sentenceRequirement', option.value)
                  setIsRequirementOpen(false)
                }}
              >
                <span>{option.label}</span>
                <small>{option.hint}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="vocabulary-word-editor__audio">
        <AudioUrlField
          id="vocabulary-audio-us-url"
          label="Audio US URL"
          value={draft.audioUsUrl}
          onChange={(value) => onChange('audioUsUrl', value)}
        />
        <AudioUrlField
          id="vocabulary-audio-uk-url"
          label="Audio UK URL"
          value={draft.audioUkUrl}
          onChange={(value) => onChange('audioUkUrl', value)}
        />
      </div>

      <label className="vocabulary-word-editor__wide">
        Nghĩa
        <textarea
          className="form-input"
          rows={2}
          value={draft.meaning}
          onChange={(event) => onChange('meaning', event.target.value)}
        />
      </label>
      <label className="vocabulary-word-editor__wide">
        Ví dụ
        <textarea
          className="form-input"
          rows={2}
          value={draft.example}
          onChange={(event) => onChange('example', event.target.value)}
        />
      </label>
      <label className="vocabulary-word-editor__wide">
        Nghĩa ví dụ
        <textarea
          className="form-input"
          rows={2}
          value={draft.exampleMeaning}
          onChange={(event) => onChange('exampleMeaning', event.target.value)}
        />
      </label>
      <label>
        Đồng nghĩa
        <input
          className="form-input"
          value={draft.synonyms}
          onChange={(event) => onChange('synonyms', event.target.value)}
        />
      </label>
      <label>
        Trái nghĩa
        <input
          className="form-input"
          value={draft.antonyms}
          onChange={(event) => onChange('antonyms', event.target.value)}
        />
      </label>
      <div className="vocabulary-word-editor__actions">
        <button type="button" className="teacher-btn-outline" onClick={onCancel}>
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
