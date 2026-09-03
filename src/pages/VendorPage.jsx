import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Store, Plus, Search, Edit3, X, CheckCircle2, XCircle, Filter, Phone, MapPin, User } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import {
  fetchVendors,
  fetchVendorById,
  createVendor,
  updateVendor,
  updateVendorStatus,
  fetchActiveVendors,
} from '../services/vendorApi';

export default function VendorPage() {
  const { token } = useAuthContext();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const [form, setForm] = useState({
    vendor_name: '',
    contact_name: '',
    vendor_mobile: '',
    vendor_address: '',
    vendor_status: 'Active',
  });

  const loadVendors = async () => {
    setLoading(true);
    try {
      let res;
      if (activeOnly) {
        res = await fetchActiveVendors(token);
      } else {
        res = await fetchVendors(token);
      }
      
      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res?.vendors)) {
        items = res.vendors;
      } else if (Array.isArray(res?.data?.vendors)) {
        items = res.data.vendors;
      } else if (res?.data && typeof res.data === 'object') {
        items = Object.values(res.data).filter((item) => item && typeof item === 'object');
      }

      setVendors(items);
    } catch (err) {
      toast.error(err.message || 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [activeOnly]);

  const handleOpenCreate = () => {
    setEditingVendor(null);
    setForm({
      vendor_name: '',
      contact_name: '',
      vendor_mobile: '',
      vendor_address: '',
      vendor_status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (vendor) => {
    setEditingVendor(vendor);
    setForm({
      vendor_name: vendor.vendor_name || vendor.name || '',
      contact_name: vendor.contact_name || '',
      vendor_mobile: vendor.vendor_mobile || vendor.mobile || vendor.phone || '',
      vendor_address: vendor.vendor_address || vendor.address || '',
      vendor_status: vendor.vendor_status || vendor.status || 'Active',
    });
    setIsModalOpen(true);

    try {
      const single = await fetchVendorById(vendor.id, token);
      const item = single?.data || single;
      if (item && (item.vendor_name || item.name)) {
        setForm((prev) => ({
          ...prev,
          vendor_name: item.vendor_name || item.name || '',
          contact_name: item.contact_name || '',
          vendor_mobile: item.vendor_mobile || item.mobile || item.phone || '',
          vendor_address: item.vendor_address || item.address || '',
          vendor_status: item.vendor_status || item.status || 'Active',
        }));
      }
    } catch (err) {
      console.warn('[VendorPage] Single vendor fetch fallback:', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendor_name.trim()) {
      toast.error('Vendor Name (vendor_name) is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, form, token);
        toast.success('Vendor updated successfully');
      } else {
        const res = await createVendor(form, token);
        toast.success(res?.message || 'Vendor created successfully');
      }
      setIsModalOpen(false);
      await loadVendors();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (vendor) => {
    const currentStatus = vendor.vendor_status || vendor.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusTogglingId(vendor.id);
    try {
      await updateVendorStatus(vendor.id, newStatus, token);
      toast.success(`Vendor marked as ${newStatus}`);
      await loadVendors();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  const safeVendors = Array.isArray(vendors) ? vendors : [];
  const filteredVendors = safeVendors.filter((v) => {
    const term = search.toLowerCase();
    return (
      (v.vendor_name || v.name || '').toLowerCase().includes(term) ||
      (v.contact_name || '').toLowerCase().includes(term) ||
      (v.vendor_mobile || v.mobile || '').toLowerCase().includes(term) ||
      (v.vendor_address || v.address || '').toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 relative flex items-center max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search vendors by name, contact, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveOnly((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeOnly
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{activeOnly ? 'Showing: Active' : 'Filter: All Vendors'}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Vendor</span>
            </button>
          </div>
        </div>

        {/* Vendors Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Store className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Vendors Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Vendor Name</th>
                    <th className="px-6 py-3.5">Contact Person</th>
                    <th className="px-6 py-3.5">Mobile</th>
                    <th className="px-6 py-3.5">Address</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredVendors.map((vendor) => {
                    const status = vendor.vendor_status || vendor.status || 'Active';
                    const isToggling = statusTogglingId === vendor.id;

                    return (
                      <tr key={vendor.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">{vendor.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                              <Store className="w-4 h-4" />
                            </div>
                            <span>{vendor.vendor_name || vendor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{vendor.contact_name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{vendor.vendor_mobile || vendor.mobile || vendor.phone || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{vendor.vendor_address || vendor.address || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(vendor)}
                            disabled={isToggling}
                            title="Click to toggle status"
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit cursor-pointer transition-all hover:scale-105 ${
                              status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {status === 'Active' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>{status}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleOpenEdit(vendor)}
                              className="p-2 hover:bg-purple-50 rounded-lg text-slate-500 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Edit Vendor"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create / Edit Vendor Modal */}
        {isModalOpen ? (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 my-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingVendor ? 'Edit Vendor' : 'Create New Vendor'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {editingVendor ? 'Update vendor information' : 'Add a new supplier/partner'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vendor Name * (vendor_name)
                  </label>
                  <input
                    type="text"
                    value={form.vendor_name}
                    onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
                    placeholder="e.g. Heritage Crafts Co."
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Person (contact_name)
                  </label>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vendor Mobile (vendor_mobile)
                  </label>
                  <input
                    type="text"
                    value={form.vendor_mobile}
                    onChange={(e) => setForm({ ...form, vendor_mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vendor Address (vendor_address)
                  </label>
                  <textarea
                    rows="3"
                    value={form.vendor_address}
                    onChange={(e) => setForm({ ...form, vendor_address: e.target.value })}
                    placeholder="e.g. 123 Artisan Road, Jaipur, Rajasthan"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
                  />
                </div>

                {/* Status Field only in Edit Mode */}
                {editingVendor ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Status (vendor_status)
                    </label>
                    <select
                      value={form.vendor_status}
                      onChange={(e) => setForm({ ...form, vendor_status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                ) : null}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/30 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? 'Saving Vendor...' : editingVendor ? 'Update Vendor' : 'Save Vendor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
