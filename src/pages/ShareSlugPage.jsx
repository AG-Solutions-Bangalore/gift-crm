import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Share2,
  Plus,
  Search,
  Edit3,
  X,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Building2,
  Phone,
  Package,
  Check,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import { fetchProducts } from '../services/productApi';
import {
  fetchShareSlugs,
  fetchShareSlugById,
  createShareSlug,
  updateShareSlug,
  updateShareSlugStatus
} from '../services/shareSlugApi';

export default function ShareSlugPage() {
  const { token } = useAuthContext();

  const [shareSlugs, setShareSlugs] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    company_name: '',
    company_mobile: '',
    share_slugs: '',
    product_ids: [],
    share_slugs_status: 'Active',
    slugManuallyEdited: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [slugsRes, prodsRes] = await Promise.allSettled([
        fetchShareSlugs(token),
        fetchProducts(token)
      ]);

      // Extract slugs
      let slugItems = [];
      if (slugsRes.status === 'fulfilled') {
        const res = slugsRes.value;
        if (Array.isArray(res)) slugItems = res;
        else if (Array.isArray(res?.data)) slugItems = res.data;
        else if (Array.isArray(res?.data?.data)) slugItems = res.data.data;
        else if (Array.isArray(res?.share_slugs)) slugItems = res.share_slugs;
        else if (res?.data && typeof res.data === 'object') {
          slugItems = Object.values(res.data).filter((item) => item && typeof item === 'object');
        }
      }

      // Extract products for the multi-select
      let prodItems = [];
      if (prodsRes.status === 'fulfilled') {
        const res = prodsRes.value;
        if (Array.isArray(res)) prodItems = res;
        else if (Array.isArray(res?.data)) prodItems = res.data;
        else if (Array.isArray(res?.data?.data)) prodItems = res.data.data;
        else if (Array.isArray(res?.products)) prodItems = res.products;
      }

      setShareSlugs(slugItems);
      setAllProducts(prodItems);
    } catch (err) {
      toast.error(err.message || 'Failed to load shareable catalog links');
      setShareSlugs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setProductSearch('');
    setForm({
      company_name: '',
      company_mobile: '',
      share_slugs: '',
      product_ids: [],
      share_slugs_status: 'Active',
      slugManuallyEdited: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (item) => {
    setEditingItem(item);
    setProductSearch('');

    let parsedProductIds = [];
    if (Array.isArray(item.product_ids)) {
      parsedProductIds = item.product_ids.map(Number).filter(Boolean);
    } else if (typeof item.product_ids === 'string') {
      parsedProductIds = item.product_ids
        .split(',')
        .map((id) => Number(id.trim()))
        .filter(Boolean);
    }

    setForm({
      company_name: item.company_name || '',
      company_mobile: item.company_mobile || '',
      share_slugs: item.share_slugs || item.slug || '',
      product_ids: parsedProductIds,
      share_slugs_status: item.share_slugs_status || item.status || 'Active',
      slugManuallyEdited: true
    });
    setIsModalOpen(true);

    const sId = item.id || item.share_slug_id;
    if (sId) {
      try {
        const single = await fetchShareSlugById(sId, token);
        const singleData = single?.data || single;
        if (singleData) {
          let sProductIds = [];
          if (Array.isArray(singleData.product_ids)) {
            sProductIds = singleData.product_ids.map(Number).filter(Boolean);
          } else if (typeof singleData.product_ids === 'string') {
            sProductIds = singleData.product_ids
              .split(',')
              .map((id) => Number(id.trim()))
              .filter(Boolean);
          }

          setForm((prev) => ({
            ...prev,
            company_name: singleData.company_name || prev.company_name,
            company_mobile: singleData.company_mobile || prev.company_mobile,
            share_slugs: singleData.share_slugs || singleData.slug || prev.share_slugs,
            product_ids: sProductIds.length > 0 ? sProductIds : prev.product_ids,
            share_slugs_status: singleData.share_slugs_status || prev.share_slugs_status
          }));
        }
      } catch (err) {
        console.warn('Single share slug fetch fallback:', err.message);
      }
    }
  };

  const handleCompanyNameChange = (val) => {
    setForm((prev) => {
      const updated = { ...prev, company_name: val };
      if (!prev.slugManuallyEdited) {
        updated.share_slugs = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleToggleProduct = (productId) => {
    const numId = Number(productId);
    setForm((prev) => {
      const currentList = Array.isArray(prev.product_ids) ? prev.product_ids : [];
      const exists = currentList.includes(numId);
      const updated = exists
        ? currentList.filter((id) => id !== numId)
        : [...currentList, numId];
      return { ...prev, product_ids: updated };
    });
  };

  const handleSelectAllProducts = () => {
    setForm((prev) => ({
      ...prev,
      product_ids: allProducts.map((p) => Number(p.id || p.product_id)).filter(Boolean)
    }));
  };

  const handleClearAllProducts = () => {
    setForm((prev) => ({ ...prev, product_ids: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim()) {
      toast.error('Company Name is required');
      return;
    }
    if (!form.share_slugs.trim()) {
      toast.error('Share Slug is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const sId = editingItem.id || editingItem.share_slug_id;
        await updateShareSlug(sId, form, token);
        toast.success('Shareable catalog link updated successfully');
      } else {
        const res = await createShareSlug(form, token);
        toast.success(res?.message || 'Shareable catalog link created successfully');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const sId = item.id || item.share_slug_id;
    const currentStatus = item.share_slugs_status || item.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusTogglingId(sId);

    try {
      await updateShareSlugStatus(sId, newStatus, token);
      toast.success(`Share link marked as ${newStatus}`);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  const handleCopyLink = (slug) => {
    const fullUrl = `https://memorycreators.in/share/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Catalog link copied to clipboard!');
  };

  const handleWhatsAppShare = (item) => {
    const slug = item.share_slugs || item.slug || '';
    const name = item.company_name || 'Valued Client';
    const mobile = (item.company_mobile || '').replace(/[^0-9]/g, '');
    const fullUrl = `https://memorycreators.in/share/${slug}`;
    const text = encodeURIComponent(
      `Hello ${name},\n\nPlease find your curated gift catalog presentation here:\n${fullUrl}\n\nFeel free to explore and let us know your selections!`
    );

    const waUrl = mobile ? `https://wa.me/${mobile}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank');
  };

  const safeSlugs = Array.isArray(shareSlugs) ? shareSlugs : [];
  const filteredSlugs = safeSlugs.filter((s) => {
    const cName = (s.company_name || '').toLowerCase();
    const slug = (s.share_slugs || s.slug || '').toLowerCase();
    const mobile = (s.company_mobile || '').toLowerCase();
    const q = search.toLowerCase();
    return cName.includes(q) || slug.includes(q) || mobile.includes(q);
  });

  const filteredProductsList = allProducts.filter((p) => {
    const name = (p.product_name || p.productName || '').toLowerCase();
    const brand = (p.brand?.brand_name || p.brand || '').toLowerCase();
    const q = productSearch.toLowerCase();
    return name.includes(q) || brand.includes(q);
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
              placeholder="Search by company name, slug, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Shareable Link</span>
            </button>
          </div>
        </div>

        {/* Share Slugs Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              <span>Loading shareable catalog links...</span>
            </div>
          ) : filteredSlugs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Share2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Shareable Links Found</p>
              <p className="text-xs text-slate-400">
                Create custom curated catalog links for corporate clients and WhatsApp sharing.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Company & Contact</th>
                    <th className="px-6 py-3.5">Catalog Link (Share Slug)</th>
                    <th className="px-6 py-3.5">Products</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredSlugs.map((slugItem) => {
                    const sId = slugItem.id || slugItem.share_slug_id;
                    const cName = slugItem.company_name || 'Client';
                    const cMobile = slugItem.company_mobile || '—';
                    const slug = slugItem.share_slugs || slugItem.slug || '-';
                    const status = slugItem.share_slugs_status || slugItem.status || 'Active';
                    const isToggling = statusTogglingId === sId;

                    let productCount = 0;
                    if (Array.isArray(slugItem.product_ids)) {
                      productCount = slugItem.product_ids.length;
                    } else if (typeof slugItem.product_ids === 'string') {
                      productCount = slugItem.product_ids
                        .split(',')
                        .filter(Boolean).length;
                    }

                    return (
                      <tr key={sId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">
                          #{sId}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold">{cName}</span>
                              {cMobile !== '—' && (
                                <p className="text-[11px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />
                                  <span>{cMobile}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 max-w-xs truncate">
                              /{slug}
                            </span>
                            <button
                              onClick={() => handleCopyLink(slug)}
                              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Copy Full Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleWhatsAppShare(slugItem)}
                              className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Share via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1.5">
                            <Package className="w-3 h-3 text-slate-500" />
                            <span>{productCount} Products</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(slugItem)}
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
                              onClick={() => handleOpenEdit(slugItem)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Edit Share Link"
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

        {/* Create / Edit Share Slug Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Edit Shareable Catalog Link' : 'Create Shareable Catalog Link'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company Name (company_name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={(e) => handleCompanyNameChange(e.target.value)}
                      placeholder="e.g. Infosys, Wipro, Acme Corp"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Mobile (company_mobile)
                    </label>
                    <input
                      type="text"
                      value={form.company_mobile}
                      onChange={(e) => setForm({ ...form, company_mobile: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Share Slug URL (share_slugs) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                      /share/
                    </span>
                    <input
                      type="text"
                      value={form.share_slugs}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          share_slugs: e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, '-'),
                          slugManuallyEdited: true
                        })
                      }
                      placeholder="infosys-corporate-gifts"
                      required
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-mono text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Product Multi-Picker */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-purple-600" />
                      <span>Select Products for this Catalog ({form.product_ids.length})</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllProducts}
                        className="text-[11px] text-purple-600 hover:underline font-bold"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAllProducts}
                        className="text-[11px] text-slate-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Search inside products list */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products to add..."
                      className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar">
                    {filteredProductsList.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">No products found</p>
                    ) : (
                      filteredProductsList.map((p) => {
                        const pId = Number(p.id || p.product_id);
                        const isSelected = form.product_ids.includes(pId);
                        const name = p.product_name || p.productName || p.name;
                        const price = p.product_sale_price ?? p.sale_price ?? p.product_mrp ?? p.price;

                        return (
                          <label
                            key={pId}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-purple-100/80 text-purple-900 font-bold border border-purple-200'
                                : 'hover:bg-white text-slate-700 bg-white/50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleProduct(pId)}
                                className="w-3.5 h-3.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                              />
                              <span className="line-clamp-1">{name}</span>
                            </div>
                            {price && <span className="text-[11px] text-purple-700 font-bold">₹{price}</span>}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {editingItem && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Status (share_slugs_status)
                    </label>
                    <select
                      value={form.share_slugs_status}
                      onChange={(e) => setForm({ ...form, share_slugs_status: e.target.value })}
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
                    <span>{editingItem ? 'Save Changes' : 'Create Share Link'}</span>
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
