import axios from 'axios';

const getBaseURL = () => {
  const envBaseURL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.BASE_URL ||
    import.meta.env.REACT_APP_API_BASE_URL ||
    'https://memorycreators.in/crmapi/public/api';

  return envBaseURL.replace(/\/$/, '');
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('gift_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('sp_cards_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const viteKey = import.meta.env.VITE_KEY;
  const viteSecretKey = import.meta.env.VITE_SECRET_KEY;
  if (viteKey) {
    config.headers['x-api-key'] = viteKey;
  }
  if (viteSecretKey) {
    config.headers['x-api-secret'] = viteSecretKey;
  }

  return config;
});

export const getApiConfig = () => ({
  baseUrl: getBaseURL(),
  viteKey: import.meta.env.VITE_KEY || '',
  viteSecretKey: import.meta.env.VITE_SECRET_KEY || '',
  viteSecretValidation: import.meta.env.VITE_SECRET_VALIDATION || '',
});

const KNOWN_IMAGE_FOLDERS = {
  company: 'https://memorycreators.in/crmapi/public/assets/images/company_images/',
  brand: 'https://memorycreators.in/crmapi/public/assets/images/brand_images/',
  brands: 'https://memorycreators.in/crmapi/public/assets/images/brand_images/',
  user: 'https://memorycreators.in/crmapi/public/assets/images/user_images/',
  users: 'https://memorycreators.in/crmapi/public/assets/images/user_images/',
  profile: 'https://memorycreators.in/crmapi/public/assets/images/user_images/',
  product: 'https://memorycreators.in/crmapi/public/assets/images/product_images/',
  products: 'https://memorycreators.in/crmapi/public/assets/images/product_images/',
  variant: 'https://memorycreators.in/crmapi/public/assets/images/product_variant_images/',
  variants: 'https://memorycreators.in/crmapi/public/assets/images/product_variant_images/',
  product_variant: 'https://memorycreators.in/crmapi/public/assets/images/product_variant_images/',
  product_variants: 'https://memorycreators.in/crmapi/public/assets/images/product_variant_images/',
  category: 'https://memorycreators.in/crmapi/public/assets/images/category_images/',
  categories: 'https://memorycreators.in/crmapi/public/assets/images/category_images/',
  occasion: 'https://memorycreators.in/crmapi/public/assets/images/occasion_images/',
  occasions: 'https://memorycreators.in/crmapi/public/assets/images/occasion_images/',
  banner: 'https://memorycreators.in/crmapi/public/assets/images/banner_images/',
  banners: 'https://memorycreators.in/crmapi/public/assets/images/banner_images/',
};

/**
 * Image resolver helper using image_url mapping from backend
 */
export const resolveImageUrl = (imageFor, fileName, imageUrlList = []) => {
  const noImageItem = imageUrlList?.find(
    (item) => item.image_for?.toLowerCase() === 'no image'
  );
  const fallbackNoImage =
    noImageItem?.image_url ||
    'https://memorycreators.in/crmapi/public/assets/images/no_image.jpg';

  if (!fileName || fileName === 'null' || fileName === 'undefined' || String(fileName).trim() === '') {
    return fallbackNoImage;
  }

  const cleanFile = String(fileName).trim();

  if (
    cleanFile.startsWith('http://') ||
    cleanFile.startsWith('https://') ||
    cleanFile.startsWith('data:') ||
    cleanFile.startsWith('blob:')
  ) {
    return cleanFile;
  }

  // 1. First check dynamic image_url list from backend
  const key = String(imageFor || '').toLowerCase();
  const match = imageUrlList?.find(
    (item) => item.image_for?.toLowerCase() === key
  );

  if (match?.image_url) {
    const base = match.image_url.endsWith('/') ? match.image_url : `${match.image_url}/`;
    const file = cleanFile.startsWith('/') ? cleanFile.slice(1) : cleanFile;
    return `${base}${file}`;
  }

  // 2. Check known entity image folder
  const knownBase = KNOWN_IMAGE_FOLDERS[key];
  if (knownBase) {
    const file = cleanFile.startsWith('/') ? cleanFile.slice(1) : cleanFile;
    return `${knownBase}${file}`;
  }

  // 3. If relative path starting with /assets
  if (cleanFile.startsWith('/assets/') || cleanFile.startsWith('assets/')) {
    return cleanFile.startsWith('/') ? cleanFile : `/${cleanFile}`;
  }

  return cleanFile;
};

/**
 * 1. panel-check-status
 * GET — Public endpoint (no auth). Called at app startup.
 * URL: https://memorycreators.in/crmapi/public/api/panel-check-status
 * Returns: { code, success, message, version: { version_panel }, company_detils: { ... }, image_url: [ ... ] }
 */
export const checkPanelStatus = async () => {
  const response = await api.get('/panel-check-status');
  return response.data;
};
export const checkStatus = checkPanelStatus;

/**
 * 2. panel-fetch-dotenv
 * GET — Protected/Config endpoint.
 * URL: https://memorycreators.in/crmapi/public/api/panel-fetch-dotenv
 * Returns: { data: string | object }
 */
export const fetchPanelDotenv = async () => {
  const response = await api.get('/panel-fetch-dotenv');
  return response?.data?.data || response?.data;
};
export const fetchDotenv = fetchPanelDotenv;

/**
 * Auth APIs
 * POST — /panel-login
 * URL: https://memorycreators.in/crmapi/public/api/panel-login
 * Body (FormData): username, password
 */
export const loginUser = async ({ username, password }) => {
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '').trim();

  if (!cleanUsername || !cleanPassword) {
    throw new Error('Invalid username or password. Please check your credentials and try again.');
  }

  const formData = new FormData();
  formData.append('username', cleanUsername);
  formData.append('password', cleanPassword);

  try {
    const response = await api.post('/panel-login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const responseData = response?.data || {};

    if (responseData?.code && responseData.code !== 200 && responseData.code !== 201) {
      throw new Error(responseData?.message || 'Invalid username or password.');
    }

    const userInfo =
      responseData?.UserInfo || responseData?.userInfo || responseData?.data?.UserInfo;

    const token =
      userInfo?.token ||
      responseData?.token ||
      responseData?.access_token ||
      responseData?.data?.token;

    if (!token) {
      throw new Error(
        responseData?.message || 'Invalid username or password. Please check your credentials and try again.'
      );
    }

    return responseData;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Invalid username or password. Please check your credentials and try again.';

    throw new Error(message);
  }
};
export const login = loginUser;
export const panelLogin = loginUser;

/**
 * 4. POST panel-logout (logout)
 * POST — Auth endpoint.
 * URL: https://memorycreators.in/crmapi/public/api/panel-logout
 * Headers: Authorization: Bearer <token>
 */
export const logoutUser = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  try {
    const response = await api.post(
      '/panel-logout',
      {},
      {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Unable to logout. Please try again.';

    throw new Error(message);
  }
};
export const logout = logoutUser;
export const panelLogout = logoutUser;

export const sendPasswordResetEmail = async ({ username, email }) => {
  const formData = new FormData();
  formData.append('username', String(username || '').trim());
  formData.append('email', String(email || '').trim());

  try {
    const response = await api.post('/panel-send-password', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Unable to send password reset request. Please check your details and try again.';

    throw new Error(message);
  }
};
export const forgotPassword = sendPasswordResetEmail;
export const panelSendPassword = sendPasswordResetEmail;

export const changeUserPassword = async ({ username, old_password, new_password }) => {
  const formData = new FormData();
  formData.append('username', String(username || '').trim());
  formData.append('old_password', String(old_password || '').trim());
  formData.append('new_password', String(new_password || '').trim());

  try {
    const response = await api.post('/panel-change-password', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Unable to change password. Please check your current password and try again.';

    throw new Error(message);
  }
};
export const changePassword = changeUserPassword;
export const panelChangePassword = changeUserPassword;

/**
 * 5. GET panel-fetch-profile
 * GET — Auth endpoint.
 * URL: https://memorycreators.in/crmapi/public/api/panel-fetch-profile
 * Headers: Authorization: Bearer <token>
 */
export const fetchProfile = async (token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const response = await api.get('/panel-fetch-profile', {
    headers: {
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
    },
  });
  return response.data;
};
export const fetchUserProfile = fetchProfile;
export const panelFetchProfile = fetchProfile;

/**
 * 6. PUT panel-update-profile
 * PUT — Auth endpoint.
 * URL: https://memorycreators.in/crmapi/public/api/panel-update-profile
 * Headers: Authorization: Bearer <token>, Content-Type: application/json
 * Body (JSON): { "mobile": "", "email": "" }
 */
export const updateProfile = async ({ mobile, email }, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const payload = {
    mobile: String(mobile || '').trim(),
    email: String(email || '').trim(),
  };

  try {
    const response = await api.put('/panel-update-profile', payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unable to update profile. Please try again.';

    throw new Error(message);
  }
};
export const updateUserProfile = updateProfile;
export const panelUpdateProfile = updateProfile;

export default api;
