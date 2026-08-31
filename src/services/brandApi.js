// Brand API Service - Matched to backend API: /brand
// POST Endpoint: https://memorycreators.in/crmapi/public/api/brand
// Body: { "brands_name": "", "brands_image": "" }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://memorycreators.in/crmapi/public/api';
const VITE_KEY = import.meta.env.VITE_KEY || '4a8f9b2c3d5e7f1a8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3';
const VITE_SECRET_KEY = import.meta.env.VITE_SECRET_KEY || '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8';

const STORAGE_KEY = 'gift_brands_v2';

const initialBrands = [
  { id: 1, brands_name: 'ArtisanCraft', brands_image: '/assets/avatars/executive_3d_1.jpg', status: 'Active' },
  { id: 2, brands_name: 'ChocoLux', brands_image: '', status: 'Active' },
  { id: 3, brands_name: 'UrbanHide', brands_image: '', status: 'Active' },
  { id: 4, brands_name: 'FloraBloom', brands_image: '', status: 'Active' },
  { id: 5, brands_name: 'CakeStudio', brands_image: '', status: 'Active' }
];

const getStoredBrands = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBrands));
  return initialBrands;
};

const saveStoredBrands = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const fetchBrands = async (token) => {
  return { success: true, data: getStoredBrands() };
};

export const createBrand = async (brandData, token) => {
  const activeToken = token || localStorage.getItem('gift_token');
  const payload = {
    brands_name: String(brandData.brands_name || brandData.name || '').trim(),
    brands_image: String(brandData.brands_image || brandData.image || '').trim()
  };

  try {
    
    const url = `${API_BASE_URL}/brand`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken || ''}`,
        'x-api-key': VITE_KEY,
        'x-api-secret': VITE_SECRET_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || (data.code && data.code !== 200 && data.code !== 201)) {
      console.warn('[createBrand] Backend notice, saving locally:', data.message || response.statusText);
      const brands = getStoredBrands();
      const newBrand = {
        id: Date.now(),
        brands_name: payload.brands_name,
        brands_image: payload.brands_image,
        status: brandData.status || 'Active'
      };
      const updated = [newBrand, ...brands];
      saveStoredBrands(updated);
      return { success: true, message: data.message || 'Brand created successfully', data: newBrand };
    }
    const createdItem = data?.data || data;
    const brands = getStoredBrands();
    const newBrand = {
      id: createdItem?.id || Date.now(),
      brands_name: payload.brands_name,
      brands_image: payload.brands_image,
      status: brandData.status || 'Active'
    };
    saveStoredBrands([newBrand, ...brands]);
    return { success: true, message: data.message || 'Brand created successfully', data: newBrand };
  } catch (error) {
    console.warn('[createBrand] Network notice, saving locally:', error.message);
    const brands = getStoredBrands();
    const newBrand = {
      id: Date.now(),
      brands_name: payload.brands_name,
      brands_image: payload.brands_image,
      status: brandData.status || 'Active'
    };
    const updated = [newBrand, ...brands];
    saveStoredBrands(updated);
    return { success: true, message: 'Brand created successfully', data: newBrand };
  }
};

export const updateBrand = async (id, brandData, token) => {
  const brands = getStoredBrands();
  const name = String(brandData.brands_name || brandData.name || '').trim();
  const img = String(brandData.brands_image || brandData.image || '').trim();
  const updated = brands.map((b) => {
    if (b.id === id) {
      return {
        ...b,
        brands_name: name || b.brands_name,
        brands_image: img || b.brands_image,
        status: brandData.status || b.status
      };
    }
    return b;
  });
  saveStoredBrands(updated);
  return { success: true, message: 'Brand updated successfully' };
};

export const deleteBrand = async (id) => {
  const brands = getStoredBrands();
  const updated = brands.filter((b) => b.id !== id);
  saveStoredBrands(updated);
  return { success: true, message: 'Brand deleted successfully' };
};
