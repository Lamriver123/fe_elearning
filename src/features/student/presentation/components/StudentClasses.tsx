import React, { useState } from 'react'
import { useStudentClasses } from '../../application/useStudentClasses'
import { StudentClassCard } from './StudentClassCard'
import { PreviewClassModal } from './PreviewClassModal'
import type { StudentClassInfo } from '../../domain/studentClasses.types'

export function StudentClasses() {
  const { classes, isLoading, error, isJoining, handleJoinClass, handlePreviewClass, handleAcceptInvite } = useStudentClasses()
  const [inviteCode, setInviteCode] = useState('')
  const [activeTab, setActiveTab] = useState<'APPROVED' | 'PENDING' | 'INVITED'>('APPROVED')
  const [previewClass, setPreviewClass] = useState<StudentClassInfo | null>(null)

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const classInfo = await handlePreviewClass(inviteCode)
    if (classInfo) {
      setPreviewClass(classInfo)
    }
  }

  const onConfirmJoin = async () => {
    if (!previewClass) return
    const success = await handleJoinClass(inviteCode)
    if (success) {
      setPreviewClass(null)
      setInviteCode('')
      setActiveTab('PENDING')
    }
  }

  const onAcceptInvite = async (classId: string) => {
    const success = await handleAcceptInvite(classId)
    if (success) {
      setActiveTab('APPROVED')
    }
  }

  const approvedClasses = classes.filter(c => c.memberStatus === 'APPROVED')
  const pendingClasses = classes.filter(c => c.memberStatus === 'PENDING')
  const invitedClasses = classes.filter(c => c.memberStatus === 'INVITED')

  let displayClasses = approvedClasses
  if (activeTab === 'PENDING') displayClasses = pendingClasses
  if (activeTab === 'INVITED') displayClasses = invitedClasses

  return (
    <div className="student-classes">
      <section className="student-classes__header">
        <div className="student-classes__header-content">
          <span className="student-classes__kicker">
            <span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>
            Không gian học tập
          </span>
          <h2>Lớp học của tôi</h2>
          <p>Chọn lớp để tiếp tục học, theo dõi lời mời và các yêu cầu đang chờ duyệt.</p>
        </div>

        <div className="student-classes__stats" aria-label="Tổng quan lớp học">
          <span className="student-classes__stat student-classes__stat--joined">
            <span className="material-symbols-outlined" aria-hidden="true">verified</span>
            <strong>{approvedClasses.length}</strong>
            <small>Đã tham gia</small>
          </span>
          <span className="student-classes__stat student-classes__stat--pending">
            <span className="material-symbols-outlined" aria-hidden="true">hourglass_top</span>
            <strong>{pendingClasses.length}</strong>
            <small>Chờ duyệt</small>
          </span>
          <span className="student-classes__stat student-classes__stat--invited">
            <span className="material-symbols-outlined" aria-hidden="true">mark_email_unread</span>
            <strong>{invitedClasses.length}</strong>
            <small>Lời mời</small>
          </span>
        </div>
      </section>

      <div className="student-classes__tabs-row">
        <div className="student-classes__tabs">
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`student-classes__tab ${activeTab === 'APPROVED' ? 'student-classes__tab--active' : ''}`}
            aria-pressed={activeTab === 'APPROVED'}
          >
            <span className="material-symbols-outlined" aria-hidden="true">verified</span>
            Đã tham gia 
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`student-classes__tab ${activeTab === 'PENDING' ? 'student-classes__tab--active' : ''}`}
            aria-pressed={activeTab === 'PENDING'}
          >
            <span className="material-symbols-outlined" aria-hidden="true">hourglass_top</span>
            Đang chờ duyệt 
          </button>
          <button
            onClick={() => setActiveTab('INVITED')}
            className={`student-classes__tab ${activeTab === 'INVITED' ? 'student-classes__tab--active' : ''}`}
            aria-pressed={activeTab === 'INVITED'}
          >
            <span className="material-symbols-outlined" aria-hidden="true">mark_email_unread</span>
            Lời mời 
          </button>
        </div>

        {/* Small Join Form */}
        <form onSubmit={onSearchSubmit} className="student-classes__search-form">
          <span className="material-symbols-outlined student-classes__search-icon" aria-hidden="true">search</span>
          <input
            type="text"
            placeholder="Nhập mã lớp..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="student-classes__search-input"
          />
          <button
            type="submit"
            className="student-classes__search-btn"
            disabled={isJoining || !inviteCode.trim()}
          >
            {isJoining ? 'Đang tìm' : 'Tìm lớp'}
          </button>
        </form>
      </div>

      <div className="student-classes__content">
        {isLoading ? (
          <div className="student-classes__loading-grid" aria-label="Đang tải lớp học">
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton-card" aria-hidden="true">
                <div className="skeleton-thumb" />
                <div className="skeleton-line skeleton-line--lg" />
                <div className="skeleton-line skeleton-line--md" />
                <div className="skeleton-chip" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="student-classes__empty-state page-state--error">
            <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
            {error}
          </div>
        ) : displayClasses.length === 0 ? (
          <div className="student-classes__empty-state">
            <span className="material-symbols-outlined student-classes__empty-icon" aria-hidden="true">
              {activeTab === 'APPROVED' ? 'school' : activeTab === 'INVITED' ? 'mail' : 'hourglass_empty'}
            </span>
            <p>
              {activeTab === 'APPROVED'
                ? 'Bạn chưa tham gia lớp học nào. Hãy nhập mã mời ở góc phải trên để xin tham gia nhé!'
                : activeTab === 'INVITED' 
                ? 'Bạn không có lời mời tham gia lớp học nào.'
                : 'Bạn không có yêu cầu xin tham gia lớp học nào đang chờ duyệt.'}
            </p>
          </div>
        ) : (
          <div className="student-class-grid">
            {displayClasses.map((cls) => (
              <StudentClassCard 
                key={cls.id} 
                classInfo={cls} 
                onAcceptInvite={onAcceptInvite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <PreviewClassModal 
        isOpen={!!previewClass}
        onClose={() => setPreviewClass(null)}
        classInfo={previewClass}
        onJoin={onConfirmJoin}
        isJoining={isJoining}
      />
    </div>
  )
}
