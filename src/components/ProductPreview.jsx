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
  ImagePlus,
  DollarSign,
  Barcode
} from 'lucide-react';

export default function ProductPreview({ formData }) {
  const name = formData.product_name || formData.productName;
  const salePrice = formData.sale_price || formData.salePrice;

  const previewItems = [
    { label: 'Product Name', value: name, icon: Package },
    { label: 'SKU Code', value: formData.sku, icon: Barcode },
    { label: 'Regular Price', value: formData.price ? `₹ ${formData.price}` : '', icon: DollarSign },
    { label: 'Sale Price', value: salePrice ? `₹ ${salePrice}` : '', icon: DollarSign },
    { label: 'Weight', value: formData.weight, icon: Tag },
    { label: 'Brand', value: formData.brand, icon: Award },
    { label: 'Category', value: formData.category, icon: Folders },
    { label: 'Occasions', value: formData.occasions, icon: Calendar },
    { label: 'Recipients Tag', value: formData.giftsForEveryone || formData.recipients, icon: Users },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs sticky top-6">
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
            Real-time catalog entry summary
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
            <div className="w-24 h-20 border-4 border-purple-200/60 rounded-xl flex items-center justify-center bg-white/40 shadow-inner">
              <div className="w-8 h-8 rounded-full bg-purple-200/60 -mt-6 -mr-8"></div>
            </div>
          </div>
        )}

        <div className="absolute bottom-3 right-3 w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-md border border-purple-100">
          <ImagePlus className="w-4 h-4" />
        </div>
      </div>

      {/* Dynamic Summary */}
      <div className="space-y-3">
        {previewItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="pb-2 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Icon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700">
                  {item.label}
                </span>
              </div>
              <div className="pl-5">
                {item.value ? (
                  <p className="text-xs font-semibold text-purple-900 bg-purple-50 inline-block px-2 py-0.5 rounded-lg border border-purple-100">
                    {item.value}
                  </p>
                ) : (
                  <span className="text-[10px] text-slate-300 italic">Not set</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
