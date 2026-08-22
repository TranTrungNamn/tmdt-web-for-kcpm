import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (limit: number) => void;
  isDarkMode?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  isDarkMode = false,
}: PaginationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState(itemsPerPage?.toString() || "10");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itemsPerPage) setInputValue(itemsPerPage.toString());
  }, [itemsPerPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (totalPages <= 1 && !itemsPerPage) return null;
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 font-sans w-full ${totalPages <= 1 && itemsPerPage ? 'justify-end' : ''}`}>
      
      {/* Items Per Page Dropdown & Input */}
      {itemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-black' : 'text-black'}`}>Hiển thị</span>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
              isDarkMode
                ? isDropdownOpen ? "bg-[#161b22] border-indigo-500 text-white" : "bg-[#0d1117]/60 border-[#30363d] text-white hover:bg-[#21262d]/50"
                : isDropdownOpen ? "bg-white border-black text-gray-905" : "bg-slate-50 border-gray-200 text-gray-905 hover:bg-gray-50/50"
            }`}
          >
            <span>{itemsPerPage} dòng</span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? (isDarkMode ? "rotate-180 text-white" : "rotate-180 text-black") : "text-gray-400"}`} />
          </button>

          {isDropdownOpen && (
            <div className={`absolute bottom-full left-0 mb-2 z-50 w-40 rounded-2xl shadow-xl py-2 animate-fade-in text-xs transition-all border ${
              isDarkMode ? "bg-[#161b22] border-[#30363d] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]" : "bg-white border-gray-200 text-gray-900 shadow-xl"
            }`}>
              
              {/* Input for custom items per page */}
              <div className={`px-3 pb-2 mb-2 border-b ${isDarkMode ? 'border-[#30363d]' : 'border-gray-100'}`}>
                <div className={`flex items-center rounded-xl border px-2.5 py-1.5 transition-all duration-200 ${
                  isDarkMode ? 'bg-[#0d1117]/60 border-[#30363d] focus-within:border-indigo-500' : 'bg-slate-50 border-gray-200 focus-within:border-black'
                }`}>
                  <input
                    type="number"
                    min="1"
                    placeholder="Tùy chỉnh..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt(inputValue, 10);
                        if (!isNaN(val) && val > 0) {
                          onItemsPerPageChange(val);
                          setIsDropdownOpen(false);
                        }
                      }
                    }}
                    className={`w-full bg-transparent outline-none text-xs font-mono font-bold appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDarkMode ? 'text-white' : 'text-black'}`}
                    style={{ MozAppearance: 'textfield' }} // For Firefox
                  />
                  <span className={`text-[9px] font-bold uppercase tracking-wider ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>dòng</span>
                </div>
              </div>
              <ul className="space-y-1">
                {[5, 10, 20, 50].map((val) => (
                  <li
                    key={val}
                    onClick={() => { onItemsPerPageChange(val); setIsDropdownOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors mx-2 rounded-xl
                      ${itemsPerPage === val
                        ? isDarkMode ? "bg-[#21262d] text-white font-black" : "bg-slate-100 text-black font-black"
                        : isDarkMode ? "text-gray-400 hover:bg-[#21262d] hover:text-white" : "text-gray-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span>{val} dòng</span>
                    {itemsPerPage === val && <Check size={12} />}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Pages list */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {/* Back button */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
              isDarkMode
                ? "border-[#30363d] hover:bg-[#21262d] text-white"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <ChevronLeft size={14} />
          </button>

          {pages[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                  currentPage === 1
                    ? (isDarkMode ? "bg-white text-black border-white" : "bg-black text-white border-black")
                    : (isDarkMode ? "border-[#30363d] hover:bg-[#21262d] text-white" : "border-gray-200 hover:bg-gray-50 text-gray-700")
                }`}
              >
                1
              </button>
              {pages[0] > 2 && (
                <span className={`text-[10px] px-1 font-bold ${isDarkMode ? "text-black" : "text-black"}`}>...</span>
              )}
            </>
          )}

          {pages.map((p) => {
            const isActive = currentPage === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                  isActive
                    ? (isDarkMode ? "bg-white text-black border-white" : "bg-black text-white border-black")
                    : (isDarkMode ? "border-[#30363d] hover:bg-[#21262d] text-white" : "border-gray-250 hover:bg-gray-50 text-gray-700")
                }`}
              >
                {p}
              </button>
            );
          })}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && (
                <span className={`text-[10px] px-1 font-bold ${isDarkMode ? "text-black" : "text-black"}`}>...</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                  currentPage === totalPages
                    ? (isDarkMode ? "bg-white text-black border-white" : "bg-black text-white border-black")
                    : (isDarkMode ? "border-[#30363d] hover:bg-[#21262d] text-white" : "border-gray-250 hover:bg-gray-50 text-gray-700")
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next button */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
              isDarkMode
                ? "border-[#30363d] hover:bg-[#21262d] text-white"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
