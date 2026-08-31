import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare, Search, Filter, Phone, Mail, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { fetchEnquiries, updateEnquiryStatus } from '../services/enquiryApi';

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetchEnquiries();
      setEnquiries(res?.data || []);
    } catch (err) {
      toast.error('Failed to load customer enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateEnquiryStatus(id, newStatus);
      toast.success(`Enquiry marked as ${newStatus}`);
      await loadEnquiries();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch = 
      e.customerName.toLowerCase().includes(search.toLowerCase()) ||
      e.productName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search enquiries by customer, email or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filter:</span>
            {['All', 'Pending', 'In Progress', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Enquiries List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400">Loading enquiries...</div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Enquiries Found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEnquiries.map((enq) => (
                <div key={enq.id} className="p-6 hover:bg-purple-50/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                        {enq.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{enq.customerName}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        enq.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        enq.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {enq.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">
                      Product Requested: <span className="text-purple-600 font-bold">{enq.productName}</span> ({enq.quantity} Pcs)
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {enq.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {enq.phone}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {enq.date}</span>
                    </div>

                    {enq.notes ? (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "{enq.notes}"
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
