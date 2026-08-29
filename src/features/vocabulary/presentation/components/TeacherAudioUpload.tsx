import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type SyntheticEvent } from 'react'
import { toast } from 'react-hot-toast'
import { useVocabularyAudioUpload } from '../../application/useVocabularyAudioUpload'

const MIN_TRIM_GAP = 0.1

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatSeconds(value: number) {
  const safeValue = Math.max(0, value)
  const minutes = Math.floor(safeValue / 60)
  const seconds = Math.floor(safeValue % 60)
  const tenths = Math.floor((safeValue % 1) * 10)
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`
}

function audioBufferToWav(buffer: AudioBuffer) {
  const numberOfChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const bytesPerSample = 2
  const blockAlign = numberOfChannels * bytesPerSample
  const dataLength = buffer.length * blockAlign
  const arrayBuffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, dataLength, true)

  let offset = 44
  for (let frame = 0; frame < buffer.length; frame += 1) {
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame] ?? 0))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += bytesPerSample
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

export function TeacherAudioUpload() {
  const { uploadAudio, isUploading } = useVocabularyAudioUpload()
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null)
  const selectionPlaybackRequestedRef = useRef(false)
  const chunksRef = useRef<BlobPart[]>([])
  const [isPlayingSelection, setIsPlayingSelection] = useState(false)

  const trimStartPercent = duration > 0 ? (trimStart / duration) * 100 : 0
  const trimEndPercent = duration > 0 ? (trimEnd / duration) * 100 : 100
  const trimRangeStyle = {
    '--trim-start': `${trimStartPercent}%`,
    '--trim-end': `${trimEndPercent}%`,
  } as CSSProperties

  useEffect(() => {
    const audioElement = audioPreviewRef.current

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
    }
  }, [previewUrl])

  const stopPreviewPlayback = () => {
    const audioElement = audioPreviewRef.current
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
    }
    selectionPlaybackRequestedRef.current = false
    setIsPlayingSelection(false)
  }

  const setPreviewFile = (file: File) => {
    stopPreviewPlayback()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const nextPreviewUrl = URL.createObjectURL(file)
    setAudioFile(file)
    setPreviewUrl(nextPreviewUrl)
    setUploadedUrl('')
    setDuration(0)
    setTrimStart(0)
    setTrimEnd(0)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPreviewFile(file)
    event.target.value = ''
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Trình duyệt chưa hỗ trợ ghi âm')
      return
    }

    try {
      stopPreviewPlayback()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      mediaStreamRef.current = stream
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const extension = recorder.mimeType.includes('mp4') ? 'm4a' : 'webm'
        setPreviewFile(new File([blob], `recording-${Date.now()}.${extension}`, { type: blob.type }))
        stream.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
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

  const handleLoadedMetadata = (event: SyntheticEvent<HTMLAudioElement>) => {
    const nextDuration = event.currentTarget.duration
    if (Number.isFinite(nextDuration)) {
      setDuration(nextDuration)
      setTrimEnd(nextDuration)
    }
  }

  const updateTrimStart = (value: number) => {
    setTrimStart(clamp(value, 0, Math.max(0, trimEnd - MIN_TRIM_GAP)))
  }

  const updateTrimEnd = (value: number) => {
    setTrimEnd(clamp(value, Math.min(duration, trimStart + MIN_TRIM_GAP), duration))
  }

  const playSelectedSegment = async () => {
    const audioElement = audioPreviewRef.current
    if (!audioElement || trimEnd <= trimStart) {
      toast.error('Khoảng audio chưa hợp lệ')
      return
    }

    try {
      selectionPlaybackRequestedRef.current = true
      audioElement.currentTime = trimStart
      setIsPlayingSelection(true)
      await audioElement.play()
    } catch {
      setIsPlayingSelection(false)
      selectionPlaybackRequestedRef.current = false
      toast.error('Không thể phát đoạn audio này')
    }
  }

  const handlePreviewTimeUpdate = () => {
    const audioElement = audioPreviewRef.current
    if (!audioElement || !isPlayingSelection) return

    if (audioElement.currentTime >= trimEnd) {
      audioElement.pause()
      audioElement.currentTime = trimStart
      selectionPlaybackRequestedRef.current = false
      setIsPlayingSelection(false)
    }
  }

  const trimAudio = async () => {
    if (!audioFile || duration <= 0 || trimEnd <= trimStart) {
      toast.error('Khoảng cắt audio chưa hợp lệ')
      return
    }

    try {
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioContext = new AudioContext()
      const sourceBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
      const startFrame = Math.floor(trimStart * sourceBuffer.sampleRate)
      const endFrame = Math.floor(trimEnd * sourceBuffer.sampleRate)
      const frameCount = Math.max(1, endFrame - startFrame)
      const trimmedBuffer = audioContext.createBuffer(
        sourceBuffer.numberOfChannels,
        frameCount,
        sourceBuffer.sampleRate,
      )

      for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel += 1) {
        const channelData = sourceBuffer.getChannelData(channel).slice(startFrame, endFrame)
        trimmedBuffer.copyToChannel(channelData, channel)
      }

      await audioContext.close()
      const wavBlob = audioBufferToWav(trimmedBuffer)
      setPreviewFile(new File([wavBlob], `vocabulary-audio-${Date.now()}.wav`, { type: 'audio/wav' }))
      toast.success('Đã cắt audio')
    } catch {
      toast.error('Không thể cắt file audio này')
    }
  }

  const handleUpload = async () => {
    if (!audioFile) {
      toast.error('Vui lòng chọn hoặc ghi âm audio')
      return
    }

    stopPreviewPlayback()
    const url = await uploadAudio(audioFile)
    if (url) setUploadedUrl(url)
  }

  const copyUrl = async () => {
    if (!uploadedUrl) return
    await navigator.clipboard.writeText(uploadedUrl)
    toast.success('Đã copy URL audio')
  }

  return (
    <div className="teacher-content-container vocabulary-page">
      <div className="teacher-page-header">
        <div>
          <h1>Upload audio</h1>
          <p>Tạo URL audio để dán vào file từ vựng.</p>
        </div>
      </div>

      <div className="audio-upload-grid">
        <section className="surface-card audio-upload-panel">
          <div className="audio-upload-panel__header">
            <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
            <h2>File audio</h2>
          </div>
          <label className="audio-dropzone">
            <input
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/ogg,audio/mp4,.mp3,.wav,.webm,.ogg,.m4a"
              onChange={handleFileChange}
            />
            <span className="material-symbols-outlined" aria-hidden="true">library_music</span>
            <strong>{audioFile?.name ?? 'Chọn file mp3/audio'}</strong>
          </label>

          <div className="audio-recorder">
            <button
              type="button"
              className={`teacher-btn-outline ${isRecording ? 'audio-recorder__stop' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {isRecording ? 'stop_circle' : 'mic'}
              </span>
              {isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
            </button>
          </div>
        </section>

        <section className="surface-card audio-upload-panel audio-upload-panel--preview">
          <div className="audio-upload-panel__header">
            <span className="material-symbols-outlined" aria-hidden="true">graphic_eq</span>
            <h2>Preview</h2>
          </div>

          {previewUrl ? (
            <>
              <audio
                ref={audioPreviewRef}
                className="audio-preview"
                src={previewUrl}
                controls
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handlePreviewTimeUpdate}
                onPlay={() => {
                  if (!selectionPlaybackRequestedRef.current) {
                    setIsPlayingSelection(false)
                  }
                }}
                onPause={() => {
                  selectionPlaybackRequestedRef.current = false
                  setIsPlayingSelection(false)
                }}
                onEnded={() => {
                  selectionPlaybackRequestedRef.current = false
                  setIsPlayingSelection(false)
                }}
              />

              {duration > 0 && (
                <div className="audio-trim">
                  <div className="audio-trim__header">
                    <span>Bắt đầu: <strong>{formatSeconds(trimStart)}</strong></span>
                    <span>Kết thúc: <strong>{formatSeconds(trimEnd)}</strong></span>
                    <span>Độ dài: <strong>{formatSeconds(trimEnd - trimStart)}</strong></span>
                  </div>

                  <div className="audio-trim-slider" style={trimRangeStyle}>
                    <div className="audio-trim-slider__rail" aria-hidden="true">
                      <span className="audio-trim-slider__selection" />
                    </div>
                    <input
                      className="audio-trim-slider__input audio-trim-slider__input--start"
                      type="range"
                      min="0"
                      max={duration}
                      step="0.05"
                      value={trimStart}
                      onChange={(event) => updateTrimStart(Number(event.target.value))}
                      aria-label="Kéo điểm bắt đầu đoạn audio"
                    />
                    <input
                      className="audio-trim-slider__input audio-trim-slider__input--end"
                      type="range"
                      min="0"
                      max={duration}
                      step="0.05"
                      value={trimEnd}
                      onChange={(event) => updateTrimEnd(Number(event.target.value))}
                      aria-label="Kéo điểm kết thúc đoạn audio"
                    />
                  </div>

                  <div className="audio-trim__actions">
                    <button type="button" className="teacher-btn-outline" onClick={() => void playSelectedSegment()}>
                      <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
                      {isPlayingSelection ? 'Đang nghe đoạn chọn' : 'Nghe đoạn chọn'}
                    </button>
                    <button type="button" className="teacher-btn-outline" onClick={() => void trimAudio()}>
                      <span className="material-symbols-outlined" aria-hidden="true">content_cut</span>
                      Cắt đoạn
                    </button>
                  </div>
                </div>
              )}

              <button type="button" className="teacher-btn-primary" onClick={() => void handleUpload()} disabled={isUploading}>
                <span className="material-symbols-outlined" aria-hidden="true">cloud_upload</span>
                {isUploading ? 'Đang upload...' : 'Upload lên Cloudinary'}
              </button>
            </>
          ) : (
            <div className="page-state audio-empty-state">
              <span className="material-symbols-outlined page-state__icon" aria-hidden="true">music_note</span>
              <h3 className="page-state__title">Chưa có audio</h3>
            </div>
          )}

          {uploadedUrl && (
            <div className="audio-result">
              <input className="form-input" value={uploadedUrl} readOnly />
              <button type="button" className="teacher-btn-outline" onClick={() => void copyUrl()}>
                <span className="material-symbols-outlined" aria-hidden="true">content_copy</span>
                Copy URL
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
