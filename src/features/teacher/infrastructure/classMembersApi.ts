import { httpClient } from '../../../shared/lib/httpClient';
import type { ClassMemberStatus, StudentMember } from '../domain/classMember.types';
import type { ClassMembersRepository } from '../domain/classMembersRepository.port';

export const classMembersApi: ClassMembersRepository = {
  getMembers: (classId: string): Promise<StudentMember[]> => {
    return httpClient.get(`/classes/${classId}/members`) as Promise<StudentMember[]>;
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
