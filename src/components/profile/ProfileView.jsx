import React from 'react';
import { User, Mail, Phone, Shield, Save, LogOut, CheckCircle2 } from 'lucide-react';

export default function ProfileView({
  profile,
  form,
  loading,
  saving,
  onChange,
  onSubmit,
  onLogout
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Profile Information...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: Admin Profile Card */}
      <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center space-y-5">
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-purple-500 to-indigo-600 p-1 shadow-xl shadow-purple-900/20">
            <img
              src={profile?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser&backgroundColor=ffdfbf"}
              alt="Admin Avatar"
              className="w-full h-full rounded-full bg-amber-100 object-cover"
            />
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {profile?.name || profile?.username || 'Admin User'}
          </h2>
          <p className="text-xs font-semibold text-purple-600 mt-0.5">
            {profile?.role || 'System Administrator'}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3 text-left">
          <div className="flex items-center justify-between text-xs py-1">
            <span className="font-semibold text-slate-400">Account Status</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="font-semibold text-slate-400">Access Role</span>
            <span className="font-bold text-slate-700">Super Admin</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="font-semibold text-slate-400">Organization</span>
            <span className="font-bold text-slate-700">UtsavGifts CRM</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* Right Column: Edit Details Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Personal Information Settings</h3>
          <p className="text-xs text-slate-400 mt-1">
            Update your registered email address and mobile contact number.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={profile?.username || 'admin'}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Role Authority
              </label>
              <div className="relative flex items-center">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={profile?.role || 'Administrator'}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Enter email address"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mobile Contact Number
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={onChange}
                placeholder="Enter mobile number"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 hover:shadow-purple-600/40 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
