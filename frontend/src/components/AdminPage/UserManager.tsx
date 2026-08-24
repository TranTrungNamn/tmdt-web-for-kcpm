import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Sparkles, ChevronDown, Check, Shield, User as UserIcon, Copy, CheckCircle2 } from 'lucide-react';
import Pagination from '../Pagination';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'employee' | 'admin';
  vipStatus: 'Normal' | 'Premium';
  status: 'active' | 'blocked';
  joinedDate: string;
}

interface UserManagerProps {
  systemUsers: User[];
  onAddUser: (user: User) => void;
  onToggleUserRole: (id: string, newRole?: string) => void;
  onToggleUserVip: (id: string) => void;
  onToggleUserStatus: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onRestoreUser?: (id: string) => void;
  isDarkMode?: boolean;
  currentUserEmail?: string;
}

export default function UserManager({
  systemUsers,
  onAddUser,
  onToggleUserRole,
  onToggleUserVip,
  onToggleUserStatus,
  onDeleteUser,
  onRestoreUser,
  isDarkMode = false,
  currentUserEmail = 'admin@techvie.com',
}: UserManagerProps) {
  const [userQuery, setUserQuery] = useState('');
  const [isNewUsrFormOpen, setIsNewUsrFormOpen] = useState(false);

  // Role filter state
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'employee' | 'admin'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [userQuery, roleFilter]);

  // Table row custom dropdown states
  const [openRoleDropdownId, setOpenRoleDropdownId] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{ id: string; name: string; newRole: 'user' | 'employee' | 'admin' } | null>(null);
  const tableRoleDropdownRef = useRef<HTMLTableSectionElement>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, id: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '---';
    if (phone.length <= 8) return phone;
    return `${phone.slice(0, 4)}...${phone.slice(-4)}`;
  };

  // Form states for creating a new user
  const [newUsrName, setNewUsrName] = useState('');
  const [newUsrEmail, setNewUsrEmail] = useState('');
  const [newUsrPhone, setNewUsrPhone] = useState('');
  const [newUsrRole, setNewUsrRole] = useState<'user' | 'employee' | 'admin'>('user');
  const [newUsrVip, setNewUsrVip] = useState<'Normal' | 'Premium'>('Normal');

  // Custom Dropdown States & Refs
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isVipDropdownOpen, setIsVipDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const vipDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (vipDropdownRef.current && !vipDropdownRef.current.contains(event.target as Node)) {
        setIsVipDropdownOpen(false);
      }
      if (tableRoleDropdownRef.current && !tableRoleDropdownRef.current.contains(event.target as Node)) {
        setOpenRoleDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const d = isDarkMode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsrName.trim() || !newUsrEmail.trim()) return;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newUsrName.trim(),
      email: newUsrEmail.trim().toLowerCase(),
      phone: newUsrPhone.trim() || '',
      role: newUsrRole,
      vipStatus: newUsrVip,
      status: 'active',
      joinedDate: new Date().toLocaleDateString('vi-VN')
    };

    onAddUser(newUser);
    setIsNewUsrFormOpen(false);
    setNewUsrName('');
    setNewUsrEmail('');
    setNewUsrPhone('');
    setNewUsrRole('user');
    setNewUsrVip('Normal');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 border p-6 sm:p-8 rounded-3xl shadow-sm transition-all duration-300 ${
        d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex-1 min-w-0 text-left">
          <h3 className={`font-extrabold text-base uppercase tracking-wider transition-colors duration-300 ${d ? 'text-white' : 'text-gray-955'}`}>Sổ thành viên TechVie ID</h3>
          <p className={`text-xs md:text-[13px] font-sans mt-1.5 leading-relaxed transition-colors duration-300 ${d ? 'text-gray-400' : 'text-gray-400'}`}>Quản trị phân quyền cán bộ nhân viên, theo dõi trạng thái VIP tài khoản hoặc chặn truy cập.</p>
        </div>

        <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center w-full xl:w-auto">
          {/* Tabs Filter */}
          <div className={`flex rounded-xl p-1 border w-full xl:w-auto overflow-x-auto scrollbar-none ${d ? 'border-[#30363d] bg-black/20' : 'border-gray-200 bg-gray-50'}`}>
            {(["all", "user", "employee", "admin"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setRoleFilter(status)}
                className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-1 xl:flex-none ${
                  roleFilter === status
                    ? d
                      ? "bg-white text-black font-extrabold shadow-sm"
                      : "bg-black text-white font-extrabold shadow-sm"
                    : d
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {status === "all" ? "Tất cả" : status === "user" ? "Khách hàng" : status === "employee" ? "Nhân sự" : "Quản trị viên"}
              </button>
            ))}
          </div>

          {/* Search user */}
          <input
            type="text"
            placeholder="Tìm tên, email thành viên..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className={`h-12 rounded-xl px-4 text-xs outline-none font-semibold shadow-sm w-full sm:w-60 text-left transition-all border ${
              d 
                ? 'bg-[#0d1117]/60 border-[#30363d] text-white focus:bg-[#161b22] focus:!border-white focus:!ring-white placeholder-gray-500' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50 focus:bg-white focus:border-black text-gray-905 placeholder-gray-400'
            }`}
          />

          <button
            type="button"
            onClick={() => setIsNewUsrFormOpen(true)}
            className={`h-12 px-6 text-xs uppercase tracking-widest font-black rounded-xl transition-all shadow active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              d ? 'bg-white! hover:bg-gray-100! text-black' : 'bg-black hover:bg-slate-900 text-white'
            }`}
          >
            <Plus size={16} />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-[2.5rem] shadow-sm border transition-colors duration-300 ${
        d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200/80'
      }`}>
        <div className="overflow-x-auto overflow-y-visible font-sans rounded-[2.5rem] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-b-[2.5rem] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/80 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`uppercase font-extrabold text-[9px] tracking-wider border-b transition-colors duration-300 ${
                d ? 'border-[#30363d] text-gray-500' : 'border-slate-150 text-slate-400'
              }`}>
                <th className="py-4.5 px-6 whitespace-nowrap font-extrabold text-left">Thành viên</th>
                <th className="py-4.5 px-6 whitespace-nowrap font-extrabold text-left">Liên hệ</th>
                <th className="py-4.5 px-6 whitespace-nowrap font-extrabold text-left">Phân quyền</th>
                <th className="py-4.5 px-6 whitespace-nowrap font-extrabold text-left">Thành viên vip</th>
                <th className="py-4.5 px-6 whitespace-nowrap font-extrabold text-left">Ngày tham gia</th>
                <th className="py-4.5 px-6 whitespace-nowrap font-extrabold text-left">Trạng thái</th>
                <th className="py-4.5 px-6 whitespace-nowrap font-extrabold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody ref={tableRoleDropdownRef} className={`divide-y transition-colors duration-300 ${d ? 'divide-[#30363d]' : 'divide-slate-150'}`}>
              {(() => {
                const filteredUsers = (systemUsers || []).filter(u => {
                  if (!u) return false;
                  const safeName = String(u.name || (u as any).username || '').toLowerCase();
                  const safeEmail = String(u.email || '').toLowerCase();
                  const query = String(userQuery || '').toLowerCase();
                  const matchesSearch = query === '' || safeName.includes(query) || safeEmail.includes(query);
                  
                  let safeRole = String(u.role || 'user').toLowerCase().trim();
                  if (safeRole.includes('admin')) safeRole = 'admin';
                  else if (safeRole.includes('employee')) safeRole = 'employee';
                  else safeRole = 'user';

                  const matchesRole = roleFilter === 'all' || safeRole === roleFilter;
                  return matchesSearch && matchesRole;
                });
                const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
                const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <>
                    {paginatedUsers.map((usr, idx) => (
                  <tr 
                    key={usr.id || `user-row-${idx}`} 
                    className={`transition-colors duration-300 ${
                      d 
                        ? `hover:bg-[#21262d]/50 ${usr.status === 'blocked' ? 'bg-rose-955/10' : ''}` 
                        : `hover:bg-slate-50/40 ${usr.status === 'blocked' ? 'bg-rose-50/10' : ''}`
                    }`}
                  >
                    {/* Member identity */}
                    <td className="py-5 px-6 text-left">
                      <div className="flex items-center gap-3 justify-start">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 transition-all duration-300 ${
                          String(usr.role || '').toLowerCase().includes('admin') 
                            ? 'bg-indigo-300 text-black shadow-sm' 
                            : d ? 'bg-gray-800 text-white border border-gray-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {String(usr.name || (usr as any).username || 'U').charAt(0)}
                        </div>
                        <div className="text-left">
                            <span className={`font-extrabold text-sm flex items-center gap-2 tracking-tight transition-colors duration-300 ${d ? 'text-gray-50' : 'text-gray-900'}`}>
                              {String(usr.name || (usr as any).username || 'Unknown User')}
                              {(usr as any).isDeleted && (
                                <span className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider rounded font-black border ${
                                  d ? 'bg-rose-950/40 text-rose-400 border-rose-900/40' : 'bg-rose-50 text-rose-600 border-rose-200'
                                }`}>
                                  Đã xóa
                                </span>
                              )}
                            </span>
                            <span className={`text-[10px] font-mono block mt-0.5 transition-colors duration-300 ${d ? 'text-slate-400' : 'text-gray-500'}`}>{usr.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contacts phone */}
                    <td className="py-5 px-6 text-left">
                      {usr.phone ? (
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(usr.phone, usr.id)}
                          className={`group relative flex items-center gap-2 font-mono font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer ${
                            copiedPhoneId === usr.id
                              ? d 
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : d
                                ? 'bg-[#21262d] text-gray-300 hover:bg-[#30363d] hover:text-white border-[#30363d]'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                          }`}
                          title={usr.phone}
                        >
                          <span className="text-[11px] tracking-wider">{formatPhone(usr.phone)}</span>
                          {copiedPhoneId === usr.id ? (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          ) : (
                            <Copy size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${d ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </button>
                      ) : (
                        <span className={`font-mono text-[11px] font-medium px-2.5 py-1.5 cursor-default select-none ${d ? 'text-gray-600' : 'text-gray-400'}`}>
                          ---
                        </span>
                      )}
                    </td>

                    {/* Role selection toggle */}
                    <td className="py-5 px-6 text-left relative">
                      <div className="relative">
                        <button
                          type="button"
                          disabled={usr.email === currentUserEmail}
                          onClick={() => setOpenRoleDropdownId(openRoleDropdownId === usr.id ? null : usr.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border ${
                            usr.email === currentUserEmail ? '' : 'cursor-pointer'
                          } ${
                            String(usr.role || '').toLowerCase().includes('admin')
                              ? d
                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              : String(usr.role || '').toLowerCase().includes('employee')
                              ? d
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : d
                                ? 'bg-[#21262d] text-gray-300 hover:bg-[#30363d] hover:text-white border-[#30363d]'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border-slate-200'
                          }`}
                        >
                          {String(usr.role || '').toLowerCase().includes('admin') ? 'Administrator' : String(usr.role || '').toLowerCase().includes('employee') ? 'Employee' : 'Standard User'}
                          <ChevronDown size={11} className={`transition-transform duration-200 ${openRoleDropdownId === usr.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {openRoleDropdownId === usr.id && (
                          <div className={`absolute top-full left-0 z-50 w-40 mt-1.5 rounded-xl shadow-xl py-1.5 animate-fade-in text-xs transition-all border ${
                            d
                              ? 'bg-[#161b22] border-[#30363d] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                              : 'bg-white border-gray-200 text-gray-900 shadow-xl'
                          }`}>
                            <ul className="space-y-0.5">
                              {[
                                { value: 'user', label: 'Standard User', color: d ? 'text-gray-300 hover:bg-gray-800' : 'text-slate-600 hover:bg-slate-100' },
                                { value: 'employee', label: 'Employee', color: d ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-emerald-700 hover:bg-emerald-50' },
                                { value: 'admin', label: 'Administrator', color: d ? 'text-indigo-400 hover:bg-indigo-950/40' : 'text-indigo-700 hover:bg-indigo-50' }
                              ].map((roleOpt) => (
                                <li
                                  key={roleOpt.value}
                                  onClick={() => {
                                    if (usr.role !== roleOpt.value) {
                                      setConfirmRoleChange({ id: usr.id, name: usr.name, newRole: roleOpt.value as 'user' | 'employee' | 'admin' });
                                    }
                                    setOpenRoleDropdownId(null);
                                  }}
                                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors mx-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider
                                    ${usr.role === roleOpt.value
                                      ? d ? 'bg-[#21262d] text-white' : 'bg-slate-100 text-black'
                                      : roleOpt.color
                                    }
                                  `}
                                >
                                  <span>{roleOpt.label}</span>
                                  {usr.role === roleOpt.value && <Check size={12} />}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Vip premium level */}
                    <td className="py-5 px-6 text-left">
                      {String(usr.role || '').toLowerCase().includes('admin') ? (
                          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 border transition-colors duration-300 cursor-default select-none ${d ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/40' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>QTV</span>
                        ) : String(usr.role || '').toLowerCase().includes('employee') ? (
                          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 border transition-colors duration-300 cursor-default select-none ${d ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>Nhân sự</span>
                        ) : (
                        <button
                          type="button"
                          disabled={usr.email === currentUserEmail}
                          onClick={() => onToggleUserVip(usr.id)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all duration-300 hover:scale-95 active:scale-90 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 disabled:cursor-not-allowed ${
                            usr.email === currentUserEmail ? '' : 'cursor-pointer'
                          } ${
                            usr.vipStatus === 'Premium'
                              ? d
                                ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20 font-black shadow-sm'
                                : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-500/15 font-black shadow-sm'
                              : d
                                ? 'bg-[#21262d] text-gray-300 hover:bg-[#30363d] hover:text-white border border-transparent'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                          }`}
                        >
                          {usr.vipStatus === 'Premium' && <Sparkles size={11} className="text-amber-500 animate-pulse" />}
                          {usr.vipStatus}
                        </button>
                      )}
                    </td>

                    {/* Join date */}
                    <td className="py-5 px-6 text-left">
                            <span className={`font-extrabold text-sm block tracking-tight transition-colors duration-300 ${d ? 'text-white' : 'text-gray-955'}`}>{usr.joinedDate}</span>
                    </td>

                    {/* Status tag */}
                    <td className="py-5 px-6 text-left">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold transition-colors duration-300 ${
                        usr.status === 'active'
                          ? (d
                            ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-lg'
                            : 'text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg')
                          : (d
                            ? 'text-rose-400 bg-rose-950/20 border border-rose-900/40 px-2 py-0.5 rounded-lg'
                            : 'text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg')
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${usr.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                        {usr.status === 'active' ? 'Hoạt động' : 'Đã Khóa'}
                      </span>
                    </td>

                    {/* Options button */}
                    <td className="py-5 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={usr.email === currentUserEmail}
                        onClick={() => onToggleUserStatus(usr.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all duration-200 hover:scale-95 active:scale-90 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 disabled:cursor-not-allowed ${
                          usr.email === currentUserEmail ? '' : 'cursor-pointer'
                        } ${
                          usr.status === 'active' 
                            ? (d
                              ? 'border-amber-900/30 bg-amber-950/20 text-amber-400 hover:bg-amber-900/35'
                              : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100')
                            : (d
                              ? 'border-emerald-900/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/35'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100')
                        }`}
                      >
                        {usr.status === 'active' ? 'Khóa' : 'Mở khóa'}
                      </button>
                      <button
                        type="button"
                        disabled={usr.email === currentUserEmail}
                        onClick={() => onDeleteUser(usr.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all duration-200 hover:scale-95 active:scale-90 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 disabled:cursor-not-allowed ${
                          usr.email === currentUserEmail ? '' : 'cursor-pointer'
                        } ${
                          d 
                            ? 'bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600' 
                            : 'bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                        }`}
                      >
                        Gỡ bỏ
                      </button>
                    </td>

                  </tr>
                ))}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(((systemUsers || []).filter(u => {
            if (!u) return false;
            const safeName = String(u.name || (u as any).username || '').toLowerCase();
            const safeEmail = String(u.email || '').toLowerCase();
            const query = String(userQuery || '').toLowerCase();
            const matchesSearch = query === '' || safeName.includes(query) || safeEmail.includes(query);
            let safeRole = String(u.role || 'user').toLowerCase().trim();
            if (safeRole.includes('admin')) safeRole = 'admin';
            else if (safeRole.includes('employee')) safeRole = 'employee';
            else safeRole = 'user';
            return matchesSearch && (roleFilter === 'all' || safeRole === roleFilter);
        })).length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
        isDarkMode={d}
      />

      {/* Role Change Confirmation Modal */}
      {confirmRoleChange && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[110] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmRoleChange(null); }}
        >
          <div className={`rounded-3xl p-8 max-w-sm w-full relative shadow-2xl font-sans text-left border transition-all duration-300 ${
            d 
              ? 'bg-[#161b22] border-[#30363d] text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}>
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
              confirmRoleChange.newRole === 'admin' 
                ? d ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                : confirmRoleChange.newRole === 'employee'
                ? d ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                : d ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}>
              <Shield size={24} />
            </div>

            <h3 className="text-lg font-black tracking-tight mb-2">
              Xác nhận cấp quyền
            </h3>
            
            <p className={`text-sm mb-6 leading-relaxed ${d ? 'text-gray-400' : 'text-gray-500'}`}>
              Bạn có chắc chắn muốn thay đổi quyền truy cập của thành viên <strong className={d ? 'text-white' : 'text-black'}>{confirmRoleChange.name}</strong> thành <strong className={confirmRoleChange.newRole === 'admin' ? (d ? 'text-indigo-400' : 'text-indigo-600') : confirmRoleChange.newRole === 'employee' ? (d ? 'text-emerald-400' : 'text-emerald-600') : ''}>{confirmRoleChange.newRole === 'admin' ? 'Administrator' : confirmRoleChange.newRole === 'employee' ? 'Employee' : 'Standard User'}</strong> không?
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setConfirmRoleChange(null)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  d 
                    ? 'border-[#30363d] text-gray-300 hover:bg-[#30363d] hover:text-white' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleUserRole(confirmRoleChange.id, confirmRoleChange.newRole);
                  setConfirmRoleChange(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                  confirmRoleChange.newRole === 'admin'
                    ? d ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : confirmRoleChange.newRole === 'employee'
                    ? d ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : d ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New account registration Modal overlay */}
      {isNewUsrFormOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[100] flex items-center justify-center p-4"
          // Tính năng bấm ngoài form sẽ thoát
          onClick={(e) => { if (e.target === e.currentTarget) setIsNewUsrFormOpen(false); }}
        >
          <div className={`rounded-[2.5rem] p-8 max-w-md w-full relative shadow-2xl font-sans text-left border transition-all duration-300 ${
            d 
              ? 'bg-[#161b22] border border-[#30363d] text-white shadow-[0_24px_70px_rgba(0,0,0,0.4)]' 
              : 'bg-white border border-gray-200 text-gray-955 shadow-[0_24px_70px_rgba(0,0,0,0.12)]'
          }`}>
            
            <button
              type="button"
              onClick={() => setIsNewUsrFormOpen(false)}
              className={`absolute top-6 right-6 w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                d 
                  ? 'border-[#30363d] text-gray-400 hover:bg-[#21262d] hover:text-white' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <X size={14} />
            </button>

            <h3 className={`text-sm font-extrabold uppercase tracking-wider mb-5 pb-3 border-b border-gray-200/10 ${d ? 'text-white' : 'text-gray-955'}`}>
              Cấp tài khoản TechVie ID mới
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Họ và Tên *</label>
                <input
                  type="text"
                  required
                  value={newUsrName}
                  onChange={(e) => setNewUsrName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={`w-full rounded-xl px-4 py-2.5 outline-none text-xs font-semibold transition-all border ${
                    d 
                      ? 'bg-[#0d1117]/60 border-[#30363d] text-white focus:bg-[#161b22] focus:!border-white focus:!ring-white placeholder-gray-500' 
                      : 'bg-slate-50 border-gray-200 focus:border-black focus:bg-white text-gray-905 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Địa chỉ Email *</label>
                <input
                  type="email"
                  required
                  value={newUsrEmail}
                  onChange={(e) => setNewUsrEmail(e.target.value)}
                  placeholder="mail@techvie.com"
                  className={`w-full rounded-xl px-4 py-2.5 outline-none text-xs font-semibold transition-all border ${
                    d 
                      ? 'bg-[#0d1117]/60 border-[#30363d] text-white focus:bg-[#161b22] focus:!border-white focus:!ring-white placeholder-gray-500' 
                      : 'bg-slate-50 border-gray-200 focus:border-black focus:bg-white text-gray-905 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Số điện thoại</label>
                <input
                  type="text"
                  value={newUsrPhone}
                  onChange={(e) => setNewUsrPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className={`w-full rounded-xl px-4 py-2.5 outline-none text-xs font-semibold transition-all border ${
                    d 
                      ? 'bg-[#0d1117]/60 border-[#30363d] text-white focus:bg-[#161b22] focus:!border-white focus:!ring-white placeholder-gray-500' 
                      : 'bg-slate-50 border-gray-200 focus:border-black focus:bg-white text-gray-905 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Custom Role Dropdown */}
                <div className="space-y-1 relative" ref={roleDropdownRef}>
                  <label className="text-[10px] uppercase font-bold text-gray-400">Phân quyền</label>
                  <button
                    type="button"
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer text-xs font-semibold
                      ${
                        d
                          ? isRoleDropdownOpen
                            ? "bg-[#161b22] border-indigo-500 text-white shadow-sm"
                            : "bg-[#161b22] border-[#30363d] text-white hover:border-gray-700 hover:bg-[#21262d]/50"
                          : isRoleDropdownOpen
                            ? "bg-white border-black text-gray-905 shadow-sm"
                            : "bg-white border-gray-200 text-gray-955 hover:border-gray-300 hover:bg-gray-50/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-lg transition-colors ${
                        isRoleDropdownOpen
                          ? d ? 'bg-[#21262d] text-white' : 'bg-slate-100 text-black'
                          : d ? 'bg-[#0d1117] text-gray-400' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {newUsrRole === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                      </span>
                      <span>
                        {newUsrRole === 'admin' ? 'Administrator' : newUsrRole === 'employee' ? 'Employee' : 'Standard User'}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180 text-black' : ''}`} />
                  </button>

                  {isRoleDropdownOpen && (
                    <div className={`absolute bottom-full left-0 z-50 w-full mb-2 rounded-2xl shadow-xl py-1.5 animate-fade-in text-xs transition-all border ${
                      d
                        ? 'bg-[#161b22] border-[#30363d] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                        : 'bg-white border-gray-200 text-gray-900 shadow-xl'
                    }`}>
                      <ul className="space-y-1">
                        <li
                          onClick={() => { setNewUsrRole('user'); setIsRoleDropdownOpen(false); }}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors mx-1.5 rounded-xl
                            ${newUsrRole === 'user'
                              ? d ? 'bg-[#21262d] text-white font-black' : 'bg-slate-150 text-black font-black'
                              : d ? 'text-gray-350 hover:bg-[#21262d]' : 'text-gray-600 hover:bg-slate-50'
                            }
                          `}
                        >
                          <span>Standard User</span>
                          {newUsrRole === 'user' && <Check size={12} />}
                        </li>
                        <li
                          onClick={() => { setNewUsrRole('admin'); setNewUsrVip('Normal'); setIsRoleDropdownOpen(false); }}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors mx-1.5 rounded-xl
                            ${newUsrRole === 'admin'
                              ? d ? 'bg-[#21262d] text-white font-black' : 'bg-slate-150 text-black font-black'
                              : d ? 'text-gray-350 hover:bg-[#21262d]' : 'text-gray-600 hover:bg-slate-50'
                            }
                          `}
                        >
                          <span>Administrator</span>
                          {newUsrRole === 'admin' && <Check size={12} />}
                        </li>
                        <li
                          onClick={() => { setNewUsrRole('employee'); setNewUsrVip('Normal'); setIsRoleDropdownOpen(false); }}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors mx-1.5 rounded-xl
                            ${newUsrRole === 'employee'
                              ? d ? 'bg-[#21262d] text-white font-black' : 'bg-slate-150 text-black font-black'
                              : d ? 'text-gray-350 hover:bg-[#21262d]' : 'text-gray-600 hover:bg-slate-50'
                            }
                          `}
                        >
                          <span>Employee</span>
                          {newUsrRole === 'employee' && <Check size={12} />}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Custom VIP Dropdown */}
                <div className={`space-y-1 relative ${newUsrRole !== 'user' ? 'opacity-50 pointer-events-none' : ''}`} ref={vipDropdownRef}>
                  <label className="text-[10px] uppercase font-bold text-gray-400">Hạng Thành viên</label>
                  <button
                    type="button"
                    disabled={newUsrRole !== 'user'}
                    onClick={() => setIsVipDropdownOpen(!isVipDropdownOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer text-xs font-semibold disabled:cursor-not-allowed
                      ${
                        d
                          ? isVipDropdownOpen
                            ? "bg-[#161b22] border-indigo-500 text-white shadow-sm"
                            : "bg-[#161b22] border-[#30363d] text-white hover:border-gray-700 hover:bg-[#21262d]/50"
                          : isVipDropdownOpen
                            ? "bg-white border-black text-gray-905 shadow-sm"
                            : "bg-white border-gray-200 text-gray-955 hover:border-gray-300 hover:bg-gray-50/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-lg transition-colors ${
                        isVipDropdownOpen
                          ? d ? 'bg-[#21262d] text-white' : 'bg-slate-100 text-black'
                          : d ? 'bg-[#0d1117] text-gray-400' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {newUsrVip === 'Premium' ? <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> : <UserIcon className="w-3.5 h-3.5" />}
                      </span>
                      <span>
                        {newUsrRole !== 'user' ? 'Không áp dụng' : newUsrVip === 'Premium' ? 'Premium VIP' : 'Normal'}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isVipDropdownOpen ? 'rotate-180 text-black' : ''}`} />
                  </button>

                  {isVipDropdownOpen && (
                    <div className={`absolute bottom-full left-0 z-50 w-full mb-2 rounded-2xl shadow-xl py-1.5 animate-fade-in text-xs transition-all border ${
                      d
                        ? 'bg-[#161b22] border-[#30363d] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                        : 'bg-white border-gray-200 text-gray-900 shadow-xl'
                    }`}>
                      <ul className="space-y-1">
                        <li
                          onClick={() => { setNewUsrVip('Normal'); setIsVipDropdownOpen(false); }}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors mx-1.5 rounded-xl
                            ${newUsrVip === 'Normal'
                              ? d ? 'bg-[#21262d] text-white font-black' : 'bg-slate-150 text-black font-black'
                              : d ? 'text-gray-350 hover:bg-[#21262d]' : 'text-gray-600 hover:bg-slate-50'
                            }
                          `}
                        >
                          <span>Normal</span>
                          {newUsrVip === 'Normal' && <Check size={12} />}
                        </li>
                        <li
                          onClick={() => { setNewUsrVip('Premium'); setIsVipDropdownOpen(false); }}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors mx-1.5 rounded-xl
                            ${newUsrVip === 'Premium'
                              ? d ? 'bg-[#21262d] text-white font-black' : 'bg-slate-150 text-black font-black'
                              : d ? 'text-gray-350 hover:bg-[#21262d]' : 'text-gray-600 hover:bg-slate-50'
                            }
                          `}
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={11} className="text-amber-500" />
                            Premium VIP
                          </span>
                          {newUsrVip === 'Premium' && <Check size={12} />}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full mt-4 py-3.5 font-sans text-xs uppercase tracking-widest font-black rounded-xl transition-all shadow active:scale-95 cursor-pointer text-center ${
                  d ? 'bg-white! hover:bg-gray-100! text-black' : 'bg-black hover:bg-slate-900 text-white'
                }`}
              >
                Cấp tài khoản
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
