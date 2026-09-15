import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Award, Plus, Search, Edit3, X, CheckCircle2, XCircle, Upload, Filter } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Pagination from '../components/common/Pagination';
import BrandLogo from '../components/common/BrandLogo';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import {
  fetchBrands,
  fetchBrandById,
  createBrand,
  updateBrand,
  updateBrandStatus,
  fetchActiveBrands
} from '../services/brandApi';

export default function BrandPage() {
  const { token } = useAuthContext();
  const { getImageUrl, noImageUrl } = useAppContext();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [form, setForm] = useState({
    brands_name: '',
    brands_image: '',
    brands_status: 'Active',
    image_file: null,
    image_preview: ''
  });

  const loadBrands = async () => {
    setLoading(true);
    try {
      let res;
      if (activeOnly) {
        res = await fetchActiveBrands(token);
      } else {
        res = await fetchBrands(token);
      }
      
      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res?.brands)) {
        items = res.brands;
      } else if (Array.isArray(res?.data?.brands)) {
        items = res.data.brands;
      } else if (res?.data && typeof res.data === 'object') {
        items = Object.values(res.data).filter((item) => item && typeof item === 'object');
      }

      setBrands(items);
    } catch (err) {
      toast.error(err.message || 'Failed to load brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [activeOnly]);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setForm({
      brands_name: '',
      brands_image: '',
      brands_status: 'Active',
      image_file: null,
      image_preview: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (brand) => {
    setEditingBrand(brand);
    setForm({
      brands_name: brand.brands_name || brand.name || '',
      brands_image: brand.brands_image || brand.image || '',
      brands_status: brand.brands_status || brand.status || 'Active',
      image_file: null,
      image_preview: ''
    });
    setIsModalOpen(true);

    try {
      const single = await fetchBrandById(brand.id, token);
      const item = single?.data || single;
      if (item && (item.brands_name || item.name)) {
        setForm((prev) => ({
          ...prev,
          brands_name: item.brands_name || item.name || '',
          brands_image: item.brands_image || item.image || '',
          brands_status: item.brands_status || item.status || 'Active'
        }));
      }
    } catch (err) {
      console.warn('[BrandPage] Single brand fetch fallback:', err.message);
    }
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
        brands_image: file.name,
        image_file: file,
        image_preview: reader.result,
        image_name: file.name
      }));
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

  const handleToggleStatus = async (brand) => {
    const currentStatus = brand.brands_status || brand.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusTogglingId(brand.id);
    try {
      await updateBrandStatus(brand.id, newStatus, token);
      toast.success(`Brand marked as ${newStatus}`);
      await loadBrands();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  const safeBrands = Array.isArray(brands) ? brands : [];
  const filteredBrands = safeBrands
    .filter((b) => (b.brands_name || b.name || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(a.id || 0) - Number(b.id || 0));

  const numericPageSize = pageSize === 'all' || pageSize === 'All' ? (filteredBrands.length || 1) : Number(pageSize) || 20;
  const paginatedBrands = filteredBrands.slice(
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
              placeholder="Search brands by name..."
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
              <span>{activeOnly ? 'Showing: Active' : 'Filter: All Brands'}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Brand</span>
            </button>
          </div>
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
                  {paginatedBrands.map((brand) => {
                    const status = brand.brands_status || brand.status || 'Active';
                    const isToggling = statusTogglingId === brand.id;

                    return (
                      <tr key={brand.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">{brand.id}</td>
                        <td className="px-6 py-4">
                          <div className="w-28 h-11 rounded-xl bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                            <BrandLogo
                              name={brand.brands_name || brand.name || 'Brand'}
                              src={
                                brand.brands_image || brand.image
                                  ? getImageUrl('Brands', brand.brands_image || brand.image)
                                  : null
                              }
                              className="w-full h-full"
                              imgClassName="w-full h-full object-contain p-1"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {brand.brands_name || brand.name}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(brand)}
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
                              onClick={() => handleOpenEdit(brand)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Edit Brand"
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
          {!loading && filteredBrands.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredBrands.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemName="brands"
              pageSizeOptions={[10, 20, 50, 100, 'All']}
            />
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
                    <p className="text-xs text-slate-400">
                      {editingBrand ? 'Update brand details' : 'Add a new brand to your catalog'}
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
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={form.brands_name}
                    onChange={(e) => setForm({ ...form, brands_name: e.target.value })}
                    placeholder="e.g. Borosil"
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

                    {form.brands_image || form.image_preview || form.brands_name ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-28 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                            <BrandLogo
                              name={form.brands_name || 'Brand'}
                              src={
                                form.image_preview ||
                                (form.brands_image ? getImageUrl('Brands', form.brands_image) : null)
                              }
                              className="w-full h-full"
                              imgClassName="w-full h-full object-contain p-1"
                            />
                          </div>
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 truncate max-w-[160px]">
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {form.brands_image || form.brands_name || 'Brand Logo'}
                          </span>
                        </div>
                        {form.brands_image || form.image_preview ? (
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, brands_image: '', image_file: null, image_preview: '' }))}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline p-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Status Field shown only in Edit Mode */}
                {editingBrand ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.brands_status}
                      onChange={(e) => setForm({ ...form, brands_status: e.target.value })}
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
                    {submitting ? 'Saving Brand...' : editingBrand ? 'Update Brand' : 'Save Brand'}
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
