import React, { useState } from 'react';
import { Team, TeamMember, TeamCategory, TeamStatus, ActiveScreen } from '../../types';
import { calculateQuota } from '../../utils/rules';
import { api } from '../../lib/database';
import {
  Trophy,
  Users,
  Search,
  PlusCircle,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

interface TeamDirectoryProps {
  teams: Team[];
  members: TeamMember[];
  onSelectTeam: (team: Team) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const TeamDirectory: React.FC<TeamDirectoryProps> = ({
  teams,
  members,
  onSelectTeam,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TeamCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TeamStatus>('all');
  const [copiedSql, setCopiedSql] = useState(false);
  const dbError = api.getLastDbError();

  const sqlFix = `GRANT ALL ON TABLE public.teams TO anon, authenticated;
GRANT ALL ON TABLE public.team_members TO anon, authenticated;
GRANT ALL ON TABLE public.marathon_registrations TO anon, authenticated;

ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marathon_registrations DISABLE ROW LEVEL SECURITY;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlFix);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Thống kê tổng hợp
  const totalAthletes = members.length;
  const count42k = teams.filter((t) => t.category === '42km').length;
  const count21k = teams.filter((t) => t.category === '21km').length;

  // Lọc danh sách đội
  const filteredTeams = teams.filter((team) => {
    const matchSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.captain_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || team.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || team.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Editorial Header - Typo đẹp, không cần ảnh cover */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9f224e] bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9f224e]" />
              VnExpress Marathon • Thể Thức Đồng Đội
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Quản Lý Nhóm Đua Đồng Đội
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Theo dõi và quản lý chỉ tiêu 18 thành viên: 15 Chính thức (10 Nam + 5 Nữ) và 3 Dự bị (2 Nam + 1 Nữ) cho cự ly 42km & 21km.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('create')}
              className="px-5 py-2.5 rounded-lg bg-[#9f224e] hover:bg-[#851c41] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo nhóm mới</span>
            </button>
            <button
              onClick={() => onNavigate('join')}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-[#9f224e]" />
              <span>Gia nhập nhóm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cảnh báo Supabase nếu bảng team_members bị chặn quyền SELECT */}
      {dbError && dbError.code === '42501' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Supabase đang chặn quyền đọc bảng team_members (Mã lỗi 42501: Permission Denied)</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Dữ liệu thành viên trong bảng <strong>team_members</strong> đã được lưu thành công, nhưng quyền đọc (SELECT) của tài khoản web (role <code>anon</code>) chưa được cấp trên PostgreSQL. Do đó các thẻ nhóm hiện chưa lấy được số VĐV để thống kê.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-lg border border-amber-200">
            <span className="font-semibold text-amber-950">
              Hãy vào <strong>Supabase &gt; SQL Editor</strong> và chạy lệnh SQL cấp quyền:
            </span>
            <button
              onClick={handleCopySql}
              className="px-3.5 py-1.5 rounded-lg bg-[#9f224e] hover:bg-[#851c41] text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-xs shrink-0 transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã sao chép SQL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép lệnh SQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4 Thẻ KPI Sáng sủa */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tổng số đội đua
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5 font-mono">
            {teams.length}
            <span className="text-xs font-normal text-slate-400 font-sans">đội</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Hạng mục 42KM
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#9f224e] mt-1 flex items-baseline gap-1.5 font-mono">
            {count42k}
            <span className="text-xs font-normal text-slate-400 font-sans">đội</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Hạng mục 21KM
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 flex items-baseline gap-1.5 font-mono">
            {count21k}
            <span className="text-xs font-normal text-slate-400 font-sans">đội</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tổng VĐV đã tham gia
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 flex items-baseline gap-1.5 font-mono">
            {totalAthletes}
            <span className="text-xs font-normal text-slate-400 font-sans">chân chạy</span>
          </div>
        </div>
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc - Nền trắng sáng */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên đội hoặc họ tên đội trưởng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9f224e] focus:bg-white"
          />
        </div>

        {/* Bộ lọc cự ly & trạng thái */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs Cự ly */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                categoryFilter === 'all'
                  ? 'bg-white text-[#9f224e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả cự ly
            </button>
            <button
              onClick={() => setCategoryFilter('42km')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                categoryFilter === '42km'
                  ? 'bg-[#9f224e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              42KM
            </button>
            <button
              onClick={() => setCategoryFilter('21km')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                categoryFilter === '21km'
                  ? 'bg-[#9f224e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              21KM
            </button>
          </div>

          {/* Chọn trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-[#9f224e] font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="recruiting">Đang gom quân</option>
            <option value="completed">Đủ 18 người</option>
            <option value="locked">Đã khóa sổ</option>
          </select>
        </div>
      </div>

      {/* Danh sách các đội đua - Box màu trắng, viền thanh nhã */}
      {filteredTeams.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Chưa có đội đua nào phù hợp
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hãy bấm "Tạo nhóm mới" để khởi tạo đội đua đầu tiên cho giải!
          </p>
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#9f224e] hover:bg-[#851c41] text-white text-xs font-bold uppercase tracking-wider"
          >
            <PlusCircle className="w-4 h-4" /> Tạo nhóm ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredTeams.map((team) => {
            const teamMembers = members.filter((m) => m.team_id === team.id);
            const quota = calculateQuota(teamMembers);

            const getStatusBadge = () => {
              switch (team.status) {
                case 'recruiting':
                  return (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đang gom quân
                    </span>
                  );
                case 'completed':
                  return (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      Đủ 18 người
                    </span>
                  );
                case 'locked':
                  return (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 border border-slate-300 text-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Đã khóa sổ
                    </span>
                  );
              }
            };

            return (
              <div
                key={team.id}
                onClick={() => onSelectTeam(team)}
                className="group relative rounded-xl bg-white border border-slate-200 hover:border-[#9f224e]/50 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Cự ly & Trạng thái */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-[#9f224e] text-white">
                      {team.category}
                    </span>
                    {getStatusBadge()}
                  </div>

                  {/* Tên Đội & Đội trưởng */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#9f224e] transition-colors line-clamp-1">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span>Đội trưởng:</span>{' '}
                      <strong className="text-slate-800">{team.captain_name}</strong>
                    </p>
                  </div>

                  {/* Tiến độ số lượng 18 VĐV */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#9f224e]" /> Tiến độ thành viên:
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {quota.total}
                        <span className="text-xs text-slate-400 font-normal">/18 VĐV</span>
                      </span>
                    </div>

                    {/* Thanh tiến độ */}
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(quota.officialMale / 18) * 100}%` }}
                        className="bg-blue-600 h-full"
                        title={`Nam chính thức: ${quota.officialMale}/10`}
                      />
                      <div
                        style={{ width: `${(quota.officialFemale / 18) * 100}%` }}
                        className="bg-rose-500 h-full"
                        title={`Nữ chính thức: ${quota.officialFemale}/5`}
                      />
                      <div
                        style={{ width: `${(quota.reserveMale / 18) * 100}%` }}
                        className="bg-sky-400 h-full"
                        title={`Nam dự bị: ${quota.reserveMale}/2`}
                      />
                      <div
                        style={{ width: `${(quota.reserveFemale / 18) * 100}%` }}
                        className="bg-pink-400 h-full"
                        title={`Nữ dự bị: ${quota.reserveFemale}/1`}
                      />
                    </div>

                    {/* Chi tiết Chính thức & Dự bị */}
                    <div className="grid grid-cols-2 gap-1 text-[11px] pt-0.5 text-slate-500">
                      <div>
                        Chính thức:{' '}
                        <span className="font-mono font-semibold text-slate-800">
                          {quota.officialCount}/15
                        </span>
                      </div>
                      <div className="text-right">
                        Dự bị:{' '}
                        <span className="font-mono font-semibold text-slate-800">
                          {quota.reserveCount}/3
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer thẻ */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#9f224e] transition-colors">
                  <span>Chi tiết đội hình</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#9f224e]" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
