import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AddProductForm from '../components/AddProductForm';
import { useAuthContext } from '../context/AuthContext';
import { createProduct } from '../services/productApi';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);

  const initialFormData = {
    product_name: '',
    product_barcode: '',
    product_short_description: '',
    product_long_description: '',
    product_brand_id: '',
    category_ids: [],
    vendor_ids: [],
    occasion_ids: [],
    tag_ids: [],
    has_variants: 1,
    product_weight: '',
    product_mrp: '',
    product_sale_price: '',
    product_bulk_price: '',
    images: [],
    variants: []
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const handleSaveProduct = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.product_name || !formData.product_name.trim()) {
      toast.error('Product Name (product_name) is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await createProduct(formData, token);
      toast.success(res?.message || 'Product created successfully');
      navigate('/products');
    } catch (err) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <AddProductForm 
          formData={formData} 
          setFormData={setFormData}
          onReset={handleReset}
          onSave={handleSaveProduct}
          isSaving={isSaving}
        />
      </div>
    </MainLayout>
  );
}
