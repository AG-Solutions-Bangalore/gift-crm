// Product API Service - Matched to backend schema: Products, Products_Image, Products_Variants
// Fields: ID, Product Name, Brand, Slug, Length, Width, Height, Price, Sale Price, Bulk price, Weight, Is_variants, Status

const STORAGE_KEY = 'gift_products_schema';

const initialProducts = [
  {
    id: 101,
    product_name: 'Chocolate Truffle Cake',
    brand: 'CakeStudio',
    slug: 'chocolate-truffle-cake',
    length: '',
    width: '',
    height: '',
    price: 699,
    sale_price: 549,
    bulk_price: 50,
    weight: '500g',
    is_variants: 1,
    status: 'Active',
    category: 'Chocolate Cakes',
    category_id: 4,
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80']
  },
  {
    id: 102,
    product_name: 'Red Velvet Cake',
    brand: 'CakeStudio',
    slug: 'red-velvet-cake',
    length: '',
    width: '',
    height: '',
    price: 799,
    sale_price: 649,
    bulk_price: 30,
    weight: '500g',
    is_variants: 0,
    status: 'Active',
    category: 'Red Velvet Cakes',
    category_id: 5,
    images: ['https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=400&q=80']
  },
  {
    id: 103,
    product_name: 'Red Rose Bouquet',
    brand: 'FloraBloom',
    slug: 'red-rose-bouquet',
    length: '',
    width: '',
    height: '',
    price: 999,
    sale_price: 899,
    bulk_price: 20,
    weight: '10 Roses',
    is_variants: 0,
    status: 'Active',
    category: 'Birthday Flowers',
    category_id: 8,
    images: ['https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80']
  }
];

const getStoredProducts = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
  return initialProducts;
};

const saveStoredProducts = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const fetchProducts = async () => {
  await new Promise((res) => setTimeout(res, 250));
  return { success: true, data: getStoredProducts() };
};

export const createProduct = async (productData) => {
  await new Promise((res) => setTimeout(res, 400));
  const items = getStoredProducts();
  const name = productData.product_name || productData.productName || 'New Product';
  
  const newProduct = {
    id: Date.now(),
    product_name: name,
    brand: productData.brand || 'General',
    slug: productData.slug || name.toLowerCase().replace(/\s+/g, '-'),
    length: productData.length || '',
    width: productData.width || '',
    height: productData.height || '',
    price: Number(productData.price) || 0,
    sale_price: Number(productData.sale_price || productData.salePrice) || Number(productData.price) || 0,
    bulk_price: Number(productData.bulk_price || productData.bulkPrice) || 0,
    weight: productData.weight || '',
    is_variants: productData.is_variants ? 1 : 0,
    status: productData.status || 'Active',
    category: productData.category || '',
    images: productData.images && productData.images.length > 0
      ? productData.images
      : ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80']
  };

  const updated = [newProduct, ...items];
  saveStoredProducts(updated);
  return { success: true, message: 'Product added successfully', data: newProduct };
};

export const updateProduct = async (id, productData) => {
  await new Promise((res) => setTimeout(res, 300));
  const items = getStoredProducts();
  const updated = items.map((item) => (item.id === id ? { ...item, ...productData } : item));
  saveStoredProducts(updated);
  return { success: true, message: 'Product updated successfully' };
};

export const deleteProduct = async (id) => {
  await new Promise((res) => setTimeout(res, 200));
  const items = getStoredProducts();
  const updated = items.filter((item) => item.id !== id);
  saveStoredProducts(updated);
  return { success: true, message: 'Product deleted successfully' };
};
