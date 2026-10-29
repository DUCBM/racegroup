import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200">
          <div className="w-10 h-10 rounded-lg bg-[#9f224e]/10 border border-[#9f224e]/20 flex items-center justify-center text-[#9f224e]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Điều Lệ Giải Chạy Đồng Đội
            </h2>
            <p className="text-xs text-slate-500">
              Cơ cấu nhân sự và quy định đăng ký 18 VĐV theo thể thức VnExpress Marathon
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Quy mô 18 thành viên */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9f224e]" /> Quy chuẩn: 18 Thành viên / Đội
              </span>
              <span className="text-[#9f224e] bg-rose-50 px-2 py-0.5 rounded text-xs">
                Tối đa 18 VĐV
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Chính thức */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chính thức (15 VĐV)
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span>• VĐV Nam:</span>
                    <strong className="text-slate-800">Tối đa 10 Nam</strong>
                  </li>
                  <li className="flex justify-between py-1">
                    <span>• VĐV Nữ:</span>
                    <strong className="text-slate-800">Tối đa 05 Nữ</strong>
                  </li>
                </ul>
              </div>

              {/* Dự bị */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" /> Dự bị (03 VĐV)
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span>• Nam dự bị:</span>
                    <strong className="text-slate-800">Tối đa 02 Nam</strong>
                  </li>
                  <li className="flex justify-between py-1">
                    <span>• Nữ dự bị:</span>
                    <strong className="text-slate-800">Tối đa 01 Nữ</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quy định cự ly & vai trò */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800">Quy định cự ly & vai trò</h4>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>Chỉ áp dụng đăng ký thi đấu đồng đội cho cự ly <strong>42km</strong> và <strong>21km</strong>.</li>
              <li>Mỗi VĐV chỉ được đứng tên trong danh sách của 01 đội duy nhất.</li>
              <li>Đội trưởng khi tạo đội sẽ tự động giữ 01 suất VĐV trong danh sách.</li>
              <li>Đội trưởng có quyền phân quyền Chính thức / Dự bị và quản lý thành viên.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#9f224e] hover:bg-[#851c41] text-white font-bold text-xs uppercase"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
