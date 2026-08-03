import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { httpClient } from '../../../../shared/lib/httpClient';

type StudentMember = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INVITED';
  joinedAt: string;
  student: {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    phone?: string;
    avatar: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth?: string;
    address?: string;
    createdAt: string;
  };
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'APPROVED': return { label: 'Đã duyệt', color: '#2e7d32', bg: '#e8f5e9' };
    case 'PENDING': return { label: 'Chờ duyệt', color: '#e65100', bg: '#fff3e0' };
    case 'INVITED': return { label: 'Đã mời', color: '#1565c0', bg: '#e3f2fd' };
    case 'REJECTED': return { label: 'Đã từ chối', color: '#c62828', bg: '#ffebee' };
    default: return { label: status, color: 'var(--color-muted)', bg: 'var(--color-surface-soft)' };
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

export function StudentListTab({ classId }: { classId: string }) {
  const [members, setMembers] = useState<StudentMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentMember | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'INVITED'>('ALL');

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await httpClient.get(`/classes/${classId}/members`) as StudentMember[];
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách');
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleApprove = async (studentId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await httpClient.patch(`/classes/${classId}/members/${studentId}/approve`, { status });
      toast.success(status === 'APPROVED' ? 'Đã duyệt học sinh' : 'Đã từ chối học sinh');
      setSelectedStudent(null);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleKick = async (studentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn đuổi học sinh này khỏi lớp?')) return;
    try {
      await httpClient.delete(`/classes/${classId}/members/${studentId}`);
      toast.success('Đã xóa học sinh khỏi lớp');
      setSelectedStudent(null);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const filteredMembers = filter === 'ALL' ? members : members.filter(m => m.status === filter);

  const approvedCount = members.filter(m => m.status === 'APPROVED').length;
  const pendingCount = members.filter(m => m.status === 'PENDING').length;
  const invitedCount = members.filter(m => m.status === 'INVITED').length;

  if (isLoading) {
    return (
      <div className="student-list-loading">
        <span className="material-symbols-outlined student-list-loading__icon">group</span>
        <p>Đang tải danh sách học sinh...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-list-error">
        <span className="material-symbols-outlined">error</span>
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="student-list">
      {/* Summary */}
      <div className="student-list-summary">
        <div className="student-list-summary__item">
          <span className="material-symbols-outlined student-list-summary__icon student-list-summary__icon--total">groups</span>
          <div>
            <span className="student-list-summary__number">{members.length}</span>
            <span className="student-list-summary__label">Tổng cộng</span>
          </div>
        </div>
        <div className="student-list-summary__divider" />
        <div className="student-list-summary__item">
          <span className="material-symbols-outlined student-list-summary__icon student-list-summary__icon--approved">how_to_reg</span>
          <div>
            <span className="student-list-summary__number">{approvedCount}</span>
            <span className="student-list-summary__label">Đã duyệt</span>
          </div>
        </div>
        <div className="student-list-summary__divider" />
        <div className="student-list-summary__item">
          <span className="material-symbols-outlined student-list-summary__icon student-list-summary__icon--pending">pending</span>
          <div>
            <span className="student-list-summary__number">{pendingCount}</span>
            <span className="student-list-summary__label">Chờ duyệt</span>
          </div>
        </div>
        {invitedCount > 0 && (
          <>
            <div className="student-list-summary__divider" />
            <div className="student-list-summary__item">
              <span className="material-symbols-outlined student-list-summary__icon student-list-summary__icon--invited">mail</span>
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
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-muted-soft)' }}>person_off</span>
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
                  src={member.student.avatar}
                  alt={member.student.fullName}
                  className="student-list-item__avatar"
                />
                <div className="student-list-item__info">
                  <span className="student-list-item__name">{member.student.fullName}</span>
                  <span className="student-list-item__email">{member.student.email}</span>
                </div>
                <div className="student-list-item__meta">
                  <span className="student-list-item__joined">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                    {formatDate(member.joinedAt)}
                  </span>
                </div>
                <span
                  className="student-list-item__status"
                  style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                >
                  {statusInfo.label}
                </span>
                <span className="material-symbols-outlined student-list-item__chevron">chevron_right</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Student detail modal */}
      {selectedStudent && (
        <div className="student-detail-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="student-detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
            <button className="student-detail-modal__close" onClick={() => setSelectedStudent(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="student-detail-modal__header">
              <img
                src={selectedStudent.student.avatar}
                alt={selectedStudent.student.fullName}
                className="student-detail-modal__avatar"
              />
              <h2 className="student-detail-modal__name">{selectedStudent.student.fullName}</h2>
              <span className="student-detail-modal__username">@{selectedStudent.student.userName}</span>
              <span
                className="student-detail-modal__status-badge"
                style={{
                  backgroundColor: getStatusInfo(selectedStudent.status).bg,
                  color: getStatusInfo(selectedStudent.status).color,
                }}
              >
                {getStatusInfo(selectedStudent.status).label}
              </span>
            </div>

            <div className="student-detail-modal__body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '24px' }}>
              <div className="student-detail-modal__field" style={{ gridColumn: 'span 2', paddingBottom: '0', borderBottom: 'none' }}>
                <span className="material-symbols-outlined">mail</span>
                <div>
                  <span className="student-detail-modal__field-label">Email</span>
                  <span className="student-detail-modal__field-value">{selectedStudent.student.email}</span>
                </div>
              </div>

              <div className="student-detail-modal__field" style={{ paddingBottom: '0', borderBottom: 'none' }}>
                <span className="material-symbols-outlined">phone</span>
                <div>
                  <span className="student-detail-modal__field-label">Số điện thoại</span>
                  <span className="student-detail-modal__field-value">{selectedStudent.student.phone || '—'}</span>
                </div>
              </div>

              <div className="student-detail-modal__field" style={{ paddingBottom: '0', borderBottom: 'none' }}>
                <span className="material-symbols-outlined">wc</span>
                <div>
                  <span className="student-detail-modal__field-label">Giới tính</span>
                  <span className="student-detail-modal__field-value">{getGenderLabel(selectedStudent.student.gender)}</span>
                </div>
              </div>

              <div className="student-detail-modal__field" style={{ paddingBottom: '0', borderBottom: 'none' }}>
                <span className="material-symbols-outlined">cake</span>
                <div>
                  <span className="student-detail-modal__field-label">Ngày sinh</span>
                  <span className="student-detail-modal__field-value">{formatDate(selectedStudent.student.dateOfBirth)}</span>
                </div>
              </div>

              <div className="student-detail-modal__field" style={{ paddingBottom: '0', borderBottom: 'none' }}>
                <span className="material-symbols-outlined">location_on</span>
                <div>
                  <span className="student-detail-modal__field-label">Địa chỉ</span>
                  <span className="student-detail-modal__field-value">{selectedStudent.student.address || '—'}</span>
                </div>
              </div>

              <div className="student-detail-modal__field" style={{ paddingBottom: '0', borderBottom: 'none' }}>
                <span className="material-symbols-outlined">event</span>
                <div>
                  <span className="student-detail-modal__field-label">Ngày tham gia lớp</span>
                  <span className="student-detail-modal__field-value">{formatDate(selectedStudent.joinedAt)}</span>
                </div>
              </div>

              <div className="student-detail-modal__field" style={{ paddingBottom: '0', borderBottom: 'none' }}>
                <span className="material-symbols-outlined">person_add</span>
                <div>
                  <span className="student-detail-modal__field-label">Ngày đăng ký tài khoản</span>
                  <span className="student-detail-modal__field-value">{formatDate(selectedStudent.student.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="student-detail-modal__actions" style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--color-border)' }}>
              {selectedStudent.status === 'PENDING' && (
                <>
                  <button 
                    onClick={() => handleApprove(selectedStudent.student.id, 'APPROVED')}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#2e7d32', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Duyệt tham gia
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedStudent.student.id, 'REJECTED')}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #c62828', backgroundColor: 'transparent', color: '#c62828', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Từ chối
                  </button>
                </>
              )}
              {selectedStudent.status === 'APPROVED' && (
                <button 
                  onClick={() => handleKick(selectedStudent.student.id)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c62828', backgroundColor: '#ffebee', color: '#c62828', fontWeight: 600, cursor: 'pointer' }}
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
