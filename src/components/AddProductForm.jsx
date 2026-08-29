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

export default function AddProductForm({ formData, setFormData, onReset }) {
  const fileInputRef = useRef(null);

  const brandOptions = ['Aura Gifts', 'Royal Celebrations', 'CraftyMoments', 'FestiveVibe', 'LuxeBox'];
  const categoryOptions = ['Personalized Gifts', 'Festive Sweets', 'Corporate Kits', 'Handmade Decor', 'Gourmet Baskets'];
  const occasionOptions = ['Birthday', 'Anniversary', 'Diwali', 'Wedding', 'Corporate Event', 'Valentine\'s Day'];
  const tagOptions = ['Best Seller', 'New Arrival', 'Limited Edition', 'Eco-Friendly', 'Express Shipping'];
  const vendorOptions = ['Global Artisans Ltd', 'Pradesh Crafts Co.', 'Heritage Creations', 'Urban Gift Supply'];
  const audienceOptions = ['Family & Friends', 'Corporate Clients', 'Kids & Teens', 'Couples', 'Everyone'];

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImageUrls = files.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImageUrls].slice(0, 5),
      }));
    }
  };

  const isFormComplete = Boolean(formData.productName && formData.brand && formData.category);

  return (
    <div className="space-y-6">
      {/* Product Information Form Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        
        {/* Card Header */}
        <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Product Information
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Add a product and organize it using your existing catalog data.
            </p>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="space-y-5">
          {/* Row 1: Product Name & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
                placeholder="Enter product name"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Brand <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Search and select brand...</option>
                  {brandOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Category (Full Width) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Search and select category...</option>
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Row 3: Suitable Occasions & Product Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Suitable Occasions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Suitable Occasions
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={formData.occasions}
                  onChange={(e) => handleChange('occasions', e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Search and select occasions...</option>
                  {occasionOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Product Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Tags
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Search and select tags...</option>
                  {tagOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 4: Vendor & Gifts For Everyone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vendor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Vendor
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={formData.vendor}
                  onChange={(e) => handleChange('vendor', e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Search and select vendor...</option>
                  {vendorOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Gifts For Everyone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gifts For Everyone
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={formData.giftsForEveryone}
                  onChange={(e) => handleChange('giftsForEveryone', e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Search and select audience...</option>
                  {audienceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Images Dropzone Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Images
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 rounded-2xl p-8 text-center transition-all cursor-pointer group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
              <div className="w-12 h-12 bg-white text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md border border-purple-100 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Drag & drop images here <span className="text-slate-400 font-normal">or</span>
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-500/20 transition-all"
              >
                Browse Images
              </button>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-2 text-center">
              You can upload up to 5 images. Recommended size: 1280x1280px
            </p>
          </div>

        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Completion status indicator */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{isFormComplete ? 'All required information completed' : 'Fill required fields (*)'}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            Cancel
          </button>
          
          <button
            type="button"
            className="px-4 py-2.5 bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
