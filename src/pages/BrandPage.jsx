import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Award, Plus, Search, Edit3, Trash2, X, CheckCircle2, XCircle, Upload, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import { fetchBrands, createBrand, updateBrand, deleteBrand } from '../services/brandApi';

export default function BrandPage() {
  const { token } = useAuthContext();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Custom Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

  const [form, setForm] = useState({
    brands_name: '',
    brands_image: '',
    status: 'Active'
  });

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await fetchBrands(token);
      setBrands(res?.data || []);
    } catch (err) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setForm({
      brands_name: '',
      brands_image: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setForm({
      brands_name: brand.brands_name || brand.name || '',
      brands_image: brand.brands_image || brand.image || '',
      status: brand.status || 'Active'
    });
    setIsModalOpen(true);
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
      setForm((prev) => ({ ...prev, brands_image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brands_name.trim()) {
      toast.error('Brand Name (brands_name) is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, form, token);
        toast.success('Brand updated successfully');
      } else {
        const res = await createBrand(form, token);
        toast.success(res?.message || 'Brand created successfully');
      }
      setIsModalOpen(false);
      await loadBrands();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (brand) => {
    setDeleteConfirm({
      isOpen: true,
      id: brand.id,
      name: brand.brands_name || brand.name || 'this brand'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteBrand(deleteConfirm.id);
      toast.success('Brand deleted successfully');
      setDeleteConfirm({ isOpen: false, id: null, name: '' });
      await loadBrands();
    } catch (err) {
      toast.error('Failed to delete brand');
    }
  };

  const filteredBrands = brands.filter((b) =>
    (b.brands_name || b.name || '').toLowerCase().includes(search.toLowerCase())
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
              placeholder="Search brands by name..."
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
            <span>Add New Brand</span>
          </button>
        </div>

        {/* Brands Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400">Loading brands...</div>
          ) : filteredBrands.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Brands Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Brand Image</th>
                    <th className="px-6 py-3.5">Brand Name</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredBrands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-400">{brand.id}</td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0">
                          {brand.brands_image || brand.image ? (
                            <img
                              src={brand.brands_image || brand.image}
                              alt={brand.brands_name || 'Brand'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Award className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {brand.brands_name || brand.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                            (brand.status || 'Active') === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {(brand.status || 'Active') === 'Active' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {brand.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(brand)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                            title="Edit Brand"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(brand)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                            title="Delete Brand"
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

        {/* Create / Edit Brand Modal */}
        {isModalOpen ? (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 my-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingBrand ? 'Edit Brand' : 'Create New Brand'}
                    </h3>
                    <p className="text-xs text-slate-400">Add a new brand to your catalog</p>
                  </div>
                </div>
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
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={form.brands_name}
                    onChange={(e) => setForm({ ...form, brands_name: e.target.value })}
                    placeholder="e.g. ArtisanCraft"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand Image
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-purple-200/80">
                      <Upload className="w-4 h-4 text-purple-600" />
                      <span>Upload Brand Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>

                    {form.brands_image ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                            <img src={form.brands_image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Image selected
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, brands_image: '' }))}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline p-1 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
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
                    disabled={submitting}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/30 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? 'Saving Brand...' : 'Save Brand'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Custom Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Delete Brand</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteConfirm.name}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Delete Brand
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
