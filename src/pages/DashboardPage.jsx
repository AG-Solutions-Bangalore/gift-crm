import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Package,
  Layers,
  Calendar,
  Tag,
  Mail,
  MessageSquare,
  RefreshCw,
  ArrowUpRight,
  Plus,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Store,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import { fetchDashboard } from '../services/dashboardApi';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthContext();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetchDashboard(token);
      const data = res?.data || res || {};
      setDashboardData(data);
      if (isManualRefresh) {
        toast.success('Dashboard metrics refreshed!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  // Extract metrics with fallbacks
  const totalProduct = dashboardData?.totalProduct ?? dashboardData?.totalProducts ?? 0;
  const totalCategories = dashboardData?.totalCategories ?? 0;
  const totalOccasions = dashboardData?.totalOccasions ?? 0;
  const totalTags = dashboardData?.totalTags ?? 0;
  const totalNewsletter = dashboardData?.totalNewsletter ?? dashboardData?.totalNewsletters ?? 0;
  const totalEnquiry = dashboardData?.totalEnquiry ?? dashboardData?.totalEnquiries ?? 0;
  const latestEnquiry = Array.isArray(dashboardData?.latestEnquiry) ? dashboardData.latestEnquiry : [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const STATS_CARDS = [
    {
      title: 'Total Products',
      value: totalProduct,
      label: 'Products in Catalog',
      icon: Package,
      path: '/products',
      gradient: 'from-purple-600 to-indigo-600',
      bgLight: 'bg-purple-50/80',
      border: 'border-purple-200/80',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Categories',
      value: totalCategories,
      label: 'Organized Groups',
      icon: Layers,
      path: '/categories',
      gradient: 'from-blue-600 to-cyan-600',
      bgLight: 'bg-blue-50/80',
      border: 'border-blue-200/80',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Occasions',
      value: totalOccasions,
      label: 'Gifting Events',
      icon: Calendar,
      path: '/occasions',
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50/80',
      border: 'border-amber-200/80',
      textColor: 'text-amber-700',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Tags',
      value: totalTags,
      label: 'Discovery Filters',
      icon: Tag,
      path: '/tags',
      gradient: 'from-emerald-600 to-teal-600',
      bgLight: 'bg-emerald-50/80',
      border: 'border-emerald-200/80',
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Newsletter Subscribers',
      value: totalNewsletter,
      label: 'Active Audiences',
      icon: Mail,
      path: '/newsletter',
      gradient: 'from-fuchsia-600 to-pink-600',
      bgLight: 'bg-fuchsia-50/80',
      border: 'border-fuchsia-200/80',
      textColor: 'text-fuchsia-700',
      iconBg: 'bg-fuchsia-100 text-fuchsia-600',
    },
    {
      title: 'Customer Enquiries',
      value: totalEnquiry,
      label: 'Leads & Inquiries',
      icon: MessageSquare,
      path: '/enquiries',
      gradient: 'from-rose-600 to-red-600',
      bgLight: 'bg-rose-50/80',
      border: 'border-rose-200/80',
      textColor: 'text-rose-700',
      iconBg: 'bg-rose-100 text-rose-600',
    },
  ];

  const QUICK_ACTIONS = [
    { label: 'Add New Product', desc: 'Create product with variants', icon: Plus, path: '/products/add', color: 'from-purple-600 to-indigo-600 text-white' },
    { label: 'Manage Products', desc: 'View catalog & stock', icon: Package, path: '/products', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
    { label: 'Categories', desc: 'Hierarchy & collections', icon: Layers, path: '/categories', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { label: 'Occasions', desc: 'Special gift occasions', icon: Calendar, path: '/occasions', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { label: 'Tags', desc: 'Filter keywords & labels', icon: Tag, path: '/tags', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { label: 'Customer Enquiries', desc: 'Review inbound leads', icon: MessageSquare, path: '/enquiries', color: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
    { label: 'Banners', desc: 'Promotional hero banners', icon: ImageIcon, path: '/banners', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
    { label: 'Attributes', desc: 'Colors, Sizes & Options', icon: Sliders, path: '/attributes', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  ];

  const getStatusBadge = (status) => {
    const s = String(status || 'Pending').toLowerCase();
    if (s.includes('closed') || s.includes('resolved')) {
      return (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Closed</span>
        </span>
      );
    }
    if (s.includes('progress')) {
      return (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>In Progress</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Top Header / Welcome Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold rounded-full backdrop-blur-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>Overview & Analytics</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">{currentDateFormatted}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {getGreeting()}{user?.name ? `, ${user.name}` : ''}!
              </h1>
              <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
                Here is an overview of your products, categories, tags, newsletter subscriptions, and customer inquiries.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={loading || refreshing}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md border border-white/10 shadow-xs disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/products/add')}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-900/40 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Stats Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Key Performance Metrics</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Live sync with database</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs animate-pulse space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div className="w-16 h-4 bg-slate-100 rounded-md" />
                  </div>
                  <div className="w-20 h-7 bg-slate-100 rounded-md" />
                  <div className="w-28 h-3 bg-slate-100 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STATS_CARDS.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate(card.path)}
                    className={`group bg-white hover:${card.bgLight} rounded-2xl p-5 border ${card.border} shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-700 text-xs font-bold transition-colors">
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>

                    <div>
                      <div className="text-3xl font-black text-slate-900 tracking-tight mb-0.5">
                        {card.value.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-slate-700">{card.title}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{card.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Two Column Layout: Latest Enquiries & Quick Management Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Enquiries (2 cols on wide screen) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Latest Customer Enquiries</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Recent inbound questions and leads</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/enquiries')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({totalEnquiry})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                <span>Loading enquiries...</span>
              </div>
            ) : latestEnquiry.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">No Recent Enquiries</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    New customer inquiries and contact forms from your storefront will show up here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/enquiries')}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Open Enquiries Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-2">Customer</th>
                      <th className="pb-3 px-2">Product / Subject</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {latestEnquiry.map((enq, index) => {
                      const name = enq.customer_name || enq.name || enq.customerName || 'Customer';
                      const email = enq.email || enq.enquiry_email || enq.phone || '—';
                      const product = enq.product_name || enq.productName || enq.subject || enq.message || 'General Enquiry';
                      return (
                        <tr key={enq.id || index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-2">
                            <div className="font-bold text-slate-800">{name}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{email}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-semibold text-slate-700 truncate max-w-[180px]">{product}</div>
                            {enq.created_at && (
                              <div className="text-[10px] text-slate-400">
                                {new Date(enq.created_at).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {getStatusBadge(enq.status)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => navigate('/enquiries')}
                              className="px-2.5 py-1 text-purple-600 hover:bg-purple-50 rounded-lg font-bold transition-colors cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts (1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Quick Shortcuts</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Fast access to core tools</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {QUICK_ACTIONS.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-slate-50/80 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-transform group-hover:scale-105 ${action.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                          {action.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">{action.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
