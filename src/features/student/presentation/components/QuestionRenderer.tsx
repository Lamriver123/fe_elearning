import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { StudentQuestion } from '../../domain/studentExam.types';

type QuestionValue = string | Blob | null;

type QuestionRendererProps = {
  question: StudentQuestion;
  index: number;
  value: QuestionValue;
  onChange: (value: QuestionValue) => void;
};

export function QuestionRenderer({ question, index, value, onChange }: QuestionRendererProps) {
  return (
    <div className="question-card">
      <div className="question-card__head">
        <h4 className="question-card__title">Câu {index}:</h4>
        <span className="question-card__points">{question.points} điểm</span>
      </div>
      <p className="question-card__content">{question.content}</p>

      {question.questionType === 'MULTIPLE_CHOICE' && (
        <div className="question-card__options">
          {question.options?.map(opt => (
            <label 
              key={opt.id} 
              className={`question-card__option ${value === opt.id ? 'question-card__option--selected' : ''}`}
            >
              <input 
                className="question-card__radio"
                type="radio" 
                name={`question-${question.id}`} 
                value={opt.id}
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
              />
              <span className="question-card__option-text">{opt.content}</span>
            </label>
          ))}
        </div>
      )}

      {question.questionType === 'ESSAY' && (
        <textarea
          className="form-textarea"
          rows={5}
          placeholder="Nhập câu trả lời của bạn vào đây..."
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.questionType === 'AUDIO_RESPONSE' && (
        <AudioRecorder value={value instanceof Blob ? value : null} onChange={onChange} />
      )}
    </div>
  );
}

// Sub-component for Audio Recording
function AudioRecorder({ value, onChange }: { value: Blob | null, onChange: (val: Blob | null) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | ReturnType<typeof setInterval> | null>(null);
  const playbackUrl = useMemo(() => value ? URL.createObjectURL(value) : null, [value]);

  useEffect(() => {
    return () => {
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    };
  }, [playbackUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onChange(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch {
      toast.error('Không thể truy cập microphone. Vui lòng cấp quyền.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clearRecording = () => {
    onChange(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="audio-recorder">
      {!value && !isRecording && (
        <div className="audio-recorder__idle">
          <button 
            type="button"
            onClick={startRecording}
            className="audio-recorder__button audio-recorder__button--record"
          >
            <span className="material-symbols-outlined" aria-hidden="true">mic</span>
            Bắt đầu ghi âm
          </button>
        </div>
      )}

      {isRecording && (
        <div className="audio-recorder__recording">
          <div className="audio-recorder__status">
            <span className="material-symbols-outlined" aria-hidden="true">fiber_manual_record</span>
            Đang ghi âm... {formatTime(recordingTime)}
          </div>
          <button 
            type="button"
            onClick={stopRecording}
            className="audio-recorder__button audio-recorder__button--stop"
          >
            Dừng ghi âm
          </button>
        </div>
      )}

      {value && !isRecording && playbackUrl && (
        <div className="audio-recorder__playback">
          <audio controls src={playbackUrl} />
          <button 
            type="button"
            onClick={clearRecording}
            className="audio-recorder__button audio-recorder__button--clear"
          >
            <span className="material-symbols-outlined" aria-hidden="true">delete</span>
            Xóa & Thu lại
          </button>
        </div>
      )}
    </div>
  );
}
