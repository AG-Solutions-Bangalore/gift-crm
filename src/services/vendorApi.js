// Vendor API Service - All 6 Vendor Endpoints
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
 * 1. POST /vendor (Create Vendor)
 * URL: https://memorycreators.in/crmapi/public/api/vendor
 * Headers: Authorization: Bearer <token>, Content-Type: application/json
 * Body (JSON): { "vendor_name": "", "contact_name": "", "vendor_mobile": "", "vendor_address": "" }
 */
export const createVendor = async (vendorData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const payload = {
    vendor_name: String(vendorData.vendor_name || vendorData.name || '').trim(),
    contact_name: String(vendorData.contact_name || '').trim(),
    vendor_mobile: String(vendorData.vendor_mobile || vendorData.mobile || vendorData.phone || '').trim(),
    vendor_address: String(vendorData.vendor_address || vendorData.address || '').trim(),
  };

  try {
    const response = await api.post('/vendor', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to create vendor. Please check the fields and try again.'));
  }
};

/**
 * 2. GET /vendor (Vendor List)
 * URL: https://memorycreators.in/crmapi/public/api/vendor
 * Headers: Authorization: Bearer <token>
 */
export const fetchVendors = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/vendor', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch vendors.'));
  }
};
export const getVendorList = fetchVendors;
export const fetchVendorList = fetchVendors;

/**
 * 3. GET /vendor/{id} (Fetch Vendor by ID)
 * URL: https://memorycreators.in/crmapi/public/api/vendor/{id}
 * Headers: Authorization: Bearer <token>
 */
export const fetchVendorById = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get(`/vendor/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, `Failed to fetch vendor #${id}.`));
  }
};
export const getVendorById = fetchVendorById;

/**
 * 4. PUT /vendor/{id} (Update Vendor)
 * URL: https://memorycreators.in/crmapi/public/api/vendor/{id}
 * Headers: Authorization: Bearer <token>, Content-Type: application/json
 * Body (JSON): { "vendor_name": "", "contact_name": "", "vendor_mobile": "", "vendor_address": "", "vendor_status": "Active" }
 */
export const updateVendor = async (id, vendorData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const payload = {
    vendor_name: String(vendorData.vendor_name || vendorData.name || '').trim(),
    contact_name: String(vendorData.contact_name || '').trim(),
    vendor_mobile: String(vendorData.vendor_mobile || vendorData.mobile || vendorData.phone || '').trim(),
    vendor_address: String(vendorData.vendor_address || vendorData.address || '').trim(),
    vendor_status: String(vendorData.vendor_status || vendorData.status || 'Active').trim(),
  };

  try {
    const response = await api.put(`/vendor/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to update vendor.'));
  }
};

/**
 * 5. PATCH /vendors/{id}/status (Update Vendors Status)
 * URL: https://memorycreators.in/crmapi/public/api/vendors/{id}/status
 * Headers: Authorization: Bearer <token>
 * Body (FormData): vendor_status ("Active" / "Inactive")
 */
export const updateVendorStatus = async (id, status, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const cleanStatus = String(status || 'Active').trim();

  const formData = new FormData();
  formData.append('vendor_status', cleanStatus);

  try {
    const response = await api.patch(`/vendors/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (patchErr) {
    try {
      const fbData = new FormData();
      fbData.append('vendor_status', cleanStatus);
      fbData.append('_method', 'PATCH');
      const response = await api.post(`/vendors/${id}/status`, fbData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Unable to update vendor status.'));
    }
  }
};
export const changeVendorStatus = updateVendorStatus;

/**
 * 6. GET /activeVendors (Active Vendors List)
 * URL: https://memorycreators.in/crmapi/public/api/activeVendors
 * Headers: Authorization: Bearer <token>
 */
export const fetchActiveVendors = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.get('/activeVendors', {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch active vendors.'));
  }
};
export const getActiveVendors = fetchActiveVendors;

/**
 * Delete Vendor helper
 */
export const deleteVendor = async (id, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.delete(`/vendor/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to delete vendor.'));
  }
};

export default {
  createVendor,
  fetchVendors,
  getVendorList,
  fetchVendorList,
  fetchVendorById,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  changeVendorStatus,
  fetchActiveVendors,
  getActiveVendors,
  deleteVendor,
};
