import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Gift,
  Package,
  Award,
  Folders,
  Calendar,
  Tag,
  SlidersHorizontal,
  Store,
  Share2,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  Image as ImageIcon,
  Mail,
  Layers,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();
  const { companyInfo, companyLogoUrl } = useAppContext();

  const masterItems = [
    { path: '/brands', label: 'Brand', icon: Award },
    { path: '/vendors', label: 'Vendor', icon: Store },
    { path: '/categories', label: 'Category', icon: Folders },
    { path: '/occasions', label: 'Occasions', icon: Calendar },
    { path: '/tags', label: 'Tags', icon: Tag },
    { path: '/attributes', label: 'Attribute', icon: SlidersHorizontal },
  ];

  const isMasterActive = masterItems.some((item) => location.pathname === item.path);
  const [masterOpen, setMasterOpen] = useState(true);

  useEffect(() => {
    if (isMasterActive) {
      setMasterOpen(true);
    }
  }, [location.pathname, isMasterActive]);

  const isDashboardActive = location.pathname === '/' || location.pathname === '/dashboard';
  const isProductActive = location.pathname.startsWith('/products');
  const isBannerActive = location.pathname.startsWith('/banner') || location.pathname.startsWith('/banners');
  const isNewsletterActive = location.pathname.startsWith('/newsletter');
  const isShareslugActive = location.pathname.startsWith('/share-slug');
  const isWebsiteUniqueActive = location.pathname.startsWith('/website-unique');
  const isEnquiryActive = location.pathname.startsWith('/enquiries');

  return (
    <aside className="w-64 bg-[#12102e] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800/60 shadow-xl select-none z-30 shrink-0">

      {/* 1. TOP FIXED: LOGO AND SHOP NAME */}
      <div
        onClick={() => navigate('/')}
        className="p-5 border-b border-slate-800/80 flex flex-col items-center text-center shrink-0 cursor-pointer group"
      >
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-purple-500 to-indigo-600 p-0.5 shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
            {companyInfo?.company_logo && companyInfo.company_logo !== 'logo.webp' ? (
              <img
                src={companyLogoUrl}
                alt={companyInfo?.company_name || 'Logo'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover rounded-[10px]"
              />
            ) : (
              <div className="w-full h-full bg-[#1b173d] rounded-[10px] flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-300 stroke-[2.2]" />
              </div>
            )}
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-white tracking-tight leading-none font-sans">
              {companyInfo?.company_short || 'Gift'}
            </h1>
            <span className="text-[10px] font-semibold tracking-widest text-purple-400 uppercase">
              {companyInfo?.company_name ? 'CRM ADMIN' : 'CRM Admin'}
            </span>
          </div>
        </div>
        <p className="text-[11px] font-medium text-slate-400 mt-2 tracking-wide truncate max-w-full">
          {companyInfo?.company_name || 'Making Every Moment Special'}
        </p>
      </div>

      {/* 2. MIDDLE SCROLLABLE: ORDERED NAVIGATION LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar">

        {/* 0. DASHBOARD */}
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
            isDashboardActive
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
            isDashboardActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
          }`} />
          <span>Dashboard</span>
        </button>
        
        {/* 1. MASTER (Accordion Dropdown) */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setMasterOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
              isMasterActive
                ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                isMasterActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
              }`} />
              <span className="font-bold">Master</span>
            </div>
            <div className="flex items-center">
              {masterOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              )}
            </div>
          </button>

          {/* Master Sub-items */}
          {masterOpen && (
            <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-800 ml-4 animate-in slide-in-from-top-2 duration-150">
              {masterItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-150 group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-purple-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. PRODUCT */}
        <button
          onClick={() => navigate('/products')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
            isProductActive
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
            isProductActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
          }`} />
          <span>Product</span>
        </button>

        {/* 3. BANNER */}
        <button
          onClick={() => navigate('/banners')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
            isBannerActive
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
            isBannerActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
          }`} />
          <span>Banner</span>
        </button>

        {/* 4. NEWSLETTER */}
        <button
          onClick={() => navigate('/newsletter')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
            isNewsletterActive
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Mail className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
            isNewsletterActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
          }`} />
          <span>NewsLetter</span>
        </button>

        {/* 5. SHARESLUG */}
        <button
          onClick={() => navigate('/share-slugs')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
            isShareslugActive
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Share2 className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
            isShareslugActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
          }`} />
          <span>Shareslug</span>
        </button>

        {/* 6. WEBSITE UNIQUE */}
        <button
          onClick={() => navigate('/website-unique')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
            isWebsiteUniqueActive
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
            isWebsiteUniqueActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
          }`} />
          <span>Website Unique</span>
        </button>

        {/* 7. ENQUIRIES */}
        <button
          onClick={() => navigate('/enquiries')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
            isEnquiryActive
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
            isEnquiryActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
          }`} />
          <span>Enquiries</span>
        </button>

      </div>

      {/* 3. BOTTOM: ADMIN USER CARD & FOOTER */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0e0c24] shrink-0 space-y-3">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:bg-slate-800 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 p-0.5 shadow-md">
                <img
                  src="/assets/avatars/profileimg.jpg"
                  alt="Admin Avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/avatars/profileimg.jpg';
                  }}
                  className="w-full h-full rounded-full bg-amber-100 object-cover object-top"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#12102e] rounded-full"></span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                {user?.name || user?.username || 'Admin User'}
              </p>
              <p className="text-[10px] font-medium text-slate-400 leading-tight mt-0.5">
                {user?.role || 'Administrator'}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </div>

        {/* Quick Action Footer Buttons */}
        <div className="flex items-center justify-between pt-1 px-1">
          <button 
            onClick={() => navigate('/profile')}
            title="Profile Settings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-purple-300 hover:bg-slate-800/70 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button 
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            title="Logout"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

    </aside>
  );
}
