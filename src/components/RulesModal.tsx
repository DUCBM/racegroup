import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Users,
  Trophy,
  Clock,
  ShieldAlert,
  Calendar,
  BadgePercent,
  FileText,
  FileCheck,
  Medal,
  Globe,
  Sparkles
} from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'eligibility' | 'scoring' | 'prizes' | 'timeline';

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [scoringDist, setScoringDist] = useState<'42km' | '21km'>('42km');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-rose-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#9f224e]/10 border border-[#9f224e]/20 flex items-center justify-center text-[#9f224e] shadow-sm shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#9f224e] text-white rounded">
                  VnExpress Marathon 2026
                </span>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Giải Đồng Đội Hải Phòng
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-0.5 leading-snug">
                Quy Chế Giải Chạy Đồng Đội 2026
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            title="Đóng điều lệ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 pt-2 border-b border-slate-200 bg-slate-50/80 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Cơ Cấu Đội Hình
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'eligibility'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Tiêu Chí VĐV Phong Trào
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'scoring'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Thi Đấu & Bảng Điểm
          </button>

          <button
            onClick={() => setActiveTab('prizes')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'prizes'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Giải Thưởng & Ưu Đãi BIB
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'timeline'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Thời Hạn & Hồ Sơ
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-700 leading-relaxed">

          {/* TAB 1: CƠ CẤU ĐỘI HÌNH */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Giới thiệu quy chuẩn */}
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 text-xs md:text-sm">
                <p className="text-slate-800">
                  Áp dụng cho giải đồng đội toàn hệ thống <strong>VnExpress Marathon (VM) 2026</strong> tại Hải Phòng với hai nội dung độc lập: <strong>42km (Full Marathon)</strong> và <strong>21km (Half Marathon)</strong>. Mỗi đội chỉ đăng ký 1 nội dung.
                </p>
              </div>

              {/* Box Quy chuẩn 18 VĐV */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                    <Users className="w-5 h-5 text-[#9f224e]" />
                    <span>Cơ cấu bắt buộc: 18 Thành viên / Đội</span>
                  </div>
                  <span className="text-[#9f224e] font-bold bg-rose-100/70 border border-rose-200 px-2.5 py-1 rounded-full text-xs">
                    15 Chính thức + 03 Dự bị
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Chính thức */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        15 Thành Viên Chính Thức
                      </span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                        Bắt buộc thi đấu
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                      <li className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span>• VĐV Nam chính thức:</span>
                        <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded">
                          Cố định 10 Nam
                        </strong>
                      </li>
                      <li className="flex justify-between items-center py-1">
                        <span>• VĐV Nữ chính thức:</span>
                        <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded">
                          Cố định 05 Nữ
                        </strong>
                      </li>
                    </ul>
                  </div>

                  {/* Dự bị */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <CheckCircle2 className="w-5 h-5 text-amber-600" />
                        03 Thành Viên Dự Bị
                      </span>
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold">
                        Thay thế cùng giới tính
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                      <li className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span>• VĐV Nam dự bị:</span>
                        <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded">
                          Tối đa 02 Nam
                        </strong>
                      </li>
                      <li className="flex justify-between items-center py-1">
                        <span>• VĐV Nữ dự bị:</span>
                        <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded">
                          Tối đa 01 Nữ
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quy định thay thế & cự ly */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#9f224e]" />
                  Quy định cự ly & hoán đổi nhân sự
                </h4>
                <ul className="space-y-2 text-xs md:text-sm text-slate-600 list-disc list-inside">
                  <li>Thành viên dự bị đăng ký cùng cự ly với đội và <strong>chỉ được thay thế thành viên chính thức cùng giới tính</strong>.</li>
                  <li>Thành viên dự bị không bắt buộc thi đấu nếu không được đôn lên danh sách chính thức.</li>
                  <li>Mỗi VĐV chỉ được đăng ký tham gia <strong>duy nhất 01 đội</strong> trong suốt giải đấu.</li>
                  <li>Đội trưởng khi tạo nhóm tự động giữ 01 suất và có toàn quyền sắp xếp, thay đổi nhân sự trước thời hạn quy định.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: TIÊU CHÍ VĐV PHONG TRÀO */}
          {activeTab === 'eligibility' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-4 flex gap-3 text-amber-900 text-xs md:text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-sm mb-1">Quy định VĐV Phong Trào (Mục 2 Điều lệ)</strong>
                  Giải đồng đội chỉ dành cho VĐV chạy bộ phong trào. Ban tổ chức (BTC) sẽ kiểm tra, đối chiếu hồ sơ và loại bỏ ngay lập tức các đội có VĐV vi phạm quy chế chuyên nghiệp.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2.1 VĐV Quốc tịch Việt Nam */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    2.1. Vận Động Viên Quốc Tịch Việt Nam
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="text-[#9f224e] font-bold">•</span>
                      <span><strong>Không phải thành viên Đội tuyển Quốc gia</strong> và không nhận hỗ trợ, tiền lương (hợp đồng chính thức, CTV hoặc tương đương) từ bất kỳ đội tuyển, CLB thể thao chuyên nghiệp nào (theo Điều 49 Luật TDTT 2006).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#9f224e] font-bold">•</span>
                      <span><strong>VĐV từng thi đấu chuyên nghiệp:</strong> chỉ được tham gia khi đã <strong>nghỉ hẳn thi đấu</strong> và không nhận lương từ bất kỳ đơn vị thể thao chuyên nghiệp nào tính đến ngày thi đấu.</span>
                    </li>
                  </ul>
                </div>

                {/* 2.2 VĐV Quốc tịch Nước ngoài */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                    <Globe className="w-4 h-4 text-sky-600" />
                    2.2. Vận Động Viên Nước Ngoài & Song Tịch
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="text-[#9f224e] font-bold">•</span>
                      <span>Là VĐV phong trào: không thuộc ĐTQG bất kỳ nước nào, không nhận lương từ CLB thể thao chuyên nghiệp.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#9f224e] font-bold">•</span>
                      <span><strong>Không có thành tích chuyên nghiệp</strong> trong 03 năm gần nhất tính đến ngày thi đấu (kết quả World Athletics, AIMS hoặc giải được công nhận).</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bảng chuẩn cấm chuyên nghiệp nước ngoài */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-950 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                    Chuẩn Thành Tích CẤM Tham Gia Nội Dung Đồng Đội (VĐV Nước Ngoài)
                  </h4>
                  <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                    Thành tích tốt nhất 3 năm
                  </span>
                </div>
                <p className="text-xs text-rose-800">
                  VĐV nước ngoài có thành tích cá nhân dưới các mốc sau được xác định là <strong>VĐV chuyên nghiệp</strong> và <strong>KHÔNG ĐỦ ĐIỀU KIỆN</strong> tham gia:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left bg-white rounded-lg overflow-hidden border border-rose-200">
                    <thead className="bg-rose-100/70 text-rose-950 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Giới Tính</th>
                        <th className="py-2.5 px-4">Full Marathon (42km)</th>
                        <th className="py-2.5 px-4">Half Marathon (21km)</th>
                        <th className="py-2.5 px-4 text-center">Kết luận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-900">VĐV Nam</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Dưới 2 giờ 30 phút (&lt; 2h30&apos;)</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Dưới 1 giờ 15 phút (&lt; 1h15&apos;)</td>
                        <td className="py-2.5 px-4 text-center font-bold text-rose-700 bg-rose-50/60">Không đủ điều kiện</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-900">VĐV Nữ</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Dưới 2 giờ 50 phút (&lt; 2h50&apos;)</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Dưới 1 giờ 25 phút (&lt; 1h25&apos;)</td>
                        <td className="py-2.5 px-4 text-center font-bold text-rose-700 bg-rose-50/60">Không đủ điều kiện</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2.3 & 2.4 Tiêu chí chung & Giải cá nhân */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Mua BIB chính chủ (Mục 2.3)
                  </div>
                  <p className="text-slate-600">
                    Cả 18 thành viên (kể cả dự bị) phải đăng ký mua BIB chính chủ, họ tên trùng khớp danh sách đội trước <strong>23h59 ngày 10/12/2026</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Bảo lưu Giải Cá Nhân (Mục 2.4)
                  </div>
                  <p className="text-slate-600">
                    Thành tích của từng VĐV khi tham gia nội dung đồng đội <strong>vẫn được ghi nhận đồng thời</strong> để xét các giải thưởng cá nhân của giải chạy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THI ĐẤU & BẢNG ĐIỂM */}
          {activeTab === 'scoring' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Nguyên tắc thi đấu & Quy định DNF / DNS / DSQ */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#9f224e]" />
                  Quy chế tính kết quả thi đấu (Áp dụng cho 15 VĐV chính thức)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Chip time & COT */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Chip-Time & COT
                    </div>
                    <p className="text-slate-600">
                      Tính theo chip-time chính thức của BTC. Phải về đích trước Cut-Off Time (COT): <strong>42km là 6h30&apos;</strong>, <strong>21km là 3h30&apos;</strong>.
                    </p>
                  </div>

                  {/* DNF */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1 text-amber-950">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> DNF (Did Not Finish)
                    </div>
                    <p className="text-amber-800">
                      Chạy quá COT hoặc bỏ cuộc: <strong>0 điểm</strong> và <strong>BỊ TRỪ 10 ĐIỂM/VĐV</strong>. Đội chỉ được có <strong>tối đa 3 VĐV DNF</strong>.
                    </p>
                  </div>

                  {/* LOẠI ĐỘI BỎ CUỘC */}
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-1 text-rose-950">
                    <div className="font-bold flex items-center gap-1 text-rose-700">
                      <X className="w-3.5 h-3.5 text-rose-600" /> LOẠI KHỎI BXH
                    </div>
                    <p className="text-rose-800">
                      Bị loại ngay nếu: <strong>Có từ 4 DNF trở lên</strong>, HOẶC <strong>Có ít nhất 1 DNS (không xuất phát)</strong>, HOẶC <strong>Có 1 DSQ (phạm quy)</strong>.
                    </p>
                  </div>
                </div>

                {/* Công thức tính điểm & Xếp hạng */}
                <div className="p-3 rounded-lg bg-slate-900 text-white text-xs space-y-2 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="font-bold text-rose-400 uppercase tracking-wide">
                      Công thức điểm tổng kết:
                    </span>
                    <span className="font-mono bg-slate-800 px-2.5 py-1 rounded text-amber-300 font-bold">
                      Điểm Đội = (Tổng điểm VĐV về đích) - (10 x Số VĐV DNF)
                    </span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Tiêu chí phụ khi bằng điểm:</strong> (1) Đội có số VĐV DNF ít hơn; (2) Đội có tổng chip-time của tất cả VĐV hoàn thành ít hơn.
                  </p>
                </div>
              </div>

              {/* Bảng điểm quy đổi */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#9f224e]" />
                    Bảng Điểm Quy Đổi Theo Chip-Time
                  </h4>

                  {/* Nút chuyển đổi cự ly */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setScoringDist('42km')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        scoringDist === '42km'
                          ? 'bg-[#9f224e] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Cự ly 42km
                    </button>
                    <button
                      onClick={() => setScoringDist('21km')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        scoringDist === '21km'
                          ? 'bg-[#9f224e] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Cự ly 21km
                    </button>
                  </div>
                </div>

                {scoringDist === '42km' ? (
                  /* Bảng 42km */
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 text-center w-20">Điểm Số</th>
                          <th className="py-2.5 px-4 bg-blue-50/50 text-blue-950">VĐV Nam (42km)</th>
                          <th className="py-2.5 px-4 bg-pink-50/50 text-pink-950">VĐV Nữ (42km)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        <tr className="bg-amber-50/60 font-semibold">
                          <td className="py-2 px-4 text-center font-bold text-amber-700 bg-amber-100/60">10 điểm</td>
                          <td className="py-2 px-4">2h30&apos; – dưới 2h40&apos;</td>
                          <td className="py-2 px-4">2h50&apos; – dưới 3h00&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">9 điểm</td>
                          <td className="py-2 px-4">2h40&apos; – dưới 2h50&apos;</td>
                          <td className="py-2 px-4">3h00&apos; – dưới 3h15&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">8 điểm</td>
                          <td className="py-2 px-4">2h50&apos; – dưới 3h00&apos;</td>
                          <td className="py-2 px-4">3h15&apos; – dưới 3h30&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">7 điểm</td>
                          <td className="py-2 px-4">3h00&apos; – dưới 3h15&apos;</td>
                          <td className="py-2 px-4">3h30&apos; – dưới 3h45&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">6 điểm</td>
                          <td className="py-2 px-4">3h15&apos; – dưới 3h30&apos;</td>
                          <td className="py-2 px-4">3h45&apos; – dưới 4h00&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">5 điểm</td>
                          <td className="py-2 px-4">3h30&apos; – dưới 3h45&apos;</td>
                          <td className="py-2 px-4">4h00&apos; – dưới 4h15&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">4 điểm</td>
                          <td className="py-2 px-4">3h45&apos; – dưới 4h00&apos;</td>
                          <td className="py-2 px-4">4h15&apos; – dưới 4h30&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">3 điểm</td>
                          <td className="py-2 px-4">4h00&apos; – dưới 4h15&apos;</td>
                          <td className="py-2 px-4">4h30&apos; – dưới 4h45&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">2 điểm</td>
                          <td className="py-2 px-4">4h15&apos; – dưới 4h30&apos;</td>
                          <td className="py-2 px-4">4h45&apos; – dưới 5h00&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">1 điểm</td>
                          <td className="py-2 px-4">4h30&apos; – COT (6h30&apos;)</td>
                          <td className="py-2 px-4">5h00&apos; – COT (6h30&apos;)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Bảng 21km */
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 text-center w-20">Điểm Số</th>
                          <th className="py-2.5 px-4 bg-blue-50/50 text-blue-950">VĐV Nam (21km)</th>
                          <th className="py-2.5 px-4 bg-pink-50/50 text-pink-950">VĐV Nữ (21km)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        <tr className="bg-amber-50/60 font-semibold">
                          <td className="py-2 px-4 text-center font-bold text-amber-700 bg-amber-100/60">10 điểm</td>
                          <td className="py-2 px-4">1h15&apos; – dưới 1h20&apos;</td>
                          <td className="py-2 px-4">1h25&apos; – dưới 1h30&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">9 điểm</td>
                          <td className="py-2 px-4">1h20&apos; – dưới 1h25&apos;</td>
                          <td className="py-2 px-4">1h30&apos; – dưới 1h35&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">8 điểm</td>
                          <td className="py-2 px-4">1h25&apos; – dưới 1h30&apos;</td>
                          <td className="py-2 px-4">1h35&apos; – dưới 1h40&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">7 điểm</td>
                          <td className="py-2 px-4">1h30&apos; – dưới 1h35&apos;</td>
                          <td className="py-2 px-4">1h40&apos; – dưới 1h45&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">6 điểm</td>
                          <td className="py-2 px-4">1h35&apos; – dưới 1h40&apos;</td>
                          <td className="py-2 px-4">1h45&apos; – dưới 1h50&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">5 điểm</td>
                          <td className="py-2 px-4">1h40&apos; – dưới 1h45&apos;</td>
                          <td className="py-2 px-4">1h50&apos; – dưới 1h55&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">4 điểm</td>
                          <td className="py-2 px-4">1h45&apos; – dưới 1h50&apos;</td>
                          <td className="py-2 px-4">1h55&apos; – dưới 2h00&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">3 điểm</td>
                          <td className="py-2 px-4">1h50&apos; – dưới 1h55&apos;</td>
                          <td className="py-2 px-4">2h00&apos; – dưới 2h10&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">2 điểm</td>
                          <td className="py-2 px-4">1h55&apos; – dưới 2h00&apos;</td>
                          <td className="py-2 px-4">2h10&apos; – dưới 2h20&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">1 điểm</td>
                          <td className="py-2 px-4">2h00&apos; – COT (3h30&apos;)</td>
                          <td className="py-2 px-4">2h20&apos; – COT (3h30&apos;)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GIẢI THƯỞNG & QUYỀN LỢI */}
          {activeTab === 'prizes' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Quyền lợi Voucher BIB 2027 */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-300/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <BadgePercent className="w-5 h-5 text-amber-600" />
                  <span>Quyền Lợi Mã Ưu Đãi BIB VnExpress Marathon 2027</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-600" /> Top 1 – Top 5 Mỗi Cự Ly:
                    </span>
                    <p className="text-slate-700">
                      Mỗi thành viên (cả 15 chính thức + 3 dự bị = <strong>18 người</strong>) nhận <strong>01 mã giảm 100%</strong> giá vé mua BIB 01 giải bất kỳ thuộc hệ thống VM 2027.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Các Đội Hoàn Thành Khác:
                    </span>
                    <p className="text-slate-700">
                      Mỗi thành viên (tổng <strong>18 người</strong>) nhận <strong>01 mã giảm 50%</strong> giá vé mua BIB 01 giải bất kỳ thuộc hệ thống VM 2027 (áp dụng cho đội hợp lệ, không bị loại).
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Mã ưu đãi không quy đổi thành tiền mặt, chỉ được chuyển nhượng trong nội bộ thành viên của đội.
                </p>
              </div>

              {/* Bảng Giải Thưởng Tiền Mặt */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Medal className="w-4 h-4 text-[#9f224e]" />
                    Cơ Cấu Giải Thưởng Tiền Mặt & Kỷ Niệm Chương
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    Trao giải Top 1 đến Top 5
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bảng 42km */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-sm">Đồng Đội 42km</span>
                      <span className="text-xs font-bold text-[#9f224e] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        Tổng: 43.000.000 VNĐ
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 font-bold text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-600" /> Hạng Nhất (Vô địch)
                        </span>
                        <span className="text-amber-700 text-sm">15.000.000 VNĐ</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-800">
                        <span>Hạng Nhì</span>
                        <span className="font-bold text-slate-900">10.000.000 VNĐ</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span>Hạng Ba</span>
                        <span className="font-bold text-slate-900">7.000.000 VNĐ</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span>Hạng Tư</span>
                        <span className="font-bold text-slate-900">6.000.000 VNĐ</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span>Hạng Năm</span>
                        <span className="font-bold text-slate-900">5.000.000 VNĐ</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 text-center">
                      + Kỷ niệm chương vinh danh dành cho toàn bộ các đội đạt giải.
                    </p>
                  </div>

                  {/* Bảng 21km */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-sm">Đồng Đội 21km</span>
                      <span className="text-xs font-bold text-[#9f224e] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        Tổng: 29.000.000 VNĐ
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 font-bold text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-600" /> Hạng Nhất (Vô địch)
                        </span>
                        <span className="text-amber-700 text-sm">10.000.000 VNĐ</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-800">
                        <span>Hạng Nhì</span>
                        <span className="font-bold text-slate-900">7.000.000 VNĐ</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span>Hạng Ba</span>
                        <span className="font-bold text-slate-900">5.000.000 VNĐ</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span>Hạng Tư</span>
                        <span className="font-bold text-slate-900">4.000.000 VNĐ</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span>Hạng Năm</span>
                        <span className="font-bold text-slate-900">3.000.000 VNĐ</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 text-center">
                      + Kỷ niệm chương vinh danh dành cho toàn bộ các đội đạt giải.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: THỜI HẠN & HỒ SƠ */}
          {activeTab === 'timeline' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Mốc thời gian quan trọng */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9f224e]" />
                  Các Mốc Thời Hạn Bắt Buộc (Mục 7 Quy Chế)
                </h4>

                <div className="space-y-3 text-xs md:text-sm">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#9f224e] flex items-center justify-center font-bold shrink-0 text-xs">
                      01
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold">23h59 ngày 01/12/2026</strong>
                        <span className="text-[11px] bg-rose-100 text-[#9f224e] font-semibold px-2 py-0.5 rounded">
                          Chốt danh sách đội
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Hạn chốt danh sách đội đăng ký ban đầu. Sau thời điểm này, đội không được bổ sung hay thay đổi VĐV mới.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 text-xs">
                      10
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold">23h59 ngày 10/12/2026</strong>
                        <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                          Hạn chót hoán đổi & Mua BIB
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Hạn chót hoán đổi giữa thành viên chính thức và dự bị (hoặc thay thế dự bị vì lý do bất khả kháng). Đồng thời cả 18 thành viên phải hoàn tất mua BIB chính chủ đúng thông tin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hồ sơ yêu cầu */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9f224e]" />
                  Hồ Sơ Đăng Ký Cần Chuẩn Bị
                </h4>
                <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                  <li className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bản scan hoặc ảnh chụp rõ nét <strong>CCCD / Căn cước / Hộ chiếu</strong> của từng thành viên.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>01 ảnh chân dung nhìn rõ khuôn mặt phục vụ xác thực hồ sơ VĐV.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đường dẫn (URL) trang cá nhân Facebook (nếu có) để đối chiếu thông tin thể thao.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hồ sơ minh chứng thành tích (đối với VĐV nước ngoài khi BTC có yêu cầu đối soát).</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Ban Tổ Chức VnExpress Marathon • Quy chế áp dụng năm 2026
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#9f224e] hover:bg-[#851c41] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Tôi đã hiểu và đồng ý
          </button>
        </div>

      </div>
    </div>
  );
};
