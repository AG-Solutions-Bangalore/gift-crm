import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Tag,
  Plus,
  Search,
  Edit3,
  X,
  CheckCircle2,
  XCircle,
  Filter,
  Sparkles,
  Link as LinkIcon,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import {
  fetchTags,
  fetchActiveTags,
  fetchTagById,
  createTag,
  updateTag,
  updateTagStatus,
  generateTagSlug
} from '../services/tagApi';

export default function TagPage() {
  const { token } = useAuthContext();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State matching backend requirements
  const [form, setForm] = useState({
    tags_name: '',
    tags_slug: '',
    tags_sort: '1',
    tags_status: 'Active',
    slugManuallyEdited: false
  });

  const loadTags = async () => {
    setLoading(true);
    try {
      let res;
      if (activeOnly) {
        res = await fetchActiveTags(token);
      } else {
        res = await fetchTags(token);
      }
      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res?.tags)) {
        items = res.tags;
      } else if (Array.isArray(res?.data?.tags)) {
        items = res.data.tags;
      } else if (res?.data && typeof res.data === 'object') {
        items = Object.values(res.data).filter((item) => item && typeof item === 'object');
      }

      setTags(items);
    } catch (err) {
      toast.error(err.message || 'Failed to load tags');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, [activeOnly]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      tags_name: '',
      tags_slug: '',
      tags_sort: '1',
      tags_status: 'Active',
      slugManuallyEdited: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (item) => {
    const tagId = item.id || item.tags_id;
    setEditingItem(item);
    setForm({
      tags_name: item.tags_name || item.name || '',
      tags_slug: item.tags_slug || item.slug || '',
      tags_sort: String(item.tags_sort ?? item.sort ?? '1'),
      tags_status: item.tags_status || item.status || 'Active',
      slugManuallyEdited: true
    });
    setIsModalOpen(true);

    try {
      const single = await fetchTagById(tagId, token);
      const detail = single?.data || single;
      if (detail && (detail.tags_name || detail.name)) {
        setForm((prev) => ({
          ...prev,
          tags_name: detail.tags_name || detail.name || '',
          tags_slug: detail.tags_slug || detail.slug || '',
          tags_sort: String(detail.tags_sort ?? detail.sort ?? prev.tags_sort),
          tags_status: detail.tags_status || detail.status || 'Active'
        }));
      }
    } catch (err) {
      console.warn('[TagPage] Single tag fetch fallback:', err.message);
    }
  };

  const handleNameChange = (val) => {
    setForm((prev) => ({
      ...prev,
      tags_name: val,
      tags_slug: prev.slugManuallyEdited ? prev.tags_slug : generateTagSlug(val)
    }));
  };

  const handleSlugChange = (val) => {
    setForm((prev) => ({
      ...prev,
      tags_slug: generateTagSlug(val),
      slugManuallyEdited: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tags_name.trim()) {
      toast.error('Tag Name is required');
      return;
    }

    setSubmitting(true);
    const tagId = editingItem?.id || editingItem?.tags_id;

    try {
      if (editingItem) {
        await updateTag(tagId, form, token);
        toast.success('Tag updated successfully');
      } else {
        const res = await createTag(form, token);
        toast.success(res?.message || 'Tag created successfully');
      }
      setIsModalOpen(false);
      await loadTags();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const tagId = item.id || item.tags_id;
    const currentStatus = item.tags_status || item.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusTogglingId(tagId);

    try {
      await updateTagStatus(tagId, newStatus, token);
      toast.success(`Tag marked as ${newStatus}`);
      await loadTags();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  const safeTags = Array.isArray(tags) ? tags : [];
  const filteredTags = safeTags.filter((t) => {
    const name = (t.tags_name || t.name || '').toLowerCase();
    const slug = (t.tags_slug || t.slug || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || slug.includes(q);
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
              placeholder="Search tags by name or slug..."
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
              <span>{activeOnly ? 'Showing: Active' : 'Filter: All Tags'}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Tag</span>
            </button>
          </div>
        </div>

        {/* Tags Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              <span>Loading tags...</span>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Tag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Tags Found</p>
              <p className="text-xs text-slate-400">Create promotional or descriptive tags like 'Bestseller', 'Trending', etc.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Tag Name</th>
                    <th className="px-6 py-3.5">Slug</th>
                    <th className="px-6 py-3.5">Sort Order</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredTags.map((tagItem) => {
                    const tagId = tagItem.id || tagItem.tags_id;
                    const name = tagItem.tags_name || tagItem.name || '-';
                    const slug = tagItem.tags_slug || tagItem.slug || '-';
                    const sort = tagItem.tags_sort ?? tagItem.sort ?? '-';
                    const status = tagItem.tags_status || tagItem.status || 'Active';
                    const isToggling = statusTogglingId === tagId;

                    return (
                      <tr key={tagId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">
                          #{tagId}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                              <Tag className="w-4 h-4" />
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
                        <td className="px-6 py-4 font-mono text-slate-600 font-semibold">
                          <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-[11px]">
                            {sort}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(tagItem)}
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
                              onClick={() => handleOpenEdit(tagItem)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Edit Tag"
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

        {/* Create / Edit Tag Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Edit Tag' : 'Create New Tag'}
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
                    Tag Name (tags_name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.tags_name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Bestseller, Trending, Premium, Same Day"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Tag Slug (tags_slug)</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">auto-generated</span>
                  </label>
                  <input
                    type="text"
                    value={form.tags_slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="e.g. bestseller, trending"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sort Order (tags_sort)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.tags_sort}
                    onChange={(e) => setForm({ ...form, tags_sort: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                {editingItem && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Status (tags_status)
                    </label>
                    <select
                      value={form.tags_status}
                      onChange={(e) => setForm({ ...form, tags_status: e.target.value })}
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
                    <span>{editingItem ? 'Save Changes' : 'Create Tag'}</span>
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
