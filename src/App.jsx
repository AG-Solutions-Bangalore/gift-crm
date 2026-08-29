import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AddProductForm from './components/AddProductForm';
import ProductPreview from './components/ProductPreview';

export default function App() {
  const [activeNav, setActiveNav] = useState('add-product');

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

  // Helper title lookup for active navigation tab
  const getNavTitle = (id) => {
    const titles = {
      'dashboard': 'Dashboard',
      'all-products': 'All Products',
      'add-product': 'Add New Product',
      'brands': 'Brands',
      'categories': 'Categories',
      'occasions': 'Occasions',
      'tags': 'Tags',
      'vendors': 'Vendors',
      'gifts-for-everyone': 'Gifts For Everyone'
    };
    return titles[id] || 'Overview';
  };

  return (
    <div className="flex min-h-screen bg-[#f6f7fb]">
      {/* 
        Sidebar divided into 3 distinct sections:
        1. Top fixed: Logo + Shop Name (UtsavGifts)
        2. Middle scrollable: Navigation list categories (Main, Products, Catalog)
        3. Bottom: Admin profile & footer buttons
      */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {activeNav === 'add-product' ? (
            <>
              <Header />

              {/* Grid Layout: 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form Column (Spans 2 cols on desktop) */}
                <div className="lg:col-span-2">
                  <AddProductForm 
                    formData={formData} 
                    setFormData={setFormData}
                    onReset={handleReset}
                  />
                </div>

                {/* Live Preview Column (Spans 1 col on desktop) */}
                <div className="lg:col-span-1">
                  <ProductPreview formData={formData} />
                </div>
              </div>
            </>
          ) : (
            /* Empty state when clicking other menu items */
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {getNavTitle(activeNav)}
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Section overview and management
                </p>
              </div>

              <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center min-h-[450px]">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-400 flex items-center justify-center mb-4 border border-purple-100/60">
                  <span className="text-2xl font-bold">✨</span>
                </div>
                <h3 className="text-base font-bold text-slate-700">
                  {getNavTitle(activeNav)} Section
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  This view is intentionally left empty. Click <span className="font-semibold text-purple-600">Add Product</span> on the sidebar to display the product creation interface.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

