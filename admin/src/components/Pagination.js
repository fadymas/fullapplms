// src/components/ui/Pagination.jsx
import React from 'react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    isPrevDisabled,
    isNextDisabled
}) => {
    // Build a compact list of pages with ellipsis
    const getPageList = () => {
        const pages = [];
        const siblingCount = 1; // pages adjacent to current
        const leftSibling = Math.max(2, currentPage - siblingCount);
        const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);

        pages.push(1);

        if (leftSibling > 2) pages.push('left-ellipsis');

        for (let i = leftSibling; i <= rightSibling; i++) {
            if (i >= 2 && i <= totalPages - 1) pages.push(i);
        }

        if (rightSibling < totalPages - 1) pages.push('right-ellipsis');

        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    const pageItems = getPageList();

    return (
        <nav aria-label="User table pagination">
            <ul className="pagination justify-content-center">
                <li className={`page-item ${(isPrevDisabled ?? currentPage === 1) ? 'disabled' : ''}`}>
                    <button 
                        className="page-link" 
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={isPrevDisabled ?? currentPage === 1}
                    >
                        السابق
                    </button>
                </li>
                
                {pageItems.map((item, idx) => (
                    item === 'left-ellipsis' || item === 'right-ellipsis' ? (
                        <li key={item + idx} className="page-item disabled">
                            <span className="page-link">...</span>
                        </li>
                    ) : (
                        <li 
                            key={item} 
                            className={`page-item ${currentPage === item ? 'active' : ''}`}
                        >
                            <button 
                                className="page-link" 
                                onClick={() => onPageChange(item)}
                                disabled={item === currentPage}
                            >
                                {item}
                            </button>
                        </li>
                    )
                ))}
                
                <li className={`page-item ${(isNextDisabled ?? currentPage === totalPages) ? 'disabled' : ''}`}>
                    <button 
                        className="page-link" 
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={isNextDisabled ?? currentPage === totalPages}
                    >
                        التالي
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;