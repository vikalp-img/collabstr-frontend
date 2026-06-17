import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Common Pagination Component
 * 
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {number} totalItems - Total count of all items across all pages
 * @param {number} itemsCount - Number of items currently displayed on this page
 * @param {string} label - Plural noun for the items (e.g., "orders", "bookings")
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsCount, 
  label = "items" 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 border-t border-gray-50 bg-gray-50/30">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        Showing <span className="text-gray-900">{itemsCount}</span> of <span className="text-gray-900">{totalItems}</span> {label}
      </p>
      
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                    currentPage === page 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200" 
                    : "bg-white border border-gray-100 text-gray-600 hover:border-purple-200 hover:text-purple-600"
                  }`}
                >
                  {page}
                </button>
              );
            } else if (
              (page === currentPage - 2 && page > 1) || 
              (page === currentPage + 2 && page < totalPages)
            ) {
              return <span key={page} className="px-1 text-gray-400 font-bold text-xs">...</span>;
            }
            return null;
          })}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
