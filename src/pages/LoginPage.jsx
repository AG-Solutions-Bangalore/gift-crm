import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import { loginUser } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Gift CRM - Login';
  }, []);

  const handleLogin = async (formValues) => {
    setError('');
    setIsSubmitting(true);
    try {
      const username = String(formValues?.username || '').trim();
      const password = String(formValues?.password || '').trim();

      const response = await loginUser({ username, password });
      await login(response);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0c24] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-950/40 relative z-10 border border-slate-100">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
            Gift CRM
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1 tracking-wide">
            Admin Portal • Making Every Moment Special
          </p>
        </div>

        {/* Login Form Component */}
        <LoginForm
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
          submitError={error}
          onForgotPassword={() => navigate('/forgot-password')}
        />

        {/* Footer Badge */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure Encrypted Connection</span>
        </div>
      </div>
    </div>
  );
}
