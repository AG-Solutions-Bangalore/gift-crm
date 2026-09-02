// Occasion API Service - All 6 Occasions Endpoints
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

export const generateOccasionSlug = (name = '') => {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * 1. POST /occasion (Create Occasion)
 * URL: https://memorycreators.in/crmapi/public/api/occasion
 * Headers: Authorization: Bearer <token>, Content-Type: application/json
 * Body: { "occasions_name": "", "occasions_slug": "" }
 */
export const createOccasion = async (occasionData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const occasionsName = String(
    occasionData.occasions_name || occasionData.name || ''
  ).trim();
  const rawSlug = occasionData.occasions_slug || occasionData.slug || '';
  const occasionsSlug = String(rawSlug).trim() || generateOccasionSlug(occasionsName);

  const payload = {
    occasions_name: occasionsName,
    occasions_slug: occasionsSlug,
  };

  try {
    const response = await api.post('/occasion', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Unable to create occasion. Please check the details and try again.')
    );
  }
};

/**
 * 2. GET /occasion (Occasion List)
 * URL: https://memorycreators.in/crmapi/public/api/occasion
 * Headers: Authorization: Bearer <token>
 */
export const fetchOccasions = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/occasion', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    // Fallback: If backend OccasionService.php has a paginate() bug, try /activeOccasions
    try {
      console.warn('[occasionApi] /occasion error, trying /activeOccasions fallback:', error.message);
      const fallbackResponse = await api.get('/activeOccasions', {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallbackResponse.data;
    } catch (fbErr) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch occasions list.'));
    }
  }
};
export const getOccasionList = fetchOccasions;
export const fetchOccasionList = fetchOccasions;

/**
 * 3. GET /occasion/{id} (Fetch Occasion by ID)
 * URL: https://memorycreators.in/crmapi/public/api/occasion/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchOccasionById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/occasion/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch occasion #${id}.`));
  }
};
export const getOccasionById = fetchOccasionById;

/**
 * 4. PUT /occasion/{id} (Update Occasion)
 * URL: https://memorycreators.in/crmapi/public/api/occasion/{id}
 * Headers: Authorization: Bearer <token>, Content-Type: application/json
 * Body: { "occasions_name": "", "occasions_slug": "", "occasions_status": "Active" }
 */
export const updateOccasion = async (id, occasionData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const occasionsName = String(
    occasionData.occasions_name || occasionData.name || ''
  ).trim();
  const rawSlug = occasionData.occasions_slug || occasionData.slug || '';
  const occasionsSlug = String(rawSlug).trim() || generateOccasionSlug(occasionsName);
  const occasionsStatus = String(
    occasionData.occasions_status || occasionData.status || 'Active'
  ).trim();

  const payload = {
    occasions_name: occasionsName,
    occasions_slug: occasionsSlug,
    occasions_status: occasionsStatus,
  };

  try {
    const response = await api.put(`/occasion/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (putErr) {
    // Fallback: try POST with _method=PUT or FormData if server requires it
    try {
      const fbData = new FormData();
      fbData.append('occasions_name', payload.occasions_name);
      fbData.append('occasions_slug', payload.occasions_slug);
      fbData.append('occasions_status', payload.occasions_status);
      fbData.append('_method', 'PUT');

      const response = await api.post(`/occasion/${id}`, fbData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to update occasion.'));
    }
  }
};

/**
 * 5. PATCH /occasions/{id}/status (Update Occasions Status)
 * URL: https://memorycreators.in/crmapi/public/api/occasions/{id}/status
 * Headers: Authorization: Bearer <token>
 * Body (FormData): occasions_status ("Active" / "Inactive")
 */
export const updateOccasionStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const cleanStatus = String(status || 'Active').trim();

  const formData = new FormData();
  formData.append('occasions_status', cleanStatus);

  try {
    // Primary path: /occasions/{id}/status
    const response = await api.patch(`/occasions/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (patchErr) {
    // Fallback 1: POST /occasions/{id}/status with _method=PATCH
    try {
      const fbData = new FormData();
      fbData.append('occasions_status', cleanStatus);
      fbData.append('_method', 'PATCH');
      const response = await api.post(`/occasions/${id}/status`, fbData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (fbErr1) {
      // Fallback 2: /occasion/{id}/status (singular)
      try {
        const response = await api.patch(`/occasion/${id}/status`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error, 'Unable to update occasion status.'));
      }
    }
  }
};
export const changeOccasionStatus = updateOccasionStatus;

/**
 * 6. GET /activeOccasions (Active Occasions List)
 * URL: https://memorycreators.in/crmapi/public/api/activeOccasions
 * Headers: Authorization: Bearer <token>
 */
export const fetchActiveOccasions = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/activeOccasions', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch active occasions.'));
  }
};
export const getActiveOccasions = fetchActiveOccasions;

/**
 * Optional: DELETE /occasion/{id}
 */
export const deleteOccasion = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.delete(`/occasion/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to delete occasion.'));
  }
};

export default {
  createOccasion,
  fetchOccasions,
  getOccasionList,
  fetchOccasionList,
  fetchOccasionById,
  getOccasionById,
  updateOccasion,
  updateOccasionStatus,
  changeOccasionStatus,
  fetchActiveOccasions,
  getActiveOccasions,
  deleteOccasion,
  generateOccasionSlug,
};
