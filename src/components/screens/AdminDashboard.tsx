import React, { useState, useEffect, useMemo } from 'react';
import { Team, TeamMember, TeamCategory } from '../../types';
import {
  fetchGoogleSheetRunners,
  validateMemberWithSheet,
  SheetRunner,
} from '../../lib/googleSheets';
import * as XLSX from 'xlsx';
import { calculateQuota } from '../../utils/rules';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowLeft,
  Flame,
  Phone,
  Mail,
  KeyRound,
  IdCard,
  LogOut,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';
import { AdminLogin } from './AdminLogin';

interface AdminDashboardProps {
  teams: Team[];
  members: TeamMember[];
  onBackToHome: () => void;
  onRefreshData: () => void;
}

export function AdminDashboard({
  teams,
  members,
  onBackToHome,
  onRefreshData,
}: AdminDashboardProps) {
  // Supabase Auth session state
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Google Sheets state
  const [sheetRunners, setSheetRunners] = useState<Map<string, SheetRunner>>(new Map());
  const [loadingSheet, setLoadingSheet] = useState(true);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetRowCount, setSheetRowCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | TeamCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'recruiting'>('all');
  const [selectedWarningFilter, setSelectedWarningFilter] = useState<'all' | 'warnings_only' | 'matched_only'>('all');

  // Expanded teams state
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(new Set());

  // Modal for runner details
  const [selectedRunnerDetail, setSelectedRunnerDetail] = useState<{
    member: TeamMember;
    sheetRunner?: SheetRunner;
    teamName: string;
    teamCategory: TeamCategory;
    warnings: string[];
  } | null>(null);

  // Load Google Sheet TSV
  const loadSheetData = async (force = false) => {
    try {
      setLoadingSheet(true);
      setSheetError(null);
      const result = await fetchGoogleSheetRunners(force);
      setSheetRunners(result.runners);
      setSheetRowCount(result.totalRows);
      setLastSyncTime(result.lastUpdated);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu BTC:', err);
      setSheetError(err.message || 'Không thể kết nối tới dữ liệu đăng ký BTC');
    } finally {
      setLoadingSheet(false);
    }
  };

  useEffect(() => {
    // Check Supabase Auth session
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminUser(session?.user || null);
      setAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user || null);
    });

    loadSheetData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAdminUser(null);
  };

  // Compute team members lookup & analysis
  const teamsWithMembers = useMemo(() => {
    return teams.map((team) => {
      const teamMems = members.filter((m) => m.team_id === team.id);
      const quota = calculateQuota(teamMems);

      // Validate each member against sheet data
      const analyzedMembers = teamMems.map((member) => {
        const validation = validateMemberWithSheet(member, sheetRunners, team.category);
        return {
          ...member,
          validation,
        };
      });

      // Sắp xếp lại: Chính thức lên đầu, dự bị xuống cuối cùng
      analyzedMembers.sort((a, b) => {
        if (a.role === 'official' && b.role !== 'official') return -1;
        if (a.role !== 'official' && b.role === 'official') return 1;
        if (a.gender !== b.gender) {
          return a.gender === 'Nam' ? -1 : 1;
        }
        return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
      });

      const warningCount = analyzedMembers.filter(
        (m) => m.validation.status !== 'matched'
      ).length;

      return {
        ...team,
        members: analyzedMembers,
        quota,
        warningCount,
      };
    });
  }, [teams, members, sheetRunners]);

  // Expand / Collapse all
  const handleToggleExpandAll = () => {
    if (expandedTeamIds.size === teamsWithMembers.length) {
      setExpandedTeamIds(new Set());
    } else {
      setExpandedTeamIds(new Set(teamsWithMembers.map((t) => t.id)));
    }
  };

  const handleToggleTeam = (teamId: string) => {
    const next = new Set(expandedTeamIds);
    if (next.has(teamId)) next.delete(teamId);
    else next.add(teamId);
    setExpandedTeamIds(next);
  };

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teamsWithMembers.filter((team) => {
      // Category filter
      if (selectedCategory !== 'all' && team.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'completed' && team.quota.total < 18) return false;
      if (selectedStatus === 'recruiting' && team.quota.total >= 18) return false;

      // Warning filter
      if (selectedWarningFilter === 'warnings_only' && team.warningCount === 0) return false;
      if (selectedWarningFilter === 'matched_only' && team.warningCount > 0) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchTeamName = team.name.toLowerCase().includes(query);
        const matchCaptain = team.captain_name.toLowerCase().includes(query);
        const matchPhone = team.captain_phone.includes(query);
        const matchPasscode = team.passcode.toLowerCase().includes(query);

        const matchMember = team.members.some((m) => {
          const nameMatch = m.full_name.toLowerCase().includes(query);
          const userMatch = (m.user_id || '').toLowerCase().includes(query);
          const bibMatch = (m.bib_number || '').toLowerCase().includes(query);
          const sheetMatch = m.validation.sheetRunner
            ? m.validation.sheetRunner.fullName.toLowerCase().includes(query) ||
              m.validation.sheetRunner.cccd.includes(query) ||
              m.validation.sheetRunner.phone.includes(query) ||
              m.validation.sheetRunner.bibNumber.includes(query)
            : false;

          return nameMatch || userMatch || bibMatch || sheetMatch;
        });

        if (!matchTeamName && !matchCaptain && !matchPhone && !matchPasscode && !matchMember) {
          return false;
        }
      }

      return true;
    });
  }, [teamsWithMembers, selectedCategory, selectedStatus, selectedWarningFilter, searchTerm]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const teams42km = teams.filter((t) => t.category === '42km').length;
    const teams21km = teams.filter((t) => t.category === '21km').length;
    const totalMembers = members.length;

    let totalWarnings = 0;
    let totalMatched = 0;
    let totalNotFound = 0;

    teamsWithMembers.forEach((t) => {
      t.members.forEach((m) => {
        if (m.validation.status === 'matched') totalMatched++;
        else if (m.validation.status === 'not_found') totalNotFound++;
        else totalWarnings++;
      });
    });

    const completedTeams = teamsWithMembers.filter((t) => t.quota.total >= 18).length;

    return {
      totalTeams,
      teams42km,
      teams21km,
      totalMembers,
      completedTeams,
      totalWarnings,
      totalMatched,
      totalNotFound,
    };
  }, [teams, members, teamsWithMembers]);

  // Export full table to Excel (.xlsx) theo filter Trạng thái
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Tên Đội',
      'Cự Ly Đội',
      'Tên Đội Trưởng',
      'USER ID',
      'Vai Trò',
      'Họ Tên',
      'Giới Tính',
      'Cự Ly',
      'Số BIB',
      'CCCD',
      'Năm Sinh',
      'SĐT VĐV',
      'PEN',
      'Trạng Thái Đối Chiếu',
      'Ghi Chú Cảnh Báo',
    ];

    const dataRows: (string | number)[][] = [headers];
    let count = 1;

    // Xuất theo filter trạng thái (sử dụng filteredTeams)
    filteredTeams.forEach((team) => {
      team.members.forEach((m) => {
        const sheet = m.validation.sheetRunner;
        const statusLabel =
          m.validation.status === 'matched'
            ? 'Khớp dữ liệu'
            : m.validation.status === 'distance_mismatch'
            ? 'LỆCH CỰ LY'
            : m.validation.status === 'gender_mismatch'
            ? 'LỆCH GIỚI TÍNH'
            : 'Chưa có trong dữ liệu BTC';

        dataRows.push([
          count++,
          team.name,
          team.category,
          team.captain_name,
          m.user_id || sheet?.userId || '',
          m.role === 'official' ? 'Chính thức' : 'Dự bị',
          sheet?.fullName || m.full_name || '',
          sheet?.gender || m.gender || '',
          sheet?.distance || team.category,
          sheet?.bibNumber || m.bib_number || '',
          sheet?.cccd || '',
          sheet?.birthYear || '',
          sheet?.phone || '',
          sheet?.pen || '',
          statusLabel,
          m.validation.warnings.join('; '),
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(dataRows);

    // Căn chỉnh độ rộng cột chuẩn Excel
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 28 }, // Tên Đội
      { wch: 12 }, // Cự Ly Đội
      { wch: 24 }, // Tên Đội Trưởng
      { wch: 14 }, // USER ID
      { wch: 14 }, // Vai Trò
      { wch: 26 }, // Họ Tên
      { wch: 10 }, // Giới Tính
      { wch: 10 }, // Cự Ly
      { wch: 12 }, // Số BIB
      { wch: 18 }, // CCCD
      { wch: 14 }, // Năm Sinh
      { wch: 14 }, // SĐT VĐV
      { wch: 10 }, // PEN
      { wch: 24 }, // Trạng Thái Đối Chiếu
      { wch: 35 }, // Ghi Chú Cảnh Báo
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Đồng Đội');

    // Tên file theo bộ lọc trạng thái
    const statusText =
      selectedStatus === 'completed'
        ? '_Du_18_VDV'
        : selectedStatus === 'recruiting'
        ? '_Dang_Tuyen'
        : '_Tat_Ca';

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `VM_Danh_Sach_Dong_Doi${statusText}_${dateStr}.xlsx`);
  };

  // 1. Loading check auth
  if (authChecking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-[#9f224e] flex items-center justify-center mb-4 shadow-2xl">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <p className="text-base font-bold text-slate-800">Đang xác thực quyền Quản trị viên...</p>
        <p className="text-xs text-slate-500 mt-1">Hệ thống đang kiểm tra phiên làm việc bảo mật Supabase Auth</p>
      </div>
    );
  }

  // 2. Not logged in -> Show AdminLogin form
  if (!adminUser) {
    return <AdminLogin onSuccess={(user) => setAdminUser(user)} onBackToHome={onBackToHome} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Khu vực Quản trị Admin
              </span>
              <span className="text-xs text-slate-400">Đường dẫn bảo mật: /admin</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#9f224e]" />
              Quản Trị Nhóm Đua & Đối Chiếu Dữ Liệu BTC
            </h1>
            <p className="text-sm text-slate-300">
              Kiểm tra thông tin chi tiết từng đội, đối chiếu thời gian thực với dữ liệu đăng ký
              marathon chính thức qua USER ID.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                loadSheetData(true);
                onRefreshData();
              }}
              disabled={loadingSheet}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSheet ? 'animate-spin text-[#9f224e]' : ''}`} />
              {loadingSheet ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu BTC'}
            </button>

            <button
              onClick={handleExportExcel}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              title="Xuất file Excel theo bộ lọc trạng thái hiện tại"
            >
              <Download className="w-4 h-4" />
              <span>Xuất File Excel</span>
              {selectedStatus !== 'all' && (
                <span className="text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-white font-normal">
                  {selectedStatus === 'completed' ? 'Đủ 18 VĐV' : 'Đang tuyển'}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[180px] font-semibold text-slate-200" title={adminUser.email || 'Admin'}>
                {adminUser.email || 'Admin'}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-xs font-semibold flex items-center gap-1.5 border border-rose-800/60 transition cursor-pointer"
              title="Đăng xuất khỏi tài khoản Quản trị"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Đăng xuất</span>
            </button>

            <button
              onClick={onBackToHome}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tổng số đội</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalTeams}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.teams42km} đội 42km • {stats.teams21km} đội 21km
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Đội đủ 18 VĐV</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completedTeams}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.totalTeams - stats.completedTeams} đội đang tuyển
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tổng thành viên</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalMembers}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">VĐV đã vào nhóm</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 shadow-sm">
          <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Khớp chuẩn BTC
          </p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.totalMatched}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Đúng cự ly & giới tính</p>
        </div>

        <div
          onClick={() => setSelectedWarningFilter('warnings_only')}
          className={`p-4 rounded-xl border shadow-sm cursor-pointer transition ${
            selectedWarningFilter === 'warnings_only'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400'
              : 'bg-white border-rose-200 hover:border-rose-300'
          }`}
        >
          <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Lệch cự ly / giới tính
          </p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.totalWarnings}</p>
          <p className="text-[11px] text-rose-500 mt-0.5 font-medium">Click để lọc nhanh</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Chưa có trong dữ liệu BTC
          </p>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.totalNotFound}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Cần đối chiếu thêm</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Tên Đội, Tên VĐV, USER ID, Số BIB, CCCD, SĐT, Passcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9f224e] focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Filter Cự ly */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-medium pl-1">Cự ly:</span>
            {(['all', '42km', '21km'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>

          {/* Filter Tình trạng */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-medium pl-1">Trạng thái:</span>
            {(['all', 'completed', 'recruiting'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-[#9f224e] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'Tất cả' : st === 'completed' ? 'Đủ 18 VĐV' : 'Đang tuyển'}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-bar: Warning filter & Expand/Collapse */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Lọc đối chiếu:
            </span>
            <button
              onClick={() => setSelectedWarningFilter('all')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                selectedWarningFilter === 'all'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({teamsWithMembers.length})
            </button>
            <button
              onClick={() => setSelectedWarningFilter('warnings_only')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                selectedWarningFilter === 'warnings_only'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Chỉ đội có cảnh báo ({teamsWithMembers.filter((t) => t.warningCount > 0).length})
            </button>
            <button
              onClick={() => setSelectedWarningFilter('matched_only')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                selectedWarningFilter === 'matched_only'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Đội chuẩn 100% ({teamsWithMembers.filter((t) => t.warningCount === 0).length})
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="text-slate-400">
              Hiển thị: <strong className="text-slate-800">{filteredTeams.length}</strong> / {teams.length} đội
            </span>
            <button
              onClick={handleToggleExpandAll}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer flex items-center gap-1"
            >
              {expandedTeamIds.size === teamsWithMembers.length ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Thu gọn tất cả
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Mở rộng tất cả
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Teams Listing */}
      {filteredTeams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy nhóm phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không có đội đua nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại. Thử xóa bộ lọc để
            xem toàn bộ.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSelectedWarningFilter('all');
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((team, idx) => {
            const isExpanded = expandedTeamIds.has(team.id);
            const isCompleted = team.quota.total >= 18;

            return (
              <div
                key={team.id}
                className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden ${
                  team.warningCount > 0
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Team Accordion Header */}
                <div
                  onClick={() => handleToggleTeam(team.id)}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition select-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                          {team.name}
                        </h2>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            team.category === '42km'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {team.category}
                        </span>

                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đủ 18 VĐV
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            Đang tuyển ({team.quota.total}/18 VĐV)
                          </span>
                        )}

                        {team.warningCount > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            {team.warningCount} cảnh báo lệch dữ liệu
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                            ✓ Dữ liệu chuẩn
                          </span>
                        )}
                      </div>

                      {/* Captain & Passcode Info */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <strong>Đội trưởng:</strong> {team.captain_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {team.captain_phone}
                        </span>
                        {team.captain_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {team.captain_email}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          Passcode: <strong>{team.passcode}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quota Progress & Arrow */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right text-xs">
                      <div className="font-bold text-slate-800">
                        Chính thức:{' '}
                        <span className="text-blue-600">
                          {team.quota.officialMale}/10 Nam
                        </span>{' '}
                        •{' '}
                        <span className="text-rose-600">
                          {team.quota.officialFemale}/5 Nữ
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Dự bị: {team.quota.reserveMale}/2 Nam • {team.quota.reserveFemale}/1 Nữ
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Members Table (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#9f224e]" />
                        Danh sách VĐV trong đội ({team.members.length} thành viên)
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Bấm vào dòng để xem chi tiết đầy đủ hồ sơ BTC
                      </span>
                    </div>

                    {team.members.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">
                        Đội chưa có thành viên nào tham gia.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                              <th className="py-3 px-3 w-10 text-center">STT</th>
                              <th className="py-3 px-3">Vai Trò</th>
                              <th className="py-3 px-3">USER ID</th>
                              <th className="py-3 px-3">Họ Tên</th>
                              <th className="py-3 px-3 text-center">Giới Tính</th>
                              <th className="py-3 px-3 text-center">Cự Ly</th>
                              <th className="py-3 px-3">CCCD</th>
                              <th className="py-3 px-3">Năm Sinh</th>
                              <th className="py-3 px-3">SĐT VĐV</th>
                              <th className="py-3 px-3 text-center">Số BIB</th>
                              <th className="py-3 px-4">Đối Chiếu BTC</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {team.members.map((member, mIdx) => {
                              const val = member.validation;
                              const sheet = val.sheetRunner;
                              const isWarning = val.status !== 'matched';

                              return (
                                <tr
                                  key={member.id}
                                  onClick={() =>
                                    setSelectedRunnerDetail({
                                      member,
                                      sheetRunner: sheet,
                                      teamName: team.name,
                                      teamCategory: team.category,
                                      warnings: val.warnings,
                                    })
                                  }
                                  className={`hover:bg-slate-50 transition cursor-pointer ${
                                    isWarning ? 'bg-rose-50/40' : ''
                                  }`}
                                >
                                  <td className="py-3 px-3 text-center text-slate-400 font-mono">
                                    {mIdx + 1}
                                  </td>

                                  <td className="py-3 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                        member.role === 'official'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-purple-100 text-purple-800'
                                      }`}
                                    >
                                      {member.role === 'official' ? 'Chính thức' : 'Dự bị'}
                                    </span>
                                  </td>

                                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                    {member.user_id ? (
                                      <span className="flex items-center gap-1">
                                        <IdCard className="w-3 h-3 text-slate-400" />
                                        {member.user_id}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic">Chưa có</span>
                                    )}
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-bold text-slate-900">
                                      {member.full_name}
                                    </div>
                                    {sheet && sheet.fullName && sheet.fullName !== member.full_name && (
                                      <div className="text-[11px] text-slate-500">
                                        BTC: <strong>{sheet.fullName}</strong>
                                      </div>
                                    )}
                                    {sheet?.bibName && (
                                      <div className="text-[10px] text-slate-400 italic">
                                        Tên BIB: {sheet.bibName}
                                      </div>
                                    )}
                                  </td>

                                  {/* Giới tính */}
                                  <td className="py-3 px-3 text-center">
                                    <div className="flex flex-col items-center">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                          member.gender === 'Nam'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-rose-50 text-rose-700'
                                        }`}
                                      >
                                        {member.gender}
                                      </span>
                                      {sheet && sheet.gender !== member.gender && (
                                        <span className="text-[10px] font-bold text-rose-600 mt-0.5">
                                          BTC: {sheet.gender} ({sheet.rawGender})
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Cự ly */}
                                  <td className="py-3 px-3 text-center">
                                    <div className="flex flex-col items-center">
                                      <span className="font-bold text-slate-800">
                                        {member.distance}
                                      </span>
                                      {sheet && sheet.distance !== team.category && (
                                        <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-1 rounded mt-0.5">
                                          BTC: {sheet.distance} ({sheet.rawDistance})
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* CCCD */}
                                  <td className="py-3 px-3 font-mono text-slate-600">
                                    {sheet?.cccd || '—'}
                                  </td>

                                  {/* Năm sinh */}
                                  <td className="py-3 px-3 text-slate-600">
                                    {sheet?.birthYear || '—'}
                                  </td>

                                  {/* SĐT */}
                                  <td className="py-3 px-3 font-mono text-slate-700">
                                    {sheet?.phone || '—'}
                                  </td>

                                  {/* Số BIB */}
                                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                                    {sheet?.bibNumber || member.bib_number || 'Chưa gán'}
                                  </td>

                                  {/* Đối chiếu status badge */}
                                  <td className="py-3 px-4">
                                    {val.status === 'matched' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Khớp BTC
                                      </span>
                                    ) : val.status === 'not_found' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                        Chưa có trong dữ liệu BTC
                                      </span>
                                    ) : (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                          LỆCH DỮ LIỆU
                                        </span>
                                        {val.warnings.map((w, wIdx) => (
                                          <div
                                            key={wIdx}
                                            className="text-[10px] text-rose-600 font-medium"
                                          >
                                            • {w}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal for a single Runner (Full Google Sheets row inspection) */}
      {selectedRunnerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-900 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Chi tiết hồ sơ VĐV (Hệ thống BTC)
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {selectedRunnerDetail.member.full_name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Đội: <strong>{selectedRunnerDetail.teamName}</strong> (Cự ly{' '}
                    <strong>{selectedRunnerDetail.teamCategory}</strong>)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRunnerDetail(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Warnings alert if any */}
              {selectedRunnerDetail.warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Cảnh báo đối chiếu:
                  </div>
                  {selectedRunnerDetail.warnings.map((w, idx) => (
                    <div key={idx} className="text-xs pl-5 font-medium">
                      • {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Data comparison grid */}
              {selectedRunnerDetail.sheetRunner ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Toàn bộ thông tin đối chiếu từ hệ thống BTC
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">USER ID</span>
                      <strong className="text-sm font-mono text-slate-900">
                        {selectedRunnerDetail.sheetRunner.userId}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Số BIB</span>
                      <strong className="text-sm font-mono text-amber-700">
                        {selectedRunnerDetail.sheetRunner.bibNumber || 'Chưa gán số'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Họ và Tên</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.fullName}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Tên in trên BIB</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.bibName || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">CCCD / Hộ chiếu</span>
                      <strong className="text-sm font-mono text-slate-900">
                        {selectedRunnerDetail.sheetRunner.cccd || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Số điện thoại</span>
                      <strong className="text-sm font-mono text-slate-900">
                        {selectedRunnerDetail.sheetRunner.phone || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Cự ly đăng ký BTC</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.distance} (Gốc:{' '}
                        {selectedRunnerDetail.sheetRunner.rawDistance})
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Giới tính BTC</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.gender} (Gốc:{' '}
                        {selectedRunnerDetail.sheetRunner.rawGender})
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Năm / Ngày sinh</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.birthYear || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Khu vực xuất phát (PEN)</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.pen || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Size áo thi đấu</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.shirtSize || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Size áo Finisher</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.finisherShirtSize || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Tỉnh thành</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.city || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Quốc tịch</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.nationality || '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-2">
                      <span className="text-[11px] text-slate-400 block">Liên hệ khẩn cấp</span>
                      <strong className="text-sm text-slate-900">
                        {selectedRunnerDetail.sheetRunner.emergencyContact || '—'}{' '}
                        {selectedRunnerDetail.sheetRunner.emergencyPhone
                          ? `(${selectedRunnerDetail.sheetRunner.emergencyPhone})`
                          : ''}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
                  <HelpCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-bold text-amber-900">
                    Không tìm thấy hồ sơ của VĐV trong dữ liệu đăng ký BTC
                  </p>
                  <p className="text-xs text-amber-700">
                    Mã USER ID "{selectedRunnerDetail.member.user_id}" hiện chưa xuất hiện trong danh
                    sách đăng ký của BTC hoặc chưa được cập nhật vào hệ thống.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedRunnerDetail(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
