import { MarathonRegistration, MemberGender, MemberRole, Team, TeamCategory, TeamMember, TeamStatus, UserSession } from '../types';
import { calculateQuota, canSwitchRole, parseGender, validateSlotAvailability } from '../utils/rules';
import { getSupabaseClient } from './supabase';

const STORAGE_KEY_TEAMS = 'marathon_teams_real_v2';
const STORAGE_KEY_MEMBERS = 'marathon_members_real_v2';
const STORAGE_KEY_USER = 'marathon_current_user_v2';

// Khởi tạo người dùng mặc định không gắn dữ liệu giả
const DEFAULT_USER: UserSession = {
  id: '',
  name: 'VĐV / Đội trưởng',
  email: '',
  phone: '',
  isCaptain: false,
};

// Không dùng dữ liệu mẫu - chỉ dùng dữ liệu thực từ database
const INITIAL_TEAMS: Team[] = [];
const INITIAL_MEMBERS: TeamMember[] = [];

let lastDbError: { code?: string; message: string; table: string } | null = null;

function loadLocalTeams(): Team[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAMS);
    if (!raw) return [];
    const list: Team[] = JSON.parse(raw);
    return list.filter((t) => !t.id.startsWith('team-42k-') && !t.id.startsWith('team-21k-'));
  } catch {
    return [];
  }
}

function saveLocalTeams(teams: Team[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
  } catch (e) {
    console.warn('LocalStorage saveLocalTeams error (likely iframe sandbox):', e);
  }
}

function loadLocalMembers(): TeamMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!raw) return [];
    const list: TeamMember[] = JSON.parse(raw);
    return list
      .filter((m) => !m.id.startsWith('m-'))
      .map((m) => ({ ...m, gender: parseGender(m.gender) }));
  } catch {
    return [];
  }
}

function saveLocalMembers(members: TeamMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.warn('LocalStorage saveLocalMembers error (likely iframe sandbox):', e);
  }
}

// Session management
export function getCurrentUser(): UserSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEFAULT_USER));
      } catch {}
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export function setCurrentUser(user: UserSession) {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('LocalStorage setCurrentUser error (likely iframe sandbox):', e);
  }
}

// Generate random UUID
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const api = {
  /**
   * Tra cứu thông tin VĐV từ bảng marathon_registrations trên Supabase
   */
  async lookupRegistration(regCodeOrUserId: string): Promise<MarathonRegistration | null> {
    const trimmed = regCodeOrUserId.trim();
    if (!trimmed) return null;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const numId = parseInt(trimmed, 10);

        let query = supabase.from('marathon_registrations').select('*');
        if (!isNaN(numId)) {
          query = query.or(`user_id.eq.${numId},id.eq.${numId},sdt.eq.${trimmed},cccd.eq.${trimmed}`);
        } else {
          query = query.or(`sdt.eq.${trimmed},cccd.eq.${trimmed}`);
        }

        const { data, error } = await query.maybeSingle();

        if (!error && data) {
          // Chuẩn hóa giới tính: M/m -> Nam, F/f -> Nữ
          const rawGenderField = data.gioi_tinh ?? data.gender ?? data.sex ?? data.gioitinh ?? '';
          const gender: MemberGender = parseGender(rawGenderField);

          let dist = String(data.cu_ly || data.distance || '').trim();
          if (/42/i.test(dist)) dist = '42km';
          else if (/21/i.test(dist)) dist = '21km';
          else if (/10/i.test(dist)) dist = '10km';
          else if (/5/i.test(dist)) dist = '5km';
          else dist = dist || '42km';

          return {
            id: data.id,
            user_id: data.user_id,
            ho_ten: data.ho_ten || data.full_name || data.name || '',
            gioi_tinh: gender,
            cu_ly: dist,
            sdt: data.sdt || data.phone,
            email: data.email || data.captain_email || '',
            cccd: data.cccd,
            so_bib: data.so_bib || data.bib || data.bib_number,
            nam_sinh: data.nam_sinh || data.birth_year || data.dob,
          };
        }
      } catch (err) {
        console.warn('Supabase lookupRegistration error:', err);
      }
    }

    return null;
  },

  /**
   * Reset local storage
   */
  resetSampleData() {
    try {
      localStorage.removeItem(STORAGE_KEY_TEAMS);
      localStorage.removeItem(STORAGE_KEY_MEMBERS);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
  },

  /**
   * Lấy danh sách tất cả các đội
   */
  async getTeams(): Promise<Team[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as Team[];
        }
      } catch (err) {
        console.warn('Supabase network error:', err);
      }
    }
    return loadLocalTeams().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * Lấy 1 đội theo ID
   */
  async getTeamById(id: string): Promise<Team | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('teams').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return data as Team;
        }
      } catch (e) {
        console.warn('Supabase getTeamById error:', e);
      }
    }
    const teams = loadLocalTeams();
    return teams.find((t) => t.id === id) || null;
  },

  /**
   * Lấy danh sách thành viên của 1 đội
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', teamId)
          .order('joined_at', { ascending: true });
        if (!error && data) {
          return (data as any[]).map((m) => ({
            ...m,
            gender: parseGender(m.gender ?? m.gioi_tinh),
          })) as TeamMember[];
        }
      } catch (e) {
        console.warn('Supabase getTeamMembers error:', e);
      }
    }
    const members = loadLocalMembers();
    return members
      .filter((m) => m.team_id === teamId)
      .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
  },

  /**
   * Lấy tất cả thành viên của toàn bộ các đội
   */
  async getAllMembers(): Promise<TeamMember[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('team_members').select('*');
        if (!error && data) {
          lastDbError = null;
          return (data as any[]).map((m) => ({
            ...m,
            gender: parseGender(m.gender ?? m.gioi_tinh),
          })) as TeamMember[];
        }
        if (error) {
          console.warn('Supabase getAllMembers warning:', error);
          lastDbError = { code: error.code, message: error.message, table: 'team_members' };
        }
      } catch (e: any) {
        console.warn('Supabase getAllMembers error:', e);
        lastDbError = { message: e?.message || 'Lỗi mạng khi tải team_members', table: 'team_members' };
      }
    }
    return loadLocalMembers();
  },

  getLastDbError() {
    return lastDbError;
  },

  /**
   * Tạo Đội mới và tự động thêm Đội trưởng vào bảng team_members
   */
  async createTeam(
    teamInput: {
      name: string;
      passcode: string;
      category: TeamCategory;
      captain_name: string;
      captain_phone: string;
      captain_email: string;
      user_id?: string;
    },
    captainMemberInput: {
      bib_number: string | null;
      gender: MemberGender;
      distance: string;
      role: MemberRole;
      user_id?: string;
    }
  ): Promise<{ team: Team; member: TeamMember }> {
    const currentUser = getCurrentUser();
    const teamId = generateUUID();
    const memberId = generateUUID();
    const now = new Date().toISOString();

    const captainUserId = (teamInput.user_id || captainMemberInput.user_id || currentUser.id || generateUUID()).trim();

    // 1 Vận động viên chỉ được tạo hoặc tham gia 1 đội duy nhất
    const allExistingMembers = await this.getAllMembers();
    const existingMembership = allExistingMembers.find(
      (m) =>
        (m.user_id && String(m.user_id).trim() === captainUserId) ||
        m.full_name.trim().toLowerCase() === teamInput.captain_name.trim().toLowerCase()
    );
    if (existingMembership) {
      const existingTeam = (await this.getTeams()).find((t) => t.id === existingMembership.team_id);
      const teamName = existingTeam ? existingTeam.name : 'đội khác';
      throw new Error(
        `Vận động viên "${teamInput.captain_name}" (Mã: ${captainUserId}) đã tham gia đội "${teamName}". Mỗi VĐV chỉ được tạo hoặc tham gia 1 đội duy nhất!`
      );
    }

    // Kiểm tra trùng tên đội
    const allTeams = await this.getTeams();
    if (allTeams.some((t) => t.name.trim().toLowerCase() === teamInput.name.trim().toLowerCase())) {
      throw new Error(`Tên đội "${teamInput.name}" đã tồn tại! Vui lòng chọn tên khác.`);
    }

    const newTeam: Team = {
      id: teamId,
      user_id: captainUserId,
      name: teamInput.name.trim(),
      passcode: teamInput.passcode.trim(),
      category: teamInput.category,
      captain_name: teamInput.captain_name.trim(),
      captain_phone: teamInput.captain_phone.trim(),
      captain_email: teamInput.captain_email.trim(),
      status: 'recruiting',
      created_at: now,
    };

    const newMember: TeamMember = {
      id: memberId,
      user_id: captainUserId,
      team_id: teamId,
      bib_number: captainMemberInput.bib_number?.trim() || null,
      full_name: `${teamInput.captain_name.trim()} (Đội trưởng)`,
      gender: parseGender(captainMemberInput.gender),
      distance: captainMemberInput.distance || teamInput.category,
      role: captainMemberInput.role,
      joined_at: now,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error: teamErr } = await supabase.from('teams').insert([newTeam]);
      if (teamErr) {
        throw new Error(`Lỗi lưu vào Supabase teams: ${teamErr.message}`);
      }

      const { error: memErr } = await supabase.from('team_members').insert([newMember]);
      if (memErr) {
        throw new Error(`Lỗi lưu Đội trưởng vào team_members: ${memErr.message}`);
      }

      return { team: newTeam, member: newMember };
    }

    // Local DB fallback nếu không có Supabase
    const teams = loadLocalTeams();
    teams.unshift(newTeam);
    saveLocalTeams(teams);

    const members = loadLocalMembers();
    members.push(newMember);
    saveLocalMembers(members);

    return { team: newTeam, member: newMember };
  },

  /**
   * Tham gia đội đua
   */
  async joinTeam(
    arg1:
      | string
      | {
          teamId: string;
          userId?: string;
          fullName: string;
          gender: MemberGender;
          distance: string;
          role: MemberRole;
          bibNumber?: string | null;
          passcode?: string;
        },
    arg2?: string,
    arg3?: {
      full_name: string;
      bib_number?: string | null;
      gender: MemberGender;
      distance: string;
      role: MemberRole;
      user_id?: string;
    }
  ): Promise<TeamMember> {
    let teamId: string;
    let userId: string;
    let fullName: string;
    let gender: MemberGender;
    let distance: string;
    let role: MemberRole;
    let bibNumber: string | null = null;
    let passcode: string | null = null;

    if (typeof arg1 === 'object') {
      teamId = arg1.teamId;
      userId = arg1.userId || generateUUID();
      fullName = arg1.fullName;
      gender = parseGender(arg1.gender);
      distance = arg1.distance;
      role = arg1.role;
      bibNumber = arg1.bibNumber || null;
      passcode = arg1.passcode || null;
    } else {
      teamId = arg1;
      passcode = arg2 || null;
      userId = arg3?.user_id || generateUUID();
      fullName = arg3?.full_name || '';
      gender = parseGender(arg3?.gender || 'Nam');
      distance = arg3?.distance || '42km';
      role = arg3?.role || 'official';
      bibNumber = arg3?.bib_number || null;
    }

    const team = await this.getTeamById(teamId);
    if (!team) {
      throw new Error('Đội đua không tồn tại hoặc đã bị xóa.');
    }

    if (team.status === 'locked') {
      throw new Error('Đội đua này đã bị khóa sổ danh sách thi đấu, không nhận thêm VĐV.');
    }

    if (passcode && passcode.trim().toUpperCase() !== team.passcode.trim().toUpperCase()) {
      throw new Error('Mật khẩu nhóm (Passcode) không chính xác.');
    }

    const currentMembers = await this.getTeamMembers(teamId);

    const quotaCheck = validateSlotAvailability(currentMembers, gender, role);
    if (!quotaCheck.valid) {
      throw new Error(quotaCheck.error);
    }

    // 1 Vận động viên chỉ được tham gia 1 nhóm duy nhất (kiểm tra toàn hệ thống)
    const allMembers = await this.getAllMembers();
    const existingMembership = allMembers.find(
      (m) =>
        (m.user_id && String(m.user_id).trim() === String(userId).trim()) ||
        m.full_name.trim().toLowerCase() === fullName.trim().toLowerCase()
    );
    if (existingMembership) {
      const allTeams = await this.getTeams();
      const existingTeam = allTeams.find((t) => t.id === existingMembership.team_id);
      const tName = existingTeam ? existingTeam.name : 'đội khác';
      throw new Error(
        `Vận động viên "${fullName}" (Mã: ${userId}) đã tham gia đội "${tName}". Mỗi VĐV chỉ được tham gia 1 đội duy nhất!`
      );
    }

    const memberId = generateUUID();
    const newMember: TeamMember = {
      id: memberId,
      user_id: userId,
      team_id: teamId,
      bib_number: bibNumber,
      full_name: fullName.trim(),
      gender,
      distance: distance || team.category,
      role,
      joined_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('team_members').insert([newMember]);
      if (error) {
        throw new Error(`Lỗi Supabase khi lưu thành viên: ${error.message}`);
      }

      if (currentMembers.length + 1 >= 18 && team.status === 'recruiting') {
        await supabase.from('teams').update({ status: 'completed' }).eq('id', teamId);
      }
      return newMember;
    }

    const members = loadLocalMembers();
    members.push(newMember);
    saveLocalMembers(members);

    if (currentMembers.length + 1 >= 18 && team.status === 'recruiting') {
      const teams = loadLocalTeams();
      const t = teams.find((item) => item.id === teamId);
      if (t) {
        t.status = 'completed';
        saveLocalTeams(teams);
      }
    }

    return newMember;
  },

  /**
   * Loại thành viên khỏi đội
   */
  async kickMember(teamId: string, memberId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('team_members').delete().eq('id', memberId);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase kickMember error:', e);
      }
    }
    const members = loadLocalMembers();
    const filtered = members.filter((m) => m.id !== memberId);
    saveLocalMembers(filtered);

    const remaining = filtered.filter((m) => m.team_id === teamId);
    if (remaining.length < 18) {
      const teams = loadLocalTeams();
      const t = teams.find((item) => item.id === teamId);
      if (t && t.status === 'completed') {
        t.status = 'recruiting';
        saveLocalTeams(teams);
      }
    }

    return true;
  },

  /**
   * Đổi vai trò chính thức <-> dự bị
   */
  async toggleMemberRole(teamId: string, memberId: string): Promise<TeamMember> {
    const members = await this.getTeamMembers(teamId);
    const target = members.find((m) => m.id === memberId);
    if (!target) throw new Error('Không tìm thấy thông tin thành viên.');

    const check = canSwitchRole(target, members);
    if (!check.canSwitch) {
      throw new Error(check.error || 'Không thể chuyển đổi vai trò do quy định giới hạn slot.');
    }

    const newRole = check.targetRole;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .update({ role: newRole })
          .eq('id', memberId)
          .select()
          .single();
        if (!error && data) return data as TeamMember;
      } catch (e) {
        console.warn('Supabase toggleMemberRole error:', e);
      }
    }

    const allMembers = loadLocalMembers();
    const m = allMembers.find((item) => item.id === memberId);
    if (m) {
      m.role = newRole;
      saveLocalMembers(allMembers);
      return m;
    }
    target.role = newRole;
    return target;
  },

  /**
   * Cập nhật trạng thái đội
   */
  async updateTeamStatus(teamId: string, status: TeamStatus): Promise<Team> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .update({ status })
          .eq('id', teamId)
          .select()
          .single();
        if (!error && data) return data as Team;
      } catch (e) {
        console.warn('Supabase updateTeamStatus error:', e);
      }
    }

    const teams = loadLocalTeams();
    const t = teams.find((item) => item.id === teamId);
    if (!t) throw new Error('Đội không tồn tại.');
    t.status = status;
    saveLocalTeams(teams);
    return t;
  },
};
