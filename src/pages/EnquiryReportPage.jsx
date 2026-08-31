import React, { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { fetchEnquiryReport } from '../services/enquiryApi';

export default function EnquiryReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchEnquiryReport();
        setReport(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Summary Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Enquiry Analytics & Export</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Detailed breakdown of customer gift requests, fulfillment status, and volume reports.
            </p>
          </div>
          <button
            onClick={() => alert('Exporting Enquiry Report CSV...')}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" /> Export Summary CSV
          </button>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Enquiries</span>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-slate-900">{loading ? '...' : report?.pendingCount || 0}</p>
            <p className="text-xs text-amber-600 font-semibold">Requires immediate review</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-black text-slate-900">{loading ? '...' : report?.inProgressCount || 0}</p>
            <p className="text-xs text-blue-600 font-semibold">Quotes actively sent</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfilled & Closed</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-slate-900">{loading ? '...' : report?.closedCount || 0}</p>
            <p className="text-xs text-emerald-600 font-semibold">Successful orders completed</p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Comprehensive Enquiry Log</h3>
          {loading ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-400">Generating report...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">Enquiry ID</th>
                    <th className="px-6 py-3.5">Customer Name</th>
                    <th className="px-6 py-3.5">Requested Gift</th>
                    <th className="px-6 py-3.5">Quantity</th>
                    <th className="px-6 py-3.5">Date Submitted</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {report?.data?.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-purple-600">{item.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.customerName}</td>
                      <td className="px-6 py-4 text-slate-600">{item.productName}</td>
                      <td className="px-6 py-4 font-bold">{item.quantity} units</td>
                      <td className="px-6 py-4 text-slate-500">{item.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          item.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
