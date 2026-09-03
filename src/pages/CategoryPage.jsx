import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Folders, Plus, Search, Edit3, X, CheckCircle2, XCircle, Upload, Filter, CornerDownRight, Layers, Sparkles } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  fetchActiveCategories,
} from '../services/categoryApi';

export default function CategoryPage() {
  const { token } = useAuthContext();
  const { getImageUrl, noImageUrl } = useAppContext();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [form, setForm] = useState({
    parent_id: '',
    categories_name: '',
    categories_slug: '',
    isTop: 1,
    isSubTop: 0,
    categories_sort_order: 1,
    categories_image: '',
    image_file: null,
    image_preview: '',
    categories_status: 'Active',
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      let res;
      if (activeOnly) {
        res = await fetchActiveCategories(token);
      } else {
        res = await fetchCategories(token);
      }
      
      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res?.categories)) {
        items = res.categories;
      } else if (Array.isArray(res?.data?.categories)) {
        items = res.data.categories;
      } else if (res?.data && typeof res.data === 'object') {
        items = Object.values(res.data).filter((item) => item && typeof item === 'object');
      }

      setCategories(items);
    } catch (err) {
      toast.error(err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [activeOnly]);

  const safeCategories = Array.isArray(categories) ? categories : [];

  // Filter only top-level categories (where parent_id is null / empty) for the dropdown options
  const parentCategoriesList = useMemo(() => {
    return safeCategories.filter((c) => {
      const pid = c.parent_id;
      return (
        pid === null ||
        pid === undefined ||
        pid === '' ||
        pid === 'null' ||
        pid === 'none' ||
        pid === 'undefined' ||
        pid === '0' ||
        pid === 0 ||
        String(pid).trim() === ''
      );
    });
  }, [safeCategories]);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setForm({
      parent_id: '',
      categories_name: '',
      categories_slug: '',
      isTop: 0, // Initially disabled until category type / parent is selected
      isSubTop: 0, // Initially disabled until category type / parent is selected
      categories_sort_order: safeCategories.length + 1,
      categories_image: '',
      image_file: null,
      image_preview: '',
      categories_status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (cat) => {
    setEditingCat(cat);
    const hasParent = Boolean(
      cat.parent_id &&
      String(cat.parent_id) !== 'null' &&
      String(cat.parent_id) !== 'none' &&
      String(cat.parent_id).trim() !== ''
    );

    setForm({
      parent_id: hasParent ? String(cat.parent_id) : 'none',
      categories_name: cat.categories_name || cat.name || '',
      categories_slug: cat.categories_slug || cat.slug || '',
      isTop: hasParent ? 0 : Number(cat.isTop ?? 1),
      isSubTop: hasParent ? Number(cat.isSubTop ?? 1) : 0,
      categories_sort_order: cat.categories_sort_order || cat.sort || 1,
      categories_image: cat.categories_image || cat.image || '',
      image_file: null,
      image_preview: '',
      categories_status: cat.categories_status || cat.status || 'Active',
    });
    setIsModalOpen(true);

    try {
      const single = await fetchCategoryById(cat.id, token);
      const item = single?.data || single;
      if (item && (item.categories_name || item.name)) {
        const itemHasParent = Boolean(
          item.parent_id &&
          String(item.parent_id) !== 'null' &&
          String(item.parent_id) !== 'none' &&
          String(item.parent_id).trim() !== ''
        );
        setForm((prev) => ({
          ...prev,
          parent_id: itemHasParent ? String(item.parent_id) : 'none',
          categories_name: item.categories_name || item.name || '',
          categories_slug: item.categories_slug || item.slug || '',
          isTop: itemHasParent ? 0 : Number(item.isTop ?? prev.isTop ?? 1),
          isSubTop: itemHasParent ? Number(item.isSubTop ?? prev.isSubTop ?? 1) : 0,
          categories_sort_order: item.categories_sort_order || item.sort || 1,
          categories_image: item.categories_image || item.image || '',
          categories_status: item.categories_status || item.status || 'Active',
        }));
      }
    } catch (err) {
      console.warn('[CategoryPage] Single fetch fallback:', err.message);
    }
  };

  // Condition Logic handler: when parent_id changes
  const handleParentChange = (newParentId) => {
    if (!newParentId) {
      // Unselected initial state -> both disabled
      setForm((prev) => ({
        ...prev,
        parent_id: '',
        isTop: 0,
        isSubTop: 0,
      }));
      return;
    }

    if (newParentId === 'none') {
      // Top-level chosen -> isTop enabled & checked (1) by default, isSubTop disabled (0)
      setForm((prev) => ({
        ...prev,
        parent_id: 'none',
        isTop: 1,
        isSubTop: 0,
      }));
      return;
    }

    // Sub-category chosen -> isSubTop enabled & checked (1) by default, isTop disabled (0)
    setForm((prev) => ({
      ...prev,
      parent_id: newParentId,
      isTop: 0,
      isSubTop: 1,
    }));
  };

  const handleNameChange = (name) => {
    setForm((prev) => {
      const autoSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return {
        ...prev,
        categories_name: name,
        categories_slug: prev.categories_slug === '' || prev.categories_slug === autoSlug.slice(0, -1) ? autoSlug : prev.categories_slug,
      };
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        categories_image: file.name,
        image_file: file,
        image_preview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categories_name.trim()) {
      toast.error('Category Name (categories_name) is required');
      return;
    }
    if (!form.categories_slug.trim()) {
      toast.error('Category Slug (categories_slug) is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, form, token);
        toast.success('Category updated successfully');
      } else {
        const res = await createCategory(form, token);
        toast.success(res?.message || 'Category created successfully');
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const currentStatus = cat.categories_status || cat.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusTogglingId(cat.id);
    try {
      await updateCategoryStatus(cat.id, newStatus, token);
      toast.success(`Category marked as ${newStatus}`);
      await loadCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  const filteredCategories = safeCategories.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.categories_name || c.name || '').toLowerCase().includes(term) ||
      (c.categories_slug || c.slug || '').toLowerCase().includes(term)
    );
  });

  const getParentCategoryName = (parentId) => {
    if (!parentId || String(parentId) === 'null') return 'Top-Level (Main)';
    const found = safeCategories.find((c) => String(c.id) === String(parentId));
    return found ? found.categories_name || found.name : `Parent #${parentId}`;
  };

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 relative flex items-center max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search categories by name, slug..."
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
              <span>{activeOnly ? 'Showing: Active' : 'Filter: All Categories'}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* Categories Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Folders className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Categories Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Image</th>
                    <th className="px-6 py-3.5">Category Name</th>
                    <th className="px-6 py-3.5">Slug</th>
                    <th className="px-6 py-3.5">Hierarchy / Parent</th>
                    <th className="px-6 py-3.5">Top Badges</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredCategories.map((cat) => {
                    const status = cat.categories_status || cat.status || 'Active';
                    const isToggling = statusTogglingId === cat.id;
                    const isSub = Boolean(cat.parent_id && String(cat.parent_id) !== 'null');

                    return (
                      <tr key={cat.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">{cat.id}</td>
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={
                                cat.categories_image || cat.image
                                  ? getImageUrl('Category', cat.categories_image || cat.image)
                                  : noImageUrl
                              }
                              alt={cat.categories_name || cat.name || 'Category'}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = noImageUrl;
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            {isSub && <CornerDownRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                            <span>{cat.categories_name || cat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                          {cat.categories_slug || cat.slug}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1 ${
                              !isSub
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <Layers className="w-3 h-3" />
                            {getParentCategoryName(cat.parent_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {Number(cat.isTop) === 1 ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Top
                              </span>
                            ) : null}
                            {Number(cat.isSubTop) === 1 ? (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> SubTop
                              </span>
                            ) : null}
                            {Number(cat.isTop) !== 1 && Number(cat.isSubTop) !== 1 ? (
                              <span className="text-[11px] text-slate-400 font-medium">—</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(cat)}
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
                              onClick={() => handleOpenEdit(cat)}
                              className="p-2 hover:bg-purple-50 rounded-lg text-slate-500 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Edit Category"
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

        {/* Create / Edit Category Modal */}
        {isModalOpen ? (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 my-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Folders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingCat ? 'Edit Category' : 'Create New Category'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {editingCat ? 'Update category properties' : 'Add top-level or sub-category to catalog'}
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
                {/* Parent Category Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Parent Category (parent_id) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => handleParentChange(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                  >
                    <option value="">-- Choose Category Type / Parent --</option>
                    <option value="none">None — Top-Level (Main Category)</option>
                    {parentCategoriesList
                      .filter((p) => !editingCat || String(p.id) !== String(editingCat.id))
                      .map((parent) => (
                        <option key={parent.id} value={String(parent.id)}>
                          {parent.categories_name || parent.name} (ID: {parent.id})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={form.categories_name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Cakes"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>

                  {/* Category Slug */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={form.categories_slug}
                      onChange={(e) => setForm({ ...form, categories_slug: e.target.value })}
                      placeholder="e.g. cakes"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Conditional isTop and isSubTop Checkbox Fields */}
                {(() => {
                  const isTopLevelChosen = form.parent_id === 'none';
                  const isSubCategoryChosen = Boolean(form.parent_id && form.parent_id !== 'none');
                  const isTypeChosen = isTopLevelChosen || isSubCategoryChosen;

                  return (
                    <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100/80 space-y-3">
                      <div className="text-[11px] font-bold text-purple-900 flex items-center justify-between">
                        <span>Hierarchy Visibility Rules</span>
                        <span className="text-[10px] font-medium text-purple-600">
                          {!isTypeChosen
                            ? 'Select parent category above to enable'
                            : isSubCategoryChosen
                            ? 'Sub-category mode'
                            : 'Top-level mode'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* isTop Checkbox */}
                        <label
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isTopLevelChosen
                              ? 'bg-white border-purple-200 shadow-2xs cursor-pointer hover:border-purple-300'
                              : 'bg-slate-100/80 border-slate-200 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">isTop (Top Category)</span>
                              {isTopLevelChosen ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  Active
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                                  Disabled
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {!isTypeChosen
                                ? 'Choose parent first'
                                : isTopLevelChosen
                                ? 'Enable as featured Top Category'
                                : 'Disabled for sub-categories'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={Number(form.isTop) === 1}
                            disabled={!isTopLevelChosen}
                            onChange={(e) => setForm({ ...form, isTop: e.target.checked ? 1 : 0 })}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
                          />
                        </label>

                        {/* isSubTop Checkbox */}
                        <label
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isSubCategoryChosen
                              ? 'bg-white border-purple-200 shadow-2xs cursor-pointer hover:border-purple-300'
                              : 'bg-slate-100/80 border-slate-200 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">isSubTop (Sub-Top)</span>
                              {isSubCategoryChosen ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  Active
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                                  Disabled
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {!isTypeChosen
                                ? 'Choose parent first'
                                : isSubCategoryChosen
                                ? 'Enable as featured Sub-Top'
                                : 'Disabled for top-level'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={Number(form.isSubTop) === 1}
                            disabled={!isSubCategoryChosen}
                            onChange={(e) => setForm({ ...form, isSubTop: e.target.checked ? 1 : 0 })}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sort Order */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Sort Order (categories_sort_order)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.categories_sort_order}
                      onChange={(e) => setForm({ ...form, categories_sort_order: e.target.value })}
                      placeholder="1"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>

                  {/* Status only in Edit */}
                  {editingCat ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Status (categories_status)
                      </label>
                      <select
                        value={form.categories_status}
                        onChange={(e) => setForm({ ...form, categories_status: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  ) : null}
                </div>

                {/* Category Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Image (categories_image)
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-purple-200/80">
                      <Upload className="w-4 h-4 text-purple-600" />
                      <span>Upload Category Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>

                    {form.categories_image || form.image_preview ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                            <img
                              src={
                                form.image_preview ||
                                (form.categories_image ? getImageUrl('Category', form.categories_image) : noImageUrl)
                              }
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = noImageUrl;
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 truncate max-w-[180px]">
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {form.categories_image || 'Image selected'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, categories_image: '', image_file: null, image_preview: '' }))}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline p-1 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

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
                    {submitting ? 'Saving Category...' : editingCat ? 'Update Category' : 'Save Category'}
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
