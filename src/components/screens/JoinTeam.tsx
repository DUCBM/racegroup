import React, { useState, useEffect, useRef } from 'react';
import { Team, TeamMember, MemberGender, MemberRole, UserSession, MarathonRegistration } from '../../types';
import { calculateQuota } from '../../utils/rules';
import { api } from '../../lib/database';
import {
  UserPlus,
  Key,
  Trophy,
  ArrowLeft,
  Check,
  AlertCircle,
  Users,
  ShieldAlert,
  Search,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Plus,
} from 'lucide-react';

interface JoinTeamProps {
  teams: Team[];
  members: TeamMember[];
  currentUser: UserSession;
  initialTeamId?: string;
  onJoined?: (team: Team) => void;
  onRefreshData?: () => Promise<void> | void;
  onCancel: () => void;
}

export const JoinTeam: React.FC<JoinTeamProps> = ({
  teams,
  members,
  currentUser,
  initialTeamId,
  onRefreshData,
  onCancel,
}) => {
  const recruitingTeams = teams.filter((t) => t.status === 'recruiting');

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    initialTeamId || (recruitingTeams[0] ? recruitingTeams[0].id : '')
  );
  const [passcode, setPasscode] = useState('');

  // Tra cứu mã đăng ký VĐV (user_id)
  const [registrationCode, setRegistrationCode] = useState('');
  const [regLookupLoading, setRegLookupLoading] = useState(false);
  const [regLookupSuccess, setRegLookupSuccess] = useState<string | null>(null);
  const [regLookupError, setRegLookupError] = useState<string | null>(null);
  const [distanceDisallowedError, setDistanceDisallowedError] = useState<string | null>(null);
  const [alreadyInTeamError, setAlreadyInTeamError] = useState<string | null>(null);
  const [athleteInfo, setAthleteInfo] = useState<MarathonRegistration | null>(null);

  const [fullName, setFullName] = useState(currentUser.name || '');
  const [gender, setGender] = useState<MemberGender>('Nam');
  const [distance, setDistance] = useState('42km');
  const [role, setRole] = useState<MemberRole>('official');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [addedRunners, setAddedRunners] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Tra cứu mã VĐV từ bảng marathon_registrations
  const handleLookupRegCode = async (codeToLookup: string) => {
    const code = codeToLookup.trim();
    if (!code) {
      setAthleteInfo(null);
      setRegLookupSuccess(null);
      setRegLookupError(null);
      setDistanceDisallowedError(null);
      setAlreadyInTeamError(null);
      return;
    }

    setRegLookupLoading(true);
    setRegLookupError(null);
    setRegLookupSuccess(null);
    setDistanceDisallowedError(null);
    setAlreadyInTeamError(null);

    try {
      const result = await api.lookupRegistration(code);
      if (result) {
        // Kiểm tra VĐV đã tham gia đội nào chưa (mỗi VĐV chỉ được tham gia 1 đội duy nhất)
        const existingMembership = members.find(
          (m) =>
            (m.user_id && String(m.user_id).trim() === String(result.user_id).trim()) ||
            m.full_name.trim().toLowerCase() === result.ho_ten.trim().toLowerCase()
        );
        if (existingMembership) {
          const foundTeam = teams.find((t) => t.id === existingMembership.team_id);
          const tName = foundTeam ? foundTeam.name : 'đội khác';
          setAlreadyInTeamError(
            `Vận động viên "${result.ho_ten}" (Mã: ${result.user_id}) đã tham gia đội "${tName}". Mỗi VĐV chỉ được tạo hoặc tham gia 1 đội duy nhất!`
          );
          setAthleteInfo(null);
          setRegLookupSuccess(null);
          return;
        }

        setAthleteInfo(result);
        if (result.ho_ten) {
          setFullName(result.ho_ten);
        }
        if (result.gioi_tinh) {
          setGender(result.gioi_tinh);
        }

        const distStr = String(result.cu_ly || '').trim().toLowerCase();
        const isDisallowed =
          distStr === '5km' ||
          distStr === '10km' ||
          distStr === '5k' ||
          distStr === '10k' ||
          (!distStr.includes('42') && !distStr.includes('21') && (distStr.includes('5') || distStr.includes('10')));

        if (isDisallowed) {
          setDistance(result.cu_ly);
          setDistanceDisallowedError(
            `Cự ly "${result.cu_ly}" không áp dụng cho giải đồng đội (chỉ tiếp nhận 42km hoặc 21km).`
          );
          setRegLookupSuccess(null);
        } else {
          const normDist = distStr.includes('21') ? '21km' : '42km';
          setDistance(normDist);
          if (currentTeam && normDist !== currentTeam.category) {
            setDistanceDisallowedError(
              `Cự ly của VĐV là ${normDist}, trong khi đội "${currentTeam.name}" thi đấu cự ly ${currentTeam.category}. Không thể tham gia đội này!`
            );
          } else {
            setRegLookupSuccess(`Đã tìm thấy thông tin VĐV: ${result.ho_ten} (${normDist})`);
          }
        }
      } else {
        setAthleteInfo(null);
        setRegLookupError(`Không tìm thấy mã VĐV "${code}" trong dữ liệu đăng ký.`);
      }
    } catch (err: any) {
      setAthleteInfo(null);
      setRegLookupError('Không thể tra cứu mã VĐV. Vui lòng thử lại.');
    } finally {
      setRegLookupLoading(false);
    }
  };

  // Tự động trả data về khi người dùng nhập mã đăng ký (debounce 450ms)
  useEffect(() => {
    const trimmed = registrationCode.trim();
    if (!trimmed) {
      setAthleteInfo(null);
      setRegLookupSuccess(null);
      setRegLookupError(null);
      setDistanceDisallowedError(null);
      setAlreadyInTeamError(null);
      return;
    }

    const timer = setTimeout(() => {
      handleLookupRegCode(trimmed);
    }, 450);

    return () => clearTimeout(timer);
  }, [registrationCode]);

  const currentTeam = teams.find((t) => t.id === selectedTeamId);
  const currentTeamMembers = members.filter((m) => m.team_id === selectedTeamId);
  const quota = calculateQuota(currentTeamMembers);

  const getSlotStatus = () => {
    if (role === 'official') {
      if (gender === 'Nam') {
        return {
          current: quota.officialMale,
          max: 10,
          full: quota.officialMale >= 10,
          label: 'Nam chính thức',
        };
      } else {
        return {
          current: quota.officialFemale,
          max: 5,
          full: quota.officialFemale >= 5,
          label: 'Nữ chính thức',
        };
      }
    } else {
      if (gender === 'Nam') {
        return {
          current: quota.reserveMale,
          max: 2,
          full: quota.reserveMale >= 2,
          label: 'Nam dự bị',
        };
      } else {
        return {
          current: quota.reserveFemale,
          max: 1,
          full: quota.reserveFemale >= 1,
          label: 'Nữ dự bị',
        };
      }
    }
  };

  const slotStatus = getSlotStatus();

  // Tự động chuyển vai trò sang dự bị nếu suất chính thức đã đầy
  useEffect(() => {
    if (role === 'official') {
      if (gender === 'Nam' && quota.officialMale >= 10 && quota.reserveMale < 2) {
        setRole('reserve');
      } else if (gender === 'Nữ' && quota.officialFemale >= 5 && quota.reserveFemale < 1) {
        setRole('reserve');
      }
    }
  }, [gender, quota.officialMale, quota.officialFemale, quota.reserveMale, quota.reserveFemale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedTeamId || !currentTeam) {
      setErrorMsg('Vui lòng chọn đội muốn gia nhập.');
      return;
    }

    if (!passcode.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu nhóm (Passcode).');
      return;
    }

    if (passcode.trim() !== currentTeam.passcode.trim()) {
      setErrorMsg('Mật khẩu nhóm không chính xác. Vui lòng liên hệ Đội trưởng.');
      return;
    }

    if (!registrationCode.trim()) {
      setErrorMsg('Vui lòng nhập Mã đăng ký VĐV để tra cứu thông tin.');
      return;
    }

    if (!athleteInfo) {
      setErrorMsg('Vui lòng nhập đúng Mã đăng ký VĐV hợp lệ trước khi gửi.');
      return;
    }

    if (alreadyInTeamError) {
      setErrorMsg(alreadyInTeamError);
      return;
    }

    if (distanceDisallowedError) {
      setErrorMsg('Cự ly cá nhân không hợp lệ cho giải đồng đội.');
      return;
    }

    if (currentTeam.category !== distance) {
      setErrorMsg(
        `Cự ly của VĐV (${distance}) không khớp với cự ly đồng đội của nhóm (${currentTeam.category}). Vui lòng chọn đội có cự ly phù hợp.`
      );
      return;
    }

    if (slotStatus.full) {
      setErrorMsg(`Suất ${slotStatus.label} của đội đã đủ (${slotStatus.max}/${slotStatus.max}).`);
      return;
    }

    const regCodeVal = registrationCode.trim();
    // Kiểm tra VĐV đã tham gia đội nào chưa (trên toàn bộ hệ thống)
    const alreadyJoinedAny = members.find(
      (m) =>
        (m.user_id && String(m.user_id).trim() === regCodeVal) ||
        (m.full_name.trim().toLowerCase() === athleteInfo.ho_ten.trim().toLowerCase())
    );

    if (alreadyJoinedAny) {
      const foundTeam = teams.find((t) => t.id === alreadyJoinedAny.team_id);
      const tName = foundTeam ? foundTeam.name : 'đội khác';
      setErrorMsg(
        `Vận động viên "${athleteInfo.ho_ten}" (Mã: ${regCodeVal}) đã tham gia đội "${tName}". Mỗi VĐV chỉ được tham gia 1 đội duy nhất!`
      );
      return;
    }

    setLoading(true);
    try {
      const savedName = athleteInfo.ho_ten.trim();
      const savedRoleName = role === 'official' ? 'Chính thức' : 'Dự bị';

      await api.joinTeam({
        teamId: currentTeam.id,
        userId: regCodeVal,
        fullName: savedName,
        gender: athleteInfo.gioi_tinh,
        distance,
        role,
        bibNumber: athleteInfo.so_bib || null,
        passcode: passcode.trim(),
      });

      // Làm mới dữ liệu tổng để cập nhật ngay số lượng thành viên trong đội
      if (onRefreshData) {
        await onRefreshData();
      }

      // Xóa trắng thông tin Box 2 để nhập vận động viên tiếp theo
      setRegistrationCode('');
      setAthleteInfo(null);
      setRegLookupSuccess(null);
      setRegLookupError(null);
      setDistanceDisallowedError(null);
      setAlreadyInTeamError(null);
      setFullName('');
      setRole('official');
      setAddedRunners((prev) => [savedName, ...prev]);

      setSuccessToast(
        `Đã thêm thành công VĐV "${savedName}" (${savedRoleName}) vào đội "${currentTeam.name}". Bạn có thể nhập tiếp VĐV tiếp theo!`
      );

      // Focus lại vào ô nhập mã VĐV để tiện thao tác
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi thêm VĐV vào đội. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Nút quay lại */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#9f224e] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách đội</span>
        </button>

        <span className="text-xs text-[#9f224e] font-bold uppercase tracking-wider">
          Tham gia nhóm VĐV
        </span>
      </div>

      {/* Tiêu đề trang */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-[#9f224e]" />
          Đăng Ký Gia Nhập Đội Đua
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chọn đội đua, nhập mật khẩu Passcode do Đội trưởng cấp. Bạn có thể thêm liên tiếp nhiều VĐV vào nhóm.
        </p>
      </div>

      {/* Thông báo thêm VĐV thành công */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-emerald-950">Thêm vận động viên thành công!</div>
              <div className="text-emerald-800 leading-relaxed">{successToast}</div>
              <div className="text-[11px] text-emerald-700 font-medium pt-1">
                👉 Ô mã đăng ký bên dưới đã được làm mới, mời bạn nhập tiếp mã VĐV tiếp theo.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {recruitingTeams.length === 0 ? (
        <div className="p-10 text-center rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
          <Trophy className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            Hiện không có đội nào đang tuyển quân
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Các đội đều đã đủ 18 VĐV hoặc đã khóa sổ thi đấu. Bạn có thể tự khởi tạo đội đua mới.
          </p>
          <button
            onClick={() => onCancel()}
            className="px-4 py-2 rounded-lg bg-[#9f224e] hover:bg-[#851c41] text-white font-bold text-xs uppercase"
          >
            Quay lại tổng quan
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PHẦN 1: Chọn Đội & Mật Khẩu (Giữ nguyên khi nhập liên tiếp) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Trophy className="w-4 h-4 text-[#9f224e]" />
              1. Chọn Đội Đua & Mật Khẩu Passcode
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đội muốn gia nhập <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setSuccessToast(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-[#9f224e] focus:bg-white"
                >
                  {recruitingTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category}) - Đội trưởng: {t.captain_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu nhóm (Passcode) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nhập Passcode do Đội trưởng cung cấp"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm font-mono tracking-wider text-slate-900 focus:outline-none focus:border-[#9f224e] focus:bg-white uppercase"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {currentTeam && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700">
                    Tình trạng thành viên của đội: <strong className="text-slate-900">{currentTeam.name}</strong> ({currentTeam.category})
                  </span>
                  <span className="font-bold text-[#9f224e]">
                    {quota.total}/18 VĐV
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-slate-500 text-[11px]">Nam chính thức</div>
                    <div className="font-bold text-slate-800 mt-0.5">{quota.officialMale}/10</div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      {quota.remOfficialMale > 0 ? `Còn ${quota.remOfficialMale}` : 'Đã đủ'}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-slate-500 text-[11px]">Nữ chính thức</div>
                    <div className="font-bold text-slate-800 mt-0.5">{quota.officialFemale}/5</div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      {quota.remOfficialFemale > 0 ? `Còn ${quota.remOfficialFemale}` : 'Đã đủ'}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-slate-500 text-[11px]">Nam dự bị</div>
                    <div className="font-bold text-slate-800 mt-0.5">{quota.reserveMale}/2</div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      {quota.remReserveMale > 0 ? `Còn ${quota.remReserveMale}` : 'Đã đủ'}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-slate-500 text-[11px]">Nữ dự bị</div>
                    <div className="font-bold text-slate-800 mt-0.5">{quota.reserveFemale}/1</div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      {quota.remReserveFemale > 0 ? `Còn ${quota.remReserveFemale}` : 'Đã đủ'}
                    </div>
                  </div>
                </div>

                {addedRunners.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-slate-700">VĐV vừa thêm trong phiên này:</span>
                    {addedRunners.map((rName, i) => (
                      <span key={i} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                        ✓ {rName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PHẦN 2: Thông tin VĐV - Tự động xóa sạch sau khi thêm để nhập tiếp */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9f224e]" />
                2. Thông Tin Vận Động Viên
              </h2>
              {athleteInfo && (
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Đã xác thực
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* Nhập mã đăng ký VĐV */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã đăng ký VĐV (user_id) <span className="text-rose-500">*</span>
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      required
                      placeholder="Nhập mã đăng ký tại email đăng ký thành công"
                      value={registrationCode}
                      onChange={(e) => setRegistrationCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLookupRegCode(registrationCode);
                        }
                      }}
                      className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#9f224e]"
                    />
                    <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    {regLookupLoading && (
                      <Loader2 className="w-4 h-4 text-[#9f224e] absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLookupRegCode(registrationCode)}
                    disabled={regLookupLoading || !registrationCode.trim()}
                    className="px-4 py-2 rounded-lg bg-[#9f224e] hover:bg-[#851c41] disabled:opacity-50 text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    {regLookupLoading ? (
                      <span>Đang tìm...</span>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Tra cứu</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Ghi chú đỏ */}
                <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                  * Mã đăng ký bạn tìm tại email đăng ký chạy thành công.
                </p>
              </div>

              {/* Thông báo lỗi nếu có */}
              {regLookupError && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{regLookupError}</span>
                </div>
              )}

              {alreadyInTeamError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{alreadyInTeamError}</span>
                </div>
              )}

              {distanceDisallowedError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{distanceDisallowedError}</span>
                </div>
              )}

              {/* Box hiển thị thông tin VĐV tự động trả về */}
              {athleteInfo ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Thông tin VĐV (Mã: {athleteInfo.user_id})
                    </span>
                    {currentTeam && athleteInfo.cu_ly && !athleteInfo.cu_ly.toLowerCase().includes(currentTeam.category.toLowerCase().replace('km', '')) && (
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Khác cự ly đội ({currentTeam.category})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Họ và tên</div>
                      <div className="text-xs font-bold text-slate-900 truncate">{athleteInfo.ho_ten || '---'}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Cự ly</div>
                      <div className="text-xs font-bold text-[#9f224e]">{athleteInfo.cu_ly || '---'}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Giới tính</div>
                      <div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          athleteInfo.gioi_tinh === 'Nữ'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {athleteInfo.gioi_tinh || '---'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Năm sinh</div>
                      <div className="text-xs font-bold text-slate-800">{athleteInfo.nam_sinh || '---'}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">SĐT</div>
                      <div className="text-xs font-bold text-slate-800 truncate">{athleteInfo.sdt || '---'}</div>
                    </div>
                  </div>

                  {athleteInfo.so_bib && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                      <span>Số BIB:</span>
                      <strong className="text-emerald-700 font-mono">{athleteInfo.so_bib}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  Nhập mã đăng ký cá nhân của bạn ở trên để hệ thống tự động tải Họ tên, Cự ly, Giới tính, Năm sinh và SĐT.
                </div>
              )}

              {/* Chọn vai trò: Chính thức hoặc Dự bị */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vị trí đăng ký thi đấu <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('official')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      role === 'official'
                        ? 'bg-rose-50 border-[#9f224e] text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase text-[#9f224e]">
                        Chính thức (Official)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {gender === 'Nam' ? `${quota.officialMale}/10 Nam` : `${quota.officialFemale}/5 Nữ`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {gender === 'Nam'
                        ? quota.officialMale >= 10
                          ? 'Đã hết suất Nam chính thức'
                          : `Còn ${quota.remOfficialMale} suất trống`
                        : quota.officialFemale >= 5
                        ? 'Đã hết suất Nữ chính thức'
                        : `Còn ${quota.remOfficialFemale} suất trống`}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('reserve')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      role === 'reserve'
                        ? 'bg-rose-50 border-[#9f224e] text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase text-[#9f224e]">
                        Dự bị (Reserve)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {gender === 'Nam' ? `${quota.reserveMale}/2 Nam` : `${quota.reserveFemale}/1 Nữ`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {gender === 'Nam'
                        ? quota.reserveMale >= 2
                          ? 'Đã hết suất Nam dự bị'
                          : `Còn ${quota.remReserveMale} suất trống`
                        : quota.reserveFemale >= 1
                        ? 'Đã hết suất Nữ dự bị'
                        : `Còn ${quota.remReserveFemale} suất trống`}
                    </p>
                  </button>
                </div>

                {slotStatus?.full && (
                  <div className="mt-2.5 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Vị trí <strong>{slotStatus.label}</strong> của đội đã đủ ({slotStatus.max}/{slotStatus.max}).
                      {role === 'official' ? ' Vui lòng chọn vị trí Dự bị.' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Hoàn tất & Về danh sách đội
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !athleteInfo ||
                Boolean(slotStatus?.full) ||
                Boolean(distanceDisallowedError) ||
                (currentTeam ? currentTeam.category !== distance : false)
              }
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#9f224e] hover:bg-[#851c41] text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <span>Đang lưu VĐV...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Thêm VĐV này vào đội</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
