import { httpClient } from '../../../shared/lib/httpClient';
import type { ClassInviteCandidate, ClassMemberStatus, StudentMember } from '../domain/classMember.types';
import type { ClassMembersRepository } from '../domain/classMembersRepository.port';

export const classMembersApi: ClassMembersRepository = {
  getMembers: (classId: string): Promise<StudentMember[]> => {
    return httpClient.get(`/classes/${classId}/members`) as Promise<StudentMember[]>;
  },

  searchInviteCandidates: (classId: string, query: string): Promise<ClassInviteCandidate[]> => {
    return httpClient.get(`/classes/${classId}/invitable-students`, {
      params: { q: query },
    }) as Promise<ClassInviteCandidate[]>;
  },

  inviteStudent: (classId: string, email: string): Promise<{ message: string }> => {
    return httpClient.post(`/classes/${classId}/invite`, { email }) as Promise<{ message: string }>;
  },

  cancelInvitation: (classId: string, studentId: string): Promise<{ message: string }> => {
    return httpClient.delete(`/classes/${classId}/invitations/${studentId}`) as Promise<{ message: string }>;
  },

  updateMemberStatus: (
    classId: string,
    studentId: string,
    status: Extract<ClassMemberStatus, 'APPROVED' | 'REJECTED'>,
  ): Promise<void> => {
    return httpClient.patch(`/classes/${classId}/members/${studentId}/approve`, { status }) as Promise<void>;
  },

  removeMember: (classId: string, studentId: string): Promise<void> => {
    return httpClient.delete(`/classes/${classId}/members/${studentId}`) as Promise<void>;
  },
};
