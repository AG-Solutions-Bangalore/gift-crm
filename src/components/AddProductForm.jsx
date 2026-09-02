import React, { useEffect, useState, useRef } from 'react';
import { 
  ShoppingBag, 
  UploadCloud, 
  CheckCircle2, 
  Plus, 
  X, 
  Layers, 
  Trash2, 
  Tag as TagIcon, 
  Calendar, 
  Store, 
  Award, 
  SlidersHorizontal,
  DollarSign,
  Barcode,
  Sparkles,
  ChevronDown,
  Image as ImageIcon,
  Check,
  Search,
  Box,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { fetchActiveBrands } from '../services/brandApi';
import { fetchActiveCategories } from '../services/categoryApi';
import { fetchActiveVendors } from '../services/vendorApi';
import { fetchActiveOccasions } from '../services/occasionApi';
import { fetchActiveTags } from '../services/tagApi';
import { fetchActiveAttributes } from '../services/attributeApi';

export default function AddProductForm({ formData, setFormData, onReset, onSave, isSaving }) {
  const { token } = useAuthContext();
  const fileInputRef = useRef(null);

  // Dynamic Options from live backend API
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [tags, setTags] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Search filters inside tag pickers
  const [categorySearch, setCategorySearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [occasionSearch, setOccasionSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  useEffect(() => {
    const loadCatalogOptions = async () => {
      setLoadingOptions(true);
      try {
        const [brandsRes, catRes, venRes, occRes, tagRes, attrRes] = await Promise.allSettled([
          fetchActiveBrands(token),
          fetchActiveCategories(token),
          fetchActiveVendors(token),
          fetchActiveOccasions(token),
          fetchActiveTags(token),
          fetchActiveAttributes(token),
        ]);

        const extractItems = (result) => {
          if (result.status !== 'fulfilled') return [];
          const res = result.value;
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.data?.data)) return res.data.data;
          if (Array.isArray(res?.brands)) return res.brands;
          if (Array.isArray(res?.categories)) return res.categories;
          if (Array.isArray(res?.vendors)) return res.vendors;
          if (Array.isArray(res?.occasions)) return res.occasions;
          if (Array.isArray(res?.tags)) return res.tags;
          if (Array.isArray(res?.attributes)) return res.attributes;
          return [];
        };

        setBrands(extractItems(brandsRes));
        setCategories(extractItems(catRes));
        setVendors(extractItems(venRes));
        setOccasions(extractItems(occRes));
        setTags(extractItems(tagRes));
        setAttributes(extractItems(attrRes));
      } catch (err) {
        console.warn('Error loading catalog options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadCatalogOptions();
  }, [token]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleId = (arrayField, id) => {
    const numId = Number(id);
    setFormData((prev) => {
      const currentList = Array.isArray(prev[arrayField]) ? prev[arrayField] : [];
      const exists = currentList.includes(numId);
      const updated = exists ? currentList.filter((item) => item !== numId) : [...currentList, numId];
      return { ...prev, [arrayField]: updated };
    });
  };

  // Main Images (Single Mode)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => {
          const currentImages = Array.isArray(prev.images) ? prev.images : [];
          return {
            ...prev,
            images: [
              ...currentImages,
              {
                product_images: reader.result,
                product_images_sort_order: currentImages.length + 1,
                preview: reader.result,
                name: file.name
              }
            ]
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Variant Functions
  const handleAddVariant = () => {
    setFormData((prev) => {
      const currentVariants = Array.isArray(prev.variants) ? prev.variants : [];
      return {
        ...prev,
        variants: [
          ...currentVariants,
          {
            product_barcode: '',
            product_mrp: '',
            product_sale_price: '',
            product_bulk_price: '',
            product_weight: '',
            product_length: '',
            product_width: '',
            product_height: '',
            attribute_value_ids: [],
            images: []
          }
        ]
      };
    });
  };

  const handleUpdateVariant = (index, field, value) => {
    setFormData((prev) => {
      const currentVariants = [...(prev.variants || [])];
      if (currentVariants[index]) {
        currentVariants[index] = { ...currentVariants[index], [field]: value };
      }
      return { ...prev, variants: currentVariants };
    });
  };

  const handleToggleVariantAttribute = (variantIndex, attrValueId) => {
    const numId = Number(attrValueId);
    setFormData((prev) => {
      const currentVariants = [...(prev.variants || [])];
      const target = currentVariants[variantIndex];
      if (!target) return prev;

      const currentIds = Array.isArray(target.attribute_value_ids) ? target.attribute_value_ids : [];
      const exists = currentIds.includes(numId);
      const updatedIds = exists ? currentIds.filter((id) => id !== numId) : [...currentIds, numId];

      currentVariants[variantIndex] = { ...target, attribute_value_ids: updatedIds };
      return { ...prev, variants: currentVariants };
    });
  };

  const handleRemoveVariant = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleVariantImageUpload = (variantIndex, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => {
          const currentVariants = [...(prev.variants || [])];
          const target = currentVariants[variantIndex];
          if (!target) return prev;

          const currentImages = Array.isArray(target.images) ? target.images : [];
          target.images = [
            ...currentImages,
            {
              product_variant_images: reader.result,
              product_variant_images_sort_order: currentImages.length + 1,
              preview: reader.result,
              name: file.name
            }
          ];
          currentVariants[variantIndex] = { ...target };
          return { ...prev, variants: currentVariants };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveVariantImage = (variantIndex, imageIndex) => {
    setFormData((prev) => {
      const currentVariants = [...(prev.variants || [])];
      const target = currentVariants[variantIndex];
      if (!target) return prev;

      target.images = (target.images || []).filter((_, idx) => idx !== imageIndex);
      currentVariants[variantIndex] = { ...target };
      return { ...prev, variants: currentVariants };
    });
  };

  // has_variants === 1 means Single Product; has_variants === 0 means Variants Mode
  const isSingleProductMode = Number(formData.has_variants) === 1;
  const isFormValid = Boolean(formData.product_name && formData.product_name.trim());

  return (
    <div className="space-y-6 select-none pb-12">
      {/* 1. BASIC INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">1. Product Information</h2>
            <p className="text-[11px] text-slate-500 font-medium">Basic product details, brand, and barcode</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.product_name || ''}
                onChange={(e) => handleChange('product_name', e.target.value)}
                placeholder="e.g. Signature Chocolate Truffle Cake"
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5 text-slate-400" />
                <span>Product Barcode</span>
              </label>
              <input
                type="text"
                value={formData.product_barcode || ''}
                onChange={(e) => handleChange('product_barcode', e.target.value)}
                placeholder="e.g. 8901234567890"
                className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-mono text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>Brand</span>
              </label>
              <select
                value={formData.product_brand_id || ''}
                onChange={(e) => handleChange('product_brand_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="">-- Select Brand --</option>
                {brands.map((b) => (
                  <option key={b.id || b.brand_id} value={b.id || b.brand_id}>
                    {b.brand_name || b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Description
              </label>
              <input
                type="text"
                value={formData.product_short_description || ''}
                onChange={(e) => handleChange('product_short_description', e.target.value)}
                placeholder="One-liner summary for cards & previews..."
                className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Long Description
            </label>
            <textarea
              rows={2}
              value={formData.product_long_description || ''}
              onChange={(e) => handleChange('product_long_description', e.target.value)}
              placeholder="Detailed product descriptions, care tips, ingredients..."
              className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all resize-y"
            />
          </div>
        </div>
      </div>

      {/* 2. CATEGORIZATION & TAGS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">2. Categorization & Associations</h2>
            <p className="text-[11px] text-slate-500 font-medium">Click tags below to assign them to this product</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Pill Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Categories
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                {(formData.category_ids || []).length} selected
              </span>
            </div>
            <div className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 min-h-[5rem] max-h-36 overflow-y-auto custom-scrollbar">
              {categories.map((c) => {
                const cId = Number(c.id || c.category_id);
                const isSelected = (formData.category_ids || []).includes(cId);
                return (
                  <button
                    type="button"
                    key={cId}
                    onClick={() => handleToggleId('category_ids', cId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{c.categories_name || c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vendors Pill Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vendors 
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                {(formData.vendor_ids || []).length} selected
              </span>
            </div>
            <div className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 min-h-[5rem] max-h-36 overflow-y-auto custom-scrollbar">
              {vendors.map((v) => {
                const vId = Number(v.id || v.vendor_id);
                const isSelected = (formData.vendor_ids || []).includes(vId);
                return (
                  <button
                    type="button"
                    key={vId}
                    onClick={() => handleToggleId('vendor_ids', vId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{v.vendors_name || v.vendor_name || v.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Occasions Pill Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Occasions 
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                {(formData.occasion_ids || []).length} selected
              </span>
            </div>
            <div className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 min-h-[5rem] max-h-36 overflow-y-auto custom-scrollbar">
              {occasions.map((occ) => {
                const occId = Number(occ.id || occ.occasions_id);
                const isSelected = (formData.occasion_ids || []).includes(occId);
                return (
                  <button
                    type="button"
                    key={occId}
                    onClick={() => handleToggleId('occasion_ids', occId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{occ.occasions_name || occ.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Pill Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tags
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                {(formData.tag_ids || []).length} selected
              </span>
            </div>
            <div className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 min-h-[5rem] max-h-36 overflow-y-auto custom-scrollbar">
              {tags.map((t) => {
                const tId = Number(t.id || t.tags_id);
                const isChecked = (formData.tag_ids || []).includes(tId);
                return (
                  <button
                    type="button"
                    key={tId}
                    onClick={() => handleToggleId('tag_ids', tId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isChecked
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                    <span>{t.tags_name || t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRICING & INVENTORY / VARIANTS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">3. Pricing & Inventory Configuration</h2>
              <p className="text-[11px] text-slate-500 font-medium">Configure single product pricing or enable multi-option variants</p>
            </div>
          </div>
        </div>

        {/* Checkbox for Variants */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <label className="flex items-start gap-3 p-3.5 bg-white border border-purple-200/80 rounded-xl cursor-pointer hover:bg-purple-50/30 transition-all shadow-2xs group">
            <input
              type="checkbox"
              checked={!isSingleProductMode}
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange('has_variants', checked ? 0 : 1);
                if (checked && (!formData.variants || formData.variants.length === 0)) {
                  handleAddVariant();
                }
              }}
              className="w-4 h-4 mt-0.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>This product has other variants / options (Size, Weight, Color, etc.)</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                Check this box to set up individual variant barcodes, MRPs, sale prices, weights, dimensions, and variant photos.
              </p>
            </div>
          </label>
        </div>

        {/* 3A. SINGLE PRODUCT VIEW (When Checkbox is UNCHECKED, has_variants = 1) */}
        {isSingleProductMode ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  MRP (product_mrp) ₹
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.product_mrp || ''}
                  onChange={(e) => handleChange('product_mrp', e.target.value)}
                  placeholder="e.g. 699"
                  className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sale Price (product_sale_price) ₹
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.product_sale_price || ''}
                  onChange={(e) => handleChange('product_sale_price', e.target.value)}
                  placeholder="e.g. 549"
                  className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-bold text-purple-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bulk Price (product_bulk_price) ₹
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.product_bulk_price || ''}
                  onChange={(e) => handleChange('product_bulk_price', e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Weight (product_weight)
                </label>
                <input
                  type="text"
                  value={formData.product_weight || ''}
                  onChange={(e) => handleChange('product_weight', e.target.value)}
                  placeholder="e.g. 500g, 1kg"
                  className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Main Product Images Upload */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Images (images)
              </label>

              <div className="flex items-center gap-4 flex-wrap">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-4 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/50 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-9 h-9 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-xs border border-purple-100 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Upload Product Images</p>
                    <p className="text-[10px] text-slate-400">Click to choose PNG, JPG, WEBP</p>
                  </div>
                </div>

                {/* Thumbnails */}
                {formData.images && formData.images.length > 0 && (
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {formData.images.map((img, idx) => {
                      const src = img.product_images || img.preview || img;
                      return (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-2xs"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 px-1 rounded bg-black/60 text-white font-mono text-[8px] font-bold">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 3B. VARIANTS MODE VIEW (has_variants = 0) */
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Product Variants ({(formData.variants || []).length})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Set unique attribute combinations, pricing, barcodes, dimensions, and images for each variant.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Variant</span>
              </button>
            </div>

            {/* Variants Cards List */}
            <div className="space-y-5">
              {(formData.variants || []).map((variant, vIdx) => {
                const selectedAttrIds = variant.attribute_value_ids || [];

                return (
                  <div
                    key={vIdx}
                    className="bg-slate-50/80 rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all hover:border-purple-200"
                  >
                    {/* Variant Card Header */}
                    <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          #{vIdx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900">
                            Variant {vIdx + 1}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            ({selectedAttrIds.length} attributes selected)
                          </span>
                        </div>
                      </div>

                      {(formData.variants || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(vIdx)}
                          className="px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete this variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>

                    <div className="p-5 space-y-5">
                      {/* 1. Attribute Values Pickers Grouped by Attribute Name */}
                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Select Variant Options (Attributes)
                        </label>

                        {attributes.length === 0 ? (
                          <p className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-slate-200">
                            No attributes configured. Please add attributes (e.g. Size, Color) in the Attributes page first.
                          </p>
                        ) : (
                          <div className="space-y-2.5 bg-white p-4 rounded-xl border border-slate-200/80">
                            {attributes.map((attr) => {
                              const vals = Array.isArray(attr.values) ? attr.values : (attr.attribute_values || []);
                              if (vals.length === 0) return null;

                              return (
                                <div key={attr.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-2.5 last:pb-0 border-b border-slate-100 last:border-0">
                                  <span className="text-xs font-bold text-slate-700 sm:w-28 shrink-0 flex items-center gap-1.5">
                                    <SlidersHorizontal className="w-3 h-3 text-purple-600" />
                                    <span>{attr.attribute_name || attr.name}:</span>
                                  </span>

                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {vals.map((val) => {
                                      const valId = Number(val.id || val.attribute_value_id);
                                      const valName = val.attribute_value || val.value || String(val);
                                      const isSelected = selectedAttrIds.includes(valId);

                                      return (
                                        <button
                                          type="button"
                                          key={`${attr.id}-${valId}`}
                                          onClick={() => handleToggleVariantAttribute(vIdx, valId)}
                                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                            isSelected
                                              ? 'bg-purple-600 text-white border-purple-600 shadow-2xs font-bold scale-105'
                                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                          }`}
                                        >
                                          {isSelected && <Check className="w-3 h-3" />}
                                          <span>{valName}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 2. Pricing & Barcode Grid */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Pricing & Barcode
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Barcode
                            </span>
                            <input
                              type="text"
                              value={variant.product_barcode || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'product_barcode', e.target.value)}
                              placeholder="e.g. 123456"
                              className="w-full px-3 py-2 bg-slate-50 text-xs font-mono text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              MRP ₹
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={variant.product_mrp || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'product_mrp', e.target.value)}
                              placeholder="500"
                              className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Sale Price ₹
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={variant.product_sale_price || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'product_sale_price', e.target.value)}
                              placeholder="450"
                              className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-purple-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Bulk Price ₹
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={variant.product_bulk_price || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'product_bulk_price', e.target.value)}
                              placeholder="18"
                              className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Dimensions & Weight Grid */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Weight & Dimensions
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Weight (kg)
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={variant.product_weight || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'product_weight', e.target.value)}
                              placeholder="0.3"
                              className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Length (cm)
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={variant.product_length || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'product_length', e.target.value)}
                              placeholder="25"
                              className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Width (cm)
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={variant.product_width || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'product_width', e.target.value)}
                              placeholder="20"
                              className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Height (cm)
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={variant.product_height || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'product_height', e.target.value)}
                              placeholder="2"
                              className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. Variant Images */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                            <span>Variant Images ({(variant.images || []).length})</span>
                          </label>

                          <label className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Variant Photos</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleVariantImageUpload(vIdx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {variant.images && variant.images.length > 0 ? (
                          <div className="flex items-center gap-3 flex-wrap pt-1">
                            {variant.images.map((vImg, imgIdx) => {
                              const vSrc = vImg.product_variant_images || vImg.preview || vImg;
                              return (
                                <div
                                  key={imgIdx}
                                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                                >
                                  <img src={vSrc} alt="" className="w-full h-full object-cover" />
                                  <span className="absolute bottom-1 left-1 px-1 rounded bg-black/60 text-white font-mono text-[8px] font-bold">
                                    #{imgIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariantImage(vIdx, imgIdx)}
                                    className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Remove image"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            No images uploaded for this variant yet. Click 'Add Variant Photos' above.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Variant Button */}
            <button
              type="button"
              onClick={handleAddVariant}
              className="w-full py-3.5 border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/30 hover:bg-purple-50/60 text-purple-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Another Variant Row</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. ACTION BAR */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <CheckCircle2 className={`w-4 h-4 ${isFormValid ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span>{isFormValid ? 'Ready to submit product' : 'Product name is required (*)'}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!isFormValid || isSaving}
            className={`px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer ${
              !isFormValid || isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isSaving ? 'Creating Product...' : 'Create & Save Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
