// Category API Service - All 6 Category Endpoints
import { api } from './api';

const extractErrorMessage = (error, defaultMsg = 'Operation failed') => {
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
 * 1. POST /category (Create Category)
 * URL: https://memorycreators.in/crmapi/public/api/category
 * Headers: Authorization: Bearer <token>
 * Body: { parent_id, categories_name, categories_slug, isTop, isSubTop, categories_sort_order, categories_image }
 */
export const createCategory = async (categoryData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  // [RULE CONDITION]: Check if parent_id has a selected parent category ID
  // If parent_id is empty, "none", or "null" -> it's a Top-Level category (hasParent = false)
  // If parent_id has an ID (e.g. Cake/Flowers ID) -> it's a Sub-Category (hasParent = true)
  const hasParent =
    categoryData.parent_id &&
    String(categoryData.parent_id).trim() !== '' &&
    String(categoryData.parent_id).trim() !== 'none' &&
    String(categoryData.parent_id).trim() !== 'null';

  // [RULE CONDITION - isTop]:
  // - If hasParent is true (Sub-Category): isTop is forced to 0.
  // - If hasParent is false (Top-Level): isTop uses admin's checkbox choice (default 1).
  const isTopVal = hasParent ? 0 : Number(categoryData.isTop ?? 1);

  // [RULE CONDITION - isSubTop]:
  // - If hasParent is true (Sub-Category): isSubTop uses admin's checkbox choice (default 1).
  // - If hasParent is false (Top-Level): isSubTop is forced to 0.
  const isSubTopVal = hasParent ? Number(categoryData.isSubTop ?? 1) : 0;

  const imgFile =
    categoryData.image_file ||
    (categoryData.categories_image instanceof File ? categoryData.categories_image : null);

  // If binary image file is attached, send via FormData
  if (imgFile) {
    const formData = new FormData();
    if (hasParent) {
      formData.append('parent_id', String(categoryData.parent_id).trim());
    }
    formData.append('categories_name', String(categoryData.categories_name || categoryData.name || '').trim());
    formData.append('categories_slug', String(categoryData.categories_slug || categoryData.slug || '').trim());
    formData.append('isTop', String(isTopVal));
    formData.append('isSubTop', String(isSubTopVal));
    formData.append('categories_sort_order', String(categoryData.categories_sort_order || categoryData.sort || '1'));
    formData.append('categories_image', imgFile);

    try {
      const response = await api.post('/category', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to create category.'));
    }
  }

  // Otherwise send clean JSON payload
  const payload = {
    parent_id: hasParent ? String(categoryData.parent_id).trim() : null,
    categories_name: String(categoryData.categories_name || categoryData.name || '').trim(),
    categories_slug: String(categoryData.categories_slug || categoryData.slug || '').trim(),
    isTop: isTopVal,
    isSubTop: isSubTopVal,
    categories_sort_order: String(categoryData.categories_sort_order || categoryData.sort || '1'),
    categories_image: String(categoryData.categories_image || categoryData.image || '').trim(),
  };

  try {
    const response = await api.post('/category', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to create category.'));
  }
};

/**
 * 2. GET /category (Category List)
 * URL: https://memorycreators.in/crmapi/public/api/category
 * Headers: Authorization: Bearer <token>
 */
export const fetchCategories = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/category', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch categories.'));
  }
};
export const getCategoryList = fetchCategories;
export const fetchCategoryList = fetchCategories;

/**
 * 3. GET /category/{id} (Fetch Category by ID)
 * URL: https://memorycreators.in/crmapi/public/api/category/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchCategoryById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/category/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch category #${id}.`));
  }
};
export const getCategoryById = fetchCategoryById;

/**
 * 4. PUT /category/{id} (Update Category)
 * URL: https://memorycreators.in/crmapi/public/api/category/{id}
 * Headers: Authorization: Bearer <token>
 * Body: { parent_id, categories_name, categories_slug, isTop, isSubTop, categories_sort_order, categories_image, categories_status }
 */
export const updateCategory = async (id, categoryData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  // [RULE CONDITION]: Check if parent_id has a selected parent category ID
  const hasParent =
    categoryData.parent_id &&
    String(categoryData.parent_id).trim() !== '' &&
    String(categoryData.parent_id).trim() !== 'none' &&
    String(categoryData.parent_id).trim() !== 'null';

  // [RULE CONDITION - isTop & isSubTop values]:
  const isTopVal = hasParent ? 0 : Number(categoryData.isTop ?? 1);
  const isSubTopVal = hasParent ? Number(categoryData.isSubTop ?? 1) : 0;
  const statusVal = String(categoryData.categories_status || categoryData.status || 'Active').trim();

  const imgFile =
    categoryData.image_file ||
    (categoryData.categories_image instanceof File ? categoryData.categories_image : null);

  // If a NEW binary file is selected, send via FormData
  if (imgFile) {
    const formData = new FormData();
    if (hasParent) {
      formData.append('parent_id', String(categoryData.parent_id).trim());
    }
    formData.append('categories_name', String(categoryData.categories_name || categoryData.name || '').trim());
    formData.append('categories_slug', String(categoryData.categories_slug || categoryData.slug || '').trim());
    formData.append('isTop', String(isTopVal));
    formData.append('isSubTop', String(isSubTopVal));
    formData.append('categories_sort_order', String(categoryData.categories_sort_order || categoryData.sort || '1'));
    formData.append('categories_status', statusVal);
    formData.append('categories_image', imgFile);
    formData.append('_method', 'PUT');

    try {
      const response = await api.post(`/category/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to update category.'));
    }
  }

  // Otherwise send JSON payload WITHOUT categories_image string to prevent Laravel image validator error
  const payload = {
    parent_id: hasParent ? String(categoryData.parent_id).trim() : null,
    categories_name: String(categoryData.categories_name || categoryData.name || '').trim(),
    categories_slug: String(categoryData.categories_slug || categoryData.slug || '').trim(),
    isTop: isTopVal,
    isSubTop: isSubTopVal,
    categories_sort_order: String(categoryData.categories_sort_order || categoryData.sort || '1'),
    categories_status: statusVal,
  };

  try {
    const response = await api.put(`/category/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (putErr) {
    // Fallback: try POST with _method=PUT
    try {
      const fbData = new FormData();
      if (hasParent) fbData.append('parent_id', String(categoryData.parent_id).trim());
      fbData.append('categories_name', payload.categories_name);
      fbData.append('categories_slug', payload.categories_slug);
      fbData.append('isTop', String(isTopVal));
      fbData.append('isSubTop', String(isSubTopVal));
      fbData.append('categories_sort_order', payload.categories_sort_order);
      fbData.append('categories_status', statusVal);
      fbData.append('_method', 'PUT');

      const response = await api.post(`/category/${id}`, fbData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to update category.'));
    }
  }
};

/**
 * 5. PATCH /categorys/{id}/status (Update Category Status)
 * URL: https://memorycreators.in/crmapi/public/api/categorys/{id}/status
 * Headers: Authorization: Bearer <token>
 * Body (FormData): categories_status
 */
export const updateCategoryStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const cleanStatus = String(status || 'Active').trim();

  const formData = new FormData();
  formData.append('categories_status', cleanStatus);

  try {
    // Primary path: /categorys/{id}/status
    const response = await api.patch(`/categorys/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (patchErr) {
    try {
      // Fallback: POST /categorys/{id}/status with _method=PATCH
      const fbData = new FormData();
      fbData.append('categories_status', cleanStatus);
      fbData.append('_method', 'PATCH');
      const response = await api.post(`/categorys/${id}/status`, fbData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (fbErr) {
      try {
        // Fallback: /categories/{id}/status
        const response = await api.patch(`/categories/${id}/status`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error, 'Unable to update category status.'));
      }
    }
  }
};
export const changeCategoryStatus = updateCategoryStatus;

/**
 * 6. GET /activeCategories (Active Categories List)
 * URL: https://memorycreators.in/crmapi/public/api/activeCategories
 * Headers: Authorization: Bearer <token>
 */
export const fetchActiveCategories = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/activeCategories', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch active categories.'));
  }
};
export const getActiveCategories = fetchActiveCategories;

export default {
  createCategory,
  fetchCategories,
  getCategoryList,
  fetchCategoryList,
  fetchCategoryById,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  changeCategoryStatus,
  fetchActiveCategories,
  getActiveCategories,
};
