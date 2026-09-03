import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const getHeaderDetails = (pathname) => {
  const routes = {
    '/': { title: 'Dashboard Overview', category: 'Main', page: 'Dashboard' },
    '/products': { title: 'All Products Catalog', category: 'Products', page: 'All Products' },
    '/products/add': { title: 'Add New Product', category: 'Products', page: 'Add Product' },
    '/categories': { title: 'Category Management', category: 'Catalog', page: 'Categories' },
    '/occasions': { title: 'Occasion Management', category: 'Catalog', page: 'Occasions' },
    '/gifts-for-everyone': { title: 'Gifts For Everyone Management', category: 'Catalog', page: 'Gifts For Everyone' },
    '/brands': { title: 'Brand Management', category: 'Catalog', page: 'Brands' },
    '/tags': { title: 'Tag Management', category: 'Catalog', page: 'Tags' },
    '/attributes': { title: 'Attribute Management', category: 'Catalog', page: 'Attributes' },
    '/share-slugs': { title: 'Shareable Catalog Links', category: 'Products & Sharing', page: 'Shareable Links' },
    '/share-slug': { title: 'Shareable Catalog Links', category: 'Products & Sharing', page: 'Shareable Links' },
    '/vendors': { title: 'Vendor Management', category: 'Catalog', page: 'Vendors' },
    '/enquiries': { title: 'Customer Enquiries', category: 'Enquiries & Reports', page: 'Enquiries' },
    '/reports/enquiry': { title: 'Enquiry Analytics & Reports', category: 'Enquiries & Reports', page: 'Reports' },
    '/profile': { title: 'Admin Account Profile', category: 'Account', page: 'Profile' },
    '/change-password': { title: 'Change Security Password', category: 'Account', page: 'Change Password' }
  };

  return routes[pathname] || { title: 'Gift Management', category: 'Admin', page: 'Overview' };
};

export default function Header() {
  const location = useLocation();
  const details = getHeaderDetails(location.pathname);

  useEffect(() => {
    document.title = details.title ? `Gift CRM - ${details.title}` : 'Gift CRM';
  }, [details.title]);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {details.title}
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mt-1">
          <span className="text-slate-500">{details.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-purple-600 font-bold">{details.page}</span>
        </div>
      </div>
    </header>
  );
}
