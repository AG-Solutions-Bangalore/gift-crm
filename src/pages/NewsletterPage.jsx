import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Search, 
  Download, 
  RefreshCw, 
  Calendar, 
  ChevronDown 
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import { fetchNewsletters, updateNewsletterStatus } from '../services/newsletterApi';

export default function NewsletterPage() {
  const { token } = useAuthContext();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetchNewsletters(token);
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res?.data?.data)) items = res.data.data;
      else if (Array.isArray(res?.newsletters)) items = res.newsletters;
      setSubscribers(items);
    } catch (err) {
      toast.error(err.message || 'Failed to load newsletter subscribers');
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, [token]);

  const handleStatusToggle = async (sub) => {
    const subId = sub.id || sub.newsletter_id;
    const currentStatus = sub.newsletter_status || sub.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateNewsletterStatus(subId, newStatus, token);
      toast.success(`Subscriber status updated to ${newStatus}`);
      await loadSubscribers();
    } catch (err) {
      toast.error(err.message || 'Failed to update subscriber status');
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export.');
      return;
    }

    const headers = ['ID', 'Email', 'Status', 'Date'];
    const rows = filteredSubscribers.map((s) => [
      s.id || s.newsletter_id,
      s.email || s.newsletter_email || '',
      s.newsletter_status || s.status || 'Active',
      s.created_at || s.subscribed_at || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscribers CSV exported successfully');
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const email = String(s.email || s.newsletter_email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = email.includes(q);

    if (statusFilter === 'ALL') return matchesSearch;
    const st = String(s.newsletter_status || s.status || 'Active').toLowerCase();
    return matchesSearch && st === statusFilter.toLowerCase();
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Marketing / <span className="text-purple-600">Newsletter</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Newsletter Subscribers
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadSubscribers}
              disabled={loading}
              className="p-2.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all cursor-pointer border border-slate-200 bg-white shadow-2xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search subscribers by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <span className="text-xs font-bold text-slate-500">
              Total: {filteredSubscribers.length} Subscribers
            </span>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              <span>Loading newsletter subscribers...</span>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Mail className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">No Newsletter Subscribers Found</p>
              <p className="text-xs text-slate-400">Newsletter subscribers registered on the website will be listed here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Email Address</th>
                    <th className="px-5 py-3.5">Subscribed Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredSubscribers.map((sub) => {
                    const subId = sub.id || sub.newsletter_id;
                    const email = sub.email || sub.newsletter_email || '—';
                    const date = sub.created_at || sub.subscribed_at || '—';
                    const status = sub.newsletter_status || sub.status || 'Active';
                    const isActive = status.toLowerCase() === 'active' || status.toLowerCase() === 'subscribed';

                    return (
                      <tr key={subId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-400">#{subId}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                            <span>{email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{date}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(sub)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {status}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(sub)}
                            className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                          >
                            Toggle Status
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
      </div>
    </MainLayout>
  );
}
