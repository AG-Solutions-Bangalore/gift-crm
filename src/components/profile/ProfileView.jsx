import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Save, LogOut, CheckCircle2, Lock, Eye, EyeOff, KeyRound, ShieldCheck, Camera, X, Upload } from 'lucide-react';
import { changeUserPassword } from '../../services/api';

const PRESET_AVATARS = [
  { id: 'female-admin-1', name: 'Female Admin', url: '/assets/avatars/profileimg.jpg' },
  { id: 'female-admin-2', name: 'Female Admin (Glasses)', url: '/assets/avatars/female_admin_1.jpg' },
  { id: 'male-admin-1', name: 'Male Admin (Glasses)', url: '/assets/avatars/male_admin_1.jpg' },
  { id: 'executive-3d-1', name: '3D Executive Admin', url: '/assets/avatars/executive_3d_1.jpg' }
];

export default function ProfileView({
  profile,
  form,
  loading,
  saving,
  onChange,
  onSubmit,
  onLogout,
  onUpdateAvatar
}) {
  const [pwForm, setPwForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(profile?.avatar || PRESET_AVATARS[0].url);
  const [customUrl, setCustomUrl] = useState('');

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwdChange = handlePwChange;

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setPwSubmitting(true);
    try {
      await changeUserPassword({
        username: profile?.username || profile?.mobile || '9999999999',
        old_password: pwForm.old_password,
        new_password: pwForm.new_password
      });
      toast.success('Password updated successfully!');
      setPwForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleSelectAvatar = (url) => {
    setCurrentAvatar(url);
    if (onUpdateAvatar) {
      onUpdateAvatar(url);
    }
    setShowAvatarModal(false);
    toast.success('Profile avatar updated successfully!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      handleSelectAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    handleSelectAvatar(customUrl.trim());
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Profile Information...</p>
      </div>
    );
  }

  const isValidAvatar = (url) => {
    return url && typeof url === 'string' && url !== 'null' && url !== 'undefined' && url.trim() !== '' && url !== '[object Object]';
  };

  const fallbackAvatar = PRESET_AVATARS[0].url;
  const avatarSrc = isValidAvatar(profile?.avatar)
    ? profile.avatar
    : (isValidAvatar(currentAvatar) ? currentAvatar : fallbackAvatar);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner Profile Summary Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          {/* Avatar Container with Hover Camera Button */}
          <div
            className="relative shrink-0 group cursor-pointer"
            onClick={() => setShowAvatarModal(true)}
            title="Click to Change Avatar"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-purple-500 to-indigo-600 p-1 shadow-md shadow-purple-900/20 relative overflow-hidden">
              <img
                src={avatarSrc}
                alt="Admin Avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackAvatar;
                }}
                className="w-full h-full rounded-full bg-amber-100 object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full border-2 border-white shadow-md text-xs font-bold transition-transform group-hover:scale-110 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {profile?.name || profile?.username || 'Admin User'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <p className="text-xs font-semibold text-purple-600 mt-1">
              {profile?.role || 'System Administrator'} • Gift CRM
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="flex-1 sm:flex-none py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Change Avatar</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex-1 sm:flex-none py-2.5 px-5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Balanced 2-Column Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Card 1: Personal Information Form */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Personal Information Settings</h3>
            <p className="text-xs text-slate-400 mt-1">
              Update your registered email address and mobile contact number.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
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
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Change Password Form */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Security & Change Password</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your account password using current credentials.
              </p>
            </div>
          </div>

          <form onSubmit={handlePwdSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showOld ? 'text' : 'password'}
                    name="old_password"
                    value={pwForm.old_password}
                    onChange={handlePwdChange}
                    placeholder="Enter current password"
                    required
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      name="new_password"
                      value={pwForm.new_password}
                      onChange={handlePwdChange}
                      placeholder="Min. 6 characters"
                      required
                      className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      name="confirm_password"
                      value={pwForm.confirm_password}
                      onChange={handlePwdChange}
                      placeholder="Re-enter new password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold text-center sm:text-left">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Password updates take effect immediately.</span>
              </div>
              <button
                type="submit"
                disabled={pwSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{pwSubmitting ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 md:p-8 shadow-2xl space-y-5 sm:space-y-6 relative border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Choose Profile Avatar</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">Select a preset icon, upload a photo, or enter an image URL.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 sm:space-y-6 pr-1">
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Select Preset Avatar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectAvatar(item.url)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer group hover:border-purple-500 hover:shadow-md ${
                        avatarSrc === item.url ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20' : 'border-slate-200/80 bg-slate-50/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-100 p-0.5 border border-slate-200 shrink-0">
                        <img src={item.url} alt={item.name} className="w-full h-full rounded-full object-cover object-top" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-600 truncate w-full">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload & Custom URL Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <label className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200">
                    <Upload className="w-4 h-4 text-purple-600" />
                    <span>Upload Image File</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <form onSubmit={handleApplyCustomUrl} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
