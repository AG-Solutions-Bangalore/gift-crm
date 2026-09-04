import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  X,
  Check,
  ChevronDown,
  Clock
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import {
  fetchWebsiteUniques,
  createWebsiteUnique,
  updateWebsiteUnique,
  updateWebsiteUniqueStatus,
  deleteWebsiteUnique
} from '../services/websiteUniqueApi';
import { fetchCategories } from '../services/categoryApi';

export default function WebsiteUniquePage() {
  const { token } = useAuthContext();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialFormData = {
    website_heading: '',
    from_date: '',
    to_date: '',
    sort_order: 1,
    status: 'Active',
    sub_ids: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uniqueRes, catRes] = await Promise.allSettled([
        fetchWebsiteUniques(token),
        fetchCategories(token),
      ]);

      if (uniqueRes.status === 'fulfilled') {
        const res = uniqueRes.value;
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;
        setItems(list);
      } else {
        toast.error('Failed to load website unique sections');
        setItems([]);
      }

      if (catRes.status === 'fulfilled') {
        const cData = catRes.value;
        let cList = [];
        if (Array.isArray(cData)) cList = cData;
        else if (Array.isArray(cData?.data)) cList = cData.data;
        else if (Array.isArray(cData?.categories)) cList = cData.categories;
        setCategories(cList);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    let subIds = [];
    if (Array.isArray(item.sub_ids)) {
      subIds = item.sub_ids.map((id) => Number(id));
    } else if (typeof item.sub_ids === 'string') {
      try {
        const parsed = JSON.parse(item.sub_ids);
        if (Array.isArray(parsed)) subIds = parsed.map((id) => Number(id));
      } catch {
        subIds = item.sub_ids.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
      }
    }

    setFormData({
      website_heading: item.website_heading || item.heading || '',
      from_date: item.from_date || '',
      to_date: item.to_date || '',
      sort_order: item.sort_order ?? 1,
      status: item.status || 'Active',
      sub_ids: subIds,
    });
    setIsModalOpen(true);
  };

  const toggleSubId = (id) => {
    const numId = Number(id);
    setFormData((prev) => {
      const exists = prev.sub_ids.includes(numId);
      const newSubIds = exists
        ? prev.sub_ids.filter((i) => i !== numId)
        : [...prev.sub_ids, numId];
      return { ...prev, sub_ids: newSubIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.website_heading.trim()) {
      toast.error('Please enter a website heading.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const id = editingItem.id || editingItem.website_unique_id;
        await updateWebsiteUnique(id, formData, token);
        toast.success('Website unique section updated');
      } else {
        await createWebsiteUnique(formData, token);
        toast.success('Website unique section created');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async (item) => {
    const id = item.id || item.website_unique_id;
    const currentStatus = item.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateWebsiteUniqueStatus(id, newStatus, token);
      toast.success(`Status updated to ${newStatus}`);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (item) => {
    const id = item.id || item.website_unique_id;
    if (!window.confirm('Are you sure you want to delete this website unique section?')) return;
    try {
      await deleteWebsiteUnique(id, token);
      toast.success('Section deleted successfully');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const getSubCategoryName = (id) => {
    const found = categories.find((c) => Number(c.id || c.categories_id) === Number(id));
    return found ? found.categories_name || found.name : `Sub #${id}`;
  };

  const filteredItems = items.filter((item) => {
    const heading = (item.website_heading || item.heading || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = heading.includes(q);

    if (statusFilter === 'ALL') return matchesSearch;
    const s = (item.status || 'Active').toLowerCase();
    return matchesSearch && s === statusFilter.toLowerCase();
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Marketing / <span className="text-purple-600">Website Unique</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Website Unique Sections
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all cursor-pointer border border-slate-200 bg-white shadow-2xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by heading..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* List / Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-xs text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
            <span>Loading sections...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-xs text-center space-y-3">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No Website Unique Sections</p>
            <p className="text-xs text-slate-400">Click 'Add Section' to highlight curated categories on the website.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const id = item.id || item.website_unique_id;
              const isActive = (item.status || 'Active') === 'Active';

              let subIds = [];
              if (Array.isArray(item.sub_ids)) subIds = item.sub_ids;
              else if (typeof item.sub_ids === 'string') {
                try {
                  const parsed = JSON.parse(item.sub_ids);
                  if (Array.isArray(parsed)) subIds = parsed;
                } catch {
                  subIds = item.sub_ids.split(',').map((s) => s.trim()).filter(Boolean);
                }
              }

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">
                            {item.website_heading || 'Untitled Section'}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400">Order: #{item.sort_order ?? 1}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStatusToggle(item)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}
                      >
                        {item.status || 'Active'}
                      </button>
                    </div>

                    {/* Dates */}
                    {(item.from_date || item.to_date) && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>{item.from_date || '—'}</span>
                        <span className="text-slate-300">to</span>
                        <span>{item.to_date || '—'}</span>
                      </div>
                    )}

                    {/* Sub IDs / Categories Tag List */}
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                        Sub Categories ({subIds.length})
                      </span>
                      {subIds.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No sub IDs mapped</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {subIds.map((sId) => (
                            <span
                              key={sId}
                              className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold"
                            >
                              {getSubCategoryName(sId)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">ID: #{id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Section"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                <h2 className="text-sm font-bold text-slate-900">
                  {editingItem ? 'Edit Website Unique Section' : 'Create Website Unique Section'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                {/* Heading */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                    Website Heading <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.website_heading}
                    onChange={(e) => setFormData({ ...formData, website_heading: e.target.value })}
                    placeholder="e.g. Handcrafted Unique Gifts"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-purple-600"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={formData.from_date}
                      onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={formData.to_date}
                      onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Sort Order & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Sub IDs Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase">
                    Select Sub Categories / Sub IDs ({formData.sub_ids.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 custom-scrollbar">
                    {categories.length === 0 ? (
                      <p className="text-[11px] text-slate-400 p-2 italic text-center">Loading categories...</p>
                    ) : (
                      categories.map((cat) => {
                        const catId = Number(cat.id || cat.categories_id);
                        const isSelected = formData.sub_ids.includes(catId);
                        return (
                          <div
                            key={catId}
                            onClick={() => toggleSubId(catId)}
                            className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors text-xs ${
                              isSelected
                                ? 'bg-purple-600 text-white font-bold shadow-2xs'
                                : 'hover:bg-slate-200/60 text-slate-700'
                            }`}
                          >
                            <span>{cat.categories_name || cat.name} (ID: {catId})</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : editingItem ? 'Update Section' : 'Create Section'}
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
