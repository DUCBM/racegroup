import React, { useState } from 'react';
import { Team, TeamMember, UserSession, TeamStatus } from '../types';
import { calculateQuota } from '../utils/rules';
import { api } from '../lib/database';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  AlertCircle,
  Check,
  Clock,
  Phone,
  UserPlus,
  Edit3,
} from 'lucide-react';

interface TeamDetailModalProps {
  team: Team;
  members: TeamMember[];
  currentUser: UserSession;
  onClose: () => void;
  onRefresh: () => void;
  onNavigateToJoin: (teamId: string) => void;
  onNavigateToEdit?: (teamId: string) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  members,
  currentUser,
  onClose,
  onRefresh,
  onNavigateToJoin,
  onNavigateToEdit,
}) => {
  const isCaptain = team.user_id === currentUser.id;
  const quota = calculateQuota(members);

  const [statusLoading, setStatusLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdateStatus = async (newStatus: TeamStatus) => {
    try {
      setStatusLoading(true);
      setErrorMsg(null);
      await api.updateTeamStatus(team.id, newStatus);
      const statusVN =
        newStatus === 'recruiting'
          ? 'Đang tuyển quân'
          : newStatus === 'completed'
          ? 'Đủ quân số (18/18)'
          : 'Đã khóa sổ';
      setSuccessMsg(`Đã cập nhật trạng thái đội: ${statusVN}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi cập nhật trạng thái đội.');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusLabel = (status: TeamStatus) => {
    switch (status) {
      case 'recruiting':
        return 'Đang tuyển quân';
      case 'completed':
        return 'Đủ quân số (18/18)';
      case 'locked':
        return 'Đã khóa sổ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#9f224e] text-white">
                {team.category}
              </span>

              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  team.status === 'recruiting'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : team.status === 'completed'
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {getStatusLabel(team.status)}
              </span>

              {isCaptain && (
                <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold border border-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Bạn là Đội trưởng
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
              {team.name}
            </h2>

            {/* Thông tin Đội trưởng dưới Title - Đã bỏ hiển thị Email */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
              <span>
                Đội trưởng: <strong className="text-slate-800">{team.captain_name}</strong>
              </span>
              {team.captain_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {team.captain_phone}
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" /> Ngày tạo:{' '}
                {new Date(team.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo lỗi & thành công */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Thanh Thao tác & Quản trị */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Trạng thái:{' '}
              <strong className="text-slate-800">
                {team.status === 'recruiting'
                  ? `Đang gom quân (còn ${18 - quota.total} suất)`
                  : team.status === 'completed'
                  ? 'Đã đủ 18 VĐV'
                  : 'Đã khóa sổ danh sách'}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToEdit(team.id);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Chỉnh sửa nhóm</span>
                </button>
              )}

              {team.status === 'recruiting' && quota.total < 18 && (
                <button
                  onClick={() => onNavigateToJoin(team.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#9f224e] hover:bg-[#851c41] text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Tham gia nhóm
                </button>
              )}

              {isCaptain && (
                <div className="flex items-center gap-1.5">
                  {team.status === 'recruiting' ? (
                    <button
                      onClick={() => handleUpdateStatus('locked')}
                      disabled={statusLoading}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" /> Khóa sổ
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus('recruiting')}
                      disabled={statusLoading}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5" /> Mở tuyển lại
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tiến độ chỉ tiêu 18 thành viên */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Chỉ tiêu cơ cấu thành viên thi đấu</span>
              <span className="font-bold text-[#9f224e]">{quota.total}/18 VĐV</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Nam chính thức</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{quota.officialMale}/10</div>
                <div className="text-[10px] text-emerald-600 font-medium">
                  {quota.officialMale >= 10 ? 'Đã đủ' : `Còn ${quota.remOfficialMale} suất`}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Nữ chính thức</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{quota.officialFemale}/5</div>
                <div className="text-[10px] text-emerald-600 font-medium">
                  {quota.officialFemale >= 5 ? 'Đã đủ' : `Còn ${quota.remOfficialFemale} suất`}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Nam dự bị</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{quota.reserveMale}/2</div>
                <div className="text-[10px] text-emerald-600 font-medium">
                  {quota.reserveMale >= 2 ? 'Đã đủ' : `Còn ${quota.remReserveMale} suất`}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Nữ dự bị</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{quota.reserveFemale}/1</div>
                <div className="text-[10px] text-emerald-600 font-medium">
                  {quota.reserveFemale >= 1 ? 'Đã đủ' : `Còn ${quota.remReserveFemale} suất`}
                </div>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};
