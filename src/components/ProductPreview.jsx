import React from 'react';
import { 
  Eye, 
  Package, 
  DollarSign, 
  Barcode, 
  Tag as TagIcon, 
  Sparkles, 
  ImagePlus, 
  Layers
} from 'lucide-react';

export default function ProductPreview({ formData }) {
  const name = formData.product_name || formData.productName;
  const mrp = formData.product_mrp ?? formData.price;
  const salePrice = formData.product_sale_price ?? formData.salePrice;
  const hasVariants = Number(formData.has_variants) === 1;

  const firstImage =
    Array.isArray(formData.images) && formData.images.length > 0
      ? typeof formData.images[0] === 'string'
        ? formData.images[0]
        : formData.images[0].product_images || formData.images[0].preview || formData.images[0].url
      : null;

  const previewItems = [
    { label: 'Product Name', value: name, icon: Package },
    { label: 'Barcode', value: formData.product_barcode, icon: Barcode },
    { 
      label: 'Type', 
      value: hasVariants ? `Variants (${formData.variants?.length || 0})` : 'Single Product', 
      icon: Sparkles 
    },
    ...(hasVariants
      ? []
      : [
          { label: 'MRP', value: mrp ? `₹ ${mrp}` : '', icon: DollarSign },
          { label: 'Sale Price', value: salePrice ? `₹ ${salePrice}` : '', icon: DollarSign },
          { label: 'Weight', value: formData.product_weight, icon: TagIcon },
        ]),
    {
      label: 'Categories',
      value: formData.category_ids?.length ? `${formData.category_ids.length} selected` : '',
      icon: Layers
    },
    {
      label: 'Occasions',
      value: formData.occasion_ids?.length ? `${formData.occasion_ids.length} selected` : '',
      icon: Layers
    },
    {
      label: 'Vendors',
      value: formData.vendor_ids?.length ? `${formData.vendor_ids.length} selected` : '',
      icon: Layers
    },
    {
      label: 'Tags',
      value: formData.tag_ids?.length ? `${formData.tag_ids.length} selected` : '',
      icon: TagIcon
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs sticky top-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            Live Product Preview
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Real-time catalog entry summary
          </p>
        </div>
      </div>

      {/* Image Preview Canvas */}
      <div className="relative aspect-4/3 rounded-2xl bg-gradient-to-br from-slate-100 via-purple-50/50 to-indigo-50/40 border border-slate-200/70 flex items-center justify-center overflow-hidden mb-6 group">
        {firstImage ? (
          <img
            src={firstImage}
            alt="Preview"
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <Package className="w-12 h-12 text-slate-300 mb-1" />
            <span className="text-[11px] text-slate-400 font-medium">No Image Uploaded</span>
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
