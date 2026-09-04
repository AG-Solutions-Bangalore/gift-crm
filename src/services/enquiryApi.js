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
 * 6. GET - Fetch Enquiry List
 * URL: https://memorycreators.in/crmapi/public/api/enquiry
 * Headers: Authorization: Bearer <token>
 */
export const fetchEnquiries = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/enquiry', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch enquiries list.'));
  }
};
export const getEnquiryList = fetchEnquiries;

/**
 * Update Enquiry Status (if supported by backend)
 */
export const updateEnquiryStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.patch(`/enquiry/${id}/status`, { status }, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to update enquiry #${id} status.`));
  }
};

/**
 * Fetch Enquiry Report
 */
export const fetchEnquiryReport = async (token) => {
  try {
    const res = await fetchEnquiries(token);
    let list = [];
    if (Array.isArray(res)) list = res;
    else if (Array.isArray(res?.data)) list = res.data;
    else if (Array.isArray(res?.enquiries)) list = res.enquiries;
    else if (Array.isArray(res?.data?.data)) list = res.data.data;

    return {
      success: true,
      data: list,
      total: list.length,
      pendingCount: list.filter((e) => String(e.status).toLowerCase() === 'pending').length,
      inProgressCount: list.filter((e) => String(e.status).toLowerCase() === 'in progress').length,
      closedCount: list.filter((e) => String(e.status).toLowerCase() === 'closed').length,
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      total: 0,
      pendingCount: 0,
      inProgressCount: 0,
      closedCount: 0,
    };
  }
};

