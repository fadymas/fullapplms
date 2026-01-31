// src/components/PaymentForm.js
import React from 'react';
import { FaCreditCard } from 'react-icons/fa';

function PaymentForm({ amount, onAmountChange, onSubmit }) {
  const handleInputChange = (e) => {
    onAmountChange(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  // CSS داخلي للتأثير المطلوب
  const styles = `
    .payment-card {
      transition: all 0.3s ease;
    }
    
    .dark-mode .payment-card {
      background-color: var(--bs-dark) !important;
      border-color: var(--bs-gray-700) !important;
    }
    
    .dark-mode .payment-card .card-header {
      background-color: var(--bs-warning) !important;
      border-bottom-color: var(--bs-warning) !important;
    }
    
    .dark-mode .payment-card .card-body {
      color: var(--bs-light) !important;
    }
    
    .dark-mode .payment-card .form-label {
      color: var(--bs-light) !important;
    }
    
    .dark-mode .payment-card .form-control {
      background-color: var(--bs-gray-800) !important;
      border-color: var(--bs-gray-700) !important;
      color: var(--bs-light) !important;
    }
    
    .dark-mode .payment-card .form-control:focus {
      background-color: var(--bs-gray-800) !important;
      border-color: var(--bs-warning) !important;
      color: var(--bs-light) !important;
      box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25) !important;
    }
    
    .dark-mode .payment-card .btn-warning {
      background-color: var(--bs-warning) !important;
      border-color: var(--bs-warning) !important;
      color: var(--bs-dark) !important;
      transition: all 0.3s ease !important;
    }
    
    /* تأثير hover للوضع الليلي فقط - بدون تغيير الألوان */
    .dark-mode .payment-card .btn-warning:hover {
      /* تأثير الـ brightness - زيادة الإضاءة */
      filter: brightness(110%);
      
      /* تأثير الظل الذهبي */
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.25);
      
      /* تأثير التكبير الخفيف */
      transform: scale(1.02);
      
      /* تأثير الرفع */
      transform: translateY(-2px);
      
      /* تأثير الحدود المشعة */
      border-color: var(--bs-warning) !important;
      outline: 2px solid rgba(255, 193, 7, 0.3);
      outline-offset: 2px;
    }
    
    /* التأكد من عدم تغيير الألوان عند hover */
    .dark-mode .payment-card .btn-warning:hover {
      background-color: var(--bs-warning) !important;
      border-color: var(--bs-warning) !important;
      color: var(--bs-dark) !important;
    }
    
    /* تأثير عند الضغط */
    .dark-mode .payment-card .btn-warning:active {
      transform: scale(0.98);
      filter: brightness(95%);
    }
    
    .payment-header {
      display: flex;
      align-items: center;
    }
    
    /* التأكد من أن hover لا يؤثر على الوضع العادي */
    .payment-card .btn-warning:not(.dark-mode):hover {
      /* تأثيرات hover العادية */
      background-color: var(--bs-warning) !important;
      filter: brightness(90%);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="card payment-card shadow-sm">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0 payment-header">
            <img src="../images/fawry.png" alt="Fawry" height="30" className="me-2" />
            الدفع بواسطة فوري
          </h5>
        </div>
        <div className="card-body">
          <h6 className="card-title text-body">بيانات الدفع للكورس</h6>
          <form id="fawryPaymentForm" onSubmit={handleFormSubmit}>
            <div className="mb-3 col-lg-4">
              <label htmlFor="courseAmount" className="form-label text-body">
                أدخل المبلغ (جنية)
              </label>
              <input
                type="text"
                className="form-control text-start bg-body text-body"
                id="courseAmount"
                placeholder="100"
                min="1"
                value={amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="pt-3">
              <button type="submit" className="btn btn-warning px-5 py-3 fw-semibold">
                <FaCreditCard className="me-2" />
                ادفع الآن
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default PaymentForm;