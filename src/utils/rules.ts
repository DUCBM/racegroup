import { MemberGender, MemberRole, TeamMember, TeamQuotaBreakdown } from '../types';

export const MAX_TOTAL = 18;
export const MAX_OFFICIAL_MALE = 10;
export const MAX_OFFICIAL_FEMALE = 5;
export const MAX_RESERVE_MALE = 2;
export const MAX_RESERVE_FEMALE = 1;

/**
 * Calculates current quota breakdown for a squad of marathon runners
 */
export function calculateQuota(members: TeamMember[]): TeamQuotaBreakdown {
  let officialMale = 0;
  let officialFemale = 0;
  let reserveMale = 0;
  let reserveFemale = 0;

  for (const m of members) {
    if (m.role === 'official') {
      if (m.gender === 'Nam') officialMale++;
      else if (m.gender === 'Nữ') officialFemale++;
    } else if (m.role === 'reserve') {
      if (m.gender === 'Nam') reserveMale++;
      else if (m.gender === 'Nữ') reserveFemale++;
    }
  }

  const officialCount = officialMale + officialFemale;
  const reserveCount = reserveMale + reserveFemale;
  const total = members.length;

  return {
    total,
    officialCount,
    reserveCount,

    officialMale,
    officialFemale,
    reserveMale,
    reserveFemale,

    maxTotal: MAX_TOTAL,
    maxOfficialMale: MAX_OFFICIAL_MALE,
    maxOfficialFemale: MAX_OFFICIAL_FEMALE,
    maxReserveMale: MAX_RESERVE_MALE,
    maxReserveFemale: MAX_RESERVE_FEMALE,

    remOfficialMale: Math.max(0, MAX_OFFICIAL_MALE - officialMale),
    remOfficialFemale: Math.max(0, MAX_OFFICIAL_FEMALE - officialFemale),
    remReserveMale: Math.max(0, MAX_RESERVE_MALE - reserveMale),
    remReserveFemale: Math.max(0, MAX_RESERVE_FEMALE - reserveFemale),
    remTotal: Math.max(0, MAX_TOTAL - total),

    isFull: total >= MAX_TOTAL,
  };
}

/**
 * Strict validation rule check before joining or inserting a member
 */
export function validateSlotAvailability(
  members: TeamMember[],
  gender: MemberGender,
  role: MemberRole
): { valid: boolean; error?: string } {
  const quota = calculateQuota(members);

  if (quota.total >= MAX_TOTAL) {
    return {
      valid: false,
      error: `Đội đã đạt quy mô tối đa 18 thành viên (Đã có ${quota.total}/18). Không thể tiếp nhận thêm VĐV.`,
    };
  }

  if (role === 'official') {
    if (gender === 'Nam') {
      if (quota.officialMale >= MAX_OFFICIAL_MALE) {
        return {
          valid: false,
          error: `Slot Nam chính thức đã đầy (${quota.officialMale}/${MAX_OFFICIAL_MALE}). Vui lòng chọn Slot Dự bị (hiện còn ${quota.remReserveMale} slot Nam dự bị).`,
        };
      }
    } else {
      if (quota.officialFemale >= MAX_OFFICIAL_FEMALE) {
        return {
          valid: false,
          error: `Slot Nữ chính thức đã đầy (${quota.officialFemale}/${MAX_OFFICIAL_FEMALE}). Vui lòng chọn Slot Dự bị (hiện còn ${quota.remReserveFemale} slot Nữ dự bị).`,
        };
      }
    }
  } else {
    // reserve
    if (gender === 'Nam') {
      if (quota.reserveMale >= MAX_RESERVE_MALE) {
        return {
          valid: false,
          error: `Slot Nam dự bị đã đầy (${quota.reserveMale}/${MAX_RESERVE_MALE}).`,
        };
      }
    } else {
      if (quota.reserveFemale >= MAX_RESERVE_FEMALE) {
        return {
          valid: false,
          error: `Slot Nữ dự bị đã đầy (${quota.reserveFemale}/${MAX_RESERVE_FEMALE}).`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Check if a member can switch role (official <-> reserve)
 */
export function canSwitchRole(
  member: TeamMember,
  allMembers: TeamMember[]
): { canSwitch: boolean; targetRole: MemberRole; error?: string } {
  const targetRole: MemberRole = member.role === 'official' ? 'reserve' : 'official';

  // Exclude current member when testing slot in new role
  const otherMembers = allMembers.filter((m) => m.id !== member.id);
  const quota = calculateQuota(otherMembers);

  if (targetRole === 'official') {
    if (member.gender === 'Nam') {
      if (quota.officialMale >= MAX_OFFICIAL_MALE) {
        return {
          canSwitch: false,
          targetRole,
          error: `Không thể nâng lên Chính thức: Đã đủ 10 Nam chính thức.`,
        };
      }
    } else {
      if (quota.officialFemale >= MAX_OFFICIAL_FEMALE) {
        return {
          canSwitch: false,
          targetRole,
          error: `Không thể nâng lên Chính thức: Đã đủ 5 Nữ chính thức.`,
        };
      }
    }
  } else {
    // Switching to reserve
    if (member.gender === 'Nam') {
      if (quota.reserveMale >= MAX_RESERVE_MALE) {
        return {
          canSwitch: false,
          targetRole,
          error: `Không thể hạ xuống Dự bị: Đã đủ 2 Nam dự bị.`,
        };
      }
    } else {
      if (quota.reserveFemale >= MAX_RESERVE_FEMALE) {
        return {
          canSwitch: false,
          targetRole,
          error: `Không thể hạ xuống Dự bị: Đã đủ 1 Nữ dự bị.`,
        };
      }
    }
  }

  return { canSwitch: true, targetRole };
}
