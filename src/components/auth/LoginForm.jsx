import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginForm({ onSubmit, isSubmitting, submitError, onForgotPassword }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) {
      toast.error('Username must contain only numbers');
      const cleanVal = val.replace(/[^0-9]/g, '');
      setUsername(cleanVal);
    } else {
      setUsername(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      toast.error('Please enter username');
      return;
    }
    if (!password) {
      toast.error('Please enter password');
      return;
    }
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username Field */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Username
        </label>
        <div className="relative flex items-center">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter mobile number"
            required
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Password
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative flex items-center">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {submitError ? (
        <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
          <span>⚠️</span>
          <span>{submitError}</span>
        </div>
      ) : null}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
      >
        {isSubmitting ? (
          <span>Signing in...</span>
        ) : (
          <>
            <span>Sign In to Admin</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}
