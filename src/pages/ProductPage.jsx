import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Package, 
  Plus, 
  Minus,
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Barcode,
  Eye,
  Edit2,
  X,
  Store,
  FolderTree,
  Calendar,
  Tag as TagIcon,
  Upload,
  FileSpreadsheet,
  Download,
  FileUp,
  FileText,
  Trash2
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { fetchProducts, fetchProductById, updateProductStatus, importProduct } from '../services/productApi';

const STATUS_CONFIG = {
  'In Stock': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  'Limited Stock': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
  'Out of Stock': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
  'Inactive': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', icon: Clock },
  'Pending': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Clock },
};

const STATUS_OPTIONS = ['Pending', 'In Stock', 'Out of Stock', 'Limited Stock', 'Inactive'];

export default function ProductPage() {
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const { getImageUrl, noImageUrl } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [selectedViewProduct, setSelectedViewProduct] = useState(null);
  const [viewingVariantsProduct, setViewingVariantsProduct] = useState(null);
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  // Import Products state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext)) {
        toast.error('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
        return;
      }
      setImportFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext)) {
        toast.error('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
        return;
      }
      setImportFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select an Excel or CSV file to import');
      return;
    }

    setImporting(true);
    try {
      const res = await importProduct(importFile, token);
      toast.success(res?.message || 'Products imported successfully!');
      setImportFile(null);
      setIsImportModalOpen(false);
      await loadProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to import products. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  // Asynchronously fetch full product details when opening modals so variant attributes and updated fields are guaranteed
  const handleOpenVariantsModal = async (p) => {
    setViewingVariantsProduct(p);
    const pId = p.id || p.product_id;
    if (pId) {
      try {
        const res = await fetchProductById(pId, token);
        const detailed = res?.data || res?.product || res;
        if (detailed) {
          setViewingVariantsProduct(detailed);
          setProducts((prev) =>
            prev.map((item) => ((item.id || item.product_id) === pId ? { ...item, ...detailed } : item))
          );
        }
      } catch (err) {
        console.warn('Could not fetch full variant details:', err);
      }
    }
  };

  const handleOpenViewProductModal = async (p) => {
    setSelectedViewProduct(p);
    const pId = p.id || p.product_id;
    if (pId) {
      try {
        const res = await fetchProductById(pId, token);
        const detailed = res?.data || res?.product || res;
        if (detailed) {
          setSelectedViewProduct(detailed);
          setProducts((prev) =>
            prev.map((item) => ((item.id || item.product_id) === pId ? { ...item, ...detailed } : item))
          );
        }
      } catch (err) {
        console.warn('Could not fetch full product details:', err);
      }
    }
  };

  const handleToggleExpandVariants = async (p) => {
    const pId = p.id || p.product_id;
    const key = String(pId);
    const isCurrentlyExpanded = expandedProductIds.has(key);

    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    if (!isCurrentlyExpanded && pId) {
      try {
        const res = await fetchProductById(pId, token);
        const detailed = res?.data || res?.product || res;
        if (detailed) {
          setProducts((prev) =>
            prev.map((item) => ((item.id || item.product_id) === pId ? { ...item, ...detailed } : item))
          );
        }
      } catch (err) {
        console.warn('Could not fetch fresh variant details on expand:', err);
      }
    }
  };

  // Debounce search input for server query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleExpandVariants = (pId) => {
    const key = String(pId);
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const loadProducts = async (query = debouncedSearch, status = selectedStatus) => {
    setLoading(true);
    try {
      const params = {};
      if (query && query.trim()) {
        params.search = query.trim();
        params.q = query.trim();
      }
      if (status && status !== 'ALL') {
        params.status = status;
        params.product_status = status;
      }

      const res = await fetchProducts(token, params);
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
    loadProducts(debouncedSearch, selectedStatus);
  }, [token, debouncedSearch, selectedStatus]);

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

  const getBrandName = (p) => {
    if (!p) return '—';
    if (typeof p.brand === 'string') return p.brand;
    if (p.brand && typeof p.brand === 'object') {
      return p.brand.brands_name || p.brand.brand_name || p.brand.name || '—';
    }
    if (p.product_brand && typeof p.product_brand === 'object') {
      return p.product_brand.brands_name || p.product_brand.brand_name || p.product_brand.name || '—';
    }
    return p.brands_name || p.brand_name || '—';
  };

  const formatBarcode = (code) => {
    if (!code) return '—';
    const s = String(code).trim();
    if (/^var[-_]/i.test(s) || s === '0' || s === '0.00') return '—';
    return s;
  };

  const getCategoryName = (p) => {
    if (!p) return '—';
    if (Array.isArray(p.categories) && p.categories.length > 0) {
      const names = p.categories
        .map((c) => {
          if (typeof c === 'string') return c;
          if (typeof c === 'object' && c !== null) {
            return (
              c.categories_name ||
              c.category_name ||
              c.name ||
              c.title ||
              c.category?.categories_name ||
              c.category?.category_name ||
              c.category?.name ||
              ''
            );
          }
          return '';
        })
        .filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    if (p.category && typeof p.category === 'object') {
      return p.category.categories_name || p.category.category_name || p.category.name || '—';
    }
    if (p.categories_name) return p.categories_name;
    if (p.category_name) return p.category_name;
    return '—';
  };

  const getVariantInfo = (p) => {
    if (!p) return { hasVariants: false, count: 0, isMultiple: false, label: 'Single' };
    const hasVariantsFlag = Number(p.has_variants) === 1 || p.has_variants === true || p.has_variants === '1';
    const vList = p.variants || p.product_variants || [];
    const count = Array.isArray(vList) ? vList.length : 0;
    const hasVariants = hasVariantsFlag && count > 0;
    return {
      hasVariants,
      count: hasVariants ? count : 0,
      isMultiple: hasVariants && count > 1,
      label: hasVariants ? (count > 1 ? `${count} Variants` : (count === 1 ? '1 Variant' : 'Variants')) : 'Single'
    };
  };

  const getProductPricing = (p) => {
    let mrp = p.product_mrp ?? p.mrp ?? p.price;
    let salePrice = p.product_sale_price ?? p.sale_price ?? p.saleprice ?? p.sales_price;
    let bulkPrice = p.product_bulk_price ?? p.bulk_price ?? p.bulkprice ?? p.product_bulkprice;
    let weight = p.product_weight ?? p.weight;

    const hasVariantsFlag = Number(p.has_variants) === 1 || p.has_variants === true || p.has_variants === '1';
    const vList = p.variants || p.product_variants || [];

    if (hasVariantsFlag && Array.isArray(vList) && vList.length > 0) {
      const validMrps = vList
        .map((v) => Number(v.product_mrp ?? v.mrp ?? v.price ?? 0))
        .filter((n) => n > 0);
      const validSales = vList
        .map((v) => Number(v.product_sale_price ?? v.sale_price ?? v.saleprice ?? v.sales_price ?? v.product_variant_sale_price ?? 0))
        .filter((n) => n > 0);
      const validBulks = vList
        .map((v) => Number(v.product_bulk_price ?? v.bulk_price ?? v.bulkprice ?? v.product_bulkprice ?? v.product_variant_bulk_price ?? 0))
        .filter((n) => n > 0);

      if (validMrps.length > 0) {
        const minMrp = Math.min(...validMrps);
        const maxMrp = Math.max(...validMrps);
        mrp = minMrp === maxMrp ? `${minMrp}` : `${minMrp} - ${maxMrp}`;
      }
      if (validSales.length > 0) {
        const minSale = Math.min(...validSales);
        const maxSale = Math.max(...validSales);
        salePrice = minSale === maxSale ? `${minSale}` : `${minSale} - ${maxSale}`;
      }
      if (validBulks.length > 0) {
        const minBulk = Math.min(...validBulks);
        const maxBulk = Math.max(...validBulks);
        bulkPrice = minBulk === maxBulk ? `${minBulk}` : `${minBulk} - ${maxBulk}`;
      }
      if (!weight || weight === '—' || weight === '0' || weight === '0.00') {
        const firstW = vList.find((v) => v.product_weight || v.weight || v.product_variant_weight);
        if (firstW) weight = firstW.product_weight || firstW.weight || firstW.product_variant_weight;
      }
    }

    const clean = (val) => {
      if (val === undefined || val === null || val === '') return '—';
      const s = String(val).trim();
      if (s === '0' || s === '0.00' || s === '0.0' || s === '—') return '—';
      return s;
    };

    return {
      mrp: clean(mrp),
      salePrice: clean(salePrice),
      bulkPrice: clean(bulkPrice),
      weight: clean(weight) !== '—' ? `${clean(weight)} g` : '—'
    };
  };

  const getVariantDetails = (v) => {
    if (!v) return {};
    const vMrp = v.product_mrp ?? v.mrp ?? v.price ?? '';
    const vSale = v.product_sale_price ?? v.sale_price ?? v.saleprice ?? v.sales_price ?? v.product_variant_sale_price ?? '';
    const vBulk = v.product_bulk_price ?? v.bulk_price ?? v.bulkprice ?? v.product_bulkprice ?? v.product_variant_bulk_price ?? '';
    const vWeight = v.product_weight ?? v.weight ?? v.product_variant_weight ?? '';
    const vLength = v.product_length ?? v.length ?? v.product_variant_length ?? '';
    const vWidth = v.product_width ?? v.width ?? v.product_variant_width ?? '';
    const vHeight = v.product_height ?? v.height ?? v.product_variant_height ?? '';
    const vSku = v.product_sku ?? v.sku ?? v.product_variant_sku ?? '';
    const vBarcode = v.product_barcode ?? v.barcode ?? v.product_variant_barcode ?? '';
    const vStatus = v.product_status ?? v.product_variant_status ?? v.variant_status ?? v.status ?? 'Active';

    const cleanNum = (val) => {
      if (val === undefined || val === null || val === '') return '';
      const s = String(val).trim();
      if (s === '0' || s === '0.00' || s === '0.0' || s === '—') return '';
      return s;
    };

    const cleanDim = (val) => {
      if (val === undefined || val === null || val === '') return '0';
      const s = String(val).trim();
      if (s === '0.00' || s === '0.0') return '0';
      return s;
    };

    const hasDims = (vLength && String(vLength) !== '0' && String(vLength) !== '0.00') ||
                    (vWidth && String(vWidth) !== '0' && String(vWidth) !== '0.00') ||
                    (vHeight && String(vHeight) !== '0' && String(vHeight) !== '0.00');

    return {
      mrp: cleanNum(vMrp) || (vMrp && String(vMrp) !== '0' ? String(vMrp) : '0'),
      salePrice: cleanNum(vSale),
      bulkPrice: cleanNum(vBulk),
      weight: cleanNum(vWeight),
      length: cleanDim(vLength),
      width: cleanDim(vWidth),
      height: cleanDim(vHeight),
      hasDims,
      dimensionsText: hasDims ? `${cleanDim(vLength)} × ${cleanDim(vWidth)} × ${cleanDim(vHeight)} cm` : '—',
      sku: vSku ? String(vSku).trim() : '',
      barcode: formatBarcode(vBarcode),
      status: vStatus,
      isInactive: String(vStatus).toLowerCase() === 'inactive'
    };
  };

  const getVariantAttributeLabel = (v, vIdx = 0) => {
    if (!v) return `Variant #${vIdx + 1}`;
    if (v.combo_label && typeof v.combo_label === 'string' && v.combo_label.trim()) {
      return v.combo_label;
    }
    if (Array.isArray(v.attributes) && v.attributes.length > 0) {
      const parts = v.attributes.map((a) => {
        const name = a.attribute_name || a.name || 'Attribute';
        const val = a.attribute_value || a.value || a.attribute_value_name || '';
        return val ? `${name}: ${val}` : name;
      }).filter(Boolean);
      if (parts.length > 0) return parts.join(' | ');
    }
    if (Array.isArray(v.attribute_values) && v.attribute_values.length > 0) {
      const parts = v.attribute_values.map((av) => {
        const attrName = av.attribute?.attribute_name || av.attribute?.name || av.attribute_name || 'Attribute';
        const val = av.attribute_value || av.value || av.name || String(av);
        return `${attrName}: ${val}`;
      });
      if (parts.length > 0) return parts.join(' | ');
    }
    if (Array.isArray(v.product_variant_attributes) && v.product_variant_attributes.length > 0) {
      const parts = v.product_variant_attributes.map((pva) => {
        const attrName = pva.attribute?.attribute_name || pva.attribute_name || 'Attribute';
        const val = pva.attribute_value?.attribute_value || pva.attribute_value || pva.value || '';
        return val ? `${attrName}: ${val}` : attrName;
      }).filter(Boolean);
      if (parts.length > 0) return parts.join(' | ');
    }
    if (v.attribute_value) {
      if (typeof v.attribute_value === 'object') {
        const name = v.attribute_value.attribute?.attribute_name || v.attribute_name || 'Attribute';
        const val = v.attribute_value.attribute_value || v.attribute_value.value || '';
        return val ? `${name}: ${val}` : name;
      }
      return String(v.attribute_value);
    }
    return `Variant #${vIdx + 1}`;
  };

  const getProductImageUrl = (p) => {
    if (!p) return noImageUrl;
    let raw = null;
    let imageType = 'product';

    if (Array.isArray(p.images) && p.images.length > 0) {
      const first = p.images[0];
      raw = typeof first === 'string' ? first : first.product_images || first.image || first.url || first.product_variant_images || first.image_name;
    }
    if (!raw && p.product_images) {
      raw = Array.isArray(p.product_images) ? p.product_images[0] : p.product_images;
    }
    if (!raw && (p.image || p.product_image || p.thumbnail)) {
      raw = p.image || p.product_image || p.thumbnail;
    }
    if (!raw) {
      const hasVariantsFlag = Number(p.has_variants) === 1 || p.has_variants === true || p.has_variants === '1';
      const vList = p.variants || p.product_variants || [];
      if (hasVariantsFlag && Array.isArray(vList) && vList.length > 0) {
        for (let v of vList) {
          if (Array.isArray(v.images) && v.images.length > 0) {
            const vImg = v.images[0];
            raw = typeof vImg === 'string' ? vImg : vImg.product_variant_images || vImg.product_images || vImg.image || vImg.url;
            if (raw) {
              if (vImg?.product_variant_images) imageType = 'variant';
              break;
            }
          } else if (Array.isArray(v.product_variant_images) && v.product_variant_images.length > 0) {
            const vImg = v.product_variant_images[0];
            raw = typeof vImg === 'string' ? vImg : vImg.product_variant_images || vImg.product_images || vImg.image || vImg.url;
            if (raw) {
              imageType = 'variant';
              break;
            }
          } else if (v.product_variant_images || v.product_images || v.image) {
            raw = v.product_variant_images || v.product_images || v.image;
            if (v.product_variant_images) imageType = 'variant';
            if (raw) break;
          }
        }
      }
    }
    if (!raw || raw === 'null' || raw === 'undefined' || raw === 'none') return noImageUrl;
    if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:') || raw.startsWith('blob:'))) {
      return raw;
    }
    return getImageUrl(imageType, raw);
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((p) => {
    const name = (p.product_name || p.productName || p.name || '').toLowerCase();
    const barcode = String(p.product_barcode || p.barcode || '').toLowerCase();
    const brand = getBrandName(p).toLowerCase();
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
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
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
              type="button"
              onClick={() => {
                setImportFile(null);
                setIsImportModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Import</span>
            </button>

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
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">Brand</th>
                    <th className="px-5 py-3.5">Variants</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredProducts.map((p) => {
                    const pId = p.id || p.product_id;
                    const name = p.product_name || p.productName || p.name || '-';
                    const brandName = getBrandName(p);
                    const variantInfo = getVariantInfo(p);
                    const status = p.product_status || p.status || 'Pending';
                    const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
                    const mainImage = getProductImageUrl(p);
                    const isUpdating = statusUpdatingId === pId;

                    return (
                      <tr key={pId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-400">
                          #{pId}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-2xs flex items-center justify-center">
                              <img
                                src={mainImage}
                                alt={name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = noImageUrl;
                                }}
                              />
                            </div>
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
                        <td className="px-5 py-4 text-slate-700 font-semibold">
                          {brandName}
                        </td>
                        <td className="px-5 py-4">
                          {variantInfo.hasVariants ? (
                            <button
                              type="button"
                              onClick={() => handleOpenVariantsModal(p)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300"
                              title="Click to view all variant details"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              <span>{variantInfo.label}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Single Product</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
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
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenViewProductModal(p)}
                              title="View Details"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer border border-transparent hover:border-purple-200"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/products/edit/${pId}`)}
                              title="Edit Product"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
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
              const brandName = getBrandName(p);
              const variantInfo = getVariantInfo(p);
              const pricing = getProductPricing(p);
              const status = p.product_status || p.status || 'Pending';
              const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];

              const mainImage = getProductImageUrl(p);

              return (
                <div
                  key={pId}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={mainImage}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = noImageUrl;
                        }}
                      />
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate max-w-[120px]">
                          {getCategoryName(p)}
                        </span>
                        {variantInfo.hasVariants ? (
                          <button
                            type="button"
                            onClick={() => handleOpenVariantsModal(p)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1 hover:bg-purple-100 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{variantInfo.label}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Single</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                        {name}
                      </h3>
                      <p className="text-xs font-medium text-slate-400">
                        Brand: <span className="text-slate-700 font-semibold">{brandName}</span>
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-sm font-bold text-slate-900">
                          {pricing.mrp !== '—' ? `₹ ${pricing.mrp}` : '—'}
                        </span>
                        {pricing.salePrice && pricing.salePrice !== '—' && (
                          <span className="text-xs font-semibold text-purple-600">
                            Sale: ₹ {pricing.salePrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 font-bold">#{pId}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenViewProductModal(p)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-white transition-colors cursor-pointer border border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/products/edit/${pId}`)}
                        title="Edit Product"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer border border-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick View Product Modal */}
        {selectedViewProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                    #{selectedViewProduct.id || selectedViewProduct.product_id}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      {selectedViewProduct.product_name || selectedViewProduct.name}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Brand: {getBrandName(selectedViewProduct)} • Barcode: {formatBarcode(selectedViewProduct.product_barcode)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedViewProduct.id || selectedViewProduct.product_id;
                      navigate(`/products/edit/${id}`);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedViewProduct(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 text-xs">
                {/* Product Image & Main Details */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="w-full sm:w-44 h-44 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs flex items-center justify-center">
                    <img
                      src={getProductImageUrl(selectedViewProduct)}
                      alt={selectedViewProduct.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = noImageUrl;
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    {/* Price Grid */}
                    {(() => {
                      const pr = getProductPricing(selectedViewProduct);
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">MRP</span>
                            <span className="text-xs font-bold text-slate-700">₹ {pr.mrp}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-purple-600 font-bold uppercase">Sale Price</span>
                            <span className="text-xs font-bold text-purple-700">{pr.salePrice !== '—' ? `₹ ${pr.salePrice}` : '—'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">Bulk Price</span>
                            <span className="text-xs font-bold text-slate-700">{pr.bulkPrice !== '—' ? `₹ ${pr.bulkPrice}` : '—'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">Weight</span>
                            <span className="text-xs font-bold text-slate-700">{pr.weight}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Short Description */}
                    {selectedViewProduct.product_short_description && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Short Description
                        </span>
                        <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          {selectedViewProduct.product_short_description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Long Description */}
                {selectedViewProduct.product_long_description && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Long Description
                    </span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                      {selectedViewProduct.product_long_description}
                    </p>
                  </div>
                )}

                {/* Variants List if Multi-Variant */}
                {Number(selectedViewProduct.has_variants) === 1 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Product Variants ({(selectedViewProduct.variants || selectedViewProduct.product_variants || []).length})</span>
                    </span>

                    <div className="space-y-2">
                      {(selectedViewProduct.variants || selectedViewProduct.product_variants || []).map((v, vIdx) => {
                        const vImg = (v.images && v.images[0]) || v.product_variant_images || v.image;
                        const vImgUrl = typeof vImg === 'string' ? getImageUrl('variant', vImg) : (vImg?.product_variant_images ? getImageUrl('variant', vImg.product_variant_images) : noImageUrl);
                        const variantAttrLabel = getVariantAttributeLabel(v, vIdx);
                        const vd = getVariantDetails(v);

                        return (
                          <div
                            key={v.id || vIdx}
                            className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-purple-200 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                <img
                                  src={vImgUrl}
                                  alt="Variant"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = noImageUrl;
                                  }}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 block">
                                    {variantAttrLabel}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                      vd.isInactive
                                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    }`}
                                  >
                                    {vd.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                                  {vd.sku && <span>SKU: {vd.sku}</span>}
                                  {vd.barcode !== '—' && <span>• Barcode: {vd.barcode}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-right shrink-0">
                              <div>
                                <span className="block text-[10px] text-slate-400">MRP</span>
                                <span className="font-bold text-slate-700">₹ {vd.mrp}</span>
                              </div>
                              {vd.salePrice && (
                                <div>
                                  <span className="block text-[10px] text-purple-600">Sale</span>
                                  <span className="font-bold text-purple-700">₹ {vd.salePrice}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Variant Details Modal */}
        {viewingVariantsProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shadow-xs">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      {viewingVariantsProduct.product_name || viewingVariantsProduct.name} — All Variants
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Brand: {getBrandName(viewingVariantsProduct)} • Total: {(viewingVariantsProduct.variants || viewingVariantsProduct.product_variants || []).length} Variants
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = viewingVariantsProduct.id || viewingVariantsProduct.product_id;
                      navigate(`/products/edit/${id}`);
                    }}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Product</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingVariantsProduct(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body: All Variant Cards with full details */}
              <div className="p-6 space-y-4">
                {(viewingVariantsProduct.variants || viewingVariantsProduct.product_variants || []).map((v, vIdx) => {
                  const vImg = (v.images && v.images[0]) || v.product_variant_images || v.image;
                  const vImgUrl =
                    typeof vImg === 'string'
                      ? getImageUrl('variant', vImg)
                      : vImg?.product_variant_images
                      ? getImageUrl('variant', vImg.product_variant_images)
                      : noImageUrl;
                  const vAttrLabel = getVariantAttributeLabel(v, vIdx);
                  const vd = getVariantDetails(v);

                  return (
                    <div
                      key={v.id || vIdx}
                      className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 hover:border-purple-200 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs flex items-center justify-center">
                            <img
                              src={vImgUrl}
                              alt="Variant"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = noImageUrl;
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{vAttrLabel}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  vd.isInactive
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                }`}
                              >
                                {vd.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                              {vd.sku && <span>SKU: <strong className="text-slate-600">{vd.sku}</strong></span>}
                              <span>Barcode: <strong className="text-slate-600">{vd.barcode}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">MRP</span>
                            <span className="text-sm font-bold text-slate-800">₹ {vd.mrp}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-purple-600 font-bold uppercase">Sale Price</span>
                            <span className="text-sm font-bold text-purple-700">
                              {vd.salePrice ? `₹ ${vd.salePrice}` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dimensions & Weight Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                        <div>
                          <span className="block text-[10px] text-slate-400">Bulk Price</span>
                          <span className="font-bold text-slate-700">
                            {vd.bulkPrice ? `₹ ${vd.bulkPrice}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Weight</span>
                          <span className="font-semibold text-slate-700">
                            {vd.weight ? `${vd.weight} g` : '—'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-[10px] text-slate-400">Dimensions (L × W × H)</span>
                          <span className="font-mono text-slate-600">
                            {vd.dimensionsText}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* Import Products Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shadow-xs">
                    <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      Import Products
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Upload an Excel or CSV file to batch import products
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!importing) {
                      setIsImportModalOpen(false);
                      setImportFile(null);
                    }
                  }}
                  disabled={importing}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                {/* Sample Template Download Box */}
                <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-xl shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-900">Sample Template</p>
                      <p className="text-[10px] text-purple-600">Download the formatted template for product import</p>
                    </div>
                  </div>
                  <a
                    href="https://memorycreators.in/crmapi/public/assets/import/product.xlsx"
                    target="_blank"
                    rel="noreferrer"
                    download="product.xlsx"
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>

                {/* Drag and Drop Zone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select File <span className="text-rose-500">*</span>
                  </label>

                  {!importFile ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                        isDragging
                          ? 'border-purple-500 bg-purple-50/50 scale-[1.01]'
                          : 'border-slate-300 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/20'
                      }`}
                      onClick={() => document.getElementById('import-file-input')?.click()}
                    >
                      <input
                        id="import-file-input"
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <div className="w-12 h-12 bg-white text-purple-600 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-center mx-auto mb-3">
                        <FileUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 mb-1">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports Excel (.xlsx, .xls) and CSV (.csv) files (Max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {importFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatFileSize(importFile.size)} • Ready for import
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setImportFile(null)}
                        disabled={importing}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-[11px] text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Important instructions:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-amber-700 pl-1">
                    <li>Ensure all required columns match the sample template layout.</li>
                    <li>Imported items will be created and immediately updated in your catalog.</li>
                  </ul>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportFile(null);
                    }}
                    disabled={importing}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!importFile || importing}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Importing Products...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Import Products</span>
                      </>
                    )}
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
