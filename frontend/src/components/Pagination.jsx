import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1 && total <= limit) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <div>
        Showing <span style={{ fontWeight: 600, color: '#0f172a' }}>{total > 0 ? startRecord : 0}</span> to{' '}
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{endRecord}</span> of{' '}
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{total}</span> entries
      </div>
      <div className="pagination-buttons">
        <button
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 500 }}>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next Page"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
