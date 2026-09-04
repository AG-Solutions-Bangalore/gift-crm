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
 * 1. GET - Newsletter List
 * Endpoint: /newsletter
 * Headers: Authorization: Bearer <token>
 */
export const fetchNewsletters = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/newsletter', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch newsletters list.'));
  }
};
export const getNewsletterList = fetchNewsletters;

/**
 * 2. GET - Fetch Newsletter by ID
 * Endpoint: /newsletter/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchNewsletterById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/newsletter/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch newsletter #${id}.`));
  }
};

/**
 * 3. PATCH - Update Newsletter Status
 * Endpoint: /newsletters/{id}/status (or /newsletter/{id}/status)
 * Body: FormData newsletter_status
 */
export const updateNewsletterStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const formData = new FormData();
  formData.append('newsletter_status', String(status));

  const endpoints = [
    { method: 'patch', url: `/newsletters/${id}/status`, isForm: true },
    { method: 'patch', url: `/newsletter/${id}/status`, isForm: true },
    { method: 'patch', url: `/newsletter/${id}`, isForm: false },
    { method: 'put', url: `/newsletter/${id}`, isForm: false },
  ];

  let lastError = null;
  for (const ep of endpoints) {
    try {
      const data = ep.isForm ? formData : { newsletter_status: status, status };
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

  throw new Error(extractErrorMessage(lastError, `Failed to update status for newsletter #${id}.`));
};
