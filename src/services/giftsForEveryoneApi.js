// Recipients / Gifts For Everyone API Service - Matched to backend schema: Recipients
// Fields: ID, Name, Slug, status

const STORAGE_KEY = 'gift_recipients_v2';

const initialRecipients = [
  { id: 1, name: 'For Him', slug: 'for-him', status: 'Active' }
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
