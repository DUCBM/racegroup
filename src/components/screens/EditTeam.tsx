import React, { useState, useEffect } from 'react';
import { Team, TeamMember, UserSession, TeamStatus, MemberRole } from '../../types';
import { calculateQuota, canSwitchRole } from '../../utils/rules';
import { api } from '../../lib/database';
import {
  ArrowLeft,
  Key,
  FileCheck2,
  Lock,
  Unlock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
  ArrowUp,
  ArrowDown,
  UserMinus,
  Trophy,
  Loader2,
  Info,
  Phone,
  UserPlus,
  RefreshCw,
  Edit3,
} from 'lucide-react';

interface EditTeamProps {
  teams: Team[];
  members: TeamMember[];
  currentUser: UserSession;
  initialTeamId?: string;
  onCancel: () => void;
  onRefreshData?: () => Promise<void> | void;
  onNavigateToJoin?: (teamId: string) => void;
}

export const EditTeam: React.FC<EditTeamProps> = ({
  teams,
  members,
  currentUser,
  initialTeamId,
  onCancel,
  onRefreshData,
  onNavigateToJoin,
}) => {
  // Chọn đội cần chỉnh sửa
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    initialTeamId || (teams[0] ? teams[0].id : '')
  );

  // Trạng thái xác thực Đội trưởng
  const [regCode, setRegCode] = useState(currentUser.id || '');
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Quản lý thành viên
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'official' | 'reserve'>('all');

  // Modal xác nhận loại thành viên
  const [memberToKick, setMemberToKick] = useState<TeamMember | null>(null);

  const currentTeam = teams.find((t) => t.id === selectedTeamId);
  const currentTeamMembers = members.filter((m) => m.team_id === selectedTeamId);
  const quota = calculateQuota(currentTeamMembers);

  // Tự động reset xác thực khi đổi nhóm
  useEffect(() => {
    setIsAuthenticated(false);
    setPasscode('');
    setAuthError(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [selectedTeamId]);

  // Xử lý xác thực Đội trưởng khi truy cập trang chỉnh sửa
  const handleVerifyAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!currentTeam) {
      setAuthError('Không tìm thấy thông tin nhóm đua.');
      return;
    }

    const trimmedPass = passcode.trim();
    const trimmedReg = regCode.trim();

    if (!trimmedReg) {
      setAuthError('Vui lòng nhập Mã đăng ký VĐV của Đội trưởng.');
      return;
    }

    if (!trimmedPass) {
      setAuthError('Vui lòng nhập Mật khẩu nhóm (Passcode).');
      return;
    }

    // 1. Kiểm tra mật khẩu nhóm
    if (trimmedPass.toUpperCase() !== currentTeam.passcode.trim().toUpperCase()) {
      setAuthError('Mật khẩu nhóm (Passcode) không chính xác.');
      return;
    }

    setIsVerifying(true);
    try {
      // 2. Kiểm tra mã đăng ký VĐV có khớp Đội trưởng không:
      // - Khớp trực tiếp user_id của team
      // - Khớp user_id của currentUser nếu currentUser là Đội trưởng
      // - Khớp SĐT Đội trưởng
      // - Hoặc tra cứu bảng marathon_registrations xem họ tên/user_id có khớp với Đội trưởng không
      let isCaptainMatch = false;

      if (
        trimmedReg === currentTeam.user_id ||
        trimmedReg === currentTeam.captain_phone ||
        (currentUser.id && trimmedReg === currentUser.id && currentUser.id === currentTeam.user_id)
      ) {
        isCaptainMatch = true;
      } else {
        // Tra cứu trong database đăng ký
        const regInfo = await api.lookupRegistration(trimmedReg);
        if (regInfo) {
          const regName = regInfo.ho_ten.trim().toLowerCase();
          const capName = currentTeam.captain_name.trim().toLowerCase();
          if (
            regName === capName ||
            String(regInfo.user_id) === String(currentTeam.user_id) ||
            (regInfo.sdt && regInfo.sdt === currentTeam.captain_phone)
          ) {
            isCaptainMatch = true;
          }
        }
      }

      if (!isCaptainMatch) {
        setAuthError(
          `Mã đăng ký "${trimmedReg}" không khớp với Đội trưởng "${currentTeam.captain_name}". Chỉ Đội trưởng mới có quyền truy cập trang Chỉnh sửa nhóm.`
        );
        return;
      }

      // Xác thực thành công
      setIsAuthenticated(true);
      setSuccessMsg(`Chào mừng Đội trưởng ${currentTeam.captain_name}! Bạn đã mở quyền chỉnh sửa nhóm "${currentTeam.name}".`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setAuthError(err.message || 'Lỗi khi xác thực quyền Đội trưởng.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Nâng / hạ vai trò thành viên theo đúng điều lệ
  const handleToggleMemberRole = async (member: TeamMember) => {
    if (!currentTeam) return;

    // Kiểm tra tính hợp lệ theo quy chế thể lệ
    const check = canSwitchRole(member, currentTeamMembers);
    if (!check.canSwitch) {
      setErrorMsg(check.error || 'Không thể chuyển đổi vai trò do quy định giới hạn slot.');
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }

    try {
      setProcessingMemberId(member.id);
      setErrorMsg(null);
      const updated = await api.toggleMemberRole(currentTeam.id, member.id);
      const roleText = updated.role === 'official' ? 'Chính thức' : 'Dự bị';
      setSuccessMsg(
        `Thành công: Đã chuyển VĐV "${member.full_name}" sang đội hình ${roleText} theo đúng điều lệ giải.`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      if (onRefreshData) await onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi chuyển đổi vai trò VĐV.');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setProcessingMemberId(null);
    }
  };

  // Loại VĐV khỏi nhóm
  const handleConfirmKick = async () => {
    if (!memberToKick || !currentTeam) return;

    try {
      setProcessingMemberId(memberToKick.id);
      setErrorMsg(null);
      await api.kickMember(currentTeam.id, memberToKick.id);
      setSuccessMsg(`Đã loại VĐV "${memberToKick.full_name}" khỏi danh sách đội "${currentTeam.name}".`);
      setMemberToKick(null);
      setTimeout(() => setSuccessMsg(null), 4000);
      if (onRefreshData) await onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi loại VĐV.');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setProcessingMemberId(null);
    }
  };

  // Thay đổi trạng thái nhóm
  const handleUpdateStatus = async (newStatus: TeamStatus) => {
    if (!currentTeam) return;
    try {
      setStatusLoading(true);
      setErrorMsg(null);
      await api.updateTeamStatus(currentTeam.id, newStatus);
      const label =
        newStatus === 'recruiting'
          ? 'Đang gom quân'
          : newStatus === 'completed'
          ? 'Đã đủ 18 người'
          : 'Đã khóa sổ';
      setSuccessMsg(`Đã cập nhật trạng thái nhóm thành "${label}".`);
      setTimeout(() => setSuccessMsg(null), 3000);
      if (onRefreshData) await onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi cập nhật trạng thái nhóm.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Lọc thành viên theo tab
  const filteredMembers = currentTeamMembers.filter((m) => {
    if (activeTab === 'official') return m.role === 'official';
    if (activeTab === 'reserve') return m.role === 'reserve';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Thanh điều hướng quay lại */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#9f224e] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách đội</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
          Trang Chỉnh Sửa Nhóm
        </span>
      </div>

      {/* Thông báo phản hồi toàn trang */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* MÀN HÌNH 1: YÊU CẦU NHẬP MÃ ĐĂNG KÝ VÀ PASS NHÓM (AUTHENTICATION GATE) */}
      {!isAuthenticated ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header xác thực */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-linear-to-r from-slate-50 to-amber-50/40">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-md border border-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Xác Thực Quyền Đội Trưởng
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Chỉnh Sửa & Quản Trị Đội Hình
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Để bảo vệ quyền lợi và đội hình thi đấu, hệ thống yêu cầu xác minh <strong>Mã đăng ký VĐV (Đội trưởng)</strong> và <strong>Mật khẩu nhóm (Passcode)</strong> trước khi cho phép nâng/hạ vai trò hoặc loại VĐV.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyAuth} className="p-6 sm:p-8 space-y-6">
            {authError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-rose-950">Không thể xác thực</div>
                  <div className="leading-relaxed">{authError}</div>
                </div>
              </div>
            )}

            <div className="space-y-4 max-w-xl">
              {/* Chọn nhóm đua */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  1. Chọn nhóm đua cần chỉnh sửa <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#9f224e] focus:bg-white"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category}) — Đội trưởng: {t.captain_name}
                    </option>
                  ))}
                </select>
              </div>

              {currentTeam && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Đội: <strong>{currentTeam.name}</strong> ({currentTeam.category})
                    </span>
                    <span className="text-[#9f224e] font-bold">
                      {quota.total}/18 VĐV
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4">
                    <span>Đội trưởng: <strong>{currentTeam.captain_name}</strong></span>
                    {currentTeam.captain_phone && <span>SĐT: {currentTeam.captain_phone}</span>}
                  </div>
                </div>
              )}

              {/* Mã đăng ký VĐV của Đội trưởng */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  2. Mã đăng ký VĐV của Đội trưởng (user_id / SĐT) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã đăng ký cá nhân của Đội trưởng"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#9f224e] focus:bg-white"
                  />
                  <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Mã bạn nhận được tại email xác nhận đăng ký giải thành công (hoặc SĐT đã đăng ký Đội trưởng).
                </p>
              </div>

              {/* Mật khẩu nhóm (Passcode) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  3. Mật khẩu nhóm (Passcode) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nhập passcode của nhóm"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono tracking-wider uppercase text-slate-900 focus:outline-none focus:border-[#9f224e] focus:bg-white"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Mật khẩu do Đội trưởng thiết lập khi tạo nhóm đua ban đầu.
                </p>
              </div>
            </div>

            {/* Nút gửi xác thực */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isVerifying || !passcode.trim() || !regCode.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#9f224e] hover:bg-[#851c41] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Xác nhận & Mở quyền chỉnh sửa</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* MÀN HÌNH 2: KHÔNG GIAN QUẢN TRỊ & CHỈNH SỬA ĐỘI HÌNH ĐÃ XÁC THỰC */
        <div className="space-y-6">
          {/* Header Thông tin Nhóm & Trạng thái */}
          {currentTeam && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#9f224e] text-white">
                      {currentTeam.category}
                    </span>

                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-amber-50 border-amber-300 text-amber-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      Quyền Đội trưởng: {currentTeam.captain_name}
                    </span>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        currentTeam.status === 'recruiting'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : currentTeam.status === 'completed'
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      {currentTeam.status === 'recruiting'
                        ? 'Đang gom quân'
                        : currentTeam.status === 'completed'
                        ? 'Đủ 18 người'
                        : 'Đã khóa sổ'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {currentTeam.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500 pt-0.5">
                    {currentTeam.captain_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> SĐT: {currentTeam.captain_phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <Key className="w-3 h-3 text-slate-400" /> Passcode: {currentTeam.passcode}
                    </span>
                  </div>
                </div>

                {/* Các nút hành động quản lý nhóm */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {onNavigateToJoin && currentTeam.status === 'recruiting' && quota.total < 18 && (
                    <button
                      onClick={() => onNavigateToJoin(currentTeam.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#9f224e] hover:bg-[#851c41] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Thêm VĐV</span>
                    </button>
                  )}

                  {/* Toggle Trạng thái Khóa sổ / Mở gom quân */}
                  {currentTeam.status === 'recruiting' ? (
                    <button
                      onClick={() => handleUpdateStatus('locked')}
                      disabled={statusLoading}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors border border-slate-300"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                      <span>Khóa sổ</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus('recruiting')}
                      disabled={statusLoading}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Mở gom quân</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Khóa lại phiên chỉnh sửa"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Khóa phiên</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BẢNG CHỈ TIÊU & ĐIỀU LỆ THI ĐẤU (STRICT RULE BREAKDOWN) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#9f224e]" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                  Chỉ Tiêu Cơ Cấu 18 Vận Động Viên Theo Điều Lệ
                </h3>
              </div>
              <div className="text-xs font-semibold text-slate-600">
                Tổng quân số:{' '}
                <span className="font-mono text-base font-black text-[#9f224e]">{quota.total}</span>
                <span className="text-slate-400">/18 VĐV</span>
              </div>
            </div>

            {/* 4 Thẻ Quota chi tiết */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="text-xs font-semibold text-blue-900">Nam chính thức</div>
                <div className="text-xl font-black text-blue-950 font-mono mt-0.5">
                  {quota.officialMale}
                  <span className="text-xs font-medium text-blue-600">/10</span>
                </div>
                <div className="text-[11px] font-semibold text-blue-700 mt-1">
                  {quota.officialMale >= 10 ? '✓ Đã đủ 10 slot' : `Còn ${quota.remOfficialMale} suất trống`}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <div className="text-xs font-semibold text-rose-900">Nữ chính thức</div>
                <div className="text-xl font-black text-rose-950 font-mono mt-0.5">
                  {quota.officialFemale}
                  <span className="text-xs font-medium text-rose-600">/5</span>
                </div>
                <div className="text-[11px] font-semibold text-rose-700 mt-1">
                  {quota.officialFemale >= 5 ? '✓ Đã đủ 5 slot' : `Còn ${quota.remOfficialFemale} suất trống`}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200">
                <div className="text-xs font-semibold text-sky-900">Nam dự bị</div>
                <div className="text-xl font-black text-sky-950 font-mono mt-0.5">
                  {quota.reserveMale}
                  <span className="text-xs font-medium text-sky-600">/2</span>
                </div>
                <div className="text-[11px] font-semibold text-sky-700 mt-1">
                  {quota.reserveMale >= 2 ? '✓ Đã đủ 2 slot' : `Còn ${quota.remReserveMale} suất trống`}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-pink-50/70 border border-pink-200">
                <div className="text-xs font-semibold text-pink-900">Nữ dự bị</div>
                <div className="text-xl font-black text-pink-950 font-mono mt-0.5">
                  {quota.reserveFemale}
                  <span className="text-xs font-medium text-pink-600">/1</span>
                </div>
                <div className="text-[11px] font-semibold text-pink-700 mt-1">
                  {quota.reserveFemale >= 1 ? '✓ Đã đủ 1 slot' : `Còn ${quota.remReserveFemale} suất trống`}
                </div>
              </div>
            </div>

            {/* Thanh tiến độ đa màu */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
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

            {/* Chú thích điều lệ */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#9f224e] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Quy chế điều lệ chuyển vai trò:</strong> VĐV chỉ được nâng từ Dự bị lên Chính thức nếu suất chính thức tương ứng (10 Nam / 5 Nữ) chưa đầy. Ngược lại, chỉ được chuyển xuống Dự bị nếu suất dự bị tương ứng (2 Nam / 1 Nữ) còn trống.
              </div>
            </div>
          </div>

          {/* BẢNG QUẢN LÝ THÀNH VIÊN: NÂNG/HẠ VAI TRÒ & LOẠI VĐV */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9f224e]" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                  Danh Sách VĐV Trong Nhóm ({currentTeamMembers.length}/18)
                </h3>
              </div>

              {/* Tabs lọc */}
              <div className="flex items-center p-1 bg-slate-200/70 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({currentTeamMembers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('official')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'official'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chính thức ({quota.officialCount}/15)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reserve')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'reserve'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dự bị ({quota.reserveCount}/3)
                </button>
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p>Không có VĐV nào trong danh mục này.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Giới tính</th>
                      <th className="py-3 px-4">Cự ly</th>
                      <th className="py-3 px-4">Số BIB</th>
                      <th className="py-3 px-4">Vai trò hiện tại</th>
                      <th className="py-3 px-4 text-center">Nâng / Hạ vai trò</th>
                      <th className="py-3 px-4 text-right">Loại VĐV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredMembers.map((m, idx) => {
                      const isCaptainOfTeam = (currentTeam && m.user_id === currentTeam.user_id) || m.full_name.includes('Đội trưởng');
                      const switchRule = canSwitchRole(m, currentTeamMembers);
                      const isProcessing = processingMemberId === m.id;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{m.full_name}</span>
                              {isCaptainOfTeam && (
                                <span className="text-[10px] text-[#9f224e] font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                  Đội trưởng
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Mã VĐV: {m.user_id || m.id.slice(0, 8)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                                m.gender === 'Nam'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {m.gender}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">{m.distance}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {m.bib_number || <span className="text-slate-300">Chưa có</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                                m.role === 'official'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {m.role === 'official' ? 'Chính thức' : 'Dự bị'}
                            </span>
                          </td>

                          {/* Cột Nâng / Hạ vai trò theo Điều lệ */}
                          <td className="py-3 px-4 text-center">
                            {m.role === 'reserve' ? (
                              // Đang là dự bị -> Nút nâng lên Chính thức
                              <button
                                type="button"
                                onClick={() => handleToggleMemberRole(m)}
                                disabled={isProcessing || !switchRule.canSwitch}
                                title={
                                  switchRule.canSwitch
                                    ? 'Nâng lên đội hình Chính thức'
                                    : switchRule.error
                                }
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                                  switchRule.canSwitch
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 active:scale-95'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                                }`}
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ArrowUp className="w-3 h-3 text-emerald-600" />
                                )}
                                <span>Nâng Chính thức</span>
                              </button>
                            ) : (
                              // Đang là chính thức -> Nút hạ xuống Dự bị
                              <button
                                type="button"
                                onClick={() => handleToggleMemberRole(m)}
                                disabled={isProcessing || !switchRule.canSwitch}
                                title={
                                  switchRule.canSwitch
                                    ? 'Chuyển sang đội hình Dự bị'
                                    : switchRule.error
                                }
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                                  switchRule.canSwitch
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 active:scale-95'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                                }`}
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-amber-600" />
                                )}
                                <span>Hạ Dự bị</span>
                              </button>
                            )}

                            {/* Cảnh báo ngắn nếu không thể chuyển */}
                            {!switchRule.canSwitch && (
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px] mx-auto" title={switchRule.error}>
                                {switchRule.error?.replace('Không thể ', '')}
                              </div>
                            )}
                          </td>

                          {/* Cột Loại VĐV khỏi nhóm */}
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setMemberToKick(m)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors active:scale-95"
                              title="Loại VĐV này khỏi danh sách nhóm"
                            >
                              <UserMinus className="w-3 h-3 text-rose-600" />
                              <span>Loại VĐV</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN LOẠI VẬN ĐỘNG VIÊN */}
      {memberToKick && currentTeam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
              <UserMinus className="w-5 h-5" />
              <span>Xác nhận loại VĐV khỏi nhóm</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn loại vận động viên{' '}
              <strong className="text-slate-900">{memberToKick.full_name}</strong> (Giới tính: {memberToKick.gender}, Suất: {memberToKick.role === 'official' ? 'Chính thức' : 'Dự bị'}) khỏi nhóm đua{' '}
              <strong>"{currentTeam.name}"</strong>?
            </p>

            {memberToKick.user_id === currentTeam.user_id && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Lưu ý quan trọng:</strong> VĐV này là Đội trưởng đăng ký nhóm. Sau khi loại, Đội trưởng vẫn giữ tài khoản quản trị nhóm nhưng không thi đấu trong danh sách.
                </span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
              * VĐV sau khi bị loại sẽ được giải phóng slot, có thể gia nhập đội đua khác hoặc nhường vị trí cho VĐV mới.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToKick(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmKick}
                disabled={Boolean(processingMemberId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              >
                {processingMemberId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserMinus className="w-3.5 h-3.5" />
                )}
                <span>Xác nhận loại</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
