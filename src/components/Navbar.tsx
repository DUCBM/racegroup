import React from 'react';
import { ActiveScreen, UserSession } from '../types';
import { PlusCircle, UserPlus, Trophy, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  currentUser: UserSession;
  onOpenUserModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenRulesModal: () => void;
  isSupabaseConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onOpenRulesModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onNavigate('directory')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                currentScreen === 'directory'
                  ? 'bg-[#9f224e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Danh sách Đội</span>
            </button>

            <button
              onClick={() => onNavigate('create')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                currentScreen === 'create'
                  ? 'bg-[#9f224e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo nhóm</span>
            </button>

            <button
              onClick={() => onNavigate('join')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                currentScreen === 'join'
                  ? 'bg-[#9f224e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Gia nhập nhóm</span>
            </button>

            <button
              onClick={onOpenRulesModal}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              title="Xem thể lệ cơ cấu 18 VĐV"
            >
              <BookOpen className="w-4 h-4 text-[#9f224e]" />
              <span className="hidden sm:inline">Thể lệ 18 VĐV</span>
              <span className="sm:hidden">Thể lệ</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
