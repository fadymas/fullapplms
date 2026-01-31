import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import Sidebar from '../components/Sidebar';
import InvoiceCard from '../components/InvoiceCard';
import PaymentForm from '../components/PaymentForm';
import Footer from '../components/Footer';

// Stores
import useUIStore from '../store/uiStore';

// Style & Icons
import '../styles/Fawry.css';
import { FaBarcode } from 'react-icons/fa';

function FawryPage() {
  const { darkMode } = useUIStore();
  const [courseAmount, setCourseAmount] = useState('100');

  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({ duration: 800 });
    }
  }, []);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (courseAmount && parseFloat(courseAmount) > 0) {
      alert(`Payment initiated for ${courseAmount} جنية via Fawry.`);
    } else {
      alert('Please enter a valid course amount.');
    }
  };

  const invoiceData = {
    invoiceNumber: '#INV-2025-001',
    issueDate: '15 ديسمبر 2024',
    dueDate: '20 ديسمبر 2024',
    status: 'غير مدفوع',
    items: [
      {
        description: 'مراجعة شهر نوفمبر اولي ثانوي - تسجيل الكورس',
        quantity: 1,
        unitPrice: '100 جنية',
        total: '100 جنية'
      }
    ],
    grandTotal: '100 جنية'
  };

  return (
    <div className={`fawry-page ${darkMode ? 'dark-mode' : ''}`}>
      <DashboardNavbar />
      <Sidebar activePage="profile" />

      <div className={`main-content ${darkMode ? 'dark-mode-bg' : ''}`}>
        <div className="container mt-5 pt-4">
          <div className="row">
            <div className="col-lg-12">
              <div className={`card mb-4 ${darkMode ? 'dark-mode-card' : ''}`}>
                <div className="card-body">
                  <InvoiceCard data={invoiceData} darkMode={darkMode} />

                  <div className="row mt-4">
                    <div className="col-12">
                      <PaymentForm
                        amount={courseAmount}
                        onAmountChange={setCourseAmount}
                        onSubmit={handlePaymentSubmit}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-12">
                      <div className={`card ${darkMode ? 'dark-mode-card' : ''}`}>
                        <div className="card-body">
                          <button
                            className={`btn w-100 px-4 py-2 d-flex align-items-center justify-content-center ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'
                              }`}
                            onClick={() => alert('سيتم فتح صفحة شحن الرصيد قريباً')}
                          >
                            اشحن الرصيد من كود السنتر
                            <FaBarcode className="ms-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default FawryPage;