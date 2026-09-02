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

/**
 * 1. POST /product (Create Product)
 * URL: https://memorycreators.in/crmapi/public/api/product
 * Headers: Authorization: Bearer <token>
 * Body: raw (json)
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

  const payload = {
    product_name: String(productData.product_name || productData.productName || '').trim(),
    product_barcode: String(productData.product_barcode || productData.barcode || '').trim(),
    product_short_description: String(productData.product_short_description || productData.shortDescription || '').trim(),
    product_long_description: String(productData.product_long_description || productData.longDescription || '').trim(),
    product_brand_id: productData.product_brand_id ? Number(productData.product_brand_id) : '',
    category_ids: formatIds(productData.category_ids),
    vendor_ids: formatIds(productData.vendor_ids),
    occasion_ids: formatIds(productData.occasion_ids),
    tag_ids: formatIds(productData.tag_ids),
    has_variants: Number(productData.has_variants === 0 ? 0 : 1),
    // When has_variants === 1 (Single/Simple Product)
    product_weight: Number(productData.has_variants) === 1 ? (productData.product_weight ?? '') : '',
    product_mrp: Number(productData.has_variants) === 1 ? (productData.product_mrp ?? '') : '',
    product_sale_price: Number(productData.has_variants) === 1 ? (productData.product_sale_price ?? '') : '',
    product_bulk_price: Number(productData.has_variants) === 1 ? (productData.product_bulk_price ?? '') : '',
    images:
      Number(productData.has_variants) === 1 && Array.isArray(productData.images)
        ? productData.images.map((img, idx) => ({
            product_images: String(img.product_images || img.image || img.url || img || ''),
            product_images_sort_order: Number(img.product_images_sort_order ?? idx + 1),
          }))
        : [],
    // When has_variants === 0 (Has Variants Builder)
    variants:
      Number(productData.has_variants) === 0 && Array.isArray(productData.variants)
        ? productData.variants.map((v) => ({
            product_barcode: String(v.product_barcode || '').trim(),
            product_mrp: Number(v.product_mrp ?? 0),
            product_sale_price: Number(v.product_sale_price ?? 0),
            product_bulk_price: Number(v.product_bulk_price ?? 0),
            product_weight: Number(v.product_weight ?? 0),
            product_length: Number(v.product_length ?? 0),
            product_width: Number(v.product_width ?? 0),
            product_height: Number(v.product_height ?? 0),
            attribute_value_ids: formatIds(v.attribute_value_ids),
            images: Array.isArray(v.images)
              ? v.images.map((img, imgIdx) => ({
                  product_variant_images: String(img.product_variant_images || img.image || img.url || img || ''),
                  product_variant_images_sort_order: Number(img.product_variant_images_sort_order ?? imgIdx + 1),
                }))
              : [],
          }))
        : [],
  };

  try {
    const response = await api.post('/product', payload, {
      headers: {
        'Content-Type': 'application/json',
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
 */
export const fetchProducts = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/product', {
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
 * Body: raw (json)
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

  const payload = {
    product_name: String(productData.product_name || productData.productName || '').trim(),
    product_barcode: String(productData.product_barcode || productData.barcode || '').trim(),
    product_short_description: String(productData.product_short_description || productData.shortDescription || '').trim(),
    product_long_description: String(productData.product_long_description || productData.longDescription || '').trim(),
    product_brand_id: productData.product_brand_id ? Number(productData.product_brand_id) : '',
    category_ids: formatIds(productData.category_ids),
    vendor_ids: formatIds(productData.vendor_ids),
    occasion_ids: formatIds(productData.occasion_ids),
    tag_ids: formatIds(productData.tag_ids),
    has_variants: Number(productData.has_variants === 0 ? 0 : 1),
    // When has_variants === 1 (Single/Simple Product)
    product_weight: Number(productData.has_variants) === 1 ? (productData.product_weight ?? '') : '',
    product_mrp: Number(productData.has_variants) === 1 ? (productData.product_mrp ?? '') : '',
    product_sale_price: Number(productData.has_variants) === 1 ? (productData.product_sale_price ?? '') : '',
    product_bulk_price: Number(productData.has_variants) === 1 ? (productData.product_bulk_price ?? '') : '',
    product_status: String(productData.product_status || 'In Stock'),
    images:
      Number(productData.has_variants) === 1 && Array.isArray(productData.images)
        ? productData.images.map((img, idx) => ({
            id: img.id ? String(img.id) : undefined,
            product_images: String(img.product_images || img.image || img.url || img || ''),
            product_images_sort_order: Number(img.product_images_sort_order ?? idx + 1),
            product_status: String(img.product_status || 'Active'),
          }))
        : [],
    // When has_variants === 0 (Has Variants Builder)
    variants:
      Number(productData.has_variants) === 0 && Array.isArray(productData.variants)
        ? productData.variants.map((v) => ({
            id: v.id ? Number(v.id) : undefined,
            product_barcode: String(v.product_barcode || '').trim(),
            product_mrp: Number(v.product_mrp ?? 0),
            product_sale_price: Number(v.product_sale_price ?? 0),
            product_bulk_price: Number(v.product_bulk_price ?? 0),
            product_weight: Number(v.product_weight ?? 0),
            product_length: Number(v.product_length ?? 0),
            product_width: Number(v.product_width ?? 0),
            product_height: Number(v.product_height ?? 0),
            attribute_value_ids: formatIds(v.attribute_value_ids),
            variant_status: String(v.variant_status || 'Active'),
            images: Array.isArray(v.images)
              ? v.images.map((img, imgIdx) => ({
                  id: img.id ? Number(img.id) : undefined,
                  product_variant_images: String(img.product_variant_images || img.image || img.url || img || ''),
                  product_variant_images_sort_order: Number(img.product_variant_images_sort_order ?? imgIdx + 1),
                  product_variant_status: String(img.product_variant_status || 'Active'),
                }))
              : [],
          }))
        : [],
  };

  try {
    const response = await api.put(`/product/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, `Failed to update product #${id}.`)
    );
  }
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
    const response = await api.post(`/products/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    // Fallback: If /products/{id}/status fails, try /product/{id}/status
    try {
      const fallbackResponse = await api.post(`/product/${id}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallbackResponse.data;
    } catch (fbErr) {
      throw new Error(
        extractErrorMessage(error, 'Failed to update product status.')
      );
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

export default {
  createProduct,
  fetchProducts,
  getProductList,
  fetchProductById,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProductImage,
};
