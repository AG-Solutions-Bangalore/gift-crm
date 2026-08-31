import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { changeUserPassword } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

export default function ChangePasswordPage() {
  const { user } = useAuthContext();
  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password !== form.confirm_password) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changeUserPassword({
        username: user?.username || 'admin',
        old_password: form.old_password,
        new_password: form.new_password
      });
      toast.success('Password changed successfully!');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Info Card Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <KeyRound className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Security Password Settings</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Ensure your account uses a strong password to maintain administrator security.
            </p>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showOld ? 'text' : 'password'}
                  name="old_password"
                  value={form.old_password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showNew ? 'text' : 'password'}
                  name="new_password"
                  value={form.new_password}
                  onChange={handleChange}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Password updates take effect immediately.</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 hover:shadow-purple-600/40 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
