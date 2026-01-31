// src/components/InvoiceCard.js
import React from 'react';
import { FaFileInvoiceDollar } from 'react-icons/fa';

function InvoiceCard({ data }) {
  // CSS داخلي محسن لوضوح النص في Dark Mode
  const styles = `
    .invoice-card {
      transition: all 0.3s ease;
    }
    
    .dark-mode .invoice-card {
      background-color: var(--bs-dark) !important;
      border-color: var(--bs-danger) !important;
    }
    
    .dark-mode .invoice-card .card-header {
      background-color: var(--bs-danger) !important;
      border-bottom-color: var(--bs-danger) !important;
    }
    
    .dark-mode .invoice-card .card-body {
      color: var(--bs-light) !important;
      background-color: transparent !important;
    }
    
    .dark-mode .invoice-card strong {
      color: #f8f9fa !important; /* أبيض فاتح للعناوين */
    }
    
    .dark-mode .invoice-card .badge {
      background-color: var(--bs-danger) !important;
      color: var(--bs-light) !important;
    }
    
    .dark-mode .invoice-card hr {
      border-color: var(--bs-gray-700) !important;
    }
    
    .dark-mode .invoice-card .table {
      color: var(--bs-light) !important;
      background-color: transparent !important;
    }
    
    .dark-mode .invoice-card .table-bordered {
      border-color: var(--bs-gray-700) !important;
    }
    
    .dark-mode .invoice-card .table-bordered th,
    .dark-mode .invoice-card .table-bordered td {
      border-color: var(--bs-gray-700) !important;
      background-color: var(--bs-gray-900) !important;
    }
    
    .dark-mode .invoice-card .table-light {
      background-color: var(--bs-gray-800) !important;
      color: var(--bs-light) !important;
    }
    
    .dark-mode .invoice-card thead.table-light th {
      background-color: var(--bs-gray-800) !important;
      color: #f8f9fa !important; /* أبيض فاتح لعناوين الجدول */
    }
    
    .dark-mode .invoice-card tfoot.table-light th {
      background-color: var(--bs-gray-800) !important;
      color: #f8f9fa !important; /* أبيض فاتح لتذييلة الجدول */
    }
    
    /* الحل الرئيسي: تحسين وضوح نص الجدول في Dark Mode */
    .dark-mode .invoice-card .table td {
      color: #ffffff !important; /* أبيض نقي لجميع خلايا الجدول */
    }
    
    /* تحسين خاص للنص الوصفي (مراجعة شهر نوفمبر...) */
    .dark-mode .invoice-card .table td:first-child {
      color: #ffffff !important; /* أبيض نقي للعمود الأول */
      font-weight: 500; /* سماكة متوسطة للوضوح */
    }
    
    /* تحسين للأرقام في الجدول */
    .dark-mode .invoice-card .table td:not(:first-child) {
      color: #e9ecef !important; /* أبيض فاتح للأرقام */
      font-weight: 500; /* سماكة متوسطة */
    }
    
    /* تحسين صفوف الجدول عند hover */
    .dark-mode .invoice-card .table-hover tbody tr:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }
    
    /* تحسين تباين الصفوف */
    .dark-mode .invoice-card tbody tr:nth-child(even) {
      background-color: rgba(255, 255, 255, 0.02) !important;
    }
    
    .dark-mode .invoice-card tbody tr:nth-child(odd) {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }
    
    /* تحسين وضوح نص الإجمالي في التذييلة */
    .dark-mode .invoice-card tfoot th {
      color: #ffffff !important;
      font-weight: 600;
    }
    
    .dark-mode .invoice-card tfoot td {
      color: #ffffff !important;
      font-weight: 700; /* سماكة عالية للإجمالي */
    }
    
    .invoice-header {
      display: flex;
      align-items: center;
    }
    
    .invoice-title {
      color: inherit !important;
    }
    
    /* تحسين وضوح عنوان الفاتورة */
    .dark-mode .invoice-card .invoice-title {
      color: #f8f9fa !important;
      font-weight: 600;
    }
    
    /* تحسينات عامة */
    .invoice-card .table-responsive {
      border-radius: 0.375rem;
      overflow: hidden;
    }
    
    .invoice-card tbody tr {
      transition: background-color 0.2s ease;
    }
    
    .invoice-card tbody tr:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    /* زيادة تباعد الأسطر للقراءة */
    .dark-mode .invoice-card .table td,
    .dark-mode .invoice-card .table th {
      padding: 0.75rem 1rem;
    }
    
    /* تحسين خاصة للنص الوصفي الطويل */
    .invoice-description-cell {
      color: inherit;
    }
    
    .dark-mode .invoice-description-cell {
      color: #ffffff !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    /* تحسين للأرقام المالية */
    .invoice-amount-cell {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .dark-mode .invoice-amount-cell {
      color: #e9ecef !important;
      font-weight: 600;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="row">
        <div className="col-12">
          <div className="card border-danger invoice-card shadow-sm">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0 invoice-header">
                <FaFileInvoiceDollar className="me-2" />
                تفاصيل الفاتورة - غير مدفوعة بعد
              </h5>
            </div>
            <div className="card-body pb-0">
              {/* معلومات الفاتورة الأساسية */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>رقم الفاتورة:</strong> {data.invoiceNumber}
                </div>
                <div className="col-md-6">
                  <strong>تاريخ الإصدار:</strong> {data.issueDate}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>تاريخ الاستحقاق:</strong> {data.dueDate}
                </div>
                <div className="col-md-6">
                  <strong>الحالة:</strong> 
                  <span className="badge bg-danger ms-2">{data.status}</span>
                </div>
              </div>
              <hr />
              
              {/* جدول تفاصيل الدفع */}
              <h6 className="invoice-title">تفاصيل الدفع</h6>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>الوصف</th>
                      <th>الكمية</th>
                      <th>سعر الوحدة</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, index) => (
                      <tr key={index}>
                        <td className="invoice-description-cell">
                          {item.description}
                        </td>
                        <td className="invoice-amount-cell">{item.quantity}</td>
                        <td className="invoice-amount-cell">{item.unitPrice}</td>
                        <td className="invoice-amount-cell">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="3" className="text-end">
                        المبلغ الإجمالي المستحق:
                      </th>
                      <th className="invoice-amount-cell">{data.grandTotal}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InvoiceCard;