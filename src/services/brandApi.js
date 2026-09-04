// Brand API Service - All 6 Brand Endpoints
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
 * 1. POST /brand (Create Brand)
 * URL: https://memorycreators.in/crmapi/public/api/brand
 * Headers: Authorization: Bearer <token>
 * Body: { "brands_name": "", "brands_image": "" }
 */
export const createBrand = async (brandData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const brandsName = String(brandData.brands_name || brandData.name || '').trim();
  const imageFile =
    brandData.image_file ||
    (brandData.brands_image instanceof File ? brandData.brands_image : null);

  // If a binary File is uploaded, send via FormData
  if (imageFile) {
    const formData = new FormData();
    formData.append('brands_name', brandsName);
    formData.append('brands_image', imageFile);

    try {
      const response = await api.post('/brand', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to create brand. Please try again.'));
    }
  }

  // Otherwise send clean JSON payload
  const payload = {
    brands_name: brandsName,
    brands_image: String(brandData.brands_image || brandData.image || '').trim(),
  };

  try {
    const response = await api.post('/brand', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to create brand. Please try again.'));
  }
};

/**
 * 2. GET /brand (Brand List)
 * URL: https://memorycreators.in/crmapi/public/api/brand
 * Headers: Authorization: Bearer <token>
 */
export const fetchBrands = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/brand', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    // Fallback: If backend BrandController@index has a server error (e.g. $complaints typo on line 38), try /activeBrands
    try {
      console.warn('[brandApi] /brand returned error, falling back to /activeBrands:', error.message);
      const fallbackResponse = await api.get('/activeBrands', {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallbackResponse.data;
    } catch (fbErr) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch brands.'));
    }
  }
};
export const getBrandList = fetchBrands;
export const fetchBrandList = fetchBrands;

/**
 * 3. GET /brand/{id} (Fetch Brand by ID)
 * URL: https://memorycreators.in/crmapi/public/api/brand/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchBrandById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/brand/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch brand #${id}.`));
  }
};
export const getBrandById = fetchBrandById;

/**
 * 4. PUT /brand/{id} (Update Brand)
 * URL: https://memorycreators.in/crmapi/public/api/brand/{id}
 * Headers: Authorization: Bearer <token>
 * Body: { "brands_name": "", "brands_image": "", "brands_status": "Active" }
 */
export const updateBrand = async (id, brandData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const brandsName = String(brandData.brands_name || brandData.name || '').trim();
  const brandsStatus = String(brandData.brands_status || brandData.status || 'Active').trim();
  const imageFile =
    brandData.image_file ||
    (brandData.brands_image instanceof File ? brandData.brands_image : null);

  // If a binary File is uploaded, send via FormData with _method: PUT
  if (imageFile) {
    const formData = new FormData();
    formData.append('brands_name', brandsName);
    formData.append('brands_status', brandsStatus);
    formData.append('brands_image', imageFile);
    formData.append('_method', 'PUT');

    try {
      const response = await api.post(`/brand/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to update brand.'));
    }
  }

  // Otherwise send JSON payload
  const payload = {
    brands_name: brandsName,
    brands_image: String(brandData.brands_image || brandData.image || '').trim(),
    brands_status: brandsStatus,
  };

  try {
    const response = await api.put(`/brand/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to update brand.'));
  }
};

/**
 * 5. PATCH /brands/{id}/status (Update Brands Status)
 * URL: https://memorycreators.in/crmapi/public/api/brands/{id}/status
 * Headers: Authorization: Bearer <token>
 * Body (FormData): brands_status ("Active" / "Inactive")
 */
export const updateBrandStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const cleanStatus = String(status || 'Active').trim();

  const formData = new FormData();
  formData.append('brands_status', cleanStatus);

  try {
    const response = await api.patch(`/brands/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (patchErr) {
    // Fallback: try POST with _method=PATCH if server router requires it
    try {
      const fbData = new FormData();
      fbData.append('brands_status', cleanStatus);
      fbData.append('_method', 'PATCH');
      const response = await api.post(`/brands/${id}/status`, fbData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to update brand status.'));
    }
  }
};
export const changeBrandStatus = updateBrandStatus;

/**
 * 6. GET /activeBrands (Active Brands List)
 * URL: https://memorycreators.in/crmapi/public/api/activeBrands
 * Headers: Authorization: Bearer <token>
 */
export const fetchActiveBrands = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/activeBrands', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    try {
      console.warn('[brandApi] /activeBrands returned error, falling back to /brand:', error.message);
      const fallbackResponse = await api.get('/brand', {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallbackResponse.data;
    } catch (fbErr) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch active brands.'));
    }
  }
};
export const getActiveBrands = fetchActiveBrands;

/**
 * Delete Brand helper
 */
export const deleteBrand = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.delete(`/brand/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to delete brand.'));
  }
};

export default {
  createBrand,
  fetchBrands,
  getBrandList,
  fetchBrandList,
  fetchBrandById,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  changeBrandStatus,
  fetchActiveBrands,
  getActiveBrands,
  deleteBrand,
};
