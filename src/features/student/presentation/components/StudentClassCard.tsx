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
  
  // Reuse teacher styles but simplify them
  const cardClasses = `teacher-class-card`
  
  let badgeLabel = ''
  let badgeClass = ''
  let dotClass = ''
  
  if (isApproved) {
    badgeLabel = 'Đã tham gia'
    badgeClass = 'teacher-class-card__badge--ongoing'
    dotClass = 'teacher-class-card__badge-dot--ongoing'
  } else if (isPending) {
    badgeLabel = 'Đang chờ duyệt'
    badgeClass = 'teacher-class-card__badge--upcoming'
    dotClass = 'teacher-class-card__badge-dot--upcoming'
  } else if (isInvited) {
    badgeLabel = 'Được mời'
    badgeClass = 'teacher-class-card__badge--draft'
    dotClass = 'teacher-class-card__badge-dot--draft'
  }

  const CardWrapper = isApproved ? Link : 'div'
  const wrapperProps = isApproved ? { to: `/student/courses/${classInfo.id}`, style: { textDecoration: 'none' } } : {}

  return (
    <CardWrapper {...(wrapperProps as any)} className={cardClasses}>
      <div className="teacher-class-card__image-wrapper">
        {classInfo.poster ? (
          <img 
            src={classInfo.poster} 
            alt={`${classInfo.name} Thumbnail`}
            className="teacher-class-card__image" 
          />
        ) : (
          <div className="teacher-class-card__placeholder">
            <span className="material-symbols-outlined teacher-class-card__placeholder-icon">school</span>
          </div>
        )}
        <div className="teacher-class-card__overlay"></div>

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
        
        <p className="student-class-card__teacher-info">
          <span className="material-symbols-outlined student-class-card__teacher-icon">person</span>
          {classInfo.teacherName}
        </p>
        
        <div className="teacher-class-card__info" style={{ display: 'none' }}>
          {/* Hide description for now since CourseList doesn't have it */}
        </div>

        {isApproved && (
          <div className="teacher-class-card__footer" style={{ marginTop: 'auto' }}>
            <div className="student-class-card__progress-bar">
              <div 
                className="student-class-card__progress-fill"
                style={{ width: '45%' }} // Hardcoded progress
              ></div>
            </div>
            <p className="student-class-card__progress-text">
              Bài 5/12
            </p>
          </div>
        )}
        
        {isPending && (
          <div className="teacher-class-card__footer" style={{ marginTop: 'auto' }}>
            <button className="student-class-card__action" disabled>
              Chờ giáo viên duyệt...
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>hourglass_empty</span>
            </button>
          </div>
        )}
        
        {isInvited && (
          <div className="teacher-class-card__footer" style={{ marginTop: 'auto' }}>
            <button 
              className="student-class-card__action student-class-card__action--primary"
              onClick={() => onAcceptInvite && onAcceptInvite(classInfo.id)}
            >
              Chấp nhận lời mời
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
            </button>
          </div>
        )}
      </div>
    </CardWrapper>
  )
}
