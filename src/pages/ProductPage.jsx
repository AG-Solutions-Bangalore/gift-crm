import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, Plus, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { fetchProducts, deleteProduct } from '../services/productApi';

export default function ProductPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts();
      setProducts(res?.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      await loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    const name = p.product_name || p.productName || '';
    const brand = p.brand || '';
    return name.toLowerCase().includes(search.toLowerCase()) ||
           brand.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Grid
              </button>
            </div>

            <button
              onClick={() => navigate('/products/add')}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Products Table Card */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs text-center text-xs font-semibold text-slate-400">
            Loading products catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No Products Found</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Product Name</th>
                    <th className="px-6 py-3.5">Brand</th>
                    <th className="px-6 py-3.5">Regular Price</th>
                    <th className="px-6 py-3.5">Sale Price</th>
                    <th className="px-6 py-3.5">Bulk Price</th>
                    <th className="px-6 py-3.5">Weight</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredProducts.map((p) => {
                    const name = p.product_name || p.productName;
                    const salePrice = p.sale_price || p.salePrice;
                    const bulkPrice = p.bulk_price || p.bulkPrice;
                    return (
                      <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">{p.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                          <img src={p.images?.[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0" />
                          <div>
                            <span className="line-clamp-1">{name}</span>
                            <p className="text-[10px] font-mono text-purple-600 font-normal">{p.slug}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">{p.brand || '—'}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">₹ {p.price}</td>
                        <td className="px-6 py-4 font-bold text-purple-600">₹ {salePrice || p.price}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">{bulkPrice ? `₹ ${bulkPrice}` : '—'}</td>
                        <td className="px-6 py-4 text-slate-600">{p.weight || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                            p.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {p.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              const name = p.product_name || p.productName;
              const salePrice = p.sale_price || p.salePrice;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      <img
                        src={p.images?.[0]}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-800 shadow-sm">
                        {p.status}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                        {name}
                      </h3>
                      <p className="text-xs font-medium text-slate-400">
                        Brand: <span className="text-slate-700 font-semibold">{p.brand}</span>
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-purple-700">₹ {salePrice || p.price}</span>
                      {salePrice && salePrice !== p.price ? (
                        <span className="text-xs text-slate-400 line-through ml-2">₹ {p.price}</span>
                      ) : null}
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
