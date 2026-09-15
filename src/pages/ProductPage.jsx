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
  Copy,
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
  Trash2,
  Image as ImageIcon,
  Layers,
  Sparkle
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import AutoMovingImage from '../components/common/AutoMovingImage';
import Pagination from '../components/common/Pagination';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { fetchProducts, fetchProductById, updateProductStatus, importProduct, importProductImages } from '../services/productApi';

const STATUS_CONFIG = {
  'In Stock': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  'Limited Stock': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
  'Out of Stock': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
  'Inactive': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', icon: Clock },
  'Pending': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Clock },
};

const STATUS_OPTIONS = ['Pending', 'In Stock', 'Out of Stock', 'Limited Stock', 'Inactive'];

// Custom Excel Logo Icon
const ExcelIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#107C41" />
    <path d="M6.5 7L10.5 12L6.5 17H8.8L11.5 13.5L14.2 17H16.5L12.5 12L16.5 7H14.2L11.5 10.5L8.8 7H6.5Z" fill="white" />
    <rect x="15" y="4" width="5" height="16" rx="2" fill="white" fillOpacity="0.18" />
    <path d="M15 7.5H18.5M15 10.5H18.5M15 13.5H18.5M15 16.5H18.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// Auto-moving / scrolling text: prefix before '-' is static; text after '-' auto-moves
const AutoScrollProductName = ({ name, maxLength = 26, className = "" }) => {
  if (!name || name === '-') return <span>-</span>;

  // Check if name has a separator '-' or '–' or '—'
  const separatorMatch = name.match(/([-–—])/);
  if (separatorMatch && separatorMatch.index !== undefined) {
    const sepIdx = separatorMatch.index;
    const prefix = name.slice(0, sepIdx).trim() + ' ' + separatorMatch[0] + ' ';
    const suffix = name.slice(sepIdx + 1).trim();

    const isSuffixLong = suffix.length > 8;

    return (
      <div className="flex items-center min-w-0 max-w-full overflow-hidden" title={name}>
        {/* Fixed static text before and including '-' */}
        <span className={`font-bold text-slate-900 shrink-0 whitespace-nowrap ${className}`}>
          {prefix}
        </span>

        {/* Auto-moving text only after '-' */}
        {suffix && (
          isSuffixLong ? (
            <div className="relative overflow-hidden whitespace-nowrap min-w-0 max-w-[160px] sm:max-w-[220px] md:max-w-[280px] group/scroll">
              <div className="inline-flex gap-6 animate-marquee-text group-hover/scroll:[animation-play-state:paused]">
                <span className={`font-medium text-slate-700 shrink-0 ${className}`}>{suffix}</span>
                <span className={`font-medium text-slate-700 shrink-0 ${className}`} aria-hidden="true">{suffix}</span>
              </div>
            </div>
          ) : (
            <span className={`font-medium text-slate-700 truncate ${className}`}>
              {suffix}
            </span>
          )
        )}
      </div>
    );
  }

  // If no '-' separator
  const isLong = name.length > maxLength;
  if (!isLong) {
    return (
      <span className={`font-bold text-slate-900 block truncate ${className}`} title={name}>
        {name}
      </span>
    );
  }

  // If long without '-', keep first two words static and move the rest
  const words = name.split(' ');
  if (words.length > 2) {
    const firstPart = words.slice(0, 2).join(' ') + ' ';
    const restPart = words.slice(2).join(' ');
    return (
      <div className="flex items-center min-w-0 max-w-full overflow-hidden" title={name}>
        <span className={`font-bold text-slate-900 shrink-0 whitespace-nowrap ${className}`}>{firstPart}</span>
        <div className="relative overflow-hidden whitespace-nowrap min-w-0 max-w-[160px] sm:max-w-[220px] group/scroll">
          <div className="inline-flex gap-6 animate-marquee-text group-hover/scroll:[animation-play-state:paused]">
            <span className={`font-medium text-slate-700 shrink-0 ${className}`}>{restPart}</span>
            <span className={`font-medium text-slate-700 shrink-0 ${className}`} aria-hidden="true">{restPart}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden whitespace-nowrap max-w-[220px] sm:max-w-[280px] group/scroll"
      title={name}
    >
      <div className="inline-flex gap-8 animate-marquee-text group-hover/scroll:[animation-play-state:paused]">
        <span className={`font-bold text-slate-900 shrink-0 ${className}`}>{name}</span>
        <span className={`font-bold text-slate-900 shrink-0 ${className}`} aria-hidden="true">{name}</span>
      </div>
    </div>
  );
};

export default function ProductPage() {
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const { getImageUrl, noImageUrl, imageUrls } = useAppContext();

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Import Products via Excel state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Bulk Import Product/Variant Images state
  const [isImportImagesModalOpen, setIsImportImagesModalOpen] = useState(false);
  const [imageImportType, setImageImportType] = useState('product'); // 'product' | 'variant'
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [importingImages, setImportingImages] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);

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

  // Image Import Handlers
  const handleImageFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImageFiles((prev) => [...prev, ...files]);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsImageDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setSelectedImageFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveSelectedImage = (idxToRemove) => {
    setSelectedImageFiles((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleImportImagesSubmit = async (e) => {
    e.preventDefault();
    if (selectedImageFiles.length === 0) {
      toast.error('Please select at least one image file to upload.');
      return;
    }

    setImportingImages(true);
    try {
      const res = await importProductImages(imageImportType, selectedImageFiles, token);
      toast.success(
        res?.message ||
          `${selectedImageFiles.length} ${imageImportType} images imported successfully!`
      );
      setSelectedImageFiles([]);
      setIsImportImagesModalOpen(false);
      await loadProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to import product images.');
    } finally {
      setImportingImages(false);
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
      // Ensure backend returns complete catalog of 700-800+ products
      params.per_page = 2000;

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
    setCurrentPage(1);
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

  // Always sorted First to Last (ID Ascending: 1, 2, 3... 800)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const idA = Number(a.id || a.product_id || 0);
    const idB = Number(b.id || b.product_id || 0);
    return idA - idB;
  });

  const numericPageSize = pageSize === 'all' || pageSize === 'All' ? (sortedProducts.length || 1) : Number(pageSize) || 20;
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * numericPageSize,
    (currentPage - 1) * numericPageSize + numericPageSize
  );

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Control Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          {/* Top Row: Search Input + Status Filter + Table/Grid View */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by name, barcode, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="ALL">All Statuses</option>
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Item Summary + Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              Total Products: <span className="font-bold text-slate-800">{sortedProducts.length}</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap justify-end">
              <button
                type="button"
                onClick={() => {
                  setImportFile(null);
                  setIsImportModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] group"
                title="Import products from Excel (.xlsx, .xls) or CSV"
              >
                <ExcelIcon className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                <span>Import</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedImageFiles([]);
                  setIsImportImagesModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] group"
                title="Bulk upload Product & Variant images"
              >
                <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0 text-indigo-600" />
                <span>Import Images</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/products/add')}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>
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
                  {paginatedProducts.map((p) => {
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
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-2xs flex items-center justify-center relative">
                              <AutoMovingImage
                                product={p}
                                alt={name}
                                className="w-full h-full object-cover"
                                fallbackSrc={noImageUrl}
                                interval={2800}
                              />
                            </div>
                            <div className="min-w-0 max-w-[280px]">
                              <AutoScrollProductName name={name} maxLength={24} />
                              {p.product_short_description && p.product_short_description.trim() !== name.trim() && (
                                <p className="text-[10px] text-slate-400 font-normal truncate max-w-[260px]">
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
                              onClick={() => navigate(`/products/duplicate/${pId}`)}
                              title="Duplicate Product (Clone to New)"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                            >
                              <Copy className="w-4 h-4" />
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
            <Pagination
              currentPage={currentPage}
              totalItems={sortedProducts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemName="products"
              pageSizeOptions={[10, 20, 50, 100, 200, 'All']}
            />
          </div>
        ) : (
          /* Grid View */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((p) => {
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
                        <AutoMovingImage
                          product={p}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          showDots={true}
                          showCounter={true}
                          fallbackSrc={noImageUrl}
                          interval={2500}
                        />
                        <span
                          className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs z-10 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
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
                        <div className="overflow-hidden">
                          <AutoScrollProductName name={name} maxLength={22} className="text-sm" />
                        </div>
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
                          onClick={() => navigate(`/products/duplicate/${pId}`)}
                          title="Duplicate Product (Clone to New)"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white transition-colors cursor-pointer border border-slate-200"
                        >
                          <Copy className="w-3.5 h-3.5" />
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

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalItems={sortedProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemName="products"
                pageSizeOptions={[12, 24, 48, 96, 200, 'All']}
              />
            </div>
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
                      navigate(`/products/duplicate/${id}`);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Duplicate / Clone Product"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>
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
                  <div className="w-full sm:w-44 h-44 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs flex items-center justify-center relative">
                    <AutoMovingImage
                      product={selectedViewProduct}
                      alt={selectedViewProduct.product_name}
                      className="w-full h-full object-cover"
                      showDots={true}
                      showCounter={true}
                      fallbackSrc={noImageUrl}
                      interval={2200}
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
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                                <AutoMovingImage
                                  images={v.images || v.product_variant_images || v.image}
                                  alt="Variant"
                                  className="w-full h-full object-cover"
                                  fallbackSrc={noImageUrl}
                                  interval={2400}
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
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                            <AutoMovingImage
                              images={v.images || v.product_variant_images || v.image}
                              alt="Variant"
                              className="w-full h-full object-cover"
                              fallbackSrc={noImageUrl}
                              interval={2400}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {vAttrLabel}
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
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                              {vd.sku && <span>SKU: {vd.sku}</span>}
                              {vd.barcode && vd.barcode !== '—' && <span>• Barcode: {vd.barcode}</span>}
                              {vd.weight && <span>• Weight: {vd.weight}g</span>}
                              {vd.hasDims && <span>• Dims: {vd.dimensionsText}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Pricing Overview */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase">MRP</span>
                            <span className="text-xs font-bold text-slate-800">₹ {vd.mrp}</span>
                          </div>
                          {vd.salePrice && (
                            <div className="px-3 py-1 bg-purple-50 border border-purple-200/80 rounded-xl text-center">
                              <span className="block text-[9px] font-bold text-purple-600 uppercase">Sale Price</span>
                              <span className="text-xs font-bold text-purple-700">₹ {vd.salePrice}</span>
                            </div>
                          )}
                          {vd.bulkPrice && (
                            <div className="px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase">Bulk Price</span>
                              <span className="text-xs font-bold text-slate-800">₹ {vd.bulkPrice}</span>
                            </div>
                          )}
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
              <div className="px-6 py-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs">
                    <ExcelIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      Import Products via Excel
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Upload an Excel (.xlsx, .xls) or CSV file to batch import products
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
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                      <ExcelIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Sample Excel Template</p>
                      <p className="text-[10px] text-emerald-700">Download formatted Excel sheet for product import</p>
                    </div>
                  </div>
                  <a
                    href="https://memorycreators.in/crmapi/public/assets/import/product.xlsx"
                    target="_blank"
                    rel="noreferrer"
                    download="product.xlsx"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
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

        {/* Bulk Import Product / Variant Images Modal */}
        {isImportImagesModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-xs">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      Import Product & Variant Images
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Bulk upload media images to the server media repository
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!importingImages) {
                      setIsImportImagesModalOpen(false);
                      setSelectedImageFiles([]);
                    }
                  }}
                  disabled={importingImages}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleImportImagesSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Image Type Selector: product vs variant */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Destination Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setImageImportType('product')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        imageImportType === 'product'
                          ? 'bg-purple-50/80 border-purple-500 text-purple-950 shadow-xs ring-2 ring-purple-500/20'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          imageImportType === 'product'
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {imageImportType === 'product' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Product Images</span>
                        <span className="text-[10px] text-slate-500">Main catalog products</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageImportType('variant')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        imageImportType === 'variant'
                          ? 'bg-purple-50/80 border-purple-500 text-purple-950 shadow-xs ring-2 ring-purple-500/20'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          imageImportType === 'variant'
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {imageImportType === 'variant' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Variant Images</span>
                        <span className="text-[10px] text-slate-500">Specific color / size variants</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Multiple Images Upload & Drag/Drop Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Select Images</span>
                      <span className="text-rose-500">*</span>
                      {selectedImageFiles.length > 0 && (
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          {selectedImageFiles.length} file{selectedImageFiles.length > 1 ? 's' : ''} selected
                        </span>
                      )}
                    </label>
                    {selectedImageFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedImageFiles([])}
                        className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsImageDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsImageDragging(false);
                    }}
                    onDrop={handleImageDrop}
                    onClick={() => document.getElementById('bulk-image-import-input')?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      isImageDragging
                        ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                    }`}
                  >
                    <input
                      id="bulk-image-import-input"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileSelect}
                    />
                    <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl border border-indigo-100 shadow-xs flex items-center justify-center mx-auto mb-3">
                      <FileUp className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 mb-1">
                      Click to choose images or drag & drop here
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WEBP, JPEG, GIF (Select multiple files)
                    </p>
                  </div>
                </div>

                {/* Selected Files Thumbnails Preview Grid */}
                {selectedImageFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Files to be uploaded ({selectedImageFiles.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                      {selectedImageFiles.map((file, idx) => {
                        const previewUrl = URL.createObjectURL(file);
                        return (
                          <div
                            key={`${file.name}_${idx}`}
                            className="relative group bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col items-center"
                          >
                            <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-100 mb-1 flex items-center justify-center">
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center block" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {formatFileSize(file.size)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSelectedImage(idx);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Information Callout */}
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Upload Information</span>
                  </p>
                  <p className="text-[10px] text-indigo-700 leading-relaxed pl-5">
                    Images will be uploaded to the server directory corresponding to <strong>{imageImportType === 'product' ? 'Product Images' : 'Variant Images'}</strong>. Their original filenames will match images defined in bulk import Excel sheets.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportImagesModalOpen(false);
                      setSelectedImageFiles([]);
                    }}
                    disabled={importingImages}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedImageFiles.length === 0 || importingImages}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importingImages ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading {selectedImageFiles.length} Images...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload {selectedImageFiles.length > 0 ? `${selectedImageFiles.length} Images` : 'Images'}</span>
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
