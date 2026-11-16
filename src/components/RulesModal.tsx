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
  Sparkles,
  Megaphone,
  Info,
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
                  VM Hải Phòng 2026
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-0.5 leading-snug">
                Quy Chế Giải Đồng Đội VnExpress Marathon 2026
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng điều lệ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 pt-2 border-b border-slate-200 bg-slate-50/80 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            1. Quy Định Đội
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'eligibility'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            2. Quy Chế Thành Viên
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'scoring'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            3–4. Thi Đấu & Bảng Điểm
          </button>

          <button
            onClick={() => setActiveTab('prizes')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'prizes'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            5–6. Quyền Lợi & Giải Thưởng
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-[#9f224e] text-[#9f224e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            7–8. Thời Hạn, Hồ Sơ & Điều Khoản
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-700 leading-relaxed">

          {/* TAB 1: MỤC 1 - QUY ĐỊNH ĐỘI */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Giới thiệu quy chuẩn */}
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 text-xs md:text-sm space-y-1.5">
                <p className="text-slate-800">
                  Quy chế này áp dụng cho giải đồng đội của toàn hệ thống <strong>VnExpress Marathon (VM)</strong>. Trong năm 2026, giải đồng đội được tổ chức tại giải <strong>VnExpress Marathon Hải Phòng</strong> nhằm mở rộng quy mô và mang tính toàn diện hơn, với hai nội dung thi đấu riêng biệt: <strong>Đồng đội 42km (Full Marathon)</strong> và <strong>Đồng đội 21km (Half Marathon)</strong>.
                </p>
                <p className="text-slate-700">
                  Mỗi đội đăng ký thi đấu một trong hai nội dung nêu trên và cử một <strong>Trưởng đội</strong> trong số các thành viên.
                </p>
              </div>

              {/* Box Quy chuẩn 18 VĐV */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                    <Users className="w-5 h-5 text-[#9f224e]" />
                    <span>Cơ cấu bắt buộc: 18 Thành viên / Đội</span>
                  </div>
                  <span className="text-[#9f224e] font-bold bg-rose-100/70 border border-rose-200 px-2.5 py-1 rounded-full text-xs">
                    15 Chính thức + 03 Dự bị
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Cơ cấu giới tính là bắt buộc, áp dụng cho cả hai nội dung (Đồng đội 42km và Đồng đội 21km):
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Chính thức */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        15 Thành Viên Chính Thức
                      </span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                        Tính điểm thi đấu
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
                          Cố định 02 Nam
                        </strong>
                      </li>
                      <li className="flex justify-between items-center py-1">
                        <span>• VĐV Nữ dự bị:</span>
                        <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded">
                          Cố định 01 Nữ
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
                  Quy định cự ly & thành viên dự bị
                </h4>
                <ul className="space-y-2 text-xs md:text-sm text-slate-600 list-disc list-inside">
                  <li>Thành viên dự bị đăng ký cùng cự ly với đội và <strong>chỉ được thay thế thành viên chính thức cùng giới tính</strong>.</li>
                  <li>Thành viên dự bị <strong>không bắt buộc thi đấu</strong>.</li>
                  <li>Mỗi VĐV chỉ được tham gia <strong>một đội</strong>.</li>
                  <li>Mỗi đội cử một <strong>Trưởng đội</strong> trong số các thành viên và cung cấp thông tin liên hệ của Trưởng đội.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: MỤC 2 - QUY CHẾ THÀNH VIÊN */}
          {activeTab === 'eligibility' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-4 flex gap-3 text-amber-900 text-xs md:text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <strong className="font-bold block text-sm">Nguyên tắc chung (Mục 2 Quy chế)</strong>
                  <p>
                    Thành viên tham gia đội phải đáp ứng đồng thời tiêu chí riêng theo quốc tịch (<strong>Mục 2.1</strong> hoặc <strong>2.2</strong>) và tiêu chí chung (<strong>Mục 2.3</strong>).
                  </p>
                  <p className="text-amber-900/90">
                    <strong>Môn thể thao có nội dung chạy, đi bộ</strong> là bất kỳ môn thể thao nào có nội dung chạy hoặc đi bộ mà kết quả của nội dung đó được tính vào thành tích chung cuộc, bao gồm nhưng không giới hạn: điền kinh (các nội dung chạy, đi bộ), chạy địa hình, triathlon, duathlon, aquathlon, điền kinh phối hợp và phối hợp hiện đại. <strong>VĐV chuyên nghiệp của các môn thể thao khác không có nội dung chạy, đi bộ không bị hạn chế</strong> tư cách tham gia theo Mục 2.1 và 2.2.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2.1 VĐV Quốc tịch Việt Nam */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    2.1. Đối Với VĐV Có Quốc Tịch Việt Nam
                  </div>
                  <p className="text-xs md:text-sm text-slate-700">
                    Là các VĐV đủ điều kiện tham gia giải chạy theo quy định tại Điều lệ giải VM Hải Phòng 2026, <strong>ngoại trừ</strong> các trường hợp sau đây:
                  </p>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="text-[#9f224e] font-bold">•</span>
                      <span>
                        Là thành viên <strong>đội tuyển quốc gia, đội tuyển tỉnh, thành phố, ngành</strong>, hoặc nhận lương, tiền hỗ trợ tập luyện, thi đấu (theo hợp đồng lao động, hợp đồng cộng tác viên hoặc hình thức tương đương) từ đội tuyển hoặc câu lạc bộ thể thao chuyên nghiệp <strong>của môn thể thao có nội dung chạy, đi bộ trên lãnh thổ Việt Nam</strong> tính đến thời điểm thi đấu chính thức (theo các <strong>Điều 32, 44 và 45 Luật Thể dục, thể thao số 77/2006/QH11, sửa đổi, bổ sung năm 2018</strong>).
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 2.2 VĐV Quốc tịch Nước ngoài */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                    <Globe className="w-4 h-4 text-sky-600" />
                    2.2. Đối Với VĐV Có Quốc Tịch Nước Ngoài
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    VĐV mang đồng thời quốc tịch Việt Nam và quốc tịch nước ngoài áp dụng theo Mục này.
                  </p>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="text-[#9f224e] font-bold">•</span>
                      <span>Không là thành viên đội tuyển quốc gia của bất kỳ quốc gia nào và không nhận hỗ trợ, tiền lương từ bất kỳ đội tuyển, câu lạc bộ thể thao chuyên nghiệp nào tính đến ngày thi đấu.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#9f224e] font-bold">•</span>
                      <span><strong>Không có thành tích cá nhân ở mức chuyên nghiệp</strong> trong <strong>03 năm gần nhất</strong> tính đến ngày thi đấu, căn cứ kết quả chính thức do World Athletics, AIMS hoặc ban tổ chức các giải chạy được công nhận công bố.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#9f224e] font-bold">•</span>
                      <span>BTC có quyền yêu cầu VĐV cung cấp hồ sơ thành tích để đối chiếu.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bảng chuẩn cấm chuyên nghiệp nước ngoài */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-rose-950 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                    Mốc Thành Tích Xác Định VĐV Chuyên Nghiệp (Mục 2.2 — VĐV Nước Ngoài)
                  </h4>
                  <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                    Thành tích tốt nhất 03 năm gần nhất
                  </span>
                </div>
                <p className="text-xs text-rose-800">
                  VĐV có thành tích cá nhân ở một trong hai cự ly dưới mức quy định sau đây được xác định là <strong>VĐV chuyên nghiệp</strong> và <strong>không đủ điều kiện</strong> tham gia nội dung đồng đội:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left bg-white rounded-lg overflow-hidden border border-rose-200">
                    <thead className="bg-rose-100/70 text-rose-950 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Giới</th>
                        <th className="py-2.5 px-4">Full Marathon (42km)</th>
                        <th className="py-2.5 px-4">Half Marathon (21km)</th>
                        <th className="py-2.5 px-4 text-center">Kết luận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-900">Nam</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Dưới 2h30&apos;</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Dưới 1h15&apos;</td>
                        <td className="py-2.5 px-4 text-center font-bold text-rose-700 bg-rose-50/60">Không đủ điều kiện</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-900">Nữ</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Dưới 2h50&apos;</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Dưới 1h25&apos;</td>
                        <td className="py-2.5 px-4 text-center font-bold text-rose-700 bg-rose-50/60">Không đủ điều kiện</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2.3 & 2.4 Tiêu chí chung & Thành tích cá nhân */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    2.3. Tiêu Chí Chung Đối Với Mọi VĐV
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    <li>
                      Phải đăng ký mua <strong>BIB chính chủ</strong>, với họ tên và các thông tin trùng khớp với danh sách thi đấu của đội. Cả 18 thành viên (kể cả dự bị) phải hoàn tất mua BIB chậm nhất trước <strong>23h59 ngày 10/12/2026</strong>.
                    </li>
                    <li>Mỗi VĐV chỉ được tham gia một đội.</li>
                    <li>
                      Khi đăng ký, VĐV cam kết đáp ứng các tiêu chí tại Mục 2. BTC có quyền yêu cầu hồ sơ chứng minh. <strong>VĐV kê khai không trung thực bị xử lý theo trường hợp DSQ tại Mục 3.</strong>
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    2.4. Thành Tích Cá Nhân
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Thành tích của VĐV trong nội dung đồng đội <strong>vẫn được ghi nhận</strong> để xét giải thưởng cá nhân của giải.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MỤC 3 & 4 - QUY CHẾ THI ĐẤU & BẢNG ĐIỂM */}
          {activeTab === 'scoring' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Nguyên tắc thi đấu & Quy định DNF / DNS / DSQ */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#9f224e]" />
                    3. Quy Chế Thi Đấu (Áp dụng cho 15 VĐV chính thức đã chốt)
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500">
                    Thành viên dự bị không bắt buộc thi đấu
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Chip time & COT */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Chip-Time &amp; COT
                    </div>
                    <p className="text-slate-600">
                      Thành tích xác định theo chip-time chính thức do BTC công bố. Thành viên chính thức phải thi đấu đúng cự ly đã đăng ký của đội và về đích trong thời gian giới hạn (COT): <strong>42km là 6h00&apos;</strong>, <strong>21km là 3h30&apos;</strong>.
                    </p>
                  </div>

                  {/* DNF */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1 text-amber-950">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> DNF (Did Not Finish)
                    </div>
                    <p className="text-amber-800">
                      Không về đích (gồm chạy quá COT): <strong>0 điểm</strong> và đội <strong>bị trừ thêm 10 điểm/thành viên DNF</strong>. Mỗi đội được phép có <strong>tối đa 03 thành viên DNF</strong> vẫn được xếp hạng.
                    </p>
                  </div>

                  {/* LOẠI ĐỘI */}
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-1 text-rose-950">
                    <div className="font-bold flex items-center gap-1 text-rose-700">
                      <X className="w-3.5 h-3.5 text-rose-600" /> Loại Khỏi Bảng Xếp Hạng
                    </div>
                    <p className="text-rose-800">
                      Đội bị loại nếu: <strong>Từ 04 thành viên chính thức DNF trở lên</strong>; HOẶC có ít nhất <strong>01 DNS</strong> (không xuất phát); HOẶC có ít nhất <strong>01 DSQ</strong> (vi phạm Điều lệ: nhận hỗ trợ ngoài BTC, đi đường tắt, sai đường chạy, không qua thảm chip...).
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  • Đội không bị loại theo các trường hợp trên được xác định là <strong>đội hoàn thành giải</strong>. Đội bị loại không được xếp hạng và không được hưởng giải thưởng (Mục 6), mã ưu đãi (Mục 5). Trường hợp bất khả kháng thực hiện theo Mục 7.
                </p>

                {/* Công thức tính điểm & Xếp hạng */}
                <div className="p-3.5 rounded-lg bg-slate-900 text-white text-xs space-y-2 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="font-bold text-rose-400 uppercase tracking-wide">
                      4.3. Cách tính điểm &amp; Xếp hạng đội:
                    </span>
                    <span className="font-mono bg-slate-800 px-2.5 py-1 rounded text-amber-300 font-bold">
                      Tổng điểm = Tổng điểm VĐV về đích − (10 × Số VĐV DNF)
                    </span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li>• VĐV nam tra điểm theo cột Nam, VĐV nữ tra điểm theo cột Nữ, tương ứng với cự ly thi đấu của đội.</li>
                    <li>• Tổng điểm đội <strong>thấp nhất là 0 điểm và cao nhất là 150 điểm</strong>. <em>Ví dụ: đội có 2 thành viên DNF, 13 thành viên còn lại được tổng cộng 90 điểm thì tổng điểm đội là 90 − 20 = 70 điểm.</em></li>
                    <li>• Đội có tổng điểm cao nhất trong cùng nội dung xếp hạng cao nhất. Nếu bằng điểm: (1) Đội có ít thành viên DNF hơn xếp trên; (2) Tổng chip-time các thành viên về đích thấp hơn xếp trên; (3) Nếu vẫn bằng nhau, <strong>BTC xem xét và quyết định</strong>.</li>
                    <li>• <strong>Hai nội dung 42km và 21km được xếp hạng độc lập, không so sánh chéo.</strong></li>
                  </ul>
                </div>
              </div>

              {/* Bảng điểm quy đổi */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#9f224e]" />
                    4.1 &amp; 4.2. Bảng Điểm Quy Đổi Theo Chip-Time
                  </h4>

                  {/* Nút chuyển đổi cự ly */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setScoringDist('42km')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        scoringDist === '42km'
                          ? 'bg-[#9f224e] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Đồng đội 42km
                    </button>
                    <button
                      onClick={() => setScoringDist('21km')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        scoringDist === '21km'
                          ? 'bg-[#9f224e] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Đồng đội 21km
                    </button>
                  </div>
                </div>

                {scoringDist === '42km' ? (
                  /* Bảng 42km (Mục 4.1) */
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 text-center w-24">Điểm</th>
                          <th className="py-2.5 px-4 bg-blue-50/50 text-blue-950">Nam (42km)</th>
                          <th className="py-2.5 px-4 bg-pink-50/50 text-pink-950">Nữ (42km)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        <tr className="bg-amber-50/60 font-semibold">
                          <td className="py-2 px-4 text-center font-bold text-amber-700 bg-amber-100/60">10</td>
                          <td className="py-2 px-4">2h30&apos; – dưới 2h40&apos;</td>
                          <td className="py-2 px-4">2h50&apos; – dưới 3h00&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">9</td>
                          <td className="py-2 px-4">2h40&apos; – dưới 2h50&apos;</td>
                          <td className="py-2 px-4">3h00&apos; – dưới 3h15&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">8</td>
                          <td className="py-2 px-4">2h50&apos; – dưới 3h00&apos;</td>
                          <td className="py-2 px-4">3h15&apos; – dưới 3h30&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">7</td>
                          <td className="py-2 px-4">3h00&apos; – dưới 3h15&apos;</td>
                          <td className="py-2 px-4">3h30&apos; – dưới 3h50&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">6</td>
                          <td className="py-2 px-4">3h15&apos; – dưới 3h30&apos;</td>
                          <td className="py-2 px-4">3h50&apos; – dưới 4h10&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">5</td>
                          <td className="py-2 px-4">3h30&apos; – dưới 3h45&apos;</td>
                          <td className="py-2 px-4">4h10&apos; – dưới 4h30&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">4</td>
                          <td className="py-2 px-4">3h45&apos; – dưới 4h00&apos;</td>
                          <td className="py-2 px-4">4h30&apos; – dưới 4h50&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">3</td>
                          <td className="py-2 px-4">4h00&apos; – dưới 4h30&apos;</td>
                          <td className="py-2 px-4">4h50&apos; – dưới 5h15&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">2</td>
                          <td className="py-2 px-4">4h30&apos; – dưới 5h15&apos;</td>
                          <td className="py-2 px-4">5h15&apos; – dưới 5h40&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">1</td>
                          <td className="py-2 px-4">5h15&apos; – 6h00&apos; (hết COT)</td>
                          <td className="py-2 px-4">5h40&apos; – 6h00&apos; (hết COT)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Bảng 21km (Mục 4.2) */
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 text-center w-24">Điểm</th>
                          <th className="py-2.5 px-4 bg-blue-50/50 text-blue-950">Nam (21km)</th>
                          <th className="py-2.5 px-4 bg-pink-50/50 text-pink-950">Nữ (21km)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        <tr className="bg-amber-50/60 font-semibold">
                          <td className="py-2 px-4 text-center font-bold text-amber-700 bg-amber-100/60">10</td>
                          <td className="py-2 px-4">1h15&apos; – dưới 1h25&apos;</td>
                          <td className="py-2 px-4">1h25&apos; – dưới 1h35&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">9</td>
                          <td className="py-2 px-4">1h25&apos; – dưới 1h35&apos;</td>
                          <td className="py-2 px-4">1h35&apos; – dưới 1h45&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">8</td>
                          <td className="py-2 px-4">1h35&apos; – dưới 1h45&apos;</td>
                          <td className="py-2 px-4">1h45&apos; – dưới 1h55&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">7</td>
                          <td className="py-2 px-4">1h45&apos; – dưới 1h55&apos;</td>
                          <td className="py-2 px-4">1h55&apos; – dưới 2h05&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">6</td>
                          <td className="py-2 px-4">1h55&apos; – dưới 2h05&apos;</td>
                          <td className="py-2 px-4">2h05&apos; – dưới 2h15&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">5</td>
                          <td className="py-2 px-4">2h05&apos; – dưới 2h15&apos;</td>
                          <td className="py-2 px-4">2h15&apos; – dưới 2h25&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">4</td>
                          <td className="py-2 px-4">2h15&apos; – dưới 2h25&apos;</td>
                          <td className="py-2 px-4">2h25&apos; – dưới 2h40&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">3</td>
                          <td className="py-2 px-4">2h25&apos; – dưới 2h40&apos;</td>
                          <td className="py-2 px-4">2h40&apos; – dưới 2h55&apos;</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">2</td>
                          <td className="py-2 px-4">2h40&apos; – dưới 2h55&apos;</td>
                          <td className="py-2 px-4">2h55&apos; – dưới 3h10&apos;</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-center font-bold text-slate-900 bg-slate-50">1</td>
                          <td className="py-2 px-4">2h55&apos; – 3h30&apos; (hết COT)</td>
                          <td className="py-2 px-4">3h10&apos; – 3h30&apos; (hết COT)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MỤC 5 & 6 - QUYỀN LỢI & GIẢI THƯỞNG */}
          {activeTab === 'prizes' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* 5.1 Mã ưu đãi BIB năm 2027 */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-300/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <BadgePercent className="w-5 h-5 text-amber-600" />
                  <span>5.1. Mã Ưu Đãi BIB Năm 2027</span>
                </div>
                <p className="text-xs text-slate-700">
                  Đội hoàn thành giải (theo Mục 3) được BTC cấp mã ưu đãi BIB năm 2027, áp dụng trên toàn bộ hệ thống giải VnExpress Marathon (VM). Mỗi mã dùng cho một BIB bất kỳ.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-600" /> Top 1–5 Ở Mỗi Nội Dung:
                    </span>
                    <p className="text-slate-700">
                      Nhận <strong>18 mã giảm giá 100%</strong> (tương ứng 18 thành viên trong danh sách đã chốt ngày 10/12/2026, bao gồm cả dự bị không thi đấu).
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Các Đội Còn Lại Hoàn Thành Giải:
                    </span>
                    <p className="text-slate-700">
                      Nhận <strong>18 mã giảm giá 50%</strong> (tương ứng 18 thành viên trong danh sách đã chốt ngày 10/12/2026, bao gồm cả dự bị không thi đấu).
                    </p>
                  </div>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• Mỗi đội chỉ được hưởng một mức ưu đãi theo thứ hạng; các mức ưu đãi không cộng dồn.</li>
                  <li>• Mã ưu đãi được gửi cho <strong>Trưởng đội</strong>, người có trách nhiệm phân bổ cho các thành viên trong đội. Thời hạn, điều kiện sử dụng và quy trình áp dụng mã do BTC thông báo khi cấp mã.</li>
                </ul>
              </div>

              {/* 5.2 Truyền thông */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Megaphone className="w-4 h-4 text-[#9f224e]" />
                  <span>5.2. Quyền Lợi Truyền Thông</span>
                </div>
                <ul className="space-y-1.5 text-xs md:text-sm text-slate-700 list-disc list-inside">
                  <li>
                    Các bài viết về đội, quá trình luyện tập và hoạt động của đội được truyền thông trên Báo điện tử <strong>VnExpress.net</strong> và <strong>fanpage của giải</strong>, theo kế hoạch truyền thông của BTC.
                  </li>
                  <li>
                    Sau giải, BTC truyền thông hình ảnh và câu chuyện của <strong>05 đội đạt giải</strong> ở mỗi nội dung, mỗi đội một bài viết trên các kênh truyền thông xã hội của giải.
                  </li>
                </ul>
              </div>

              {/* 6. Cơ cấu giải thưởng */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Medal className="w-4 h-4 text-[#9f224e]" />
                    6. Cơ Cấu Giải Thưởng
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    Mỗi nội dung trao 05 giải (Top 1–5)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bảng 42km */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-sm">Đồng Đội 42km</span>
                      <span className="text-xs font-bold text-[#9f224e] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        Tổng tiền mặt: 43.000.000 đ
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 font-bold text-amber-950 gap-2">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Trophy className="w-4 h-4 text-amber-600" /> Nhất
                        </span>
                        <span className="text-amber-800 text-right">15.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-800 gap-2">
                        <span className="shrink-0">Nhì</span>
                        <span className="font-bold text-slate-900 text-right">10.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700 gap-2">
                        <span className="shrink-0">Ba</span>
                        <span className="font-bold text-slate-900 text-right">7.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700 gap-2">
                        <span className="shrink-0">Tư</span>
                        <span className="font-bold text-slate-900 text-right">6.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700 gap-2">
                        <span className="shrink-0">Năm</span>
                        <span className="font-bold text-slate-900 text-right">5.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bảng 21km */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-sm">Đồng Đội 21km</span>
                      <span className="text-xs font-bold text-[#9f224e] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        Tổng tiền mặt: 29.000.000 đ
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 font-bold text-amber-950 gap-2">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Trophy className="w-4 h-4 text-amber-600" /> Nhất
                        </span>
                        <span className="text-amber-800 text-right">10.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-800 gap-2">
                        <span className="shrink-0">Nhì</span>
                        <span className="font-bold text-slate-900 text-right">7.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700 gap-2">
                        <span className="shrink-0">Ba</span>
                        <span className="font-bold text-slate-900 text-right">5.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700 gap-2">
                        <span className="shrink-0">Tư</span>
                        <span className="font-bold text-slate-900 text-right">4.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700 gap-2">
                        <span className="shrink-0">Năm</span>
                        <span className="font-bold text-slate-900 text-right">3.000.000 đ + hiện vật (nếu có)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lưu ý giải thưởng */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <p>
                    • Tiền thưởng được trao cho <strong>Trưởng đội</strong> đại diện nhận; việc sử dụng giải thưởng trong đội do các thành viên tự thỏa thuận.
                  </p>
                  <p>
                    • Cơ cấu giải thưởng nêu trên là <strong>cơ cấu dự kiến</strong>. BTC có thể điều chỉnh số lượng và giá trị giải thưởng của từng nội dung tùy theo số đội tham gia thực tế ở cự ly đó. Số giải được trao không vượt quá số đội hoàn thành giải (không bị loại theo Mục 3) của nội dung tương ứng. Cơ cấu giải thưởng chính thức của từng nội dung (nếu có điều chỉnh) được BTC thông báo đến các Trưởng đội sau thời điểm chốt danh sách ngày <strong>10/12/2026</strong> và trước ngày thi đấu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MỤC 7 & 8 - THỜI HẠN, HỒ SƠ & ĐIỀU KHOẢN CHUNG */}
          {activeTab === 'timeline' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Mốc thời gian quan trọng */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9f224e]" />
                  7. Đăng Ký Tên Đội, Danh Sách &amp; Các Mốc Thời Hạn
                </h4>

                <div className="space-y-3 text-xs md:text-sm">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#9f224e] flex items-center justify-center font-bold shrink-0 text-xs">
                      01
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-slate-900 font-bold">Chậm nhất trước 23h59 ngày 01/12/2026</strong>
                        <span className="text-[11px] bg-rose-100 text-[#9f224e] font-semibold px-2 py-0.5 rounded">
                          Đăng ký đội
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Các đội đăng ký tên đội, nội dung thi đấu (42km hoặc 21km) và danh sách 18 thành viên (15 chính thức gồm 10 nam, 05 nữ; 03 dự bị gồm 02 nam, 01 nữ) trên trang đăng ký chính thức của giải. Mỗi đội cử một Trưởng đội trong số các thành viên và cung cấp thông tin liên hệ của Trưởng đội.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 text-xs">
                      02
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-slate-900 font-bold">Sau 23h59 ngày 01/12/2026 đến hết 23h59 ngày 10/12/2026</strong>
                        <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                          Điều chỉnh lần cuối &amp; Mua BIB
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Các đội được điều chỉnh danh sách bằng một trong hai hình thức sau, bảo đảm đúng cơ cấu giới tính tại Mục 1:
                      </p>
                      <ul className="text-slate-600 mt-1 space-y-1 list-disc list-inside text-xs">
                        <li>Hoán đổi giữa thành viên chính thức và thành viên dự bị;</li>
                        <li>Thay thành viên dự bị bằng VĐV khác (VĐV mới phải đáp ứng Mục 2 và hoàn tất mua BIB chính chủ trước <strong>23h59 ngày 10/12/2026</strong>).</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-xs">
                      03
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-slate-900 font-bold">Sau 23h59 ngày 10/12/2026</strong>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                          Danh sách chính thức
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Danh sách đội là chính thức và các đội không được tự thay đổi. Trường hợp thành viên không thể tham gia vì lý do <strong>bất khả kháng</strong>, Trưởng đội liên hệ BTC, kèm minh chứng, để được xem xét hỗ trợ.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cảnh báo hệ thống đăng ký */}
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Quy định về hệ thống đăng ký:</strong> Khi VĐV đã tham gia một đội trên hệ thống, thông tin cá nhân và cự ly thi đấu của VĐV đó <strong>không thể chỉnh sửa, kể cả khi VĐV đã rời đội</strong>. VĐV cần kiểm tra kỹ thông tin và cự ly trước khi tham gia đội.
                  </div>
                </div>
              </div>

              {/* Hồ sơ đăng ký & Nộp thành tích */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9f224e]" />
                  Hồ Sơ Đăng Ký &amp; Nộp Thành Tích
                </h4>
                <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                  <li className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Hồ sơ từng thành viên gồm:</strong> Họ tên đầy đủ, bản scan căn cước công dân hoặc hộ chiếu, đường link Facebook cá nhân và ảnh chân dung chụp trong vòng <strong>03 tháng gần nhất</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>VĐV có quốc tịch nước ngoài:</strong> Cung cấp thêm thông tin thành tích cá nhân trong <strong>03 năm gần nhất</strong> theo Mục 2.2.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Nộp thành tích:</strong> Trưởng đội chịu trách nhiệm bảo đảm nộp đầy đủ thành tích cá nhân của tất cả thành viên trong đội cho BTC, theo hướng dẫn và thời hạn do BTC thông báo trước ngày thi đấu.</span>
                  </li>
                </ul>
              </div>

              {/* Mục 8. Điều khoản chung */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2.5">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-rose-400" />
                  8. Điều Khoản Chung
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  <li>
                    Những nội dung không quy định tại Quy chế này được thực hiện theo <strong>Điều lệ giải VnExpress Marathon Hải Phòng 2026</strong>.
                  </li>
                  <li>
                    Trường hợp số đội đăng ký của một nội dung chưa đủ để bảo đảm tính cạnh tranh, BTC sẽ quyết định kế hoạch thi đấu của nội dung đó và thông báo đến các Trưởng đội chậm nhất <strong>03 ngày trước ngày thi đấu</strong>.
                  </li>
                  <li>
                    <strong>Quyết định của BTC là quyết định cuối cùng.</strong>
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
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#9f224e] hover:bg-[#851c41] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            Tôi đã hiểu và đồng ý
          </button>
        </div>

      </div>
    </div>
  );
};
