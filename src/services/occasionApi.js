// Occasion API Service - Matched to backend schema: Occasions
// Fields: ID, Name, Slug, status

const STORAGE_KEY = 'gift_occasions_v2';

const initialOccasions = [
  { id: 1, name: 'Birthday', slug: 'birthday', status: 'Active' }
];

const getStoredOccasions = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOccasions));
  return initialOccasions;
};

const saveStoredOccasions = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const fetchOccasions = async () => {
  await new Promise((res) => setTimeout(res, 200));
  return { success: true, data: getStoredOccasions() };
};

export const createOccasion = async (data) => {
  await new Promise((res) => setTimeout(res, 300));
  const items = getStoredOccasions();
  const name = data.name;
  const newItem = {
    id: Date.now(),
    name: name,
    slug: data.slug || name.toLowerCase().replace(/\s+/g, '-'),
    status: data.status || 'Active'
  };
  const updated = [newItem, ...items];
  saveStoredOccasions(updated);
  return { success: true, message: 'Occasion created successfully', data: newItem };
};

export const updateOccasion = async (id, data) => {
  await new Promise((res) => setTimeout(res, 300));
  const items = getStoredOccasions();
  const updated = items.map((item) => (item.id === id ? { ...item, ...data, slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') } : item));
  saveStoredOccasions(updated);
  return { success: true, message: 'Occasion updated successfully' };
};

export const deleteOccasion = async (id) => {
  await new Promise((res) => setTimeout(res, 200));
  const items = getStoredOccasions();
  const updated = items.filter((item) => item.id !== id);
  saveStoredOccasions(updated);
  return { success: true, message: 'Occasion deleted successfully' };
};
