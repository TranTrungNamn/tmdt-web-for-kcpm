import React, { useState, useEffect, useRef } from "react";
import { Product } from "../../types";
import { 
  Boxes, 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  RefreshCw,
  Edit3
} from "lucide-react";

interface StockManagerProps {
  products: Product[];
  onOpenEditForm: (product: Product) => void;
  onRefreshProducts: () => void;
  isDarkMode?: boolean;
}

export default function StockManager({
  products,
  onOpenEditForm,
  onRefreshProducts,
  isDarkMode = false,
}: StockManagerProps) {
  const d = isDarkMode;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "out" | "low" | "ok">("all");
  const [sortBy, setSortBy] = useState<"name" | "stock-asc" | "stock-desc">("stock-asc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Statistics
  const totalStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
  const outOfStockCount = products.filter(p => (p.stock ?? 0) === 0).length;
  const lowStockCount = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;
  const healthyStockCount = products.filter(p => (p.stock ?? 0) > 5).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshProducts();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Filter & Search & Sort
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const stock = p.stock ?? 0;
      if (statusFilter === "out") return matchesSearch && stock === 0;
      if (statusFilter === "low") return matchesSearch && stock > 0 && stock <= 5;
      if (statusFilter === "ok") return matchesSearch && stock > 5;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      const stockA = a.stock ?? 0;
      const stockB = b.stock ?? 0;
      if (sortBy === "stock-asc") {
        return stockA - stockB;
      }
      return stockB - stockA;
    });

  return (
    <div className="animate-fade-in space-y-6 font-sans">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`border rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all duration-300 ${
          d ? 'bg-[#161b22] border-[#30363d] text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Tổng số lượng tồn</span>
            <strong className="text-2xl font-black font-mono tracking-tight block mt-1">
              {totalStock.toLocaleString("vi-VN")} chiếc
            </strong>
            <span className="text-[9px] text-gray-400 block font-mono">Toàn bộ mặt hàng</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${d ? 'bg-violet-950/40 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
            <Boxes size={20} />
          </div>
        </div>

        <div className={`border rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all duration-300 ${
          d ? 'bg-[#161b22] border-[#30363d] text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider block">Đã cháy hàng (0)</span>
            <strong className={`text-2xl font-black font-mono tracking-tight block mt-1 ${outOfStockCount > 0 ? 'text-rose-500' : ''}`}>
              {outOfStockCount} sản phẩm
            </strong>
            <span className="text-[9px] text-gray-400 block font-mono">Cần nhập kho gấp</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${outOfStockCount > 0 ? (d ? 'bg-rose-950/40 text-rose-450' : 'bg-rose-50 text-rose-600') : (d ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
            <TrendingDown size={20} />
          </div>
        </div>

        <div className={`border rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all duration-300 ${
          d ? 'bg-[#161b22] border-[#30363d] text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider block">Sắp hết hàng (1-5)</span>
            <strong className={`text-2xl font-black font-mono tracking-tight block mt-1 ${lowStockCount > 0 ? 'text-amber-500' : ''}`}>
              {lowStockCount} sản phẩm
            </strong>
            <span className="text-[9px] text-gray-400 block font-mono">Cảnh báo tồn kho thấp</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${lowStockCount > 0 ? (d ? 'bg-amber-950/40 text-amber-450' : 'bg-amber-50 text-amber-600') : (d ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className={`border rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all duration-300 ${
          d ? 'bg-[#161b22] border-[#30363d] text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider block">Tồn kho dồi dào (&gt;5)</span>
            <strong className="text-2xl font-black font-mono tracking-tight block mt-1 text-emerald-500">
              {healthyStockCount} sản phẩm
            </strong>
            <span className="text-[9px] text-gray-400 block font-mono">Đủ cung ứng thị trường</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${d ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Control Panel (Search, Filter, Sort, Sync) */}
      <div className={`border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 ${
        d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
      }`}>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className={`w-full rounded-xl pl-9 pr-3 py-2.5 outline-none text-xs font-semibold transition-all duration-300 border ${
                d
                  ? 'bg-black/20 border-white/10 text-white focus:bg-black/35 focus:border-indigo-500 placeholder-gray-500'
                  : 'bg-white/40 border-black/10 text-gray-900 focus:bg-white/80 focus:border-black placeholder-gray-400'
              }`}
            />
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>

          {/* Status filter tabs */}
          <div className={`flex rounded-xl p-1 border ${d ? 'border-[#30363d] bg-black/20' : 'border-gray-200 bg-gray-50'}`}>
            {(["all", "out", "low", "ok"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === status
                    ? d
                      ? "bg-white text-black font-extrabold"
                      : "bg-black text-white font-extrabold"
                    : d
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {status === "all" ? "Tất cả" : status === "out" ? "Hết hàng" : status === "low" ? "Sắp hết" : "An toàn"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className={d ? "text-gray-400" : "text-gray-500"} />
            <div className="relative" ref={sortDropdownRef}>
              {/* Custom Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer w-44
                  ${
                    d
                      ? isSortDropdownOpen
                        ? "bg-[#161b22] border-indigo-500 text-white shadow-sm"
                        : "bg-[#0d1117]/60 border-[#30363d] text-white hover:border-gray-700 hover:bg-[#21262d]/50"
                      : isSortDropdownOpen
                        ? "bg-white border-black text-gray-905 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-gray-905 hover:border-gray-300 hover:bg-gray-50/50"
                  }
                `}
              >
                <span className="font-semibold text-xs truncate">
                  {sortBy === "stock-asc" ? "Tồn kho: Tăng dần" : sortBy === "stock-desc" ? "Tồn kho: Giảm dần" : "Tên sản phẩm: A-Z"}
                </span>
                
                {/* Arrow Icon */}
                <svg
                  className={`w-3.5 h-3.5 text-gray-450 transition-transform duration-300 flex-shrink-0 ${isSortDropdownOpen ? "rotate-180 text-black" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Custom Dropdown Menu */}
              {isSortDropdownOpen && (
                <div
                  className={`absolute top-full right-0 z-50 w-44 mt-2 rounded-2xl shadow-xl py-2 animate-fade-in text-xs transition-all duration-350 border ${
                    d
                      ? "bg-[#161b22] border-[#30363d] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                      : "bg-white border-gray-200 text-gray-900 shadow-xl"
                  }`}
                >
                  <ul className="max-h-60 overflow-auto scrollbar-none space-y-1">
                    {[
                      { value: "stock-asc", label: "Tồn kho: Tăng dần" },
                      { value: "stock-desc", label: "Tồn kho: Giảm dần" },
                      { value: "name", label: "Tên sản phẩm: A-Z" },
                    ].map((option) => (
                      <li
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as any);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors mx-2 rounded-xl group
                          ${
                            sortBy === option.value
                              ? d
                                ? "bg-[#21262d] text-white font-black hover:bg-white/10"
                                : "bg-slate-100 text-black font-black hover:bg-black hover:text-white"
                              : d
                                ? "text-gray-350 hover:bg-[#21262d] hover:text-white font-semibold"
                                : "text-gray-600 hover:bg-black hover:text-white font-semibold"
                          }
                        `}
                      >
                        <span>{option.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Đồng bộ kho hàng với hệ thống"
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border shadow transition-all active:scale-95 disabled:opacity-50 ${
              d
                ? "border-[#30363d] bg-[#21262d] text-gray-300 hover:bg-white/10 hover:text-white"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className={`overflow-hidden rounded-[2rem] border shadow-sm transition-colors duration-300 ${
        d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className={`border-b text-[9px] font-black tracking-wider uppercase transition-colors duration-300 ${
                d ? "border-[#30363d] bg-[#0d1117]/60 text-gray-500" : "text-gray-450 border-gray-200 bg-gray-50"
              }`}>
                <th className="px-6 py-4.5">Mặt hàng</th>
                <th className="px-6 py-4.5">Danh mục</th>
                <th className="px-6 py-4.5">Tồn kho hiện tại</th>
                <th className="px-6 py-4.5">Trạng thái</th>
                <th className="px-6 py-4.5 text-right">Điều chỉnh nhanh</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              d ? "divide-[#30363d] text-gray-300" : "divide-gray-150 text-gray-700"
            }`}>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-450 font-medium font-sans">
                    Không có sản phẩm nào khớp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = p.stock !== undefined && p.stock !== null ? p.stock : 0;
                  const isOut = stock === 0;
                  const isLow = stock > 0 && stock <= 5;
                  return (
                    <tr key={p.id} className={`transition-colors duration-200 ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-colors duration-300 ${
                            d ? "border-[#30363d] bg-[#21262d]" : "border-gray-150 bg-white"
                          }`}>
                            <img src={p.image} alt={p.name} className={`h-full w-full object-cover ${d ? "" : "mix-blend-multiply"}`} />
                          </div>
                          <div>
                            <span className={`block font-extrabold text-sm ${d ? "text-white" : "text-gray-900"}`}>{p.name}</span>
                            <span className={`block font-mono text-[9px] ${d ? "text-gray-500" : "text-gray-400"}`}>{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-bold tracking-wider uppercase">{p.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono text-sm font-black ${
                          isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {stock} chiếc
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider font-mono ${
                          isOut
                            ? d ? 'bg-rose-950/40 border border-rose-900/40 text-rose-400' : 'bg-rose-50 border border-rose-200 text-rose-600'
                            : isLow
                            ? d ? 'bg-amber-950/40 border border-amber-900/40 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-600'
                            : d ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                          {isOut ? 'Cháy hàng' : isLow ? 'Cần nhập kho' : 'Bình thường'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onOpenEditForm(p)}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-colors ${
                            d
                              ? "border-[#30363d] text-gray-450 hover:bg-[#30363d] hover:text-white"
                              : "border-gray-250 text-gray-600 hover:bg-gray-100 hover:text-black"
                          }`}
                        >
                          <Edit3 size={11} />
                          Nhập / Sửa kho
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
