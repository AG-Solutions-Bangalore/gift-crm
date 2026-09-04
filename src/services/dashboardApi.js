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
 * GET /dashboard (Fetch Dashboard Statistics)
 * URL: https://memorycreators.in/crmapi/public/api/dashboard
 * Headers: Authorization: Bearer <token>
 * Returns: { data: { totalProduct, totalCategories, totalOccasions, totalTags, totalNewsletter, totalEnquiry, latestEnquiry: [] } }
 */
export const fetchDashboard = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/dashboard', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch dashboard statistics.'));
  }
};

export const getDashboardData = fetchDashboard;

export default {
  fetchDashboard,
  getDashboardData,
};
