import type { StudentClassInfo } from '../../domain/studentClasses.types'

interface PreviewClassModalProps {
  isOpen: boolean
  onClose: () => void
  classInfo: StudentClassInfo | null
  onJoin: () => void
  isJoining: boolean
}

export function PreviewClassModal({
  isOpen,
  onClose,
  classInfo,
  onJoin,
  isJoining
}: PreviewClassModalProps) {
  if (!isOpen || !classInfo) return null

  return (
    <div className="preview-modal__overlay">
      <div className="preview-modal__container">
        <div className="preview-modal__image-section">
          {classInfo.poster ? (
            <img 
              src={classInfo.poster} 
              alt={classInfo.name} 
              className="preview-modal__image"
            />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-muted)' }}>
              school
            </span>
          )}
          <div className="preview-modal__image-gradient"></div>
          
          <button onClick={onClose} className="preview-modal__close-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <div className="preview-modal__body">
          <h2 className="preview-modal__title">
            {classInfo.name}
          </h2>
          
          <p className="preview-modal__teacher">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
            {classInfo.teacherName}
          </p>

          <div className="preview-modal__actions">
            <button onClick={onClose} className="preview-modal__btn-cancel">
              Hủy
            </button>
            <button 
              onClick={onJoin}
              disabled={isJoining}
              className="preview-modal__btn-join"
            >
              {isJoining ? (
                'Đang gửi yêu cầu...'
              ) : (
                <>
                  Xin tham gia
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
