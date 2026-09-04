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
  Barcode as BarcodeIcon,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Check,
  Search,
  Box,
  FileText,
  BookmarkCheck,
  FolderTree
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { fetchActiveBrands, fetchBrands } from '../services/brandApi';
import { fetchActiveCategories, fetchCategories } from '../services/categoryApi';
import { fetchActiveVendors, fetchVendors } from '../services/vendorApi';
import { fetchActiveOccasions, fetchOccasions } from '../services/occasionApi';
import { fetchActiveTags, fetchTags } from '../services/tagApi';
import { fetchActiveAttributes, fetchAttributes, fetchAttributeById } from '../services/attributeApi';

export default function AddProductForm({
  formData,
  setFormData,
  activeTab: controlledActiveTab,
  setActiveTab: setControlledActiveTab,
  onReset,
  onSaveDraft,
  onSave,
  onCancel,
  isEditing = false,
  isSaving,
  hasDraft
}) {
  const { token } = useAuthContext();
  const { getImageUrl, noImageUrl } = useAppContext();
  const fileInputRef = useRef(null);

  // 4 Tabs: 'info' | 'categorization' | 'pricing' | 'variants'
  const [localActiveTab, setLocalActiveTab] = useState('info');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab;
  const setActiveTab = setControlledActiveTab || setLocalActiveTab;

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
          fetchActiveBrands(token).catch(() => fetchBrands(token)),
          fetchActiveCategories(token).catch(() => fetchCategories(token)),
          fetchActiveVendors(token).catch(() => fetchVendors(token)),
          fetchActiveOccasions(token).catch(() => fetchOccasions(token)),
          fetchActiveTags(token).catch(() => fetchTags(token)),
          fetchActiveAttributes(token).catch(() => fetchAttributes(token)),
        ]);

        const extractItems = (result) => {
          if (result.status !== 'fulfilled') return [];
          const res = result.value;
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.data?.data)) return res.data.data;
          if (Array.isArray(res?.brands)) return res.brands;
          if (Array.isArray(res?.data?.brands)) return res.data.brands;
          if (Array.isArray(res?.categories)) return res.categories;
          if (Array.isArray(res?.data?.categories)) return res.data.categories;
          if (Array.isArray(res?.vendors)) return res.vendors;
          if (Array.isArray(res?.data?.vendors)) return res.data.vendors;
          if (Array.isArray(res?.occasions)) return res.occasions;
          if (Array.isArray(res?.data?.occasions)) return res.data.occasions;
          if (Array.isArray(res?.tags)) return res.tags;
          if (Array.isArray(res?.data?.tags)) return res.data.tags;
          if (Array.isArray(res?.attributes)) return res.attributes;
          if (Array.isArray(res?.data?.attributes)) return res.data.attributes;
          if (res?.data && typeof res.data === 'object') {
            return Object.values(res.data).filter((item) => item && typeof item === 'object');
          }
          if (res && typeof res === 'object') {
            const vals = Object.values(res).filter((item) => item && typeof item === 'object');
            if (vals.length > 0) return vals;
          }
          return [];
        };

        let brandItems = extractItems(brandsRes);
        if (brandItems.length === 0) {
          try {
            const bFallback = await fetchBrands(token).catch(() => fetchActiveBrands(token));
            brandItems = extractItems({ status: 'fulfilled', value: bFallback });
          } catch {}
        }
        setBrands(brandItems);

        let catItems = extractItems(catRes);
        if (catItems.length === 0) {
          try {
            const fb = await fetchCategories(token).catch(() => fetchActiveCategories(token));
            catItems = extractItems({ status: 'fulfilled', value: fb });
          } catch {}
        }
        setCategories(catItems);

        let venItems = extractItems(venRes);
        if (venItems.length === 0) {
          try {
            const fb = await fetchVendors(token).catch(() => fetchActiveVendors(token));
            venItems = extractItems({ status: 'fulfilled', value: fb });
          } catch {}
        }
        setVendors(venItems);

        let occItems = extractItems(occRes);
        if (occItems.length === 0) {
          try {
            const fb = await fetchOccasions(token).catch(() => fetchActiveOccasions(token));
            occItems = extractItems({ status: 'fulfilled', value: fb });
          } catch {}
        }
        setOccasions(occItems);

        let tagItems = extractItems(tagRes);
        if (tagItems.length === 0) {
          try {
            const fb = await fetchTags(token).catch(() => fetchActiveTags(token));
            tagItems = extractItems({ status: 'fulfilled', value: fb });
          } catch {}
        }
        setTags(tagItems);

        const rawAttrs = extractItems(attrRes);
        let finalAttrs = rawAttrs;

        // If backend index did not eager-load values, fetch details in parallel
        if (rawAttrs.length > 0) {
          try {
            const enriched = await Promise.all(
              rawAttrs.map(async (item) => {
                const attrId = item.id || item.attribute_id;
                if (!attrId) return item;
                if (extractAttributeValues(item).length > 0) return item;

                try {
                  const single = await fetchAttributeById(attrId, token);
                  const singleData = single?.data || single;
                  if (singleData) {
                    return {
                      ...item,
                      ...singleData,
                      values:
                        singleData.values ||
                        singleData.attribute_values ||
                        singleData.attributevalues ||
                        item.values,
                    };
                  }
                } catch {
                  // Ignore single item error
                }
                return item;
              })
            );
            finalAttrs = enriched;
          } catch {
            finalAttrs = rawAttrs;
          }
        }

        setAttributes(finalAttrs);

        // Single log when fetched
        if (finalAttrs.length > 0) {
          console.group('📥 [FETCHED / GET Attributes from API]');
          console.log(`Loaded ${finalAttrs.length} attributes from Attribute Management API:`);
          console.table(
            finalAttrs.map((attr) => {
              const attrId = attr.id || attr.attribute_id;
              const attrName = attr.attribute_name || attr.name;
              const vals = extractAttributeValues(attr);
              return {
                'Attribute ID': attrId,
                'Attribute Name': attrName,
                'Total Values': vals.length,
                'Values & (IDs)': vals.map((v) => `${v.attribute_value} (ID: ${v.id})`).join(', ')
              };
            })
          );
          console.groupEnd();
        }
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

  // Helper to extract attribute values robustly across all backend response formats
  const extractAttributeValues = (attr) => {
    if (!attr) return [];
    let raw =
      attr.attribute_values ??
      attr.values ??
      attr.attributevalues ??
      attr.attribute_value ??
      attr.options ??
      attr.items ??
      [];

    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = raw.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (!Array.isArray(raw)) {
      if (raw && typeof raw === 'object') {
        raw = Object.values(raw);
      } else {
        return [];
      }
    }

    return raw
      .map((v, idx) => {
        if (typeof v === 'string' || typeof v === 'number') {
          return {
            id: v,
            attribute_value: String(v).trim(),
          };
        }
        return {
          id: v.id || v.attribute_value_id || v.value_id || `val-${idx}`,
          attribute_value: String(
            v.attribute_value ??
            v.value ??
            v.name ??
            v.title ??
            v.attribute_values ??
            ''
          ).trim(),
        };
      })
      .filter((v) => v.attribute_value !== '');
  };

  // Main Images (Single Mode)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const readPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          resolve({
            file,
            preview: uploadEvent.target.result,
            name: file.name,
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(readPromises);

    setFormData((prev) => {
      const existing = prev.images || [];
      const existingKeys = new Set(
        existing.map((img) => `${img.name || img.product_images}_${img.file?.size || 0}`)
      );

      const uniqueNew = results
        .filter((res) => {
          const key = `${res.name}_${res.size}`;
          if (existingKeys.has(key)) return false;
          existingKeys.add(key);
          return true;
        })
        .map((item, idx) => ({
          file: item.file,
          preview: item.preview,
          name: item.name,
          product_images_sort_order: existing.length + idx + 1,
        }));

      return {
        ...prev,
        images: [...existing, ...uniqueNew],
      };
    });

    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== index),
    }));
  };

  // State for user-selected active attributes
  const [selectedActiveAttrIds, setSelectedActiveAttrIds] = useState([]);
  const [currentSelectionValues, setCurrentSelectionValues] = useState({});

  // Auto-restore selectedActiveAttrIds from existing variants if any
  useEffect(() => {
    if (!formData.variants || formData.variants.length === 0 || !attributes || attributes.length === 0) {
      return;
    }

    const presentValIds = new Set();
    formData.variants.forEach((v) => {
      const ids = Array.isArray(v.attribute_value_ids)
        ? v.attribute_value_ids
        : v.attribute_value_id
        ? [v.attribute_value_id]
        : [];
      ids.forEach((id) => presentValIds.add(Number(id)));
    });
    if (presentValIds.size === 0) return;

    const activeIds = [];
    attributes.forEach((attr) => {
      const attrId = Number(attr.id || attr.attribute_id);
      const attrVals = extractAttributeValues(attr);
      const hasMatch = attrVals.some((v) => presentValIds.has(Number(v.id || v.attribute_value_id)));
      if (hasMatch && !activeIds.includes(attrId)) {
        activeIds.push(attrId);
      }
    });

    if (activeIds.length > 0) {
      setSelectedActiveAttrIds((prev) => {
        const set = new Set([...prev, ...activeIds]);
        return Array.from(set);
      });
    }
  }, [formData.variants, attributes]);

  // Toggle active attribute checkbox
  const handleToggleActiveAttribute = (attrId) => {
    const numId = Number(attrId);
    setSelectedActiveAttrIds((prev) => {
      const isAlreadySelected = prev.includes(numId);
      if (isAlreadySelected) {
        setCurrentSelectionValues((oldVals) => {
          const updated = { ...oldVals };
          delete updated[numId];
          return updated;
        });
        return prev.filter((id) => id !== numId);
      } else {
        return [...prev, numId];
      }
    });
  };

  // Update current dropdown value for an attribute
  const handleSelectionValueChange = (attrId, valId) => {
    setCurrentSelectionValues((prev) => ({
      ...prev,
      [attrId]: valId ? Number(valId) : '',
    }));
  };

  // Add Variant button handler (generates unique variant barcode)
  const handleAddVariantCombination = () => {
    if (selectedActiveAttrIds.length === 0) {
      toast.error('Please choose at least one active attribute option.');
      return;
    }

    const missingAttr = selectedActiveAttrIds.find(
      (attrId) => !currentSelectionValues[attrId]
    );

    if (missingAttr) {
      toast.error('Please select a value for all active attributes.');
      return;
    }

    const selectedValIds = selectedActiveAttrIds.map((attrId) =>
      Number(currentSelectionValues[attrId])
    );

    // Duplicate combination check
    const currentComboKey = [...selectedValIds].sort((a, b) => a - b).join('-');
    const isDuplicate = (formData.variants || []).some((v) => {
      const vKey = (v.attribute_value_ids || []).map(Number).sort((a, b) => a - b).join('-');
      return vKey === currentComboKey;
    });

    if (isDuplicate) {
      toast.error('This variant combination already exists.');
      return;
    }

    // Build combination display labels
    const comboItems = selectedActiveAttrIds.map((attrId) => {
      const attrObj = (attributes || []).find((a) => Number(a.id || a.attribute_id) === Number(attrId));
      const attrVals = attrObj ? extractAttributeValues(attrObj) : [];
      const valId = Number(currentSelectionValues[attrId]);
      const valObj = attrVals.find((v) => Number(v.id || v.attribute_value_id) === valId);
      return {
        attrId: Number(attrId),
        attrName: attrObj?.attribute_name || attrObj?.name || `Attribute #${attrId}`,
        valId,
        valName: valObj?.attribute_value || valObj?.value || String(valId)
      };
    });

    const comboLabel = comboItems.map((c) => `${c.attrName}: ${c.valName}`).join(' | ');

    const newVariant = {
      attribute_value_id: selectedValIds[0],
      attribute_value_ids: selectedValIds,
      combo_items: comboItems,
      combo_label: comboLabel,
      product_barcode: '',
      product_mrp: '',
      product_sale_price: '',
      product_bulk_price: '',
      product_weight: '',
      product_length: '',
      product_width: '',
      product_height: '',
      images: []
    };

    // APPEND to existing variants list (never replace)
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));

    // Reset only the dropdown controls back to -- None --
    setCurrentSelectionValues({});
    toast.success(`Created: ${comboLabel}`);
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, idx) => idx !== index)
    }));
    toast.success('Variant removed');
  };

  const handleUpdateVariant = (index, field, value) => {
    setFormData((prev) => {
      const currentVariants = [...(prev.variants || [])];
      if (!currentVariants[index]) return prev;
      currentVariants[index] = {
        ...currentVariants[index],
        [field]: value
      };
      return { ...prev, variants: currentVariants };
    });
  };

  const handleVariantImageUpload = async (variantIndex, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const readPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          resolve({
            file,
            preview: uploadEvent.target.result,
            name: file.name,
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(readPromises);

    setFormData((prev) => {
      const currentVariants = [...(prev.variants || [])];
      const target = currentVariants[variantIndex];
      if (!target) return prev;

      const existing = target.images || [];
      const existingKeys = new Set(
        existing.map((img) => `${img.name || img.product_variant_images}_${img.file?.size || 0}`)
      );

      const uniqueNew = results
        .filter((res) => {
          const key = `${res.name}_${res.size}`;
          if (existingKeys.has(key)) return false;
          existingKeys.add(key);
          return true;
        })
        .map((item, idx) => ({
          file: item.file,
          preview: item.preview,
          name: item.name,
          product_variant_images_sort_order: existing.length + idx + 1,
        }));

      currentVariants[variantIndex] = {
        ...target,
        images: [...existing, ...uniqueNew],
      };

      return { ...prev, variants: currentVariants };
    });

    e.target.value = '';
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

  const hasVariantsEnabled = Number(formData.has_variants) === 1;

  const focusElement = (id) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof el.focus === 'function') el.focus();
      }
    }, 150);
  };

  // Step Validation checks for smooth Tab progression
  const validateTab = (tabKey) => {
    if (tabKey === 'info') {
      if (!formData.product_name || !formData.product_name.trim()) {
        toast.error('Product Name is required.');
        focusElement('input_product_name');
        return false;
      }
      if (!formData.product_brand_id) {
        toast.error('Please select a Brand.');
        focusElement('select_product_brand');
        return false;
      }
      return true;
    }
    if (tabKey === 'categorization') {
      if (!formData.category_ids || formData.category_ids.length === 0) {
        toast.error('Please select at least one Category.');
        focusElement('section_categories');
        return false;
      }
      return true;
    }
    if (tabKey === 'pricing') {
      if (!hasVariantsEnabled) {
        if (!formData.product_mrp || Number(formData.product_mrp) <= 0) {
          toast.error('MRP is required and must be greater than 0.');
          focusElement('input_product_mrp');
          return false;
        }
        if (!formData.images || formData.images.length === 0) {
          toast.error('Please upload at least one product photo.');
          focusElement('section_product_photos');
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleNextTab = () => {
    if (activeTab === 'info') {
      if (validateTab('info')) setActiveTab('categorization');
    } else if (activeTab === 'categorization') {
      if (validateTab('categorization')) {
        setActiveTab(hasVariantsEnabled ? 'variants' : 'pricing');
      }
    } else if (activeTab === 'pricing' || activeTab === 'variants') {
      onSave();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevTab = () => {
    if (activeTab === 'categorization') {
      setActiveTab('info');
    } else if (activeTab === 'pricing' || activeTab === 'variants') {
      setActiveTab('categorization');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {/* DYNAMIC 3-TAB NAVIGATION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 flex items-center gap-1.5 flex-wrap">
        {/* Tab 1: Product Info */}
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'info'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>1. Product Info</span>
          {Boolean(formData.product_name && formData.product_brand_id) && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
        </button>

        {/* Tab 2: Categorization */}
        <button
          type="button"
          onClick={() => {
            if (validateTab('info')) setActiveTab('categorization');
          }}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'categorization'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>2. Categorization</span>
          {Array.isArray(formData.category_ids) && formData.category_ids.length > 0 && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
        </button>

        {/* Tab 3: Dynamic - Either Pricing & Photos OR Variants */}
        {!hasVariantsEnabled ? (
          <button
            type="button"
            onClick={() => {
              if (validateTab('info') && validateTab('categorization')) setActiveTab('pricing');
            }}
            className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Pricing & Photos</span>
            {Boolean(formData.product_mrp && (formData.images || []).length > 0) && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (validateTab('info') && validateTab('categorization')) {
                setActiveTab('variants');
              }
            }}
            className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'variants'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Variants</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                activeTab === 'variants' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
              }`}
            >
              {(formData.variants || []).length}
            </span>
          </button>
        )}
      </div>

      {/* TAB 1: PRODUCT INFO */}
      {activeTab === 'info' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">1. Product Information</h2>
                <p className="text-[11px] text-slate-500 font-medium">Name, Brand, and Description details</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input_product_name"
                    type="text"
                    value={formData.product_name || ''}
                    onChange={(e) => handleChange('product_name', e.target.value)}
                    placeholder="e.g. Signature Chocolate Gift Box"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="select_product_brand"
                      value={formData.product_brand_id || ''}
                      onChange={(e) => handleChange('product_brand_id', e.target.value)}
                      required
                      className="w-full appearance-none px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all cursor-pointer pr-10"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => {
                        const bId = b.id || b.brand_id || b.brands_id;
                        const bName = b.brands_name || b.brand_name || b.name || b.title || `Brand #${bId}`;
                        return (
                          <option key={bId} value={bId}>
                            {bName}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Short & Long Description (Side by Side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Short Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Short Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.product_short_description || ''}
                    onChange={(e) => handleChange('product_short_description', e.target.value)}
                    placeholder="Brief summary shown in product previews and cards"
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Long Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.product_long_description || ''}
                    onChange={(e) => handleChange('product_long_description', e.target.value)}
                    placeholder="Comprehensive product specifications, ingredients, etc."
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              {/* Variant Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 cursor-pointer hover:bg-purple-50 transition-colors group">
                  <input
                    type="checkbox"
                    checked={hasVariantsEnabled}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      handleChange('has_variants', isChecked ? 1 : 0);
                      if (isChecked) {
                        toast.success('Variants enabled. Configure combinations in Tab 3: Variants.');
                        if (activeTab === 'pricing') setActiveTab('variants');
                      } else {
                        if (activeTab === 'variants') setActiveTab('pricing');
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
                      Check this box to configure multiple size, color, or custom variant options in Tab 3.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIZATION */}
      {activeTab === 'categorization' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <FolderTree className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">2. Categorization & Grouping</h2>
                <p className="text-[11px] text-slate-500 font-medium">Categories, Vendors, Occasions, and Search Tags</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Categories (Required) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Categories</span>
                    <span className="text-rose-500">*</span>
                    <span className="text-[11px] font-semibold text-purple-600 normal-case">
                      ({formData.category_ids?.length || 0} selected)
                    </span>
                  </label>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-purple-500"
                    />
                  </div>
                </div>

                <div id="section_categories" className="flex items-center gap-2 flex-wrap max-h-48 overflow-y-auto p-3 bg-slate-50/50 rounded-xl border border-slate-200/70 focus:outline-none focus:ring-2 focus:ring-purple-500/30">
                  {categories
                    .filter((cat) => {
                      const name = cat.categories_name || cat.category_name || cat.name || cat.title || '';
                      return String(name).toLowerCase().includes(categorySearch.toLowerCase());
                    })
                    .map((cat) => {
                      const catId = Number(cat.id || cat.category_id || cat.categories_id);
                      const catName = cat.categories_name || cat.category_name || cat.name || cat.title || `Category #${catId}`;
                      const isSelected = (formData.category_ids || []).includes(catId);
                      return (
                        <button
                          key={catId}
                          type="button"
                          onClick={() => handleToggleId('category_ids', catId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <span>{catName}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Vendors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-500" />
                    <span>Vendors</span>
                    <span className="text-[11px] font-semibold text-indigo-600 normal-case">
                      ({formData.vendor_ids?.length || 0} selected)
                    </span>
                  </label>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      placeholder="Search vendors..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap max-h-48 overflow-y-auto p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                  {vendors
                    .filter((ven) => {
                      const name = ven.vendors_name || ven.vendor_name || ven.name || ven.title || '';
                      return String(name).toLowerCase().includes(vendorSearch.toLowerCase());
                    })
                    .map((ven) => {
                      const venId = Number(ven.id || ven.vendor_id || ven.vendors_id);
                      const venName = ven.vendors_name || ven.vendor_name || ven.name || ven.title || `Vendor #${venId}`;
                      const isSelected = (formData.vendor_ids || []).includes(venId);
                      return (
                        <button
                          key={venId}
                          type="button"
                          onClick={() => handleToggleId('vendor_ids', venId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <span>{venName}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Occasions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Occasions</span>
                    <span className="text-[11px] font-semibold text-pink-600 normal-case">
                      ({formData.occasion_ids?.length || 0} selected)
                    </span>
                  </label>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={occasionSearch}
                      onChange={(e) => setOccasionSearch(e.target.value)}
                      placeholder="Search occasions..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap max-h-48 overflow-y-auto p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                  {occasions
                    .filter((occ) => {
                      const name = occ.occasions_name || occ.occasion_name || occ.name || occ.title || '';
                      return String(name).toLowerCase().includes(occasionSearch.toLowerCase());
                    })
                    .map((occ) => {
                      const occId = Number(occ.id || occ.occasion_id || occ.occasions_id);
                      const occName = occ.occasions_name || occ.occasion_name || occ.name || occ.title || `Occasion #${occId}`;
                      const isSelected = (formData.occasion_ids || []).includes(occId);
                      return (
                        <button
                          key={occId}
                          type="button"
                          onClick={() => handleToggleId('occasion_ids', occId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-pink-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-pink-300'
                          }`}
                        >
                          <span>{occName}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tags</span>
                    <span className="text-[11px] font-semibold text-emerald-600 normal-case">
                      ({formData.tag_ids?.length || 0} selected)
                    </span>
                  </label>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search tags..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap max-h-48 overflow-y-auto p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                  {tags
                    .filter((t) => {
                      const name = t.tags_name || t.tag_name || t.name || t.title || '';
                      return String(name).toLowerCase().includes(tagSearch.toLowerCase());
                    })
                    .map((t) => {
                      const tId = Number(t.id || t.tag_id || t.tags_id);
                      const tName = t.tags_name || t.tag_name || t.name || t.title || `Tag #${tId}`;
                      const isSelected = (formData.tag_ids || []).includes(tId);
                      return (
                        <button
                          key={tId}
                          type="button"
                          onClick={() => handleToggleId('tag_ids', tId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <span>{tName}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING & PHOTOS */}
      {activeTab === 'pricing' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">3. Default Pricing, Barcode & Dimensions</h2>
                <p className="text-[11px] text-slate-500 font-medium">Barcode, MRP, sale prices, shipping dimensions, and product photos</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Barcode & Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Barcode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Barcode
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.product_barcode || ''}
                      onChange={(e) => handleChange('product_barcode', e.target.value)}
                      placeholder="e.g. 890123456789"
                      className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-mono text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all pr-9"
                    />
                    <BarcodeIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* MRP */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    MRP (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input_product_mrp"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.product_mrp ?? ''}
                    onChange={(e) => handleChange('product_mrp', e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Sale Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.product_sale_price ?? ''}
                    onChange={(e) => handleChange('product_sale_price', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-bold text-purple-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Bulk Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bulk Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.product_bulk_price ?? ''}
                    onChange={(e) => handleChange('product_bulk_price', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Weight & Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Weight
                  </label>
                  <input
                    type="text"
                    value={formData.product_weight || ''}
                    onChange={(e) => handleChange('product_weight', e.target.value)}
                    placeholder="e.g. 500g or 1kg"
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.product_length ?? ''}
                    onChange={(e) => handleChange('product_length', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.product_width ?? ''}
                    onChange={(e) => handleChange('product_width', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.product_height ?? ''}
                    onChange={(e) => handleChange('product_height', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Product Photos (Required for single product) */}
              <div id="section_product_photos" className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Product Photos</span>
                    <span className="text-rose-500">*</span>
                    <span className="text-[11px] font-semibold text-purple-600 normal-case">
                      ({(formData.images || []).length} uploaded)
                    </span>
                  </label>
                  <label className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Upload Images</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.images && formData.images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80">
                    {formData.images.map((img, idx) => {
                      const raw =
                        img.preview ||
                        (typeof img.product_images === 'string' ? img.product_images : '') ||
                        (img.file instanceof File ? URL.createObjectURL(img.file) : '') ||
                        (typeof img === 'string' ? img : '');
                      const src =
                        img.preview ||
                        (img.file instanceof File ? URL.createObjectURL(img.file) : '') ||
                        (raw ? getImageUrl('product', raw) : noImageUrl);
                      return (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-2xs"
                        >
                          <img
                            src={src}
                            alt="Product"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = noImageUrl;
                            }}
                          />
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
                ) : (
                  <label
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-slate-50/30 hover:bg-purple-50/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Click to upload product photos <span className="text-rose-500">*</span></p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB each</p>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VARIANTS (multi-variant mode) */}
      {activeTab === 'variants' && hasVariantsEnabled && (
        <div className="space-y-6 animate-in fade-in">
          {/* STEP 1: CHOOSE ACTIVE ATTRIBUTES & CONFIGURE COMBINATIONS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Choose Options active for this product:
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check the attributes that apply to this product (e.g. Color, demo, Size).
              </p>
            </div>

            {/* Simple Checkboxes */}
            {(() => {
              const validAttrs = (attributes || []).filter((a) => extractAttributeValues(a).length > 0);
              if (validAttrs.length === 0) {
                return (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                    No attributes available. Please create attributes in Attribute Management.
                  </div>
                );
              }

              return (
                <div className="flex items-center gap-6 flex-wrap py-2">
                  {validAttrs.map((attr) => {
                    const attrId = Number(attr.id || attr.attribute_id);
                    const attrName = attr.attribute_name || attr.name;
                    const isChecked = selectedActiveAttrIds.includes(attrId);

                    return (
                      <label
                        key={attrId}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleActiveAttribute(attrId)}
                          className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                        />
                        <span>{attrName}</span>
                      </label>
                    );
                  })}
                </div>
              );
            })()}

            {/* Simple Dropdowns & Add Variant Button */}
            {selectedActiveAttrIds.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedActiveAttrIds.map((attrId) => {
                    const attrObj = (attributes || []).find((a) => Number(a.id || a.attribute_id) === Number(attrId));
                    const attrName = attrObj?.attribute_name || attrObj?.name || `Attribute #${attrId}`;
                    const attrValues = attrObj ? extractAttributeValues(attrObj) : [];
                    const selectedVal = currentSelectionValues[attrId] || '';

                    return (
                      <div key={attrId} className="space-y-1">
                        <label className="block text-xs font-medium text-slate-600">
                          Select {attrName} <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={selectedVal}
                          onChange={(e) => handleSelectionValueChange(attrId, e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer"
                        >
                          <option value="">-- None --</option>
                          {attrValues.map((v) => {
                            const vId = Number(v.id || v.attribute_value_id);
                            const vName = v.attribute_value || v.value || String(v);
                            return (
                              <option key={vId} value={vId}>
                                {vName}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1 flex items-center justify-between gap-3">
                  <button
                    id="btn_add_variant_combo"
                    type="button"
                    onClick={handleAddVariantCombination}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Variant</span>
                  </button>

                  <span className="text-xs text-slate-500">
                    {formData.variants?.length || 0} variant{(formData.variants?.length || 0) !== 1 ? 's' : ''} added
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: SIMPLE & CLEAN VARIANT CARDS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Product Variants ({formData.variants?.length || 0})
            </h3>

            {(!formData.variants || formData.variants.length === 0) ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  No variants added yet. Select attribute values above and click <strong>"+ Add Variant"</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {formData.variants.map((variant, vIdx) => {
                  const selectedAttrIds = Array.isArray(variant.attribute_value_ids)
                    ? variant.attribute_value_ids
                    : variant.attribute_value_id
                    ? [variant.attribute_value_id]
                    : [];

                  // Build label
                  const comboPills = [];
                  (attributes || []).forEach((attr) => {
                    const vals = extractAttributeValues(attr);
                    vals.forEach((v) => {
                      const vId = Number(v.id || v.attribute_value_id);
                      if (selectedAttrIds.includes(vId)) {
                        comboPills.push(`${attr.attribute_name || attr.name}: ${v.attribute_value || v.value || String(v)}`);
                      }
                    });
                  });

                  const cardTitle =
                    variant.combo_label ||
                    (comboPills.length > 0 ? comboPills.join(' | ') : `Variant #${vIdx + 1}`);

                  return (
                    <div
                      key={vIdx}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      {/* Card Header */}
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate" title={cardTitle}>
                          {cardTitle}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={variant.product_status || variant.variant_status || 'Active'}
                            onChange={(e) => {
                              handleUpdateVariant(vIdx, 'product_status', e.target.value);
                              handleUpdateVariant(vIdx, 'variant_status', e.target.value);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none transition-colors ${
                              (variant.product_status || variant.variant_status) === 'Inactive'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(vIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            title="Delete variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-4 text-xs">
                        {/* 1. PRICING & BARCODE */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            PRICING & BARCODE
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-[10px] text-slate-500 mb-0.5">Barcode</span>
                              <input
                                type="text"
                                value={variant.product_barcode || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, 'product_barcode', e.target.value)}
                                placeholder="Barcode"
                                className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 mb-0.5">
                                MRP ₹ <span className="text-rose-500">*</span>
                              </span>
                              <input
                                id={`input_variant_mrp_${vIdx}`}
                                type="number"
                                min="0"
                                step="any"
                                value={variant.product_mrp ?? ''}
                                onChange={(e) => handleUpdateVariant(vIdx, 'product_mrp', e.target.value)}
                                placeholder="MRP ₹"
                                required
                                className="w-full px-2.5 py-1.5 text-xs font-bold rounded border border-slate-200 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 mb-0.5">Sale Price ₹</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={variant.product_sale_price ?? ''}
                                onChange={(e) => handleUpdateVariant(vIdx, 'product_sale_price', e.target.value)}
                                placeholder="Sale Price ₹"
                                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 font-semibold text-purple-700"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 mb-0.5">Bulk Price ₹</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={variant.product_bulk_price ?? ''}
                                onChange={(e) => handleUpdateVariant(vIdx, 'product_bulk_price', e.target.value)}
                                placeholder="Bulk Price ₹"
                                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. WEIGHT & DIMENSIONS */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            WEIGHT & DIMENSIONS
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-[10px] text-slate-500 mb-0.5">Weight</span>
                              <input
                                type="text"
                                value={variant.product_weight || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, 'product_weight', e.target.value)}
                                placeholder="Weight"
                                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 mb-0.5">Length (cm)</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={variant.product_length ?? ''}
                                onChange={(e) => handleUpdateVariant(vIdx, 'product_length', e.target.value)}
                                placeholder="Length"
                                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 mb-0.5">Width (cm)</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={variant.product_width ?? ''}
                                onChange={(e) => handleUpdateVariant(vIdx, 'product_width', e.target.value)}
                                placeholder="Width"
                                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 mb-0.5">Height (cm)</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={variant.product_height ?? ''}
                                onChange={(e) => handleUpdateVariant(vIdx, 'product_height', e.target.value)}
                                placeholder="Height"
                                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. VARIANT PHOTOS */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                              VARIANT PHOTOS ({(variant.images || []).length}) <span className="text-rose-500">*</span>
                            </span>
                            <label
                              id={`upload_variant_img_${vIdx}`}
                              className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 cursor-pointer p-1 rounded hover:bg-purple-50"
                            >
                              + Add Photos
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
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              {variant.images.map((vImg, imgIdx) => {
                                const vRaw =
                                  vImg.preview ||
                                  (typeof vImg.product_variant_images === 'string' ? vImg.product_variant_images : '') ||
                                  (typeof vImg.product_images === 'string' ? vImg.product_images : '') ||
                                  (typeof vImg.image === 'string' ? vImg.image : '') ||
                                  (typeof vImg === 'string' ? vImg : '');
                                const vSrc =
                                  vImg.preview ||
                                  (vImg.file instanceof File ? URL.createObjectURL(vImg.file) : '') ||
                                  (vRaw ? getImageUrl('variant', vRaw) : noImageUrl);
                                return (
                                  <div
                                    key={imgIdx}
                                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 group"
                                  >
                                    <img
                                      src={vSrc}
                                      alt="Variant"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = noImageUrl;
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVariantImage(vIdx, imgIdx)}
                                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[11px] text-rose-500 italic">
                              Photo is required for this variant.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER ACTION BUTTONS & STEP NAVIGATION */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div>
          {activeTab !== 'info' && (
            <button
              type="button"
              onClick={handlePrevTab}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* Cancel Button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Cancel and go back"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          {hasDraft && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Discard Draft
            </button>
          )}

          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Save Draft
            </button>
          )}

          {/* Next or Save Button */}
          {((!hasVariantsEnabled && activeTab === 'pricing') || (hasVariantsEnabled && activeTab === 'variants')) ? (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditing ? 'Updating Product...' : 'Saving Product...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Update Product' : 'Create & Save Product'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextTab}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
