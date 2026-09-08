import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const getHeaderDetails = (pathname) => {
  if (pathname.startsWith('/products/duplicate') || pathname.startsWith('/products/clone')) {
    return { title: 'Duplicate Product', category: 'Products', categoryRoute: '/products', page: 'Duplicate Product' };
  }
  if (pathname.startsWith('/products/edit')) {
    return { title: 'Edit Product Details', category: 'Products', categoryRoute: '/products', page: 'Edit Product' };
  }

  const routes = {
    '/': { title: 'Dashboard Overview', category: 'Main', categoryRoute: '/', page: 'Dashboard' },
    '/dashboard': { title: 'Dashboard Overview', category: 'Main', categoryRoute: '/dashboard', page: 'Dashboard' },
    '/products': { title: 'All Products Catalog', category: 'Products', categoryRoute: '/products', page: 'All Products' },
    '/products/add': { title: 'Add New Product', category: 'Products', categoryRoute: '/products', page: 'Add Product' },
    '/categories': { title: 'Category Management', category: 'Catalog', categoryRoute: '/categories', page: 'Categories' },
    '/occasions': { title: 'Occasion Management', category: 'Catalog', categoryRoute: '/occasions', page: 'Occasions' },
    '/gifts-for-everyone': { title: 'Gifts For Everyone Management', category: 'Catalog', categoryRoute: '/gifts-for-everyone', page: 'Gifts For Everyone' },
    '/brands': { title: 'Brand Management', category: 'Catalog', categoryRoute: '/brands', page: 'Brands' },
    '/tags': { title: 'Tag Management', category: 'Catalog', categoryRoute: '/tags', page: 'Tags' },
    '/attributes': { title: 'Attribute Management', category: 'Catalog', categoryRoute: '/attributes', page: 'Attributes' },
    '/share-slugs': { title: 'Shareable Catalog Links', category: 'Products & Sharing', categoryRoute: '/share-slugs', page: 'Shareable Links' },
    '/share-slug': { title: 'Shareable Catalog Links', category: 'Products & Sharing', categoryRoute: '/share-slugs', page: 'Shareable Links' },
    '/vendors': { title: 'Vendor Management', category: 'Catalog', categoryRoute: '/vendors', page: 'Vendors' },
    '/enquiries': { title: 'Customer Enquiries', category: 'Enquiries & Reports', categoryRoute: '/enquiries', page: 'Enquiries' },
    '/reports/enquiry': { title: 'Enquiry Analytics & Reports', category: 'Enquiries & Reports', categoryRoute: '/reports/enquiry', page: 'Reports' },
    '/profile': { title: 'Admin Account Profile', category: 'Account', categoryRoute: '/profile', page: 'Profile' },
    '/change-password': { title: 'Change Security Password', category: 'Account', categoryRoute: '/profile', page: 'Change Password' }
  };

  return routes[pathname] || { title: 'Gift Management', category: 'Admin', categoryRoute: '/', page: 'Overview' };
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
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
          {details.categoryRoute ? (
            <button
              type="button"
              onClick={() => navigate(details.categoryRoute)}
              className="text-slate-500 hover:text-purple-600 transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center font-semibold"
              title={`Go to ${details.category}`}
            >
              {details.category}
            </button>
          ) : (
            <span className="text-slate-500">{details.category}</span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-purple-600 font-bold">{details.page}</span>
        </div>
      </div>
    </header>
  );
}
