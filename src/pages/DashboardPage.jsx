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
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              We are enhancing our analytics dashboard to deliver real-time insights, sales trends, and live order metrics. In the meantime, manage your products, categories, and catalog using the sidebar menu.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/products/add')}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Product
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-purple-600" /> View Products Catalog
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
