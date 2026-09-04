import api from './api';

// Simple helper to extract error message from API response
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
 * 1. POST - Create Banner
 * Endpoint: /banner
 * Body: FormData (banner_image, banner_alt, banner_link, banner_position, banner_type, banner_sort_order)
 */
export const createBanner = async (bannerData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const formData = new FormData();

  // Banner image file
  if (bannerData.banner_image instanceof File) {
    formData.append('banner_image', bannerData.banner_image);
  }

  // Text and enum fields
  if (bannerData.banner_alt) {
    formData.append('banner_alt', String(bannerData.banner_alt).trim());
  }
  if (bannerData.banner_link) {
    formData.append('banner_link', String(bannerData.banner_link).trim());
  }
  if (bannerData.banner_position) {
    formData.append('banner_position', String(bannerData.banner_position).trim()); // 'Left', 'Middle', 'Right', 'Top'
  }
  if (bannerData.banner_type) {
    formData.append('banner_type', String(bannerData.banner_type).trim()); // 'Main', 'Offer'
  }
  if (bannerData.banner_sort_order !== undefined && bannerData.banner_sort_order !== '') {
    formData.append('banner_sort_order', String(bannerData.banner_sort_order));
  }

  // Log payload for easy debugging
  console.group('📤 [POST /banner] Create Banner');
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
  }
  console.groupEnd();

  try {
    const response = await api.post('/banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create banner.'));
  }
};

/**
 * 2. GET - Fetch Banner List
 * Endpoint: /banner
 */
export const fetchBanners = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/banner', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch banners list.'));
  }
};
export const getBannerList = fetchBanners;

/**
 * 3. GET - Fetch Banner by ID
 * Endpoint: /banner/{id}
 */
export const fetchBannerById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/banner/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch banner #${id}.`));
  }
};
export const getBannerById = fetchBannerById;

/**
 * 4. PUT / POST - Update Banner
 * Endpoint: /banner/{id}
 * Body: FormData (banner_image, banner_alt, banner_link, banner_position, banner_type, banner_sort_order, banner_status)
 */
export const updateBanner = async (id, bannerData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const formData = new FormData();

  // Banner image file (only if a new file is selected)
  if (bannerData.banner_image instanceof File) {
    formData.append('banner_image', bannerData.banner_image);
  }

  // Text and enum fields
  if (bannerData.banner_alt) {
    formData.append('banner_alt', String(bannerData.banner_alt).trim());
  }
  if (bannerData.banner_link) {
    formData.append('banner_link', String(bannerData.banner_link).trim());
  }
  if (bannerData.banner_position) {
    formData.append('banner_position', String(bannerData.banner_position).trim());
  }
  if (bannerData.banner_type) {
    formData.append('banner_type', String(bannerData.banner_type).trim());
  }
  if (bannerData.banner_sort_order !== undefined && bannerData.banner_sort_order !== '') {
    formData.append('banner_sort_order', String(bannerData.banner_sort_order));
  }
  if (bannerData.banner_status) {
    formData.append('banner_status', String(bannerData.banner_status).trim());
  }

  // Support Laravel multipart method spoofing if needed
  formData.append('_method', 'PUT');

  console.group(`📤 [PUT/POST /banner/${id}] Update Banner`);
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
  }
  console.groupEnd();

  try {
    // In PHP/Laravel, multipart FormData with file upload is posted to /banner/{id} with _method=PUT
    const response = await api.post(`/banner/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to update banner #${id}.`));
  }
};

/**
 * 5. PATCH - Update Banner Status
 * Endpoint: /banner/{id}/status or /banners/{id}/status
 */
export const updateBannerStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const endpoints = [
    { method: 'patch', url: `/banner/${id}/status` },
    { method: 'patch', url: `/banners/${id}/status` },
    { method: 'patch', url: `/banner/status/${id}` },
    { method: 'patch', url: `/banner/${id}` },
    { method: 'put', url: `/banner/${id}` },
  ];

  let lastError = null;
  for (const ep of endpoints) {
    try {
      const payload = { banner_status: status, status: status };
      const res = await api[ep.method](ep.url, payload, {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return res.data;
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(extractErrorMessage(lastError, `Failed to update banner #${id} status.`));
};

/**
 * 6. DELETE - Delete Banner
 * Endpoint: /banner/{id}
 */
export const deleteBanner = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.delete(`/banner/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to delete banner #${id}.`));
  }
};
