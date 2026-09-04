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
 * 1. POST /attribute (Create Attribute)
 * URL: https://memorycreators.in/crmapi/public/api/attribute
 * Headers: Authorization: Bearer <token>
 * Body: { attribute_name: string, values: [ { attribute_value: string } ] }
 */
export const createAttribute = async (attributeData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  // Format values array: ensure only non-empty strings
  const formattedValues = (attributeData.values || [])
    .map((v) => {
      if (typeof v === 'string') {
        return { attribute_value: v.trim() };
      }
      return { attribute_value: String(v.attribute_value || v.value || '').trim() };
    })
    .filter((v) => v.attribute_value !== '');

  const payload = {
    attribute_name: String(attributeData.attribute_name || attributeData.name || '').trim(),
    values: formattedValues.length > 0 ? formattedValues : [{ attribute_value: '' }],
  };

  try {
    const response = await api.post('/attribute', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Unable to create attribute. Please check the details and try again.')
    );
  }
};

/**
 * 2. GET /attribute (Attribute List)
 * URL: https://memorycreators.in/crmapi/public/api/attribute
 * Headers: Authorization: Bearer <token>
 */
export const fetchAttributes = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/attribute', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    // Fallback: If /attribute throws an error, try /activeAttributes
    try {
      console.warn('[attributeApi] /attribute error, trying /activeAttributes fallback:', error.message);
      const fallbackResponse = await api.get('/activeAttributes', {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallbackResponse.data;
    } catch (fbErr) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch attributes list.'));
    }
  }
};
export const getAttributeList = fetchAttributes;
export const fetchAttributeList = fetchAttributes;

/**
 * 3. GET /attribute/{id} (Fetch Attribute by ID)
 * URL: https://memorycreators.in/crmapi/public/api/attribute/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchAttributeById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/attribute/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch attribute #${id}.`));
  }
};
export const getAttributeById = fetchAttributeById;

/**
 * 4. PUT /attribute/{id} (Update Attribute)
 * URL: https://memorycreators.in/crmapi/public/api/attribute/{id}
 * Headers: Authorization: Bearer <token>
 * Body: { attribute_name: string, attribute_status: string, values: [ { id?: string, attribute_value: string, attribute_value_status?: string } ] }
 */
export const updateAttribute = async (id, attributeData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');

  const statusVal = String(
    attributeData.attribute_status || attributeData.status || 'Active'
  ).trim();

  // Format nested values array
  const formattedValues = (attributeData.values || [])
    .map((v) => {
      if (typeof v === 'string') {
        return {
          attribute_value: v.trim(),
          attribute_value_status: 'Active',
        };
      }
      const valObj = {
        attribute_value: String(v.attribute_value || v.value || '').trim(),
        attribute_value_status: String(v.attribute_value_status || v.status || 'Active').trim(),
      };
      if (v.id) {
        valObj.id = String(v.id);
      }
      return valObj;
    })
    .filter((v) => v.attribute_value !== '');

  const payload = {
    attribute_name: String(attributeData.attribute_name || attributeData.name || '').trim(),
    attribute_status: statusVal,
    values: formattedValues,
  };

  try {
    const response = await api.put(`/attribute/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, `Failed to update attribute #${id}.`)
    );
  }
};

/**
 * 5. PATCH /attributes/{id}/status (Update Attributes Status)
 * URL: https://memorycreators.in/crmapi/public/api/attributes/{id}/status
 * Headers: Authorization: Bearer <token>
 * Body (formdata): attribute_status: "Active" | "Inactive"
 */
export const updateAttributeStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const normalizedStatus =
    status === 'Active' || status === 'Inactive'
      ? status
      : status
      ? 'Active'
      : 'Inactive';

  const formData = new FormData();
  formData.append('attribute_status', normalizedStatus);

  try {
    // Note: status route uses plural /attributes/{id}/status as per backend API spec
    const response = await api.post(`/attributes/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    // Fallback: If /attributes/{id}/status fails, try /attribute/{id}/status
    try {
      const fallbackResponse = await api.post(`/attribute/${id}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallbackResponse.data;
    } catch (fbErr) {
      throw new Error(
        extractErrorMessage(error, 'Unable to update attribute status.')
      );
    }
  }
};

/**
 * 6. GET /activeAttributes (Active Attributes List)
 * URL: https://memorycreators.in/crmapi/public/api/activeAttributes
 * Headers: Authorization: Bearer <token>
 */
export const fetchActiveAttributes = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/activeAttributes', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    try {
      const fallback = await api.get('/attribute', {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return fallback.data;
    } catch (fbErr) {
      throw new Error(
        extractErrorMessage(error, 'Failed to fetch active attributes.')
      );
    }
  }
};
export const getActiveAttributes = fetchActiveAttributes;

export default {
  createAttribute,
  fetchAttributes,
  getAttributeList,
  fetchAttributeList,
  fetchAttributeById,
  getAttributeById,
  updateAttribute,
  updateAttributeStatus,
  fetchActiveAttributes,
  getActiveAttributes,
};
