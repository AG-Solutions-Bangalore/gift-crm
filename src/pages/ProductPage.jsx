import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Package, 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Barcode
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import { fetchProducts, updateProductStatus } from '../services/productApi';

const STATUS_CONFIG = {
  'In Stock': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  'Limited Stock': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
  'Out of Stock': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
  'Pending': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Clock },
  'Inactive': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', icon: XCircle },
};

const STATUS_OPTIONS = ['Pending', 'In Stock', 'Out of Stock', 'Limited Stock', 'Inactive'];

export default function ProductPage() {
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts(token);
      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res?.products)) {
        items = res.products;
      } else if (res?.data && typeof res.data === 'object') {
        items = Object.values(res.data).filter((item) => item && typeof item === 'object');
      }
      setProducts(items);
    } catch (err) {
      toast.error(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  const handleStatusChange = async (productId, newStatus) => {
    setStatusUpdatingId(productId);
    try {
      await updateProductStatus(productId, newStatus, token);
      toast.success(`Product status updated to ${newStatus}`);
      await loadProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((p) => {
    const name = (p.product_name || p.productName || p.name || '').toLowerCase();
    const barcode = String(p.product_barcode || p.barcode || '').toLowerCase();
    const brand = (p.brand?.brand_name || p.brand || p.product_brand?.brand_name || '').toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = name.includes(q) || barcode.includes(q) || brand.includes(q);

    if (selectedStatus === 'ALL') return matchesSearch;
    const currentStatus = p.product_status || p.status || 'Pending';
    return matchesSearch && currentStatus.toLowerCase() === selectedStatus.toLowerCase();
  });

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products by name, barcode, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="ALL">All Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Grid
              </button>
            </div>

            <button
              onClick={() => navigate('/products/add')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Products Display Card */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-xs text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
            <span>Loading products catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-xs text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No Products Found</p>
            <p className="text-xs text-slate-400">
              Click 'Add New Product' to create your first product.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-6 py-3.5">Barcode</th>
                    <th className="px-6 py-3.5">Brand</th>
                    <th className="px-6 py-3.5">MRP</th>
                    <th className="px-6 py-3.5">Sale Price</th>
                    <th className="px-6 py-3.5">Bulk Price</th>
                    <th className="px-6 py-3.5">Weight</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredProducts.map((p) => {
                    const pId = p.id || p.product_id;
                    const name = p.product_name || p.productName || p.name || '-';
                    const barcode = p.product_barcode || p.barcode || '—';
                    const brandName = p.brand?.brand_name || p.brand || p.product_brand?.brand_name || '—';
                    const mrp = p.product_mrp ?? p.price ?? '—';
                    const salePrice = p.product_sale_price ?? p.sale_price ?? mrp;
                    const bulkPrice = p.product_bulk_price ?? p.bulk_price ?? '—';
                    const weight = p.product_weight ?? p.weight ?? '—';
                    const hasVariants = Number(p.has_variants) === 0;
                    const status = p.product_status || p.status || 'Pending';
                    const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
                    const StatusIcon = statusCfg.icon;

                    const mainImage =
                      Array.isArray(p.images) && p.images[0]
                        ? typeof p.images[0] === 'string'
                          ? p.images[0]
                          : p.images[0].product_images || p.images[0].url
                        : null;

                    const isUpdating = statusUpdatingId === pId;

                    return (
                      <tr key={pId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">
                          #{pId}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={name}
                                className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/80 shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold line-clamp-1">{name}</span>
                              {p.product_short_description && (
                                <p className="text-[10px] text-slate-400 font-normal line-clamp-1">
                                  {p.product_short_description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                          {barcode}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">
                          {brandName}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">
                          {mrp !== '—' ? `₹ ${mrp}` : '—'}
                        </td>
                        <td className="px-6 py-4 font-bold text-purple-600">
                          {salePrice !== '—' ? `₹ ${salePrice}` : '—'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">
                          {bulkPrice !== '—' ? `₹ ${bulkPrice}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {weight}
                        </td>
                        <td className="px-6 py-4">
                          {hasVariants ? (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200 inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Variants</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Single</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative inline-block">
                            <select
                              value={status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(pId, e.target.value)}
                              className={`pl-2.5 pr-7 py-1 rounded-full text-[10px] font-bold border appearance-none cursor-pointer focus:outline-none transition-all ${
                                statusCfg.bg
                              } ${statusCfg.text} ${statusCfg.border} ${
                                isUpdating ? 'opacity-50 cursor-wait' : ''
                              }`}
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const pId = p.id || p.product_id;
              const name = p.product_name || p.productName || p.name || '-';
              const brandName = p.brand?.brand_name || p.brand || p.product_brand?.brand_name || '—';
              const mrp = p.product_mrp ?? p.price;
              const salePrice = p.product_sale_price ?? p.sale_price ?? mrp;
              const status = p.product_status || p.status || 'Pending';
              const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];

              const mainImage =
                Array.isArray(p.images) && p.images[0]
                  ? typeof p.images[0] === 'string'
                    ? p.images[0]
                    : p.images[0].product_images || p.images[0].url
                  : null;

              return (
                <div
                  key={pId}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-slate-300" />
                      )}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                        {name}
                      </h3>
                      <p className="text-xs font-medium text-slate-400">
                        Brand: <span className="text-slate-700 font-semibold">{brandName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-purple-700">
                        ₹ {salePrice || '—'}
                      </span>
                      {mrp && mrp !== salePrice && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          ₹ {mrp}
                        </span>
                      )}
                    </div>

                    <div className="relative inline-block">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(pId, e.target.value)}
                        className="text-[10px] font-bold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
