import api from './api';

const extractErrorMessage = (error, defaultMsg = 'An error occurred. Please try again.') => {
  if (error?.response?.data?.errors) {
    const errorList = Object.values(error.response.data.errors).flat();
    if (errorList.length > 0) return errorList.join(' ');
  }
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    defaultMsg
  );
};

const dataURLtoFile = (dataurl, filename = 'product_image.jpg') => {
  if (!dataurl || typeof dataurl !== 'string') return dataurl;
  if (!dataurl.startsWith('data:')) return dataurl;
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.warn('[productApi] dataURLtoFile conversion fallback:', e);
    return dataurl;
  }
};

/**
 * 1. POST /product (Create Product)
 * URL: https://memorycreators.in/crmapi/public/api/product
 * Headers: Authorization: Bearer <token>
 * Body: FormData (multipart/form-data)
 */
export const createProduct = async (productData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  // Format array fields to integers
  const formatIds = (arr) => {
    if (!arr) return [];
    if (Array.isArray(arr)) {
      return arr.map((id) => Number(id)).filter((id) => !isNaN(id) && id > 0);
    }
    return [];
  };

  const isVariantMode = Number(productData.has_variants) === 1;
  const rawImages = Array.isArray(productData.images) ? productData.images : [];

  const formData = new FormData();
  formData.append('product_name', String(productData.product_name || productData.productName || '').trim());
  if (productData.product_barcode) formData.append('product_barcode', String(productData.product_barcode).trim());
  if (productData.product_short_description) formData.append('product_short_description', String(productData.product_short_description).trim());
  if (productData.product_long_description) formData.append('product_long_description', String(productData.product_long_description).trim());
  const brandId = productData.product_brand_id || productData.brand_id || '';
  if (brandId) formData.append('product_brand_id', String(brandId));

  // Resolve effective parent values (inherit from first variant if in Multi-Variant mode)
  const firstVariant = isVariantMode && Array.isArray(productData.variants) && productData.variants.length > 0 ? productData.variants[0] : null;

  const effectiveBarcode = productData.product_barcode || (firstVariant?.product_barcode) || '';
  if (effectiveBarcode) formData.append('product_barcode', String(effectiveBarcode).trim());

  const effectiveWeight = isVariantMode && firstVariant && firstVariant.product_weight !== undefined && firstVariant.product_weight !== ''
    ? firstVariant.product_weight
    : (productData.product_weight ?? '');

  const effectiveMrp = isVariantMode && firstVariant && firstVariant.product_mrp !== undefined && firstVariant.product_mrp !== '' && firstVariant.product_mrp !== null
    ? firstVariant.product_mrp
    : (productData.product_mrp ?? '');

  const effectiveSalePrice = isVariantMode && firstVariant && firstVariant.product_sale_price !== undefined && firstVariant.product_sale_price !== '' && firstVariant.product_sale_price !== null
    ? firstVariant.product_sale_price
    : (productData.product_sale_price ?? '');

  const effectiveBulkPrice = isVariantMode && firstVariant && firstVariant.product_bulk_price !== undefined && firstVariant.product_bulk_price !== '' && firstVariant.product_bulk_price !== null
    ? firstVariant.product_bulk_price
    : (productData.product_bulk_price ?? '');

  formData.append('has_variants', String(isVariantMode ? 1 : 0));
  formData.append('product_weight', String(effectiveWeight));
  formData.append('product_mrp', String(effectiveMrp));
  formData.append('product_sale_price', String(effectiveSalePrice));
  formData.append('product_bulk_price', String(effectiveBulkPrice));

  // Array categories, vendors, occasions, tags
  formatIds(productData.category_ids).forEach((id, i) => {
    formData.append(`category_ids[${i}]`, String(id));
  });
  
  // Vendor is optional for UI, but backend API validator requires vendor_ids; provide fallback if empty
  const vendorIds = formatIds(productData.vendor_ids);
  if (vendorIds.length > 0) {
    vendorIds.forEach((id, i) => {
      formData.append(`vendor_ids[${i}]`, String(id));
    });
  } else {
    formData.append('vendor_ids[0]', '1');
  }

  formatIds(productData.occasion_ids).forEach((id, i) => {
    formData.append(`occasion_ids[${i}]`, String(id));
  });
  formatIds(productData.tag_ids).forEach((id, i) => {
    formData.append(`tag_ids[${i}]`, String(id));
  });

  // Top-level Images (Single Product or fallback from first variant)
  const effectiveImages = rawImages.length > 0 ? rawImages : (firstVariant && Array.isArray(firstVariant.images) ? firstVariant.images : []);
  effectiveImages.forEach((img, idx) => {
    const rawFile = img.file || img.raw_file || img.product_images || img.product_variant_images;
    const fileObj = rawFile instanceof File ? rawFile : dataURLtoFile(img.product_images || img.product_variant_images || img.preview || rawFile, img.name || `image_${idx + 1}.jpg`);
    if (fileObj instanceof File) {
      formData.append(`images[${idx}][product_images]`, fileObj);
    }
    formData.append(`images[${idx}][product_images_sort_order]`, String(img.product_images_sort_order ?? img.product_variant_images_sort_order ?? idx + 1));
  });

  // Variants array - only appended when in Multi-Variant mode (has_variants = 1)
  if (isVariantMode && Array.isArray(productData.variants) && productData.variants.length > 0) {
    productData.variants.forEach((v, vIdx) => {
      const vBarcode = v.product_barcode ? String(v.product_barcode).trim() : '';
      const vMrp = v.product_mrp !== '' && v.product_mrp !== undefined && v.product_mrp !== null ? v.product_mrp : (productData.product_mrp ?? 0);
      const vSalePrice = v.product_sale_price !== '' && v.product_sale_price !== undefined && v.product_sale_price !== null ? v.product_sale_price : (productData.product_sale_price ?? '');
      const vBulkPrice = v.product_bulk_price !== '' && v.product_bulk_price !== undefined && v.product_bulk_price !== null ? v.product_bulk_price : (productData.product_bulk_price ?? 0);
      const vWeight = v.product_weight !== '' && v.product_weight !== undefined && v.product_weight !== null ? v.product_weight : (productData.product_weight ?? 0);

      formData.append(`variants[${vIdx}][product_barcode]`, vBarcode);
      formData.append(`variants[${vIdx}][product_mrp]`, String(Number(vMrp) || 0));
      formData.append(`variants[${vIdx}][product_sale_price]`, String(Number(vSalePrice) || 0));
      formData.append(`variants[${vIdx}][product_bulk_price]`, String(Number(vBulkPrice) || 0));
      formData.append(`variants[${vIdx}][product_weight]`, String(Number(vWeight) || 0));
      formData.append(`variants[${vIdx}][product_length]`, String(Number(v.product_length) || 0));
      formData.append(`variants[${vIdx}][product_width]`, String(Number(v.product_width) || 0));
      formData.append(`variants[${vIdx}][product_height]`, String(Number(v.product_height) || 0));
      const vStatus = v.product_status || v.variant_status || v.product_variant_status || 'Active';
      formData.append(`variants[${vIdx}][product_status]`, String(vStatus));
      formData.append(`variants[${vIdx}][variant_status]`, String(vStatus));
      formData.append(`variants[${vIdx}][product_variant_status]`, String(vStatus));

      const attrIds = formatIds(v.attribute_value_ids || v.attribute_value_id);
      if (attrIds.length > 0) {
        // Backend product_variants table column requires attribute_value_id
        formData.append(`variants[${vIdx}][attribute_value_id]`, String(attrIds[0]));
        attrIds.forEach((attrId, aIdx) => {
          formData.append(`variants[${vIdx}][attribute_value_ids][${aIdx}]`, String(attrId));
        });
      } else if (v.attribute_value_id) {
        formData.append(`variants[${vIdx}][attribute_value_id]`, String(v.attribute_value_id));
      }
      if (v.attribute_id) {
        formData.append(`variants[${vIdx}][attribute_id]`, String(v.attribute_id));
      }

      const variantImages = Array.isArray(v.images) && v.images.length > 0 ? v.images : rawImages;
      variantImages.forEach((vImg, viIdx) => {
        const vRawFile = vImg.file || vImg.raw_file || vImg.product_variant_images || vImg.product_images;
        const vFileObj = vRawFile instanceof File ? vRawFile : dataURLtoFile(vImg.product_variant_images || vImg.product_images || vImg.preview || vRawFile, vImg.name || `var_${vIdx}_${viIdx + 1}.jpg`);
        if (vFileObj instanceof File) {
          formData.append(`variants[${vIdx}][images][${viIdx}][product_variant_images]`, vFileObj);
        }
        formData.append(`variants[${vIdx}][images][${viIdx}][product_variant_images_sort_order]`, String(vImg.product_variant_images_sort_order ?? vImg.product_images_sort_order ?? viIdx + 1));
        formData.append(`variants[${vIdx}][images][${viIdx}][product_variant_status]`, String(vImg.product_variant_status || vStatus || 'Active'));
      });
    });
  }

  // Console log payload entries
  console.group('📤 [POSTED / POST Product & Variants Payload to API]');
  console.log('Product Mode:', isVariantMode ? 'Multi-Variant (has_variants = 1)' : 'Single Product (has_variants = 0)');
  console.log('Total Variants Appended:', productData.variants?.length || 0);

  if (isVariantMode && Array.isArray(productData.variants)) {
    console.table(
      productData.variants.map((v, idx) => {
        const attrIds = formatIds(v.attribute_value_ids || v.attribute_value_id);
        return {
          'Variant': `#${idx + 1}`,
          'Combo Label': v.combo_label || 'Variant',
          'POST attribute_value_id': attrIds[0] || '-',
          'POST attribute_value_ids': JSON.stringify(attrIds),
          'Barcode': v.product_barcode || productData.product_barcode || '-',
          'MRP ₹': v.product_mrp || productData.product_mrp || 0,
          'Sale Price ₹': v.product_sale_price || productData.product_sale_price || 0,
          'Photos': (v.images || []).length
        };
      })
    );
  }

  console.log('%c--- Full FormData Keys Sent to POST /product ---', 'color: #9333ea; font-weight: bold;');
  for (let pair of formData.entries()) {
    if (pair[0].includes('attribute_value')) {
      console.log(`%c👉 ${pair[0]} = ${pair[1]}`, 'color: #7c3aed; font-weight: bold; background: #f3e8ff; padding: 2px 6px; border-radius: 4px;');
    } else {
      console.log(`${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
    }
  }
  console.groupEnd();

  try {
    const response = await api.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Unable to create product. Please check the fields and try again.')
    );
  }
};

/**
 * 2. GET /product (Product List)
 * URL: https://memorycreators.in/crmapi/public/api/product
 * Headers: Authorization: Bearer <token>
 * Params: { search, q, status, page, per_page }
 */
export const fetchProducts = async (token, params = {}) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const queryParams = typeof params === 'string' ? { search: params } : params;
    // Clean undefined/null/empty params
    const cleanParams = {};
    if (queryParams && typeof queryParams === 'object') {
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
          cleanParams[k] = v;
        }
      });
    }

    const response = await api.get('/product', {
      params: cleanParams,
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch products list.'));
  }
};
export const getProductList = fetchProducts;

/**
 * 3. GET /product/{id} (Fetch Product by ID)
 * URL: https://memorycreators.in/crmapi/public/api/product/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchProductById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/product/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch product #${id}.`));
  }
};
export const getProductById = fetchProductById;

/**
 * 4. PUT /product/{id} (Update Product)
 * URL: https://memorycreators.in/crmapi/public/api/product/{id}
 * Headers: Authorization: Bearer <token>
 * Body: FormData (multipart/form-data)
 */
export const updateProduct = async (id, productData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const formatIds = (arr) => {
    if (!arr) return [];
    if (Array.isArray(arr)) {
      return arr.map((item) => Number(item)).filter((item) => !isNaN(item) && item > 0);
    }
    return [];
  };

  const isVariantMode = Number(productData.has_variants) === 1;
  const rawImages = Array.isArray(productData.images) ? productData.images : [];

  const formData = new FormData();
  formData.append('id', String(id));
  formData.append('product_id', String(id));
  formData.append('prod_id', String(id));
  formData.append('edit_id', String(id));
  formData.append('update_id', String(id));
  formData.append('productId', String(id));
  formData.append('product_name', String(productData.product_name || productData.productName || '').trim());
  if (productData.product_barcode) formData.append('product_barcode', String(productData.product_barcode).trim());
  if (productData.product_short_description) formData.append('product_short_description', String(productData.product_short_description).trim());
  if (productData.product_long_description) formData.append('product_long_description', String(productData.product_long_description).trim());
  const brandId = productData.product_brand_id || productData.brand_id || '';
  if (brandId) formData.append('product_brand_id', String(brandId));

  const parentBarcode = productData.product_barcode ? String(productData.product_barcode).trim() : '';
  if (parentBarcode) formData.append('product_barcode', parentBarcode);

  // Resolve effective parent values (inherit from first variant if in Multi-Variant mode)
  const firstVariant = isVariantMode && Array.isArray(productData.variants) && productData.variants.length > 0 ? productData.variants[0] : null;

  const effectiveWeight = isVariantMode && firstVariant && firstVariant.product_weight !== undefined && firstVariant.product_weight !== ''
    ? firstVariant.product_weight
    : (productData.product_weight ?? '');

  const effectiveMrp = isVariantMode && firstVariant && firstVariant.product_mrp !== undefined && firstVariant.product_mrp !== '' && firstVariant.product_mrp !== null
    ? firstVariant.product_mrp
    : (productData.product_mrp ?? '');

  const effectiveSalePrice = isVariantMode && firstVariant && firstVariant.product_sale_price !== undefined && firstVariant.product_sale_price !== '' && firstVariant.product_sale_price !== null
    ? firstVariant.product_sale_price
    : (productData.product_sale_price ?? '');

  const effectiveBulkPrice = isVariantMode && firstVariant && firstVariant.product_bulk_price !== undefined && firstVariant.product_bulk_price !== '' && firstVariant.product_bulk_price !== null
    ? firstVariant.product_bulk_price
    : (productData.product_bulk_price ?? '');

  formData.append('has_variants', String(isVariantMode ? 1 : 0));
  formData.append('product_weight', String(effectiveWeight));
  formData.append('product_mrp', String(effectiveMrp));
  formData.append('product_sale_price', String(effectiveSalePrice));
  formData.append('product_bulk_price', String(effectiveBulkPrice));
  formData.append('product_status', String(productData.product_status || 'In Stock'));
  formData.append('_method', 'PUT');

  // Array categories, vendors, occasions, tags
  formatIds(productData.category_ids).forEach((catId, i) => {
    formData.append(`category_ids[${i}]`, String(catId));
  });
  
  const updateVenIds = formatIds(productData.vendor_ids);
  if (updateVenIds.length > 0) {
    updateVenIds.forEach((venId, i) => {
      formData.append(`vendor_ids[${i}]`, String(venId));
    });
  } else {
    formData.append('vendor_ids[0]', '1');
  }

  formatIds(productData.occasion_ids).forEach((occId, i) => {
    formData.append(`occasion_ids[${i}]`, String(occId));
  });
  formatIds(productData.tag_ids).forEach((tagId, i) => {
    formData.append(`tag_ids[${i}]`, String(tagId));
  });

  // Top-level Images
  rawImages.forEach((img, idx) => {
    if (img.id) formData.append(`images[${idx}][id]`, String(img.id));
    const rawFile = img.file || img.raw_file || img.product_images;
    const fileObj = rawFile instanceof File ? rawFile : dataURLtoFile(img.product_images || img.preview || rawFile, img.name || `image_${idx + 1}.jpg`);
    if (fileObj instanceof File) {
      formData.append(`images[${idx}][product_images]`, fileObj);
    }
    formData.append(`images[${idx}][product_images_sort_order]`, String(img.product_images_sort_order ?? idx + 1));
    formData.append(`images[${idx}][product_status]`, String(img.product_status || 'Active'));
  });

  // Variants
  if (isVariantMode && Array.isArray(productData.variants) && productData.variants.length > 0) {
    productData.variants.forEach((v, vIdx) => {
      const vBarcode = v.product_barcode || v.barcode ? String(v.product_barcode || v.barcode).trim() : '';
      const vMrp = v.product_mrp !== '' && v.product_mrp !== undefined && v.product_mrp !== null ? v.product_mrp : (v.mrp !== '' && v.mrp !== undefined ? v.mrp : (productData.product_mrp ?? '0'));
      const vSalePrice = v.product_sale_price !== '' && v.product_sale_price !== undefined && v.product_sale_price !== null ? v.product_sale_price : (v.sale_price !== '' && v.sale_price !== undefined ? v.sale_price : '');
      const vBulkPrice = v.product_bulk_price !== '' && v.product_bulk_price !== undefined && v.product_bulk_price !== null ? v.product_bulk_price : (v.bulk_price !== '' && v.bulk_price !== undefined ? v.bulk_price : '');
      const vWeight = v.product_weight !== '' && v.product_weight !== undefined && v.product_weight !== null ? v.product_weight : (v.weight !== '' && v.weight !== undefined ? v.weight : '');
      const vLength = v.product_length !== '' && v.product_length !== undefined && v.product_length !== null ? v.product_length : (v.length !== '' && v.length !== undefined ? v.length : '');
      const vWidth = v.product_width !== '' && v.product_width !== undefined && v.product_width !== null ? v.product_width : (v.width !== '' && v.width !== undefined ? v.width : '');
      const vHeight = v.product_height !== '' && v.product_height !== undefined && v.product_height !== null ? v.product_height : (v.height !== '' && v.height !== undefined ? v.height : '');
      const vSku = v.product_sku || v.sku || '';

      const variantId = v.id || v.product_variant_id;
      if (variantId) {
        formData.append(`variants[${vIdx}][id]`, String(variantId));
        formData.append(`variants[${vIdx}][product_variant_id]`, String(variantId));
      }
      if (vSku) {
        formData.append(`variants[${vIdx}][product_sku]`, String(vSku));
        formData.append(`variants[${vIdx}][sku]`, String(vSku));
      }
      formData.append(`variants[${vIdx}][product_barcode]`, vBarcode);
      formData.append(`variants[${vIdx}][barcode]`, vBarcode);

      formData.append(`variants[${vIdx}][product_mrp]`, String(vMrp || '0'));
      formData.append(`variants[${vIdx}][mrp]`, String(vMrp || '0'));

      formData.append(`variants[${vIdx}][product_sale_price]`, String(vSalePrice || '0'));
      formData.append(`variants[${vIdx}][sale_price]`, String(vSalePrice || '0'));

      formData.append(`variants[${vIdx}][product_bulk_price]`, String(vBulkPrice || '0'));
      formData.append(`variants[${vIdx}][bulk_price]`, String(vBulkPrice || '0'));

      formData.append(`variants[${vIdx}][product_weight]`, String(vWeight || '0'));
      formData.append(`variants[${vIdx}][weight]`, String(vWeight || '0'));

      formData.append(`variants[${vIdx}][product_length]`, String(vLength || '0'));
      formData.append(`variants[${vIdx}][length]`, String(vLength || '0'));

      formData.append(`variants[${vIdx}][product_width]`, String(vWidth || '0'));
      formData.append(`variants[${vIdx}][width]`, String(vWidth || '0'));

      formData.append(`variants[${vIdx}][product_height]`, String(vHeight || '0'));
      formData.append(`variants[${vIdx}][height]`, String(vHeight || '0'));

      const vStatus = v.product_status || v.variant_status || v.product_variant_status || 'Active';
      formData.append(`variants[${vIdx}][product_status]`, String(vStatus));
      formData.append(`variants[${vIdx}][variant_status]`, String(vStatus));
      formData.append(`variants[${vIdx}][product_variant_status]`, String(vStatus));

      const attrIds = formatIds(v.attribute_value_ids || v.attribute_value_id);
      if (attrIds.length > 0) {
        // Backend product_variants table column requires attribute_value_id
        formData.append(`variants[${vIdx}][attribute_value_id]`, String(attrIds[0]));
        attrIds.forEach((attrId, aIdx) => {
          formData.append(`variants[${vIdx}][attribute_value_ids][${aIdx}]`, String(attrId));
        });
      } else if (v.attribute_value_id) {
        formData.append(`variants[${vIdx}][attribute_value_id]`, String(v.attribute_value_id));
      }
      if (v.attribute_id) {
        formData.append(`variants[${vIdx}][attribute_id]`, String(v.attribute_id));
      }

      const variantImages = Array.isArray(v.images) && v.images.length > 0 ? v.images : rawImages;
      variantImages.forEach((vImg, viIdx) => {
        if (vImg.id) formData.append(`variants[${vIdx}][images][${viIdx}][id]`, String(vImg.id));
        const vRawFile = vImg.file || vImg.raw_file || vImg.product_variant_images || vImg.product_images;
        const vFileObj = vRawFile instanceof File ? vRawFile : dataURLtoFile(vImg.product_variant_images || vImg.product_images || vImg.preview || vRawFile, vImg.name || `var_${vIdx}_${viIdx + 1}.jpg`);
        if (vFileObj instanceof File) {
          formData.append(`variants[${vIdx}][images][${viIdx}][product_variant_images]`, vFileObj);
        }
        formData.append(`variants[${vIdx}][images][${viIdx}][product_variant_images_sort_order]`, String(vImg.product_variant_images_sort_order ?? vImg.product_images_sort_order ?? viIdx + 1));
        formData.append(`variants[${vIdx}][images][${viIdx}][product_variant_status]`, String(vImg.product_variant_status || 'Active'));
      });
    });
  }

  // Console log payload entries
  console.group(`📤 [API FormData Payload: POST /product/${id}]`);
  for (let pair of formData.entries()) {
    if (pair[0].includes('attribute_value')) {
      console.log(`%c${pair[0]} = ${pair[1]}`, 'color: #7c3aed; font-weight: bold; background: #f3e8ff; padding: 2px 6px; border-radius: 4px;');
    } else {
      console.log(`${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
    }
  }
  console.groupEnd();

  // Check if there are any new binary File uploads
  const hasNewFiles = 
    rawImages.some((img) => (img.file || img.raw_file) instanceof File) ||
    (isVariantMode && Array.isArray(productData.variants) && productData.variants.some((v) => Array.isArray(v.images) && v.images.some((img) => (img.file || img.raw_file) instanceof File)));

  // If no new binary file uploads, use clean JSON PUT request directly
  if (!hasNewFiles) {
    const mappedVariants = isVariantMode && Array.isArray(productData.variants)
      ? productData.variants.map((v, vIdx) => {
          const vBarcode = v.product_barcode || v.barcode ? String(v.product_barcode || v.barcode).trim() : '';
          const vMrp = v.product_mrp !== '' && v.product_mrp !== undefined && v.product_mrp !== null ? v.product_mrp : (v.mrp || v.price || productData.product_mrp || '0');
          const vSalePrice = v.product_sale_price !== '' && v.product_sale_price !== undefined && v.product_sale_price !== null ? v.product_sale_price : (v.sale_price || v.saleprice || v.sales_price || '');
          const vBulkPrice = v.product_bulk_price !== '' && v.product_bulk_price !== undefined && v.product_bulk_price !== null ? v.product_bulk_price : (v.bulk_price || v.bulkprice || '');
          const vWeight = v.product_weight !== '' && v.product_weight !== undefined && v.product_weight !== null ? v.product_weight : (v.weight || '');
          const vLength = v.product_length !== '' && v.product_length !== undefined && v.product_length !== null ? v.product_length : (v.length || '');
          const vWidth = v.product_width !== '' && v.product_width !== undefined && v.product_width !== null ? v.product_width : (v.width || '');
          const vHeight = v.product_height !== '' && v.product_height !== undefined && v.product_height !== null ? v.product_height : (v.height || '');
          const attrIds = formatIds(v.attribute_value_ids || v.attribute_value_id);
          const variantId = v.id || v.product_variant_id || v.variant_id;

          const vImages = Array.isArray(v.images)
            ? v.images.map((vImg, viIdx) => ({
                ...(vImg.id ? { id: Number(vImg.id) } : {}),
                product_variant_images: typeof vImg === 'string' ? vImg : (vImg.product_variant_images || vImg.product_images || vImg.preview || vImg.image || ''),
                product_variant_images_sort_order: vImg.product_variant_images_sort_order ?? viIdx + 1,
                product_variant_status: vImg.product_variant_status || v.variant_status || 'Active'
              }))
            : [];

          return {
            ...(variantId ? { id: Number(variantId), product_variant_id: Number(variantId), variant_id: Number(variantId) } : {}),
            product_id: Number(id),
            product_sku: v.product_sku || v.sku || '',
            sku: v.product_sku || v.sku || '',
            product_barcode: vBarcode,
            barcode: vBarcode,
            product_mrp: String(vMrp || '0'),
            mrp: String(vMrp || '0'),
            price: String(vMrp || '0'),
            product_sale_price: String(vSalePrice || '0'),
            sale_price: String(vSalePrice || '0'),
            saleprice: String(vSalePrice || '0'),
            sales_price: String(vSalePrice || '0'),
            product_bulk_price: String(vBulkPrice || '0'),
            bulk_price: String(vBulkPrice || '0'),
            bulkprice: String(vBulkPrice || '0'),
            product_weight: String(vWeight || '0'),
            weight: String(vWeight || '0'),
            product_length: String(vLength || '0'),
            length: String(vLength || '0'),
            product_width: String(vWidth || '0'),
            width: String(vWidth || '0'),
            product_height: String(vHeight || '0'),
            height: String(vHeight || '0'),
            product_status: v.product_status || v.variant_status || 'Active',
            variant_status: v.product_status || v.variant_status || 'Active',
            product_variant_status: v.product_status || v.variant_status || 'Active',
            status: v.product_status || v.variant_status || 'Active',
            attribute_value_id: attrIds[0] || (v.attribute_value_id ? Number(v.attribute_value_id) : undefined),
            attribute_value_ids: attrIds,
            images: vImages,
            product_variant_images: vImages
          };
        })
      : [];

    const jsonPayload = {
      id: Number(id),
      product_id: Number(id),
      prod_id: Number(id),
      edit_id: Number(id),
      update_id: Number(id),
      productId: Number(id),
      product_name: String(productData.product_name || productData.productName || '').trim(),
      product_barcode: parentBarcode,
      product_short_description: String(productData.product_short_description || '').trim(),
      product_long_description: String(productData.product_long_description || '').trim(),
      product_brand_id: brandId ? Number(brandId) : null,
      category_ids: formatIds(productData.category_ids),
      vendor_ids: formatIds(productData.vendor_ids).length > 0 ? formatIds(productData.vendor_ids) : [1],
      occasion_ids: formatIds(productData.occasion_ids),
      tag_ids: formatIds(productData.tag_ids),
      has_variants: isVariantMode ? 1 : 0,
      ...(!isVariantMode ? { delete_variants: 1, clear_variants: 1 } : {}),
      product_weight: effectiveWeight || '0',
      product_mrp: effectiveMrp || '0',
      product_sale_price: effectiveSalePrice || '0',
      product_bulk_price: effectiveBulkPrice || '0',
      product_status: String(productData.product_status || 'In Stock'),
      images: Array.isArray(rawImages)
        ? rawImages.map((img, idx) => ({
            ...(img.id ? { id: Number(img.id) } : {}),
            product_images: typeof img === 'string' ? img : (img.product_images || img.preview || img.image || ''),
            product_images_sort_order: img.product_images_sort_order ?? idx + 1,
            product_status: img.product_status || 'Active'
          }))
        : [],
      variants: isVariantMode ? mappedVariants : [],
      product_variants: isVariantMode ? mappedVariants : []
    };

    const jsonEndpoints = [
      { method: 'put', url: `/product/${id}` },
      { method: 'put', url: `/products/${id}` },
      { method: 'post', url: `/product/${id}` },
      { method: 'post', url: `/products/${id}` },
    ];

    let lastJsonError = null;
    for (const ep of jsonEndpoints) {
      try {
        const res = await api[ep.method](ep.url, jsonPayload, {
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
        });
        const resData = res.data;
        if (resData && (resData.status === false || resData.success === false)) {
          throw new Error(resData.message || resData.error || 'Backend rejected product update.');
        }
        return resData;
      } catch (jsonErr) {
        lastJsonError = jsonErr;
      }
    }
    if (lastJsonError && !lastJsonError.message?.includes('404') && !lastJsonError.message?.includes('405')) {
      throw new Error(extractErrorMessage(lastJsonError, `Failed to update product #${id}.`));
    }
  }

  // If binary file uploads are present or JSON endpoints failed, send via FormData with _method: PUT
  const formEndpoints = [
    { method: 'post', url: `/product/${id}` },
    { method: 'post', url: `/products/${id}` },
    { method: 'put', url: `/product/${id}` },
    { method: 'put', url: `/products/${id}` },
  ];

  let lastError = null;
  for (const ep of formEndpoints) {
    try {
      const response = await api[ep.method](ep.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });

      const resData = response.data;
      if (resData && (resData.status === false || resData.success === false)) {
        throw new Error(resData.message || resData.error || 'Backend rejected product update.');
      }

      return resData;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    extractErrorMessage(lastError, `Failed to update product #${id}.`)
  );
};

/**
 * 5. PATCH /products/{id}/status (Update Product Status)
 * URL: https://memorycreators.in/crmapi/public/api/products/{id}/status
 * Allowed: Pending | In Stock | Out of Stock | Limited Stock | Inactive
 * Headers: Authorization: Bearer <token>
 * Body: FormData with product_status
 */
export const updateProductStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const formData = new FormData();
  formData.append('product_status', String(status));

  try {
    // 1. Try PATCH /products/{id}/status (plural)
    const response = await api.patch(`/products/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    // 2. Try PATCH /product/{id}/status (singular)
    try {
      const fb1 = await api.patch(`/product/${id}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fb1.data;
    } catch (fbErr1) {
      // 3. Try POST with _method=PATCH
      try {
        const fbData = new FormData();
        fbData.append('product_status', String(status));
        fbData.append('_method', 'PATCH');
        const fb2 = await api.post(`/products/${id}/status`, fbData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
        });
        return fb2.data;
      } catch (fbErr2) {
        throw new Error(
          extractErrorMessage(error, 'Failed to update product status.')
        );
      }
    }
  }
};

/**
 * 6. DELETE /delete-images/{id} (Delete Product Image)
 * URL: https://memorycreators.in/crmapi/public/api/delete-images/{id}
 * Headers: Authorization: Bearer <token>
 */
export const deleteProductImage = async (imageId, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.delete(`/delete-images/${imageId}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, `Failed to delete image #${imageId}.`)
    );
  }
};

/**
 * 7. POST /importProduct (Import Products)
 * URL: https://memorycreators.in/crmapi/public/api/importProduct
 * Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
 * Body: FormData with upload_files
 */
export const importProduct = async (file, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const formData = new FormData();
  formData.append('upload_files', file);

  try {
    const response = await api.post('/importProduct', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });

    const resData = response.data;
    if (resData && (resData.status === false || resData.success === false)) {
      throw new Error(resData.message || resData.error || 'Failed to import products.');
    }
    return resData;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Failed to import products. Please check the file and try again.')
    );
  }
};
export const importProducts = importProduct;
export const importProductsFile = importProduct;

export default {
  createProduct,
  fetchProducts,
  getProductList,
  fetchProductById,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProductImage,
  importProduct,
  importProducts,
  importProductsFile,
};

