import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AddProductForm from '../components/AddProductForm';
import { useAuthContext } from '../context/AuthContext';
import { createProduct, fetchProductById, updateProduct } from '../services/productApi';

const DRAFT_STORAGE_KEY = 'gift_product_draft';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { token } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const initialFormData = {
    product_name: '',
    product_barcode: '',
    product_short_description: '',
    product_long_description: '',
    product_brand_id: '',
    category_ids: [],
    vendor_ids: [],
    occasion_ids: [],
    tag_ids: [],
    has_variants: 0,
    product_weight: '',
    product_mrp: '',
    product_sale_price: '',
    product_bulk_price: '',
    images: [],
    variants: []
  };

  const [formData, setFormData] = useState(initialFormData);

  // Load existing product if in Edit mode
  useEffect(() => {
    if (!id) return;
    const loadExistingProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const res = await fetchProductById(id, token);
        const p = res?.data || res?.product || res;
        if (p) {
          const rawVariants = Array.isArray(p.variants)
            ? p.variants
            : Array.isArray(p.product_variants)
            ? p.product_variants
            : [];

          const cleanZero = (val) => {
            if (val === undefined || val === null || val === '') return '';
            const str = String(val).trim();
            if (str === '0' || str === '0.00' || str === '0.0' || str === '0.0000') return '';
            return str;
          };

          const normalizedVariants = rawVariants.map((v, vIdx) => {
            // Extract attribute value ids
            let valIds = [];
            if (Array.isArray(v.attribute_value_ids) && v.attribute_value_ids.length > 0) {
              valIds = v.attribute_value_ids.map(Number);
            } else if (Array.isArray(v.attribute_values) && v.attribute_values.length > 0) {
              valIds = v.attribute_values.map((x) => Number(x.id || x.attribute_value_id || x));
            } else if (Array.isArray(v.product_variant_attributes) && v.product_variant_attributes.length > 0) {
              valIds = v.product_variant_attributes.map((x) => Number(x.attribute_value_id || x.id || x.attribute_values_id));
            } else if (Array.isArray(v.variant_attributes) && v.variant_attributes.length > 0) {
              valIds = v.variant_attributes.map((x) => Number(x.attribute_value_id || x.id));
            } else if (Array.isArray(v.attributes) && v.attributes.length > 0) {
              valIds = v.attributes.map((x) => Number(x.attribute_value_id || x.id));
            } else if (v.attribute_value_id !== undefined && v.attribute_value_id !== null && v.attribute_value_id !== '') {
              if (typeof v.attribute_value_id === 'string' && v.attribute_value_id.includes(',')) {
                valIds = v.attribute_value_id.split(',').map((s) => Number(s.trim())).filter(Boolean);
              } else {
                valIds = [Number(v.attribute_value_id)];
              }
            } else if (v.attribute_value?.id) {
              valIds = [Number(v.attribute_value.id)];
            }

            // Extract images
            let vImages = [];
            if (Array.isArray(v.images) && v.images.length > 0) {
              vImages = v.images;
            } else if (Array.isArray(v.product_variant_images) && v.product_variant_images.length > 0) {
              vImages = v.product_variant_images;
            } else if (v.product_variant_images) {
              vImages = [{ product_variant_images: v.product_variant_images }];
            } else if (v.image) {
              vImages = [{ product_variant_images: v.image }];
            }

            let comboLabel = v.combo_label || '';
            if (!comboLabel) {
              if (Array.isArray(v.attributes) && v.attributes.length > 0) {
                comboLabel = v.attributes.map((a) => `${a.attribute_name || a.name || 'Attr'}: ${a.attribute_value || a.value || a.attribute_value_name || ''}`).filter(Boolean).join(' | ');
              } else if (Array.isArray(v.attribute_values) && v.attribute_values.length > 0) {
                comboLabel = v.attribute_values.map((av) => {
                  const attrName = av.attribute?.attribute_name || av.attribute?.name || av.attribute_name || 'Attr';
                  const val = av.attribute_value || av.value || av.name || String(av);
                  return `${attrName}: ${val}`;
                }).join(' | ');
              } else if (Array.isArray(v.product_variant_attributes) && v.product_variant_attributes.length > 0) {
                comboLabel = v.product_variant_attributes.map((pva) => {
                  const attrName = pva.attribute?.attribute_name || pva.attribute_name || 'Attr';
                  const val = pva.attribute_value?.attribute_value || pva.attribute_value || pva.value || '';
                  return val ? `${attrName}: ${val}` : attrName;
                }).filter(Boolean).join(' | ');
              } else if (v.attribute_value) {
                if (typeof v.attribute_value === 'object') {
                  const name = v.attribute_value.attribute?.attribute_name || v.attribute_name || 'Attr';
                  const val = v.attribute_value.attribute_value || v.attribute_value.value || '';
                  comboLabel = val ? `${name}: ${val}` : name;
                } else {
                  comboLabel = String(v.attribute_value);
                }
              }
            }

            const rawBarcode = v.product_barcode || v.barcode || '';
            const cleanedVBarcode = String(rawBarcode).trim().toLowerCase().startsWith('var-') ? '' : rawBarcode;

            return {
              ...v,
              id: v.id || v.product_variant_id || v.variant_id,
              attribute_value_id: valIds[0] || v.attribute_value_id || (v.id ? Number(v.id) : undefined),
              attribute_value_ids: valIds.length > 0 ? valIds : (v.attribute_value_id ? [Number(v.attribute_value_id)] : []),
              combo_label: comboLabel,
              product_sku: v.product_sku || v.sku || '',
              product_barcode: cleanedVBarcode,
              product_mrp: v.product_mrp ?? v.mrp ?? v.price ?? '',
              product_sale_price: cleanZero(v.product_sale_price ?? v.sale_price ?? v.saleprice ?? v.sales_price ?? v.product_variant_sale_price),
              product_bulk_price: cleanZero(v.product_bulk_price ?? v.bulk_price ?? v.bulkprice ?? v.product_bulkprice ?? v.product_variant_bulk_price),
              product_weight: cleanZero(v.product_weight ?? v.weight ?? v.product_variant_weight),
              product_length: cleanZero(v.product_length ?? v.length ?? v.product_variant_length),
              product_width: cleanZero(v.product_width ?? v.width ?? v.product_variant_width),
              product_height: cleanZero(v.product_height ?? v.height ?? v.product_variant_height),
              variant_status: v.product_status || v.product_variant_status || v.variant_status || 'Active',
              images: vImages
            };
          });

          // Extract parent images
          let parentImages = [];
          if (Array.isArray(p.images) && p.images.length > 0) {
            parentImages = p.images;
          } else if (Array.isArray(p.product_images) && p.product_images.length > 0) {
            parentImages = p.product_images;
          } else if (p.image) {
            parentImages = typeof p.image === 'string' ? [{ product_images: p.image }] : [p.image];
          } else if (p.product_image) {
            parentImages = typeof p.product_image === 'string' ? [{ product_images: p.product_image }] : [p.product_image];
          } else if (normalizedVariants.length > 0 && normalizedVariants[0]?.images?.length > 0) {
            parentImages = normalizedVariants[0].images;
          }

          const rawParentBarcode = p.product_barcode || p.barcode || '';
          const cleanedParentBarcode = String(rawParentBarcode).trim().toLowerCase().startsWith('var-') ? '' : rawParentBarcode;

          setFormData({
            product_name: p.product_name || p.name || '',
            product_barcode: cleanedParentBarcode,
            product_short_description: p.product_short_description || '',
            product_long_description: p.product_long_description || '',
            product_brand_id: p.product_brand_id || p.brand_id || p.brand?.id || '',
            category_ids: (p.categories || p.category_ids || []).map((c) => Number(c.id || c)),
            vendor_ids: (p.vendors || p.vendor_ids || []).map((v) => Number(v.id || v)),
            occasion_ids: (p.occasions || p.occasion_ids || []).map((o) => Number(o.id || o)),
            tag_ids: (p.tags || p.tag_ids || []).map((t) => Number(t.id || t)),
            has_variants: (Number(p.has_variants) === 1 || p.has_variants === true || p.has_variants === '1') ? 1 : 0,
            product_weight: cleanZero(p.product_weight),
            product_mrp: p.product_mrp || (normalizedVariants[0]?.product_mrp ?? ''),
            product_sale_price: cleanZero(p.product_sale_price ?? normalizedVariants[0]?.product_sale_price),
            product_bulk_price: cleanZero(p.product_bulk_price ?? normalizedVariants[0]?.product_bulk_price),
            images: parentImages,
            variants: normalizedVariants
          });
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load product details');
      } finally {
        setIsLoadingProduct(false);
      }
    };
    loadExistingProduct();
  }, [id, token]);

  // Check for saved draft on mount (only for new products)
  useEffect(() => {
    if (isEditing) return;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setHasDraft(true);
        }
      }
    } catch (e) {
      console.warn('Could not read draft from localStorage:', e);
    }
  }, [isEditing]);

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      setHasDraft(true);
      toast.success('Product draft saved locally!');
    } catch (err) {
      toast.error('Failed to save draft locally');
    }
  };

  const handleLoadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        toast.success('Draft restored into form');
      }
    } catch (err) {
      toast.error('Failed to restore draft');
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    toast.success('Draft discarded');
  };

  const handleReset = () => {
    setFormData(initialFormData);
    toast('Form fields reset to default', { icon: '🧹' });
  };

  const [activeTab, setActiveTab] = useState('info');

  const focusElement = (id) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof el.focus === 'function') el.focus();
      }
    }, 150);
  };

  const handleSaveProduct = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Tab 1 Validations
    if (!formData.product_name || !formData.product_name.trim()) {
      toast.error('Product Name is required (Tab 1: Product Info)');
      setActiveTab('info');
      focusElement('input_product_name');
      return;
    }
    if (!formData.product_brand_id) {
      toast.error('Brand is required (Tab 1: Product Info)');
      setActiveTab('info');
      focusElement('select_product_brand');
      return;
    }

    // Tab 2 Validations
    if (!formData.category_ids || formData.category_ids.length === 0) {
      toast.error('At least one Category is required (Tab 2: Categorization)');
      setActiveTab('categorization');
      focusElement('section_categories');
      return;
    }

    // Tab 3 Validations
    if (Number(formData.has_variants) === 1) {
      if (!formData.variants || formData.variants.length === 0) {
        toast.error('Please add at least one variant (Tab 3: Variants) or disable variants in Tab 1.');
        setActiveTab('variants');
        focusElement('btn_add_variant_combo');
        return;
      }
      for (let i = 0; i < formData.variants.length; i++) {
        const v = formData.variants[i];
        const vIds = Array.isArray(v.attribute_value_ids)
          ? v.attribute_value_ids
          : v.attribute_value_id
          ? [v.attribute_value_id]
          : [];
        if (vIds.length === 0) {
          toast.error(`Please select attribute values for Variant #${i + 1}`);
          setActiveTab('variants');
          focusElement(`select_variant_val_${i}`);
          return;
        }
        if (!v.product_mrp || Number(v.product_mrp) <= 0) {
          toast.error(`MRP is required for Variant #${i + 1}`);
          setActiveTab('variants');
          focusElement(`input_variant_mrp_${i}`);
          return;
        }
        if (!v.images || v.images.length === 0) {
          toast.error(`At least one photo is required for Variant #${i + 1}`);
          setActiveTab('variants');
          focusElement(`upload_variant_img_${i}`);
          return;
        }
      }
    } else {
      // Single Product Mode
      if (!formData.product_mrp || Number(formData.product_mrp) <= 0) {
        toast.error('MRP is required (Tab 3: Pricing & Photos)');
        setActiveTab('pricing');
        focusElement('input_product_mrp');
        return;
      }
      if (!formData.images || formData.images.length === 0) {
        toast.error('At least one product photo is required (Tab 3: Pricing & Photos)');
        setActiveTab('pricing');
        focusElement('section_product_photos');
        return;
      }
    }

    const payloadToSave = {
      ...formData,
      has_variants: Number(formData.has_variants) === 1 ? 1 : 0,
      variants: Number(formData.has_variants) === 1 ? (formData.variants || []) : []
    };

    setIsSaving(true);
    try {
      let res;
      if (isEditing) {
        res = await updateProduct(id, payloadToSave, token);
        toast.success(res?.message || 'Product updated successfully');
      } else {
        res = await createProduct(payloadToSave, token);
        toast.success(res?.message || 'Product created successfully');
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      navigate('/products');
    } catch (err) {
      toast.error(err.message || (isEditing ? 'Failed to update product' : 'Failed to create product'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Page Top Header with Title & Cancel Button */}
        <div className="flex items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">
              Products / <span className="text-purple-600">{isEditing ? `Edit Product #${id}` : 'Create New Product'}</span>
            </div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              {isEditing ? (formData.product_name ? `Edit: ${formData.product_name}` : `Edit Product #${id}`) : 'Add New Product'}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Cancel and return to products catalog"
          >
            <span>Cancel</span>
          </button>
        </div>

        {hasDraft && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50/80 border border-purple-200/90 rounded-2xl text-xs text-purple-900 font-medium shadow-2xs animate-in fade-in">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
              You have a saved draft available from a previous session.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadDraft}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="px-2.5 py-1 text-slate-500 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <AddProductForm 
          formData={formData} 
          setFormData={setFormData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onReset={handleReset}
          onSaveDraft={handleSaveDraft}
          onSave={handleSaveProduct}
          onCancel={() => navigate('/products')}
          isEditing={isEditing}
          isSaving={isSaving}
          hasDraft={hasDraft}
        />
      </div>
    </MainLayout>
  );
}
