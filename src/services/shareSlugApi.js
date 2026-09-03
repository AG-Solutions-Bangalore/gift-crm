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
 * 1. POST /share-slug (Create Share Slug)
 * URL: https://memorycreators.in/crmapi/public/api/share-slug
 * Headers: Authorization: Bearer <token>
 * Body: { company_name: string, company_mobile: string, share_slugs: string, product_ids: string|array }
 */
export const createShareSlug = async (data, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  // Format product_ids: can be array or comma-separated string
  let productIdsStr = '';
  if (Array.isArray(data.product_ids)) {
    productIdsStr = data.product_ids.map(Number).filter((n) => !isNaN(n) && n > 0).join(',');
  } else if (typeof data.product_ids === 'string') {
    productIdsStr = data.product_ids.trim();
  } else if (data.product_ids) {
    productIdsStr = String(data.product_ids);
  }

  const payload = {
    company_name: String(data.company_name || '').trim(),
    company_mobile: String(data.company_mobile || '').trim(),
    share_slugs: String(data.share_slugs || data.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    product_ids: productIdsStr,
  };

  try {
    const response = await api.post('/share-slug', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Failed to create shareable catalog link.')
    );
  }
};

/**
 * 2. GET /share-slug (Share Slug List)
 * URL: https://memorycreators.in/crmapi/public/api/share-slug
 * Headers: Authorization: Bearer <token>
 */
export const fetchShareSlugs = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/share-slug', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Failed to fetch shareable catalog links.')
    );
  }
};
export const getShareSlugList = fetchShareSlugs;

/**
 * 3. GET /share-slug/{id} (Fetch Share Slug by ID)
 * URL: https://memorycreators.in/crmapi/public/api/share-slug/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchShareSlugById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/share-slug/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, `Failed to fetch share link #${id}.`)
    );
  }
};
export const getShareSlugById = fetchShareSlugById;

/**
 * 4. PUT /share-slug/{id} (Update Share Slug)
 * URL: https://memorycreators.in/crmapi/public/api/share-slug/{id}
 * Headers: Authorization: Bearer <token>
 * Body: { company_name, company_mobile, share_slugs, product_ids, share_slugs_status }
 */
export const updateShareSlug = async (id, data, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  let productIdsStr = '';
  if (Array.isArray(data.product_ids)) {
    productIdsStr = data.product_ids.map(Number).filter((n) => !isNaN(n) && n > 0).join(',');
  } else if (typeof data.product_ids === 'string') {
    productIdsStr = data.product_ids.trim();
  } else if (data.product_ids) {
    productIdsStr = String(data.product_ids);
  }

  const payload = {
    company_name: String(data.company_name || '').trim(),
    company_mobile: String(data.company_mobile || '').trim(),
    share_slugs: String(data.share_slugs || data.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    product_ids: productIdsStr,
    share_slugs_status: String(data.share_slugs_status || data.status || 'Active').trim(),
  };

  try {
    const response = await api.put(`/share-slug/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, `Failed to update share link #${id}.`)
    );
  }
};

/**
 * 5. PATCH /share-slugs/{id}/status (Update Share Slugs Status)
 * URL: https://memorycreators.in/crmapi/public/api/share-slugs/{id}/status
 * Headers: Authorization: Bearer <token>
 * Body: FormData with share_slugs_status (Active / Inactive)
 */
export const updateShareSlugStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const normalizedStatus =
    status === 'Active' || status === 'Inactive'
      ? status
      : status
      ? 'Active'
      : 'Inactive';

  const formData = new FormData();
  formData.append('share_slugs_status', normalizedStatus);

  try {
    // Note: status endpoint uses plural /share-slugs/{id}/status
    const response = await api.post(`/share-slugs/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    // Fallback: If /share-slugs/{id}/status fails, try /share-slug/{id}/status
    try {
      const fallbackResponse = await api.post(`/share-slug/${id}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallbackResponse.data;
    } catch (fbErr) {
      throw new Error(
        extractErrorMessage(error, 'Failed to update share link status.')
      );
    }
  }
};

export default {
  createShareSlug,
  fetchShareSlugs,
  getShareSlugList,
  fetchShareSlugById,
  getShareSlugById,
  updateShareSlug,
  updateShareSlugStatus,
};
