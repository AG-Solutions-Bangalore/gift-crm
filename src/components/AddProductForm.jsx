import React, { useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  UploadCloud, 
  CheckCircle2, 
  Bookmark, 
  Plus, 
  ChevronDown 
} from 'lucide-react';

export default function AddProductForm({ formData, setFormData, onReset, onSave }) {
  const fileInputRef = useRef(null);

  const brandOptions = ['ArtisanCraft', 'ChocoLux', 'UrbanHide', 'FloraBloom', 'CakeStudio'];
  const categoryOptions = ['Birthday', 'Birthday Gifts', 'Birthday Cakes', 'Chocolate Cakes', 'Red Velvet Cakes', 'Photo Cakes', 'Eggless Cakes', 'Birthday Flowers'];
  const occasionOptions = ['Birthday', 'Anniversary', 'Wedding', 'Rakhi', 'Congratulations', 'Housewarming', 'Baby Shower'];
  const tagOptions = ['Bestseller', 'New Arrival', 'Premium', 'Same Day Delivery', 'Midnight Delivery', 'Trending'];
  const vendorOptions = ['Heritage Crafts Co.', 'ChocoLux Artisans', 'UrbanHide Studio', 'Bloom & Garden'];
  const recipientOptions = ['For Him', 'For Her', 'For Kids', 'For Wife', 'For Husband', 'For Mother', 'For Father', 'Roses', 'Orchids', 'Lilies', 'Chocolate'];

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto generate slug if product_name changed
      if (field === 'product_name' || field === 'productName') {
        updated.product_name = value;
        updated.productName = value;
        if (!prev.slugManuallyEdited) {
          updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
      }
      return updated;
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImageUrls = files.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImageUrls].slice(0, 5),
      }));
    }
  };

  const isFormComplete = Boolean(formData.product_name || formData.productName);

  return (
    <div className="space-y-6">
      {/* Product Information Form Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        
        {/* Card Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Product Information
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Matched directly to database tables (Products, Products_Category, Products_Variants, Recipients).
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Row 1: Product Name & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Name (product_name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.product_name || formData.productName || ''}
                onChange={(e) => handleChange('product_name', e.target.value)}
                placeholder="e.g. Chocolate Truffle Cake"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Brand
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={formData.brand || ''}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">Select Brand...</option>
                  {brandOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Slug & SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                URL Slug (slug)
              </label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, slug: e.target.value, slugManuallyEdited: true }));
                }}
                placeholder="e.g. chocolate-truffle-cake"
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-mono text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SKU Code (sku)
              </label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="e.g. CAKE-001"
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-mono text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Row 3: Price, Sale Price, Bulk Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Regular Price (price) ₹
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="699"
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sale Price (sale_price) ₹
              </label>
              <input
                type="number"
                value={formData.sale_price || formData.salePrice || ''}
                onChange={(e) => handleChange('sale_price', e.target.value)}
                placeholder="549"
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-purple-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bulk Price (bulk_price) ₹
              </label>
              <input
                type="number"
                value={formData.bulk_price || formData.bulkPrice || ''}
                onChange={(e) => handleChange('bulk_price', e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Row 4: Weight, Dimensions (Length, Width, Height) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Weight
              </label>
              <input
                type="text"
                value={formData.weight || ''}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="500g"
                className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Length
              </label>
              <input
                type="text"
                value={formData.length || ''}
                onChange={(e) => handleChange('length', e.target.value)}
                placeholder="10 cm"
                className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Width
              </label>
              <input
                type="text"
                value={formData.width || ''}
                onChange={(e) => handleChange('width', e.target.value)}
                placeholder="10 cm"
                className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Height
              </label>
              <input
                type="text"
                value={formData.height || ''}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="5 cm"
                className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Row 5: Category & Recipients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <div className="relative">
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer"
                >
                  <option value="">Select Category...</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Recipients (Product Recipients)
              </label>
              <div className="relative">
                <select
                  value={formData.giftsForEveryone || formData.recipients || ''}
                  onChange={(e) => {
                    handleChange('giftsForEveryone', e.target.value);
                    handleChange('recipients', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer"
                >
                  <option value="">Select Recipient Tag...</option>
                  {recipientOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 6: Occasions & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Occasions
              </label>
              <select
                value={formData.occasions || ''}
                onChange={(e) => handleChange('occasions', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">Select Occasion...</option>
                {occasionOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Tags
              </label>
              <select
                value={formData.tags || ''}
                onChange={(e) => handleChange('tags', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">Select Tag...</option>
                {tagOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Images Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Images (Products_Image)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
              <div className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md border border-purple-100 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Click or drag & drop product images
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-3.5 py-2 rounded-xl text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{isFormComplete ? 'Ready to add product' : 'Product name required (*)'}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={onSave}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
