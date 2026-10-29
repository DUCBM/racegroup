import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, User, Plus } from 'lucide-react';
import { UserSession } from '../types';
import { setCurrentUser } from '../lib/database';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onUserChanged: (user: UserSession) => void;
}

const PRESET_USERS: UserSession[] = [
  {
    id: 'c0a80101-0000-4000-8000-000000000001',
    name: 'Nguyễn Văn Hùng (Đội trưởng)',
    email: 'hung.nguyen@marathon.vn',
    phone: '0912345678',
    isCaptain: true,
  },
  {
    id: 'c0a80101-0000-4000-8000-000000000099',
    name: 'Trần Thị Mai (Đội trưởng Sài Gòn)',
    email: 'mai.tran@saigonrunners.vn',
    phone: '0987654321',
    isCaptain: true,
  },
  {
    id: 'user-guest-runner-01',
    name: 'Phan Minh Hoàng (VĐV tự do)',
    email: 'hoang.phan@runner.com',
    phone: '0933123456',
    isCaptain: false,
  },
  {
    id: 'user-guest-runner-female',
    name: 'Vũ Thảo My (VĐV Nữ tự do)',
    email: 'thaomy.vu@runner.com',
    phone: '0944987654',
    isCaptain: false,
  },
];

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (user: UserSession) => {
    setCurrentUser(user);
    onUserChanged(user);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newUser: UserSession = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      name: customName.trim(),
      email: customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '')}@marathon.vn`,
      isCaptain: false,
    };
    setCurrentUser(newUser);
    onUserChanged(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-athletic text-xl font-bold uppercase text-white tracking-wide">
              Chuyển Đổi Người Dùng Thử Nghiệm
            </h2>
            <p className="text-xs text-slate-400">
              Mô phỏng phiên đăng nhập để kiểm tra quyền hạn Đội trưởng vs VĐV
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Tài khoản mẫu:
          </label>
          {PRESET_USERS.map((user) => {
            const isSelected = currentUser.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => handleSelectPreset(user)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-orange-500/15 border-orange-500/50 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.isCaptain ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-200 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>
                {user.isCaptain ? (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                    Đội trưởng
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
                    VĐV tự do
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom persona */}
        <form onSubmit={handleCreateCustom} className="pt-4 border-t border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Hoặc nhập VĐV mới:
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập họ tên VĐV..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!customName.trim()}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
