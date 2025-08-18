export interface User {
  id: string;
  email: string;
  name: string;
}

export type Option = {
  id?: string;
  text: string;
  votes?: number;
  _id?: string;
};

export interface AccreditedVoter {
  phoneNumber: string;
  name: string;
  hasVoted: boolean;
  otpVerified: boolean;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  options: Option[];
  deadline: string;
  roomId: string;
  tallies?: number[];
  totalVotes: number;
  isExpired: boolean;
  creatorEmail?: string;
  voters?: string[];
  requireAccreditation?: boolean;
  accreditedVoters?: AccreditedVoter[];
  maxVoters?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  firstLaunch?: boolean;
  resetFirstLaunch?: () => void;
}

export interface CreateRoomData {
  title: string;
  description: string;
  options: string[];
  deadline: string;
  requireAccreditation?: boolean;
  accreditedVoters?: { name: string; phoneNumber: string }[];
}