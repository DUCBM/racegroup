/**
 * Marathon Squad Hub - Core Types
 * Matches strictly the requested database schema:
 * - Table 'teams': id, user_id, name, passcode, category, captain_name, captain_phone, captain_email, status, created_at
 * - Table 'team_members': id, user_id, team_id, bib_number, full_name, gender, distance, role, joined_at
 * - Table 'marathon_registrations': id, user_id, ho_ten, gioi_tinh, cu_ly, sdt, cccd, created_at
 */

export type TeamCategory = '42km' | '21km';

export type TeamStatus = 'recruiting' | 'completed' | 'locked';

export type MemberGender = 'Nam' | 'Nữ';

export type MemberRole = 'official' | 'reserve';

export interface Team {
  id: string; // UUID Primary Key
  user_id: string; // UUID Foreign Key to auth.users (Captain)
  name: string; // Unique team name
  passcode: string; // Passcode for members to join
  category: TeamCategory; // '42km' | '21km'
  captain_name: string;
  captain_phone: string;
  captain_email: string;
  status: TeamStatus; // 'recruiting' | 'completed' | 'locked'
  created_at: string;
}

export interface TeamMember {
  id: string; // UUID Primary Key
  user_id: string; // UUID Foreign Key to auth.users
  team_id: string; // UUID Foreign Key to teams.id
  bib_number: string | null;
  full_name: string;
  gender: MemberGender; // 'Nam' | 'Nữ'
  distance: string; // e.g. '42km', '21km'
  role: MemberRole; // 'official' | 'reserve'
  joined_at: string;
}

export interface MarathonRegistration {
  id?: number | string;
  user_id: number | string; // Mã đăng ký / user_id
  ho_ten: string; // Họ tên VĐV
  gioi_tinh: MemberGender; // 'Nam' | 'Nữ'
  cu_ly: string; // '42km' | '21km' | etc.
  sdt?: string;
  email?: string;
  cccd?: string;
  so_bib?: string;
  nam_sinh?: string | number;
  created_at?: string;
}

export interface TeamQuotaBreakdown {
  total: number;
  officialCount: number;
  reserveCount: number;

  officialMale: number;
  officialFemale: number;
  reserveMale: number;
  reserveFemale: number;

  // Limits according to Marathon Hard Rules
  maxTotal: 18;
  maxOfficialMale: 10;
  maxOfficialFemale: 5;
  maxReserveMale: 2;
  maxReserveFemale: 1;

  // Available slots
  remOfficialMale: number;
  remOfficialFemale: number;
  remReserveMale: number;
  remReserveFemale: number;
  remTotal: number;

  isFull: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isCaptain?: boolean;
}

export type ActiveScreen = 'directory' | 'create' | 'join';
