import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Folders, Plus, Search, Edit3, Trash2, X, CheckCircle2, XCircle, CornerDownRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryApi';

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({
    parent_id: '',
    category_name: '',
    slug: '',
    sort: 1,
    images: '',
    images_alt: '',
    status: 'Active'
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchCategories();
      setCategories(res?.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setForm({
      parent_id: '',
      category_name: '',
      slug: '',
      sort: 1,
      images: '',
      images_alt: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setForm({
      parent_id: cat.parent_id || '',
      category_name: cat.category_name || cat.name || '',
      slug: cat.slug || '',
      sort: cat.sort || 1,
      images: cat.images || '',
      images_alt: cat.images_alt || '',
      status: cat.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_name.trim()) {
      toast.error('Category Name is required');
      return;
    }
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, form);
        toast.success('Category updated successfully');
      } else {
        await createCategory(form);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted successfully');
      await loadCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const getParentName = (parentId) => {
    if (!parentId) return 'Top-Level (Main)';
    const parent = categories.find((c) => c.id === Number(parentId));
    return parent ? parent.category_name : `ID: ${parentId}`;
  };

  const filteredCategories = categories.filter(c => 
    (c.category_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search categories by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
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
                    <th className="px-6 py-3.5">Category Name</th>
                    <th className="px-6 py-3.5">Parent Category</th>
                    <th className="px-6 py-3.5">Slug</th>
                    <th className="px-6 py-3.5">Sort</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-400">{cat.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <Folders className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{cat.category_name}</span>
                          {cat.images_alt ? (
                            <p className="text-[10px] text-slate-400 font-normal">Alt: {cat.images_alt}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {cat.parent_id ? (
                          <span className="flex items-center gap-1 font-semibold text-purple-700">
                            <CornerDownRight className="w-3 h-3 text-purple-400" />
                            {getParentName(cat.parent_id)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">Root Category</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-500">{cat.slug}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{cat.sort}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                          cat.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {cat.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen ? (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {editingCat ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Name (category_name) *
                  </label>
                  <input
                    type="text"
                    value={form.category_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        category_name: name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        images_alt: name
                      }));
                    }}
                    placeholder="e.g. Chocolate Cakes"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Parent Category (parent_id)
                  </label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories.filter(c => c.id !== editingCat?.id).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category_name} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    URL Slug (slug)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. chocolate-cakes"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Sort Order (sort)
                    </label>
                    <input
                      type="number"
                      value={form.sort}
                      onChange={(e) => setForm({ ...form, sort: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/30"
                  >
                    Save Category
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
