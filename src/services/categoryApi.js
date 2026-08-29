// Category API Service - Matched to backend schema: Categories
// Fields: ID, Parent ID, Category Name, Slug, Sort, images, images_alt, status

const STORAGE_KEY = 'utsav_categories_schema';

const initialCategories = [
  { id: 1, parent_id: null, category_name: 'Birthday', slug: 'birthday', sort: 1, images: '', images_alt: 'Birthday', status: 'Active' },
  { id: 2, parent_id: 1, category_name: 'Birthday Gifts', slug: 'birthday-gifts', sort: 2, images: '', images_alt: 'Birthday Gifts', status: 'Active' },
  { id: 3, parent_id: 1, category_name: 'Birthday Cakes', slug: 'birthday-cakes', sort: 2, images: '', images_alt: 'Birthday Cakes', status: 'Active' },
  { id: 4, parent_id: 3, category_name: 'Chocolate Cakes', slug: 'chocolate-cakes', sort: 3, images: '', images_alt: 'Chocolate Cakes', status: 'Active' },
  { id: 5, parent_id: 3, category_name: 'Red Velvet Cakes', slug: 'red-velvet-cakes', sort: 3, images: '', images_alt: 'Red Velvet Cakes', status: 'Active' },
  { id: 6, parent_id: 3, category_name: 'Photo Cakes', slug: 'photo-cakes', sort: 3, images: '', images_alt: 'Photo Cakes', status: 'Active' },
  { id: 7, parent_id: 3, category_name: 'Eggless Cakes', slug: 'eggless-cakes', sort: 3, images: '', images_alt: 'Eggless Cakes', status: 'Active' },
  { id: 8, parent_id: 1, category_name: 'Birthday Flowers', slug: 'birthday-flowers', sort: 2, images: '', images_alt: 'Birthday Flowers', status: 'Active' }
];

const getStoredCategories = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCategories));
  return initialCategories;
};

const saveStoredCategories = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const fetchCategories = async () => {
  await new Promise((res) => setTimeout(res, 200));
  return { success: true, data: getStoredCategories() };
};

export const createCategory = async (catData) => {
  await new Promise((res) => setTimeout(res, 300));
  const categories = getStoredCategories();
  const name = catData.category_name || catData.name;
  const newCat = {
    id: Date.now(),
    parent_id: catData.parent_id ? Number(catData.parent_id) : null,
    category_name: name,
    slug: catData.slug || name.toLowerCase().replace(/\s+/g, '-'),
    sort: Number(catData.sort) || 1,
    images: catData.images || '',
    images_alt: catData.images_alt || name,
    status: catData.status || 'Active'
  };
  const updated = [newCat, ...categories];
  saveStoredCategories(updated);
  return { success: true, message: 'Category created successfully', data: newCat };
};

export const updateCategory = async (id, catData) => {
  await new Promise((res) => setTimeout(res, 300));
  const categories = getStoredCategories();
  const name = catData.category_name || catData.name;
  const updated = categories.map((cat) => {
    if (cat.id === id) {
      return {
        ...cat,
        ...catData,
        category_name: name || cat.category_name,
        slug: catData.slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : cat.slug)
      };
    }
    return cat;
  });
  saveStoredCategories(updated);
  return { success: true, message: 'Category updated successfully' };
};

export const deleteCategory = async (id) => {
  await new Promise((res) => setTimeout(res, 200));
  const categories = getStoredCategories();
  const updated = categories.filter((cat) => cat.id !== id);
  saveStoredCategories(updated);
  return { success: true, message: 'Category deleted successfully' };
};
