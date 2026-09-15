import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Universal Pagination Component
 *
 * @param {number} currentPage - Active page (1-based index)
 * @param {number} totalItems - Total number of records
 * @param {number|string} pageSize - Number of items per page (or 'all' / large number)
 * @param {function} onPageChange - Callback when page changes (newPage: number)
 * @param {function} [onPageSizeChange] - Callback when page size changes (newSize: number)
 * @param {Array<number|string>} [pageSizeOptions] - Dropdown options, default: [10, 20, 50, 100, 200]
 * @param {string} [itemName] - Name of entity, default: 'items' (e.g. 'products', 'categories')
 * @param {boolean} [showPageSize] - Whether to show the items-per-page selector, default: true
 * @param {string} [className] - Optional extra wrapper class
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100, 200],
  itemName = 'items',
  showPageSize = true,
  className = '',
}) {
  const numericPageSize = pageSize === 'all' || pageSize === 'All' ? totalItems || 1 : Number(pageSize) || 20;
  const totalPages = Math.max(1, Math.ceil(totalItems / numericPageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems <= 0) return null;

  const startItem = (safeCurrentPage - 1) * numericPageSize + 1;
  const endItem = Math.min(totalItems, safeCurrentPage * numericPageSize);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages && page !== safeCurrentPage) {
      onPageChange?.(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 bg-white border-t border-slate-100 text-xs font-semibold text-slate-600 select-none ${className}`}
    >
      {/* Left side: Results Count & Page Size Dropdown */}
      <div className="flex items-center flex-wrap gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <span className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{startItem}</span> to{' '}
          <span className="font-bold text-slate-800">{endItem}</span> of{' '}
          <span className="font-bold text-slate-900">{totalItems}</span> {itemName}
        </span>

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium hidden sm:inline">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? totalItems : Number(e.target.value);
                onPageSizeChange(val);
                onPageChange?.(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'all' || opt === 'All' ? 'All' : `${opt}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Navigation Controls (Always visible) */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center w-full sm:w-auto">
        {/* First Page */}
        <button
          type="button"
          onClick={() => handlePageClick(1)}
          disabled={safeCurrentPage === 1}
          title="First Page"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => handlePageClick(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          title="Previous Page"
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer font-bold text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 font-bold tracking-widest text-xs select-none"
                >
                  ...
                </span>
              );
            }

            const isActive = p === safeCurrentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePageClick(p)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/30'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => handlePageClick(safeCurrentPage + 1)}
          disabled={safeCurrentPage === totalPages}
          title="Next Page"
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer font-bold text-xs"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => handlePageClick(totalPages)}
          disabled={safeCurrentPage === totalPages}
          title="Last Page"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
