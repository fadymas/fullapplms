// src/components/codes/CodePagination.jsx
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa'

const CodePagination = ({ nextPage, previousPage, currentPage, onPageChange }) => {
  const handlePageChange = (page) => {
    onPageChange(page)
  }

  return (
    <div className="d-flex justify-content-center align-items-center my-4">
      <nav aria-label="جدولة الأكواد">
        <ul className="pagination mb-0 mt-0">
          {/* الصفحة السابقة */}
          <li className={`page-item ${Number(currentPage) === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={Number(currentPage) === 1}
              aria-label="الصفحة السابقة"
            >
              <FaAngleRight />
            </button>
          </li>

          {/* أرقام الصفحات */}

          {!previousPage && (
            <li>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                {currentPage - 1}
              </button>
            </li>
          )}

          <li>
            <button className="page-link disabled" onClick={() => handlePageChange(currentPage)}>
              {currentPage}
            </button>
          </li>
          <li>
            {!nextPage && (
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                {currentPage + 1}
              </button>
            )}
          </li>

          {/* الصفحة التالية */}
          <li className={`page-item ${nextPage ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={nextPage}
              aria-label="الصفحة التالية"
            >
              <FaAngleLeft />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default CodePagination
