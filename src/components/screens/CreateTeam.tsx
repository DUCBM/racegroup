import React, { useState, useEffect } from 'react';
import { Team, TeamMember, TeamCategory, MemberGender, MemberRole, MarathonRegistration, UserSession } from '../../types';
import { api } from '../../lib/database';
import {
  ArrowLeft,
  Trophy,
  ShieldCheck,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Key,
  RefreshCw,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Check
} from 'lucide-react';

interface CreateTeamProps {
  currentUser: UserSession;
  teams: Team[];
  members: TeamMember[];
  onTeamCreated: (newTeam: Team) => void;
  onCancel: () => void;
}

export const CreateTeam: React.FC<CreateTeamProps> = ({
  currentUser,
  teams,
  members,
  onTeamCreated,
  onCancel,
}) => {
  // Team Info
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState(() => 'TEAM' + Math.floor(1000 + Math.random() * 9000));
  const [category, setCategory] = useState<TeamCategory>('42km');

  // Registration code lookup for captain
  const [registrationCode, setRegistrationCode] = useState('');
  const [captainAthleteInfo, setCaptainAthleteInfo] = useState<MarathonRegistration | null>(null);
  const [regLookupLoading, setRegLookupLoading] = useState(false);
  const [regLookupSuccess, setRegLookupSuccess] = useState<string | null>(null);
  const [regLookupError, setRegLookupError] = useState<string | null>(null);
  const [distanceDisallowedError, setDistanceDisallowedError] = useState<string | null>(null);
  const [alreadyInTeamError, setAlreadyInTeamError] = useState<string | null>(null);

  // Captain Athlete Personal Info
  const [captainGender, setCaptainGender] = useState<MemberGender>('Nam');
  const [captainDistance, setCaptainDistance] = useState<string>('42km');
  const [captainRole, setCaptainRole] = useState<MemberRole>('official');

  // Form states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lookup registration code in marathon_registrations table
  const handleLookupRegCode = async (codeToLookup: string) => {
    const code = codeToLookup.trim();
    if (!code) {
      setCaptainAthleteInfo(null);
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
        // Kiểm tra VĐV đã tạo hoặc tham gia đội nào chưa (mỗi VĐV chỉ được join 1 đội duy nhất)
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
          setCaptainAthleteInfo(null);
          setRegLookupSuccess(null);
          return;
        }

        setCaptainAthleteInfo(result);
        if (result.gioi_tinh) {
          setCaptainGender(result.gioi_tinh);
        }

        // Validate marathon relay distance (Only 42km & 21km allowed)
        const distStr = String(result.cu_ly || '').trim().toLowerCase();
        const isDisallowed =
          distStr === '5km' ||
          distStr === '10km' ||
          distStr === '5k' ||
          distStr === '10k' ||
          (!distStr.includes('42') && !distStr.includes('21') && (distStr.includes('5') || distStr.includes('10')));

        if (isDisallowed) {
          setCaptainDistance(result.cu_ly);
          setDistanceDisallowedError(
            `Cự ly "${result.cu_ly}" không thuộc nội dung đồng đội (chỉ áp dụng 42km hoặc 21km).`
          );
          setRegLookupSuccess(null);
        } else {
          setDistanceDisallowedError(null);
          const validDist: TeamCategory = distStr.includes('21') ? '21km' : '42km';
          setCaptainDistance(validDist);
          setCategory(validDist); // Tự động active cự ly theo mã đăng ký của Đội trưởng!
          setRegLookupSuccess(`Đã tìm thấy VĐV: ${result.ho_ten} (Cự ly cá nhân: ${validDist})`);
        }
      } else {
        setCaptainAthleteInfo(null);
        setRegLookupError(`Không tìm thấy mã đăng ký "${code}" trong hệ thống.`);
      }
    } catch (e: any) {
      setCaptainAthleteInfo(null);
      setRegLookupError(e.message || 'Lỗi tra cứu mã đăng ký.');
    } finally {
      setRegLookupLoading(false);
    }
  };

  // Tự động tra cứu khi nhập mã đăng ký (debounce 450ms)
  useEffect(() => {
    const trimmed = registrationCode.trim();
    if (!trimmed) {
      setCaptainAthleteInfo(null);
      setRegLookupSuccess(null);
      setRegLookupError(null);
      setDistanceDisallowedError(null);
      return;
    }

    const timer = setTimeout(() => {
      handleLookupRegCode(trimmed);
    }, 450);

    return () => clearTimeout(timer);
  }, [registrationCode]);

  // Generate athletic passcode
  const handleGeneratePasscode = () => {
    const prefixes = ['MARA', 'PACE', 'TEAM', 'SPEED'];
    const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setPasscode(`${pfx}${num}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập Tên đội.');
      return;
    }
    if (!passcode.trim()) {
      setErrorMsg('Vui lòng nhập Mật khẩu nhóm (Passcode).');
      return;
    }
    if (!captainAthleteInfo) {
      setErrorMsg('Vui lòng nhập đúng Mã đăng ký VĐV của Đội trưởng để tự động điền thông tin.');
      return;
    }

    if (alreadyInTeamError) {
      setErrorMsg(alreadyInTeamError);
      return;
    }

    if (
      distanceDisallowedError ||
      captainDistance === '5km' ||
      captainDistance === '10km' ||
      /^(5km|10km|5k|10k)$/i.test(captainDistance)
    ) {
      setErrorMsg('Cự ly không hợp lệ. Chỉ áp dụng 42km hoặc 21km.');
      return;
    }

    try {
      setLoading(true);
      const captainUserId = String(captainAthleteInfo.user_id).trim();
      const resolvedCaptainName = captainAthleteInfo.ho_ten.trim();
      const resolvedCaptainPhone = captainAthleteInfo.sdt || '';
      const resolvedCaptainEmail = captainAthleteInfo.email || `${captainUserId}@vmarathon.vn`;

      const { team } = await api.createTeam(
        {
          name,
          passcode,
          category,
          captain_name: resolvedCaptainName,
          captain_phone: resolvedCaptainPhone,
          captain_email: resolvedCaptainEmail,
          user_id: captainUserId,
        },
        {
          bib_number: captainAthleteInfo?.so_bib || null,
          gender: captainGender,
          distance: captainDistance || category,
          role: captainRole,
          user_id: captainUserId,
        }
      );

      onTeamCreated(team);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tạo đội. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <span className="text-xs text-[#9f224e] font-bold uppercase tracking-wider">
          Khởi tạo nhóm đua
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
          Đăng Ký Tạo Nhóm Đua
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Nhập thông tin nhóm, mật khẩu gia nhập và xác nhận suất VĐV của Đội trưởng.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Thông Tin Nhóm */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#9f224e]" />
              1. Thông Tin Nhóm Đua
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên đội đua <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Hà Nội Runners 42K"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#9f224e]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu nhóm <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePasscode}
                  className="text-[11px] text-[#9f224e] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Ngẫu nhiên
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="VD: MARA42"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono tracking-wider uppercase focus:outline-none focus:bg-white focus:border-[#9f224e]"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Cự ly tự động kích hoạt theo mã đăng ký của Đội trưởng */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Cự ly thi đấu đồng đội <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-[#9f224e] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {captainAthleteInfo
                  ? `Tự động kích hoạt theo mã VĐV: ${category.toUpperCase()}`
                  : 'Tự động kích hoạt khi nhập mã VĐV Đội trưởng'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Thẻ 42KM */}
              <div
                className={`p-3.5 rounded-xl border transition-all relative ${
                  category === '42km'
                    ? 'bg-rose-50/70 border-[#9f224e] shadow-sm ring-1 ring-[#9f224e]/20'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                        category === '42km' ? 'bg-[#9f224e]' : 'bg-slate-300'
                      }`}
                    >
                      {category === '42km' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      Đồng Đội 42KM (Full Marathon)
                    </span>
                  </div>
                  {category === '42km' && captainAthleteInfo && (
                    <span className="text-[10px] bg-[#9f224e] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Đang kích hoạt
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 pl-5">
                  18 thành viên (15 chính thức + 3 dự bị). Áp dụng cho VĐV đăng ký cự ly 42KM.
                </p>
              </div>

              {/* Thẻ 21KM */}
              <div
                className={`p-3.5 rounded-xl border transition-all relative ${
                  category === '21km'
                    ? 'bg-rose-50/70 border-[#9f224e] shadow-sm ring-1 ring-[#9f224e]/20'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                        category === '21km' ? 'bg-[#9f224e]' : 'bg-slate-300'
                      }`}
                    >
                      {category === '21km' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      Đồng Đội 21KM (Half Marathon)
                    </span>
                  </div>
                  {category === '21km' && captainAthleteInfo && (
                    <span className="text-[10px] bg-[#9f224e] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Đang kích hoạt
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 pl-5">
                  18 thành viên (15 chính thức + 3 dự bị). Áp dụng cho VĐV đăng ký cự ly 21KM.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              * Hệ thống khóa chọn cự ly thủ công để tránh nhầm lẫn giữa cự ly 21km và 42km. Khi bạn nhập mã đăng ký ở mục 2, cự ly sẽ tự động nhận diện chính xác.
            </p>
          </div>
        </div>

        {/* 2. Tra cứu suất VĐV của Đội Trưởng */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold uppercase text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9f224e]" />
                2. Đăng Ký Suất VĐV Của Đội Trưởng
              </h2>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Suất 1/18
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã đăng ký VĐV (user_id)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Nhập mã đăng ký tại email đăng ký thành công"
                    value={registrationCode}
                    onChange={(e) => {
                      setRegistrationCode(e.target.value);
                      if (regLookupSuccess || regLookupError || distanceDisallowedError || captainAthleteInfo) {
                        setRegLookupSuccess(null);
                        setRegLookupError(null);
                        setDistanceDisallowedError(null);
                        setCaptainAthleteInfo(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLookupRegCode(registrationCode);
                      }
                    }}
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#9f224e]"
                  />
                  <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  type="button"
                  onClick={() => handleLookupRegCode(registrationCode)}
                  disabled={regLookupLoading || !registrationCode.trim()}
                  className="px-4 py-2 rounded-lg bg-[#9f224e] hover:bg-[#851c41] disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
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

            {/* Thông tin VĐV đã tra cứu */}
            {captainAthleteInfo && (
              <div className="p-4 rounded-xl bg-slate-50 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Thông tin VĐV (Mã: {captainAthleteInfo.user_id})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Họ và tên</div>
                    <div className="text-xs font-bold text-slate-900 truncate">{captainAthleteInfo.ho_ten || '---'}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Cự ly</div>
                    <div className="text-xs font-bold text-[#9f224e]">{captainAthleteInfo.cu_ly || '---'}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Giới tính</div>
                    <div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        captainAthleteInfo.gioi_tinh === 'Nữ'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {captainAthleteInfo.gioi_tinh || '---'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Năm sinh</div>
                    <div className="text-xs font-bold text-slate-800">{captainAthleteInfo.nam_sinh || '---'}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">SĐT</div>
                    <div className="text-xs font-bold text-slate-800 truncate">{captainAthleteInfo.sdt || '---'}</div>
                  </div>
                </div>

                {captainAthleteInfo.so_bib && (
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                    <span>Số BIB:</span>
                    <strong className="text-emerald-700 font-mono">{captainAthleteInfo.so_bib}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Vai trò */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Vai trò của Đội trưởng
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCaptainRole('official')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-between ${
                    captainRole === 'official'
                      ? 'bg-rose-50 border-[#9f224e] text-[#9f224e]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Chính thức (Official)</span>
                  {captainRole === 'official' && <Check className="w-3.5 h-3.5 text-[#9f224e]" />}
                </button>
                <button
                  type="button"
                  onClick={() => setCaptainRole('reserve')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-between ${
                    captainRole === 'reserve'
                      ? 'bg-rose-50 border-[#9f224e] text-[#9f224e]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Dự bị (Reserve)</span>
                  {captainRole === 'reserve' && <Check className="w-3.5 h-3.5 text-[#9f224e]" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={
              loading ||
              Boolean(distanceDisallowedError) ||
              (captainDistance !== '42km' && captainDistance !== '21km')
            }
            className="px-6 py-2.5 rounded-xl bg-[#9f224e] hover:bg-[#851c41] text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Đang lưu...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Hoàn tất tạo nhóm</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
