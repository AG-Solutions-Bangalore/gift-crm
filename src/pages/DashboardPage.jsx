import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, PlusCircle, ArrowRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Coming Soon Hero Card */}
        <div className="bg-white rounded-3xl p-10 md:p-16 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-50 to-indigo-100 border border-purple-200/60 flex items-center justify-center shadow-inner">
            <Sparkles className="w-10 h-10 text-purple-600 animate-pulse" />
          </div>

          <div className="max-w-md space-y-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider">
              System Dashboard
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Dashboard Analytics Coming Soon
            </h2>
          </div>

          
        </div>
      </div>
    </MainLayout>
  );
}
