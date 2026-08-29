import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AddProductForm from '../components/AddProductForm';
import ProductPreview from '../components/ProductPreview';
import { createProduct } from '../services/productApi';

export default function AddProductPage() {
  const navigate = useNavigate();
  const initialFormData = {
    productName: '',
    brand: '',
    category: '',
    occasions: '',
    tags: '',
    vendor: '',
    giftsForEveryone: '',
    images: []
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const handleSaveProduct = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.productName) {
      toast.error('Please enter a product name');
      return;
    }
    try {
      await createProduct(formData);
      toast.success('Product created successfully');
      navigate('/products');
    } catch (err) {
      toast.error('Failed to create product');
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <AddProductForm 
            formData={formData} 
            setFormData={setFormData}
            onReset={handleReset}
            onSave={handleSaveProduct}
          />
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-1">
          <ProductPreview formData={formData} />
        </div>
      </div>
    </MainLayout>
  );
}
