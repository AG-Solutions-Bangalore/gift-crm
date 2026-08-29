import React from 'react';
import { Search, Bell, HelpCircle, ChevronRight } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Add New Product
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mt-1">
          <span className="text-slate-500 hover:text-slate-700 cursor-pointer">Products</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-purple-600 font-bold">Add Product</span>
        </div>
      </div>

      {/* Header Actions (Search, Notifications, Help) */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-9 pr-12 py-2 w-64 bg-white text-xs font-medium text-slate-700 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Notifications Button */}
        <button 
          title="Notifications"
          className="relative p-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-purple-600 shadow-sm transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            6
          </span>
        </button>

        {/* Help Circle Button */}
        <button 
          title="Help Center"
          className="p-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-purple-600 shadow-sm transition-all"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
