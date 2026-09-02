// Tag API Service - All 6 Tag Endpoints
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

export const generateTagSlug = (name = '') => {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * 1. POST /tag (Create Tag)
 * URL: https://memorycreators.in/crmapi/public/api/tag
 * Headers: Authorization: Bearer <token>, Content-Type: application/json
 * Body: { "tags_name": "", "tags_slug": "", "tags_sort": "" }
 */
export const createTag = async (tagData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const tagsName = String(tagData.tags_name || tagData.name || '').trim();
  const rawSlug = tagData.tags_slug || tagData.slug || '';
  const tagsSlug = String(rawSlug).trim() || generateTagSlug(tagsName);
  const tagsSort = String(tagData.tags_sort ?? tagData.sort ?? '1').trim();

  const payload = {
    tags_name: tagsName,
    tags_slug: tagsSlug,
    tags_sort: tagsSort,
  };

  try {
    const response = await api.post('/tag', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Unable to create tag. Please check the details and try again.')
    );
  }
};

/**
 * 2. GET /tag (Tag List)
 * URL: https://memorycreators.in/crmapi/public/api/tag
 * Headers: Authorization: Bearer <token>
 */
export const fetchTags = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/tag', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    // Fallback: If backend TagController or TagService has a 500 error, try /activeTags
    try {
      console.warn('[tagApi] /tag error, trying /activeTags fallback:', error.message);
      const fallbackResponse = await api.get('/activeTags', {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallbackResponse.data;
    } catch (fbErr) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch tags list.'));
    }
  }
};
export const getTagList = fetchTags;
export const fetchTagList = fetchTags;

/**
 * 3. GET /tag/{id} (Fetch Tag by ID)
 * URL: https://memorycreators.in/crmapi/public/api/tag/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchTagById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/tag/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch tag #${id}.`));
  }
};
export const getTagById = fetchTagById;

/**
 * 4. PUT /tag/{id} (Update Tag)
 * URL: https://memorycreators.in/crmapi/public/api/tag/{id}
 * Headers: Authorization: Bearer <token>, Content-Type: application/json
 * Body: { "tags_name": "", "tags_slug": "", "tags_sort": "", "tags_status": "" }
 */
export const updateTag = async (id, tagData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const tagsName = String(tagData.tags_name || tagData.name || '').trim();
  const rawSlug = tagData.tags_slug || tagData.slug || '';
  const tagsSlug = String(rawSlug).trim() || generateTagSlug(tagsName);
  const tagsSort = String(tagData.tags_sort ?? tagData.sort ?? '1').trim();
  const tagsStatus = String(tagData.tags_status || tagData.status || 'Active').trim();

  const payload = {
    tags_name: tagsName,
    tags_slug: tagsSlug,
    tags_sort: tagsSort,
    tags_status: tagsStatus,
  };

  try {
    const response = await api.put(`/tag/${id}`, payload, {
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
      fbData.append('tags_name', payload.tags_name);
      fbData.append('tags_slug', payload.tags_slug);
      fbData.append('tags_sort', payload.tags_sort);
      fbData.append('tags_status', payload.tags_status);
      fbData.append('_method', 'PUT');

      const response = await api.post(`/tag/${id}`, fbData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to update tag.'));
    }
  }
};

/**
 * 5. PATCH /tags/{id}/status (Update Tags Status)
 * URL: https://memorycreators.in/crmapi/public/api/tags/1/status
 * Headers: Authorization: Bearer <token>
 * Body (FormData): tags_status ("Active" / "Inactive")
 */
export const updateTagStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const cleanStatus = String(status || 'Active').trim();

  const formData = new FormData();
  formData.append('tags_status', cleanStatus);

  try {
    // Primary path: /tags/{id}/status (plural)
    const response = await api.patch(`/tags/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (patchErr) {
    // Fallback 1: POST /tags/{id}/status with _method=PATCH
    try {
      const fbData = new FormData();
      fbData.append('tags_status', cleanStatus);
      fbData.append('_method', 'PATCH');
      const response = await api.post(`/tags/${id}/status`, fbData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (fbErr1) {
      // Fallback 2: /tag/{id}/status (singular)
      try {
        const response = await api.patch(`/tag/${id}/status`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error, 'Unable to update tag status.'));
      }
    }
  }
};
export const changeTagStatus = updateTagStatus;

/**
 * 6. GET /activeTags (Active Tags List)
 * URL: https://memorycreators.in/crmapi/public/api/activeTags
 * Headers: Authorization: Bearer <token>
 */
export const fetchActiveTags = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/activeTags', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch active tags.'));
  }
};
export const getActiveTags = fetchActiveTags;

/**
 * Optional: DELETE /tag/{id}
 */
export const deleteTag = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.delete(`/tag/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to delete tag.'));
  }
};

export default {
  createTag,
  fetchTags,
  getTagList,
  fetchTagList,
  fetchTagById,
  getTagById,
  updateTag,
  updateTagStatus,
  changeTagStatus,
  fetchActiveTags,
  getActiveTags,
  deleteTag,
  generateTagSlug,
};
