import { useState, useRef } from 'react';
import type { StudentQuestion } from '../../domain/studentExam.types';

type QuestionRendererProps = {
  question: StudentQuestion;
  index: number;
  value: any; // Could be optionId (string), text (string), or audio blob URL (string) / File (Blob)
  onChange: (value: any) => void;
};

export function QuestionRenderer({ question, index, value, onChange }: QuestionRendererProps) {
  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '16px' }}>Câu {index}:</h4>
        <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>{question.points} điểm</span>
      </div>
      <p style={{ margin: '0 0 16px 0', fontSize: '16px', whiteSpace: 'pre-wrap' }}>{question.content}</p>

      {question.questionType === 'MULTIPLE_CHOICE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {question.options?.map(opt => (
            <label 
              key={opt.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px',
                border: value === opt.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: value === opt.id ? 'rgba(74, 144, 226, 0.05)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="radio" 
                name={`question-${question.id}`} 
                value={opt.id}
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px' }}>{opt.content}</span>
            </label>
          ))}
        </div>
      )}

      {question.questionType === 'ESSAY' && (
        <textarea
          className="form-textarea"
          rows={5}
          placeholder="Nhập câu trả lời của bạn vào đây..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', resize: 'vertical' }}
        />
      )}

      {question.questionType === 'AUDIO_RESPONSE' && (
        <AudioRecorder value={value} onChange={onChange} />
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
    } catch (err) {
      alert('Không thể truy cập microphone. Vui lòng cấp quyền.');
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
    <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {!value && !isRecording && (
        <div style={{ textAlign: 'center' }}>
          <button 
            type="button"
            onClick={startRecording}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            <span className="material-symbols-outlined">mic</span>
            Bắt đầu ghi âm
          </button>
        </div>
      )}

      {isRecording && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ animation: 'pulse 1.5s infinite' }}>fiber_manual_record</span>
            Đang ghi âm... {formatTime(recordingTime)}
          </div>
          <button 
            type="button"
            onClick={stopRecording}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid #f44336',
              color: '#f44336',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Dừng ghi âm
          </button>
        </div>
      )}

      {value && !isRecording && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <audio controls src={URL.createObjectURL(value)} style={{ flex: 1, minWidth: '200px' }} />
          <button 
            type="button"
            onClick={clearRecording}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-muted)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            Xóa & Thu lại
          </button>
        </div>
      )}
    </div>
  );
}
