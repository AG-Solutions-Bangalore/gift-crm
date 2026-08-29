// Recipients / Gifts For Everyone API Service - Matched to backend schema: Recipients
// Fields: ID, Name, Slug, status

const STORAGE_KEY = 'utsav_recipients_schema';

const initialRecipients = [
  { id: 1, name: 'For Him', slug: 'for-him', status: 'Active' },
  { id: 2, name: 'For Her', slug: 'for-her', status: 'Active' },
  { id: 3, name: 'For Kids', slug: 'for-kids', status: 'Active' },
  { id: 4, name: 'For Wife', slug: 'for-wife', status: 'Active' },
  { id: 5, name: 'For Husband', slug: 'for-husband', status: 'Active' },
  { id: 6, name: 'For Mother', slug: 'for-mother', status: 'Active' },
  { id: 7, name: 'For Father', slug: 'for-father', status: 'Active' },
  { id: 8, name: 'Roses', slug: 'roses', status: 'Active' },
  { id: 9, name: 'Orchids', slug: 'orchids', status: 'Active' },
  { id: 10, name: 'Lilies', slug: 'lilies', status: 'Active' },
  { id: 11, name: 'Carnations', slug: 'carnations', status: 'Active' },
  { id: 12, name: 'Chocolate', slug: 'chocolate', status: 'Active' },
  { id: 13, name: 'Red Velvet', slug: 'red-velvet', status: 'Active' },
  { id: 14, name: 'Butterscotch', slug: 'butterscotch', status: 'Active' },
  { id: 15, name: 'Pineapple', slug: 'pineapple', status: 'Active' }
];

const getStoredRecipients = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRecipients));
  return initialRecipients;
};

const saveStoredRecipients = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const fetchGiftsForEveryone = async () => {
  await new Promise((res) => setTimeout(res, 200));
  return { success: true, data: getStoredRecipients() };
};

export const createGiftsForEveryone = async (data) => {
  await new Promise((res) => setTimeout(res, 300));
  const items = getStoredRecipients();
  const name = data.name;
  const newItem = {
    id: Date.now(),
    name: name,
    slug: data.slug || name.toLowerCase().replace(/\s+/g, '-'),
    status: data.status || 'Active'
  };
  const updated = [newItem, ...items];
  saveStoredRecipients(updated);
  return { success: true, message: 'Recipient tag created successfully', data: newItem };
};

export const updateGiftsForEveryone = async (id, data) => {
  await new Promise((res) => setTimeout(res, 300));
  const items = getStoredRecipients();
  const updated = items.map((item) => (item.id === id ? { ...item, ...data, slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') } : item));
  saveStoredRecipients(updated);
  return { success: true, message: 'Recipient tag updated successfully' };
};

export const deleteGiftsForEveryone = async (id) => {
  await new Promise((res) => setTimeout(res, 200));
  const items = getStoredRecipients();
  const updated = items.filter((item) => item.id !== id);
  saveStoredRecipients(updated);
  return { success: true, message: 'Recipient tag deleted successfully' };
};
