import React from 'react';
import { 
  Eye, 
  Package, 
  Award, 
  Folders, 
  Calendar, 
  Tag, 
  Store, 
  Users, 
  ImagePlus 
} from 'lucide-react';

export default function ProductPreview({ formData }) {
  const previewItems = [
    { label: 'Product Name', value: formData.productName, icon: Package },
    { label: 'Brand', value: formData.brand, icon: Award },
    { label: 'Category', value: formData.category, icon: Folders },
    { label: 'Occasions', value: formData.occasions, icon: Calendar },
    { label: 'Tags', value: formData.tags, icon: Tag },
    { label: 'Vendor', value: formData.vendor, icon: Store },
    { label: 'Gifts For Everyone', value: formData.giftsForEveryone, icon: Users },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm sticky top-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Product Preview
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            See how your product information will appear
          </p>
        </div>
      </div>

      {/* Image Preview Canvas */}
      <div className="relative aspect-4/3 rounded-2xl bg-gradient-to-br from-slate-100 via-purple-50/50 to-indigo-50/40 border border-slate-200/70 flex items-center justify-center overflow-hidden mb-6 group">
        {formData.images && formData.images.length > 0 ? (
          <img
            src={formData.images[0]}
            alt="Preview"
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            {/* Subtle placeholder icon illustration matching reference */}
            <div className="w-24 h-20 border-4 border-purple-200/60 rounded-xl flex items-center justify-center bg-white/40 shadow-inner">
              <div className="w-8 h-8 rounded-full bg-purple-200/60 -mt-6 -mr-8"></div>
            </div>
          </div>
        )}

        {/* Image upload badge icon */}
        <div className="absolute bottom-3 right-3 w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-md border border-purple-100">
          <ImagePlus className="w-4 h-4" />
        </div>
      </div>

      {/* Real-time Form Fields Dynamic Summary */}
      <div className="space-y-4">
        {previewItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="flex items-center gap-2.5 mb-1">
                <Icon className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">
                  {item.label}
                </span>
              </div>
              <div className="pl-6">
                {item.value ? (
                  <p className="text-xs font-semibold text-purple-900 bg-purple-50/60 inline-block px-2.5 py-1 rounded-lg border border-purple-100">
                    {item.value}
                  </p>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-slate-200 rounded-full"></span>
                    <span className="w-4 h-0.5 bg-slate-200 rounded-full"></span>
                    <span className="w-3 h-0.5 bg-slate-200 rounded-full"></span>
                    <span className="w-2 h-0.5 bg-slate-200 rounded-full"></span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
