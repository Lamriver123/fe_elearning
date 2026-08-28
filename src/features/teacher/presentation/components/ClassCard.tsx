import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import type { ClassInfo } from '../../domain/teacher.types'

type ClassCardProps = {
  classInfo: ClassInfo
}

export function ClassCard({ classInfo }: ClassCardProps) {
  const navigate = useNavigate()
  const isFinished = classInfo.statusMock === 'finished'
  const isOngoing = classInfo.statusMock === 'ongoing'
  const isUpcoming = classInfo.statusMock === 'upcoming'
  
  const cardClasses = `teacher-class-card ${isFinished ? 'teacher-class-card--finished' : ''}`
  
  let badgeLabel = ''
  let badgeClass = ''
  let dotClass = ''
  
  if (isOngoing) {
    badgeLabel = 'Đang diễn ra'
    badgeClass = 'teacher-class-card__badge--ongoing'
    dotClass = 'teacher-class-card__badge-dot--ongoing'
  } else if (isFinished) {
    badgeLabel = 'Đã kết thúc'
    badgeClass = 'teacher-class-card__badge--finished'
    dotClass = 'teacher-class-card__badge-dot--finished'
  } else if (isUpcoming) {
    badgeLabel = 'Sắp khai giảng'
    badgeClass = 'teacher-class-card__badge--upcoming'
    dotClass = 'teacher-class-card__badge-dot--upcoming'
  }

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(classInfo.inviteCode)
    toast.success('Đã copy mã lớp: ' + classInfo.inviteCode)
  }

  const handleCardClick = () => {
    navigate(`/teacher/classes/${classInfo.id}`)
  }

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      <div className="teacher-class-card__image-wrapper">
        {classInfo.poster ? (
          <img 
            src={classInfo.poster} 
            alt={`${classInfo.name} Thumbnail`}
            className="teacher-class-card__image" 
          />
        ) : (
          <div className="teacher-class-card__placeholder">
            <span className="material-symbols-outlined teacher-class-card__placeholder-icon" aria-hidden="true">school</span>
          </div>
        )}
        <div className="teacher-class-card__overlay"></div>
        
        {/* Left Badge: Invite Code */}
        <div 
          className="teacher-class-card__badge teacher-class-card__badge--code" 
          onClick={handleCopyCode}
          title="Nhấn để copy mã lớp"
        >
          <span className="material-symbols-outlined teacher-class-card__badge-icon" aria-hidden="true">content_copy</span>
          {classInfo.inviteCode}
        </div>

        {/* Right Badge: Status */}
        {badgeLabel && (
          <div className={`teacher-class-card__badge ${badgeClass}`}>
            <span className={`teacher-class-card__badge-dot ${dotClass}`}></span>
            {badgeLabel}
          </div>
        )}
      </div>

      <div className="teacher-class-card__content">
        <h3 className="teacher-class-card__title">{classInfo.name}</h3>
        
        <div className="teacher-class-card__info">
          {classInfo.studentsCount !== undefined && (
            <>
              <div className="teacher-class-card__info-item">
                <span className="material-symbols-outlined teacher-class-card__info-icon" aria-hidden="true">group</span>
                {classInfo.studentsCount} học sinh
              </div>
            </>
          )}
          
          {classInfo.scheduleMock && classInfo.studentsCount !== undefined && (
            <div className="teacher-class-card__dot"></div>
          )}
          
          {classInfo.scheduleMock && (
            <div className="teacher-class-card__info-item">
              <span className="material-symbols-outlined teacher-class-card__info-icon" aria-hidden="true">schedule</span>
              {classInfo.scheduleMock}
            </div>
          )}
        </div>
        
        <div className="teacher-class-card__footer">
          {isFinished ? (
            <button className="teacher-class-card__action">
              Xem báo cáo
            </button>
          ) : isUpcoming ? (
            <button className="teacher-class-card__action">
              Quản lý học viên
            </button>
          ) : (
            <button className="teacher-class-card__action">
              Vào lớp
              <span className="material-symbols-outlined teacher-class-card__action-icon" aria-hidden="true">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
