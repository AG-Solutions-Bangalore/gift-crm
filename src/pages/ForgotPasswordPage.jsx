import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Gift, User, Mail, ArrowLeft, Send } from 'lucide-react';
import { sendPasswordResetEmail } from '../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      if (/[^0-9]/.test(value)) {
        toast.error('Username must contain only numbers');
        const cleanVal = value.replace(/[^0-9]/g, '');
        setForm((prev) => ({ ...prev, username: cleanVal }));
        return;
      }
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanUsername = String(form.username || '').trim();
    const cleanEmail = String(form.email || '').trim();

    if (!cleanUsername) {
      toast.error('Please enter your username');
      return;
    }
    if (!cleanEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await sendPasswordResetEmail({ username: cleanUsername, email: cleanEmail });
      const msg = response?.message;
      setMessage(msg);
      toast.success(msg);
    } catch (err) {
      const errMsg = err.message || 'Unable to send password reset request.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0c24] flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-950/40 relative z-10 border border-slate-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-purple-500 to-indigo-600 p-0.5 shadow-xl shadow-purple-900/30 mb-4">
            <div className="w-full h-full bg-[#12102e] rounded-[14px] flex items-center justify-center">
              <Gift className="w-8 h-8 text-purple-300 stroke-[2.2]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
            Forgot Password
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1 tracking-wide">
            Enter your details to receive a recovery link
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter registered email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {error ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-600">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-700">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span>Sending...</span>
            ) : (
              <>
                <span>Send Recovery password</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        </form>
      </div>
    </div>
  );
}
