import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar,
  Plus,
  Search,
  Edit3,
  X,
  CheckCircle2,
  XCircle,
  Filter,
  Sparkles,
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Pagination from '../components/common/Pagination';
import { useAuthContext } from '../context/AuthContext';
import {
  fetchOccasions,
  fetchActiveOccasions,
  fetchOccasionById,
  createOccasion,
  updateOccasion,
  updateOccasionStatus,
  generateOccasionSlug
} from '../services/occasionApi';

export default function OccasionPage() {
  const { token } = useAuthContext();

  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Form State matching backend requirements
  const [form, setForm] = useState({
    occasions_name: '',
    occasions_slug: '',
    occasions_status: 'Active',
    slugManuallyEdited: false
  });

  const loadOccasions = async () => {
    setLoading(true);
    try {
      let res;
      if (activeOnly) {
        res = await fetchActiveOccasions(token);
      } else {
        res = await fetchOccasions(token);
      }
      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res?.occasions)) {
        items = res.occasions;
      } else if (Array.isArray(res?.data?.occasions)) {
        items = res.data.occasions;
      } else if (res?.data && typeof res.data === 'object') {
        items = Object.values(res.data).filter((item) => item && typeof item === 'object');
      }

      setOccasions(items);
    } catch (err) {
      toast.error(err.message || 'Failed to load occasions');
      setOccasions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOccasions();
  }, [activeOnly]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      occasions_name: '',
      occasions_slug: '',
      occasions_status: 'Active',
      slugManuallyEdited: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (item) => {
    const occId = item.id || item.occasions_id;
    setEditingItem(item);
    setForm({
      occasions_name: item.occasions_name || item.name || '',
      occasions_slug: item.occasions_slug || item.slug || '',
      occasions_status: item.occasions_status || item.status || 'Active',
      slugManuallyEdited: true
    });
    setIsModalOpen(true);

    try {
      const single = await fetchOccasionById(occId, token);
      const detail = single?.data || single;
      if (detail && (detail.occasions_name || detail.name)) {
        setForm((prev) => ({
          ...prev,
          occasions_name: detail.occasions_name || detail.name || '',
          occasions_slug: detail.occasions_slug || detail.slug || '',
          occasions_status: detail.occasions_status || detail.status || 'Active'
        }));
      }
    } catch (err) {
      console.warn('[OccasionPage] Single occasion fetch note:', err.message);
    }
  };

  const handleNameChange = (val) => {
    setForm((prev) => ({
      ...prev,
      occasions_name: val,
      occasions_slug: prev.slugManuallyEdited ? prev.occasions_slug : generateOccasionSlug(val)
    }));
  };

  const handleSlugChange = (val) => {
    setForm((prev) => ({
      ...prev,
      occasions_slug: generateOccasionSlug(val),
      slugManuallyEdited: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.occasions_name.trim()) {
      toast.error('Occasion Name is required');
      return;
    }

    setSubmitting(true);
    const occId = editingItem?.id || editingItem?.occasions_id;

    try {
      if (editingItem) {
        await updateOccasion(occId, form, token);
        toast.success('Occasion updated successfully');
      } else {
        const res = await createOccasion(form, token);
        toast.success(res?.message || 'Occasion created successfully');
      }
      setIsModalOpen(false);
      await loadOccasions();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const occId = item.id || item.occasions_id;
    const currentStatus = item.occasions_status || item.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusTogglingId(occId);

    try {
      await updateOccasionStatus(occId, newStatus, token);
      toast.success(`Occasion marked as ${newStatus}`);
      await loadOccasions();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  const safeOccasions = Array.isArray(occasions) ? occasions : [];
  const filteredOccasions = safeOccasions
    .filter((occ) => {
      const term = search.toLowerCase();
      return (
        (occ.occasions_name || occ.name || '').toLowerCase().includes(term) ||
        (occ.occasions_slug || occ.slug || '').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => Number(a.id || a.occasions_id || 0) - Number(b.id || b.occasions_id || 0));

  const numericPageSize = pageSize === 'all' || pageSize === 'All' ? (filteredOccasions.length || 1) : Number(pageSize) || 20;
  const paginatedOccasions = filteredOccasions.slice(
    (currentPage - 1) * numericPageSize,
    (currentPage - 1) * numericPageSize + numericPageSize
  );

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 relative flex items-center max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search occasions by name or slug..."
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
              <span>{activeOnly ? 'Showing: Active' : 'Filter: All Occasions'}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Occasion</span>
            </button>
          </div>
        </div>

        {/* Occasions Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              <span>Loading occasions...</span>
            </div>
          ) : filteredOccasions.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Occasions Found</p>
              <p className="text-xs text-slate-400">Create a new occasion to organize gifts and celebratory categories.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Occasion Name</th>
                    <th className="px-6 py-3.5">Slug</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {paginatedOccasions.map((occ) => {
                    const occId = occ.id || occ.occasions_id;
                    const name = occ.occasions_name || occ.name || '-';
                    const slug = occ.occasions_slug || occ.slug || '-';
                    const status = occ.occasions_status || occ.status || 'Active';
                    const isToggling = statusTogglingId === occId;

                    return (
                      <tr key={occId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">
                          #{occId}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <span className="font-semibold">{name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium inline-flex items-center gap-1">
                            <LinkIcon className="w-3 h-3 text-slate-400" />
                            {slug}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(occ)}
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
                              onClick={() => handleOpenEdit(occ)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Edit Occasion"
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
          {!loading && filteredOccasions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredOccasions.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemName="occasions"
              pageSizeOptions={[10, 20, 50, 100, 'All']}
            />
          )}
        </div>

        {/* Create / Edit Occasion Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Edit Occasion' : 'Create New Occasion'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Occasion Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.occasions_name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Birthday, Anniversary, Diwali"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Occasion Slug</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">auto-generated</span>
                  </label>
                  <input
                    type="text"
                    value={form.occasions_slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="e.g. birthday, anniversary"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                {editingItem && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.occasions_status}
                      onChange={(e) => setForm({ ...form, occasions_status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-2 ${
                      submitting ? 'opacity-50 cursor-wait' : ''
                    }`}
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingItem ? 'Save Changes' : 'Create Occasion'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
