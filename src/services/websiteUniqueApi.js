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
 * 1. POST - Create Website Unique
 * Endpoint: /website-unique
 * Body (raw json): { from_date, to_date, website_heading, sort_order, sub_ids: [1, 4] }
 */
export const createWebsiteUnique = async (data, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const payload = {
    from_date: data.from_date || '',
    to_date: data.to_date || '',
    website_heading: String(data.website_heading || '').trim(),
    sort_order: data.sort_order !== undefined && data.sort_order !== '' ? Number(data.sort_order) : 1,
    sub_ids: Array.isArray(data.sub_ids)
      ? data.sub_ids.map((id) => Number(id)).filter((n) => !isNaN(n))
      : typeof data.sub_ids === 'string'
      ? data.sub_ids.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n))
      : [],
  };

  try {
    const response = await api.post('/website-unique', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create website unique section.'));
  }
};

/**
 * 2. GET - Fetch Website Unique List
 * Endpoint: /website-unique
 */
export const fetchWebsiteUniques = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/website-unique', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch website unique list.'));
  }
};
export const getWebsiteUniqueList = fetchWebsiteUniques;

/**
 * 3. GET - Fetch Website Unique by ID
 * Endpoint: /website-unique/{id}
 */
export const fetchWebsiteUniqueById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/website-unique/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch website unique #${id}.`));
  }
};

/**
 * 4. PUT - Update Website Unique
 * Endpoint: /website-unique/{id}
 * Body (raw json): { from_date, to_date, website_heading, sort_order, status, sub_ids: [1, 4] }
 */
export const updateWebsiteUnique = async (id, data, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const payload = {
    from_date: data.from_date || '',
    to_date: data.to_date || '',
    website_heading: String(data.website_heading || '').trim(),
    sort_order: data.sort_order !== undefined && data.sort_order !== '' ? Number(data.sort_order) : 1,
    status: data.status || 'Active',
    sub_ids: Array.isArray(data.sub_ids)
      ? data.sub_ids.map((id) => Number(id)).filter((n) => !isNaN(n))
      : typeof data.sub_ids === 'string'
      ? data.sub_ids.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n))
      : [],
  };

  try {
    const response = await api.put(`/website-unique/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to update website unique #${id}.`));
  }
};

/**
 * 5. PATCH - Update Website Unique Status
 * Endpoint: /website-uniques/{id}/status (or /website-unique/{id}/status)
 * Body: FormData status
 */
export const updateWebsiteUniqueStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const formData = new FormData();
  formData.append('status', String(status));

  const endpoints = [
    { method: 'patch', url: `/website-uniques/${id}/status`, isForm: true },
    { method: 'patch', url: `/website-unique/${id}/status`, isForm: true },
    { method: 'patch', url: `/website-unique/${id}`, isForm: false },
    { method: 'put', url: `/website-unique/${id}`, isForm: false },
  ];

  let lastError = null;
  for (const ep of endpoints) {
    try {
      const data = ep.isForm ? formData : { status };
      const headers = {
        ...(ep.isForm ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }),
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      };
      const res = await api[ep.method](ep.url, data, { headers });
      return res.data;
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(extractErrorMessage(lastError, `Failed to update status for website unique #${id}.`));
};

/**
 * DELETE - Delete Website Unique
 * Endpoint: /website-unique/{id}
 */
export const deleteWebsiteUnique = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.delete(`/website-unique/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to delete website unique #${id}.`));
  }
};
