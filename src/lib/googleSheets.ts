/**
 * Google Sheets TSV integration service for VnExpress Marathon Admin
 * Real-time synchronization and data lookup based on USER ID
 */

import { MemberGender, TeamCategory, TeamMember } from '../types';
import { parseGender } from '../utils/rules';

export const GOOGLE_SHEET_TSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-yMMEAcHpgTtvSQiMtb9YwzWHBHvCzMlHdAg5aopJX8huQrvSq0uEikTbt-wpS8fgK7YhNP3mxLM7/pub?gid=0&single=true&output=tsv';

export interface SheetRunner {
  matchId: string;
  race: string;
  userId: string;
  fullName: string;
  bibName: string;
  cccd: string;
  phone: string;
  bibNumber: string;
  shirtSize: string;
  finisherShirtSize: string;
  pen: string;
  distance: string; // '42km' | '21km' | '10km' | '5km'
  rawDistance: string;
  gender: MemberGender; // 'Nam' | 'Nữ'
  rawGender: string;
  birthYear: string;
  nationality: string;
  city: string;
  emergencyContact: string;
  emergencyPhone: string;
  authContactName: string;
  authContactPhone: string;
}

export interface MemberValidationResult {
  status: 'matched' | 'distance_mismatch' | 'gender_mismatch' | 'not_found';
  sheetRunner?: SheetRunner;
  warnings: string[];
}

let cachedRunners: Map<string, SheetRunner> | null = null;
let lastFetchTime: Date | null = null;
let fetchPromise: Promise<Map<string, SheetRunner>> | null = null;

function normalizeDistance(raw: string): string {
  const s = (raw || '').trim().toLowerCase();
  if (s.includes('42')) return '42km';
  if (s.includes('21')) return '21km';
  if (s.includes('10')) return '10km';
  if (s.includes('5')) return '5km';
  return raw.trim() || '42km';
}

/**
 * Fetch and parse the Google Sheets TSV file
 */
export async function fetchGoogleSheetRunners(forceRefresh = false): Promise<{
  runners: Map<string, SheetRunner>;
  totalRows: number;
  lastUpdated: Date;
}> {
  if (!forceRefresh && cachedRunners && lastFetchTime) {
    return {
      runners: cachedRunners,
      totalRows: cachedRunners.size,
      lastUpdated: lastFetchTime,
    };
  }

  if (fetchPromise && !forceRefresh) {
    const res = await fetchPromise;
    return {
      runners: res,
      totalRows: res.size,
      lastUpdated: lastFetchTime || new Date(),
    };
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch(GOOGLE_SHEET_TSV_URL, {
        headers: {
          Accept: 'text/tab-separated-values, text/plain, */*',
        },
        cache: forceRefresh ? 'reload' : 'default',
      });

      if (!response.ok) {
        throw new Error(`Không thể tải dữ liệu Google Sheet (HTTP ${response.status})`);
      }

      const text = await response.text();
      const lines = text.split(/\r?\n|\r/);

      if (lines.length === 0) {
        throw new Error('Dữ liệu Google Sheet trống.');
      }

      // Parse header row
      const headerLine = lines[0];
      const headers = headerLine.split('\t').map((h) => h.trim().toUpperCase());

      // Helper to find header column index
      const getColIndex = (...candidates: string[]): number => {
        for (const candidate of candidates) {
          const upper = candidate.toUpperCase();
          const idx = headers.findIndex((h) => h === upper || h.includes(upper));
          if (idx !== -1) return idx;
        }
        return -1;
      };

      const idxMatchId = getColIndex('MATCH ID');
      const idxRace = getColIndex('RACE');
      const idxUserId = getColIndex('USER ID', 'USER_ID');
      const idxHoTen = getColIndex('HO TEN', 'HỌ TÊN', 'NAME');
      const idxTenBib = getColIndex('TEN TREN BIB', 'TÊN TRÊN BIB');
      const idxCccd = getColIndex('CCCD', 'CMND', 'PASSPORT');
      const idxSdt = getColIndex('SDT', 'SĐT', 'PHONE');
      const idxSoBib = getColIndex('SO BIB', 'SỐ BIB', 'BIB');
      const idxSizeAoDau = getColIndex('SIZE AO DAU', 'SIZE ÁO');
      const idxSizeFinisher = getColIndex('SIZE AO FINISHER');
      const idxPen = getColIndex('PEN');
      const idxCuLy = getColIndex('CU LY', 'CỰ LY', 'DISTANCE');
      const idxGioiTinh = getColIndex('GIOI TINH', 'GIỚI TÍNH', 'GENDER');
      const idxNamSinh = getColIndex('NAM SINH', 'NĂM SINH', 'DOB');
      const idxQuocTich = getColIndex('QUOC TICH', 'QUỐC TỊCH');
      const idxTinhThanh = getColIndex('TINH THANH', 'TỈNH THÀNH');
      const idxTenEmergency = getColIndex('TEN LIEN HE KHAN CAP', 'LIÊN HỆ KHẨN CẤP');
      const idxSdtEmergency = getColIndex('SDT LIEN HE KHAN CAP');
      const idxTenUyQuyen = getColIndex('TEN UY QUYEN', 'ỦY QUYỀN');
      const idxSdtUyQuyen = getColIndex('SDT UY QUYEN');

      const runnersMap = new Map<string, SheetRunner>();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split('\t');
        const rawUserId = idxUserId !== -1 ? cols[idxUserId]?.trim() : '';
        if (!rawUserId) continue;

        const rawGender = idxGioiTinh !== -1 ? cols[idxGioiTinh]?.trim() || '' : '';
        const rawDist = idxCuLy !== -1 ? cols[idxCuLy]?.trim() || '' : '';

        const runner: SheetRunner = {
          matchId: idxMatchId !== -1 ? cols[idxMatchId]?.trim() || '' : '',
          race: idxRace !== -1 ? cols[idxRace]?.trim() || '' : '',
          userId: rawUserId,
          fullName: idxHoTen !== -1 ? cols[idxHoTen]?.trim() || '' : '',
          bibName: idxTenBib !== -1 ? cols[idxTenBib]?.trim() || '' : '',
          cccd: idxCccd !== -1 ? cols[idxCccd]?.trim() || '' : '',
          phone: idxSdt !== -1 ? cols[idxSdt]?.trim() || '' : '',
          bibNumber: idxSoBib !== -1 ? cols[idxSoBib]?.trim() || '' : '',
          shirtSize: idxSizeAoDau !== -1 ? cols[idxSizeAoDau]?.trim() || '' : '',
          finisherShirtSize: idxSizeFinisher !== -1 ? cols[idxSizeFinisher]?.trim() || '' : '',
          pen: idxPen !== -1 ? cols[idxPen]?.trim() || '' : '',
          distance: normalizeDistance(rawDist),
          rawDistance: rawDist,
          gender: parseGender(rawGender),
          rawGender: rawGender,
          birthYear: idxNamSinh !== -1 ? cols[idxNamSinh]?.trim() || '' : '',
          nationality: idxQuocTich !== -1 ? cols[idxQuocTich]?.trim() || '' : '',
          city: idxTinhThanh !== -1 ? cols[idxTinhThanh]?.trim() || '' : '',
          emergencyContact: idxTenEmergency !== -1 ? cols[idxTenEmergency]?.trim() || '' : '',
          emergencyPhone: idxSdtEmergency !== -1 ? cols[idxSdtEmergency]?.trim() || '' : '',
          authContactName: idxTenUyQuyen !== -1 ? cols[idxTenUyQuyen]?.trim() || '' : '',
          authContactPhone: idxSdtUyQuyen !== -1 ? cols[idxSdtUyQuyen]?.trim() || '' : '',
        };

        runnersMap.set(rawUserId, runner);
      }

      cachedRunners = runnersMap;
      lastFetchTime = new Date();
      return runnersMap;
    } finally {
      fetchPromise = null;
    }
  })();

  const runners = await fetchPromise;
  return {
    runners,
    totalRows: runners.size,
    lastUpdated: lastFetchTime || new Date(),
  };
}

/**
 * Compare a TeamMember with official Google Sheet data
 */
export function validateMemberWithSheet(
  member: TeamMember,
  sheetRunners: Map<string, SheetRunner>,
  teamCategory: TeamCategory
): MemberValidationResult {
  const userIdKey = (member.user_id || '').trim();
  const runner = sheetRunners.get(userIdKey);

  if (!runner) {
    return {
      status: 'not_found',
      warnings: [`Chưa tìm thấy USER ID "${userIdKey}" trong danh sách đăng ký BTC`],
    };
  }

  const warnings: string[] = [];

  // 1. Kiểm tra cự ly thi đấu:
  // Cự ly của thành viên trong bảng Google Sheet có khớp với cự ly thi đấu của đội không?
  if (runner.distance !== teamCategory) {
    warnings.push(
      `Lệch cự ly: Đội thi đấu ${teamCategory}, nhưng đăng ký BTC là ${runner.distance} (${runner.rawDistance})`
    );
  }

  // 2. Kiểm tra giới tính:
  if (runner.gender !== member.gender) {
    warnings.push(
      `Lệch giới tính: Nhóm xếp là "${member.gender}", nhưng hồ sơ BTC ghi nhận là "${runner.gender}" (${runner.rawGender})`
    );
  }

  if (warnings.length > 0) {
    const isDistMismatch = warnings.some((w) => w.includes('Lệch cự ly'));
    return {
      status: isDistMismatch ? 'distance_mismatch' : 'gender_mismatch',
      sheetRunner: runner,
      warnings,
    };
  }

  return {
    status: 'matched',
    sheetRunner: runner,
    warnings: [],
  };
}
