import { useState } from 'react';
import { useClassMembers } from '../../application/useClassMembers';
import type { ClassMemberStatus, StudentMember } from '../../domain/classMember.types';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'APPROVED': return { label: 'Đã duyệt', className: 'status-pill--success' };
    case 'PENDING': return { label: 'Chờ duyệt', className: 'status-pill--warning' };
    case 'INVITED': return { label: 'Đã mời', className: 'status-pill--info' };
    case 'REJECTED': return { label: 'Đã từ chối', className: 'status-pill--danger' };
    default: return { label: status, className: '' };
  }
}

function getGenderLabel(gender?: string) {
  switch (gender) {
    case 'MALE': return 'Nam';
    case 'FEMALE': return 'Nữ';
    case 'OTHER': return 'Khác';
    default: return '—';
  }
}

function getAvatarSrc(member: StudentMember) {
  return member.student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.student.fullName)}&background=random`;
}

export function StudentListTab({ classId }: { classId: string }) {
  const { members, isLoading, error, updateMemberStatus, removeMember } = useClassMembers(classId);
  const [selectedStudent, setSelectedStudent] = useState<StudentMember | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'INVITED'>('ALL');

  const handleApprove = async (studentId: string, status: Extract<ClassMemberStatus, 'APPROVED' | 'REJECTED'>) => {
    const success = await updateMemberStatus(studentId, status);
    if (success) {
      setSelectedStudent(null);
    }
  };

  const handleKick = async (studentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn đuổi học sinh này khỏi lớp?')) return;
    const success = await removeMember(studentId);
    if (success) {
      setSelectedStudent(null);
    }
  };

  const filteredMembers = filter === 'ALL' ? members : members.filter(m => m.status === filter);

  const approvedCount = members.filter(m => m.status === 'APPROVED').length;
  const pendingCount = members.filter(m => m.status === 'PENDING').length;
  const invitedCount = members.filter(m => m.status === 'INVITED').length;

  if (isLoading) {
    return (
      <div className="student-list-loading" aria-label="Đang tải danh sách học sinh">
        {[1, 2, 3].map((item) => (
          <div key={item} className="student-list-skeleton skeleton-card" aria-hidden="true">
            <span className="skeleton-avatar" />
            <span className="skeleton-line skeleton-line--lg" />
            <span className="skeleton-line skeleton-line--md" />
            <span className="skeleton-chip" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-list-error page-state--error">
        <span className="material-symbols-outlined page-state__icon page-state__icon--error" aria-hidden="true">error</span>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="student-list">
      {/* Summary */}
      <div className="student-list-summary">
        <div className="student-list-summary__item">
          <span className="material-symbols-outlined student-list-summary__icon student-list-summary__icon--total" aria-hidden="true">groups</span>
          <div>
            <span className="student-list-summary__number">{members.length}</span>
            <span className="student-list-summary__label">Tổng cộng</span>
          </div>
        </div>
        <div className="student-list-summary__divider" />
        <div className="student-list-summary__item">
          <span className="material-symbols-outlined student-list-summary__icon student-list-summary__icon--approved" aria-hidden="true">how_to_reg</span>
          <div>
            <span className="student-list-summary__number">{approvedCount}</span>
            <span className="student-list-summary__label">Đã duyệt</span>
          </div>
        </div>
        <div className="student-list-summary__divider" />
        <div className="student-list-summary__item">
          <span className="material-symbols-outlined student-list-summary__icon student-list-summary__icon--pending" aria-hidden="true">pending</span>
          <div>
            <span className="student-list-summary__number">{pendingCount}</span>
            <span className="student-list-summary__label">Chờ duyệt</span>
          </div>
        </div>
        {invitedCount > 0 && (
          <>
            <div className="student-list-summary__divider" />
            <div className="student-list-summary__item">
              <span className="material-symbols-outlined student-list-summary__icon student-list-summary__icon--invited" aria-hidden="true">mail</span>
              <div>
                <span className="student-list-summary__number">{invitedCount}</span>
                <span className="student-list-summary__label">Đã mời</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter tabs */}
      <div className="student-list-filters">
        {(['ALL', 'APPROVED', 'PENDING', 'INVITED'] as const).map(f => {
          const labels: Record<string, string> = { ALL: 'Tất cả', APPROVED: 'Đã duyệt', PENDING: 'Chờ duyệt', INVITED: 'Đã mời' };
          const counts: Record<string, number> = { ALL: members.length, APPROVED: approvedCount, PENDING: pendingCount, INVITED: invitedCount };
          return (
            <button
              key={f}
              className={`student-list-filter-btn ${filter === f ? 'student-list-filter-btn--active' : ''}`}
              type="button"
              onClick={() => setFilter(f)}
            >
              {labels[f]} ({counts[f]})
            </button>
          );
        })}
      </div>

      {/* Student list */}
      {filteredMembers.length === 0 ? (
        <div className="student-list-empty">
          <span className="material-symbols-outlined page-state__icon" aria-hidden="true">person_off</span>
          <p>Không có học sinh nào.</p>
        </div>
      ) : (
        <div className="student-list-items">
          {filteredMembers.map((member, idx) => {
            const statusInfo = getStatusInfo(member.status);
            return (
              <div
                key={member.id}
                className="student-list-item"
                onClick={() => setSelectedStudent(member)}
              >
                <div className="student-list-item__rank">{idx + 1}</div>
                <img
                  src={getAvatarSrc(member)}
                  alt={member.student.fullName}
                  className="student-list-item__avatar"
                />
                <div className="student-list-item__info">
                  <span className="student-list-item__name">{member.student.fullName}</span>
                  <span className="student-list-item__email">{member.student.email}</span>
                </div>
                <div className="student-list-item__meta">
                  <span className="student-list-item__joined">
                    <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
                    {formatDate(member.joinedAt)}
                  </span>
                </div>
                <span className={`student-list-item__status status-pill ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
                <span className="material-symbols-outlined student-list-item__chevron" aria-hidden="true">chevron_right</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Student detail modal */}
      {selectedStudent && (
        <div className="student-detail-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="student-detail-modal student-detail-modal--wide" onClick={e => e.stopPropagation()}>
            <button className="student-detail-modal__close" type="button" onClick={() => setSelectedStudent(null)}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>

            <div className="student-detail-modal__header">
              <img
                src={getAvatarSrc(selectedStudent)}
                alt={selectedStudent.student.fullName}
                className="student-detail-modal__avatar"
              />
              <h2 className="student-detail-modal__name">{selectedStudent.student.fullName}</h2>
              <span className="student-detail-modal__username">@{selectedStudent.student.userName}</span>
              <span className={`student-detail-modal__status-badge status-pill ${getStatusInfo(selectedStudent.status).className}`}>
                {getStatusInfo(selectedStudent.status).label}
              </span>
            </div>

            <div className="student-detail-modal__body student-detail-modal__body--grid">
              <div className="student-detail-modal__field student-detail-modal__field--wide">
                <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                <div>
                  <span className="student-detail-modal__field-label">Email</span>
                  <span className="student-detail-modal__field-value">{selectedStudent.student.email}</span>
                </div>
              </div>

              <div className="student-detail-modal__field">
                <span className="material-symbols-outlined" aria-hidden="true">phone</span>
                <div>
                  <span className="student-detail-modal__field-label">Số điện thoại</span>
                  <span className="student-detail-modal__field-value">{selectedStudent.student.phone || '—'}</span>
                </div>
              </div>

              <div className="student-detail-modal__field">
                <span className="material-symbols-outlined" aria-hidden="true">wc</span>
                <div>
                  <span className="student-detail-modal__field-label">Giới tính</span>
                  <span className="student-detail-modal__field-value">{getGenderLabel(selectedStudent.student.gender)}</span>
                </div>
              </div>

              <div className="student-detail-modal__field">
                <span className="material-symbols-outlined" aria-hidden="true">cake</span>
                <div>
                  <span className="student-detail-modal__field-label">Ngày sinh</span>
                  <span className="student-detail-modal__field-value">{formatDate(selectedStudent.student.dateOfBirth)}</span>
                </div>
              </div>

              <div className="student-detail-modal__field">
                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                <div>
                  <span className="student-detail-modal__field-label">Địa chỉ</span>
                  <span className="student-detail-modal__field-value">{selectedStudent.student.address || '—'}</span>
                </div>
              </div>

              <div className="student-detail-modal__field">
                <span className="material-symbols-outlined" aria-hidden="true">event</span>
                <div>
                  <span className="student-detail-modal__field-label">Ngày tham gia lớp</span>
                  <span className="student-detail-modal__field-value">{formatDate(selectedStudent.joinedAt)}</span>
                </div>
              </div>

              <div className="student-detail-modal__field">
                <span className="material-symbols-outlined" aria-hidden="true">person_add</span>
                <div>
                  <span className="student-detail-modal__field-label">Ngày đăng ký tài khoản</span>
                  <span className="student-detail-modal__field-value">{formatDate(selectedStudent.student.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="student-detail-modal__actions">
              {selectedStudent.status === 'PENDING' && (
                <>
                  <button 
                    className="student-detail-modal__action-approve"
                    type="button"
                    onClick={() => handleApprove(selectedStudent.student.id, 'APPROVED')}
                  >
                    Duyệt tham gia
                  </button>
                  <button 
                    className="student-detail-modal__action-reject"
                    type="button"
                    onClick={() => handleApprove(selectedStudent.student.id, 'REJECTED')}
                  >
                    Từ chối
                  </button>
                </>
              )}
              {selectedStudent.status === 'APPROVED' && (
                <button 
                  className="student-detail-modal__action-danger"
                  type="button"
                  onClick={() => handleKick(selectedStudent.student.id)}
                >
                  Xóa khỏi lớp
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
