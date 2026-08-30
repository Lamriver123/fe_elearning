import { Link } from 'react-router-dom'
import type { StudentClassInfo } from '../../domain/studentClasses.types'

type StudentClassCardProps = {
  classInfo: StudentClassInfo
  onAcceptInvite?: (classId: string) => void
}

export function StudentClassCard({ classInfo, onAcceptInvite }: StudentClassCardProps) {
  const isApproved = classInfo.memberStatus === 'APPROVED'
  const isPending = classInfo.memberStatus === 'PENDING'
  const isInvited = classInfo.memberStatus === 'INVITED'
  
  const cardClasses = `student-class-card student-class-card--${classInfo.memberStatus.toLowerCase()}`
  
  let badgeLabel = ''
  let badgeClass = ''
  let dotClass = ''
  
  if (isApproved) {
    badgeLabel = 'Đã tham gia'
    badgeClass = 'student-class-card__badge--approved'
    dotClass = 'student-class-card__badge-dot--approved'
  } else if (isPending) {
    badgeLabel = 'Đang chờ duyệt'
    badgeClass = 'student-class-card__badge--pending'
    dotClass = 'student-class-card__badge-dot--pending'
  } else if (isInvited) {
    badgeLabel = 'Được mời'
    badgeClass = 'student-class-card__badge--invited'
    dotClass = 'student-class-card__badge-dot--invited'
  }

  const cardContent = (
    <>
      <div className="student-class-card__image-wrapper">
        {classInfo.poster ? (
          <img 
            src={classInfo.poster} 
            alt={`${classInfo.name} Thumbnail`}
            className="student-class-card__image" 
          />
        ) : (
          <div className="student-class-card__placeholder">
            <span className="material-symbols-outlined student-class-card__placeholder-icon" aria-hidden="true">school</span>
          </div>
        )}
        <div className="student-class-card__overlay"></div>

        {badgeLabel && (
          <div className={`student-class-card__badge ${badgeClass}`}>
            <span className={`student-class-card__badge-dot ${dotClass}`}></span>
            {badgeLabel}
          </div>
        )}
      </div>

      <div className="student-class-card__content">
        <h3 className="student-class-card__title">{classInfo.name}</h3>
        
        <p className="student-class-card__teacher-info">
          <span className="material-symbols-outlined student-class-card__teacher-icon" aria-hidden="true">person</span>
          {classInfo.teacherName}
        </p>

        {isApproved && (
          <div className="student-class-card__footer">
            <div className="student-class-card__progress-bar">
              <div className="student-class-card__progress-fill"></div>
            </div>
            <p className="student-class-card__progress-text">
              Bài 5/12
            </p>
            <span className="student-class-card__quick-action">
              <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
              Vào lớp
            </span>
          </div>
        )}
        
        {isPending && (
          <div className="student-class-card__footer">
            <button className="student-class-card__action" type="button" disabled>
              Chờ giáo viên duyệt...
              <span className="material-symbols-outlined" aria-hidden="true">hourglass_empty</span>
            </button>
          </div>
        )}
        
        {isInvited && (
          <div className="student-class-card__footer">
            <button 
              className="student-class-card__action student-class-card__action--primary"
              type="button"
              onClick={() => onAcceptInvite?.(classInfo.id)}
            >
              Chấp nhận lời mời
              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
            </button>
          </div>
        )}
      </div>
    </>
  )

  if (isApproved) {
    return (
      <Link to={`/student/courses/${classInfo.id}`} className={cardClasses}>
        {cardContent}
      </Link>
    )
  }

  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  )
}
