// src/components/TablePagination.js (معدل مع Dark Mode الكامل)
import React from 'react';

function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  darkMode = false
}) {
  // توليد أرقام الصفحات
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // عدد الصفحات المرئية

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // تعديل بداية الصفحات إذا كنا في النهاية
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav aria-label="Page navigation">
      <div className="d-flex justify-content-between align-items-center my-4">
        {/* معلومات الصفحة */}
        <div className={`page-info`}
          style={{
            color: darkMode ? '#b0b0b0' : '#6c757d',
            fontSize: '0.9rem'
          }}>
          عرض {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} من {totalItems} كورس
        </div>

        {/* أزرار الصفحات */}
        <ul className="pagination mb-0">
          {/* زر الصفحة السابقة */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className={`page-link`}
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              aria-label="Previous"
              disabled={currentPage === 1}
              style={{
                backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                color: darkMode ? '#e0e0e0' : '#0d6efd',
                borderColor: darkMode ? '#4CACB7' : '#dee2e6',
                border: '1px solid',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}>
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>

          {/* أرقام الصفحات */}
          {pageNumbers.map(page => (
            <li
              key={page}
              className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button
                className={`page-link`}
                onClick={() => onPageChange(page)}
                style={{
                  backgroundColor: currentPage === page
                    ? (darkMode ? '#4CACB7' : '#0d6efd')
                    : (darkMode ? '#1e1e1e' : '#fff'),
                  color: currentPage === page
                    ? '#fff'
                    : (darkMode ? '#e0e0e0' : '#0d6efd'),
                  borderColor: darkMode ? '#4CACB7' : '#dee2e6',
                  border: '1px solid',
                  cursor: 'pointer'
                }}>
                {page}
              </button>
            </li>
          ))}

          {/* زر الصفحة التالية */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className={`page-link`}
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              aria-label="Next"
              disabled={currentPage === totalPages}
              style={{
                backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                color: darkMode ? '#e0e0e0' : '#0d6efd',
                borderColor: darkMode ? '#4CACB7' : '#dee2e6',
                border: '1px solid',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}>
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default TablePagination;