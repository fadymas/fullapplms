// src/components/requests/RequestsPagination.jsx
import React from 'react';
import { 
    FaAngleDoubleRight, 
    FaAngleRight, 
    FaAngleLeft, 
    FaAngleDoubleLeft 
} from 'react-icons/fa';

const RequestsPagination = ({ 
    currentPage = 1, 
    totalPages = 1, 
    onPageChange = () => {},
    itemsPerPage = 5,
    totalItems = 0
}) => {
    
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // عرض كل الصفحات
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // منطق لعرض مجموعة محددة من الصفحات
            let startPage, endPage;
            
            if (currentPage <= 3) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            // إضافة علامات النقاط
            if (startPage > 1) {
                pages.unshift('...');
                pages.unshift(1);
            }
            
            if (endPage < totalPages) {
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <nav aria-label="طلبات الكورسات">
            <div className="d-flex justify-content-between align-items-center mt-4 mb-5">
                <div className="text-muted d-none d-md-block">
                    <small>
                        عرض {startItem} إلى {endItem} من {totalItems} طلب
                    </small>
                </div>
                
                <ul className="pagination justify-content-center mb-0">
                    {/* الانتقال للصفحة الأولى */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                            className="page-link"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            aria-label="الصفحة الأولى"
                        >
                            <FaAngleDoubleRight />
                            <span className="d-none d-md-inline ms-1">الأولى</span>
                        </button>
                    </li>
                    
                    {/* الصفحة السابقة */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="الصفحة السابقة"
                        >
                            <FaAngleRight />
                            <span className="d-none d-md-inline ms-1">السابقة</span>
                        </button>
                    </li>
                    
                    {/* أرقام الصفحات */}
                    {renderPageNumbers().map((page, index) => (
                        <li 
                            key={index} 
                            className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                        >
                            {page === '...' ? (
                                <span className="page-link">...</span>
                            ) : (
                                <button 
                                    className="page-link"
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            )}
                        </li>
                    ))}
                    
                    {/* الصفحة التالية */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="الصفحة التالية"
                        >
                            <span className="d-none d-md-inline me-1">التالي</span>
                            <FaAngleLeft />
                        </button>
                    </li>
                    
                    {/* الانتقال للصفحة الأخيرة */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                            className="page-link"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            aria-label="الصفحة الأخيرة"
                        >
                            <span className="d-none d-md-inline me-1">الأخيرة</span>
                            <FaAngleDoubleLeft />
                        </button>
                    </li>
                </ul>
                
                <div className="d-flex align-items-center d-none d-md-flex">
                    <small className="text-muted me-2">الطلبات:</small>
                    <select 
                        className="form-select form-select-sm" 
                        style={{ width: '70px' }}
                        onChange={(e) => {
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10" selected>10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
        </nav>
    );
};

export default RequestsPagination;