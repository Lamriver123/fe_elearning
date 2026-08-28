export type ClassMemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INVITED';

export type StudentMember = {
  id: string;
  status: ClassMemberStatus;
  joinedAt: string;
  student: {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    phone?: string;
    avatar?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth?: string;
    address?: string;
    createdAt: string;
  };
};

export type ClassInviteCandidate = {
  id: string;
  fullName: string;
  userName?: string;
  email: string;
  avatar?: string;
};
