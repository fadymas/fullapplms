// src/components/InstructionsModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function InstructionsModal({ show, onClose }) {
  // بيانات تعليمات المنصة
  const instructions = [
    {
      icon: 'fa-desktop',
      title: 'المنصة موقع ويب مش تطبيق',
      points: [
        { text: 'المنصة هي موقع ويب، مش أبلكيشن، ومش محتاجة تحميل.', type: 'success' },
        { text: 'تعمل على Google Chrome, Mozilla Firefox, Opera (آخر إصدار).', type: 'success' },
        { text: 'المتصفحات القديمة قد تسبب مشاكل في التشغيل', type: 'error' },
      ]
    },
    {
      icon: 'fa-tablet',
      title: 'الأجهزة المتوافقة',
      points: [
        { text: 'تعمل على الموبايل، اللاب توب، الكمبيوتر العادي.', type: 'success' },
        { text: 'التابلت المدرسي غير مدعوم، حتى لو متهكر', type: 'error' },
      ]
    },
    {
      icon: 'fa-graduation-cap',
      title: 'تأكد من الكورس قبل الاشتراك',
      points: [
        { text: 'بعد الاشتراك لا يمكن استرجاع أو تبديل الكورس.', type: 'warning' },
        { text: 'اقرأ تفاصيل الكورس (المحتوى، عدد الفيديوهات، مدة الاشتراك).', type: 'success' },
        { text: 'لو مش متأكد، اسأل قبل الاشتراك.', type: 'success' },
      ]
    },
    {
      icon: 'fa-wifi',
      title: 'سرعة الإنترنت',
      points: [
        { text: 'استخدم Wi-Fi قوي أو 4G مستقرة.', type: 'success' },
        { text: 'الإنترنت الضعيف قد يسبب مشاكل في تشغيل الفيديوهات.', type: 'error' },
      ]
    },
    {
      icon: 'fa-user',
      title: 'الحساب شخصي فقط',
      points: [
        { text: 'الحساب مخصص لاستخدامك الشخصي فقط.', type: 'error' },
        { text: 'مشاركة الحساب يؤدي إلى إغلاقه نهائيًا.', type: 'error' },
      ]
    },
  ];

  return (
    <Modal 
      show={show} 
      onHide={onClose}
      size="xl"
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-4 text-center w-100">
          <i className="fa fa-book me-2" style={{ color: '#4CACB7' }}></i>
          تعليمات منصة مستر محمد غانم 2025
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body-scroll py-3">
        <div className="container">
          <div className="row g-3">
            {instructions.map((instruction, index) => (
              <div className="col-lg-4 col-md-6 mb-3" key={index}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title fw-bold pb-2 d-flex align-items-center">
                      <i className={`fas ${instruction.icon} pe-2`} style={{ color: '#4CACB7' }}></i>
                      {instruction.title}
                    </h6>
                    {instruction.points.map((point, pointIndex) => (
                      <p className="card-text small mb-2 d-flex align-items-start" key={pointIndex}>
                        <i className={`fa ${
                          point.type === 'success' ? 'fa-check-circle' :
                          point.type === 'error' ? 'fa-times-circle' :
                          'fa-exclamation-triangle'
                        } me-2 mt-1`} style={{
                          color: point.type === 'success' ? '#28a745' :
                                 point.type === 'error' ? '#dc3545' : '#ffc107'
                        }}></i>
                        <span>{point.text}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0 pt-0">
        <div className="w-100 text-center">
          <h5 className="fw-bold mb-3">
            <i className="fa fa-check-circle me-2" style={{ color: '#4CACB7' }}></i>
            الرجاء الالتزام بهذه التعليمات لضمان أفضل تجربة تعليمية!
            <i className="fa fa-rocket ms-2" style={{ color: '#4CACB7' }}></i>
          </h5>
          <Button 
            variant="primary" 
            onClick={onClose}
            style={{ backgroundColor: '#4CACB7', borderColor: '#4CACB7' }}
            className="px-5"
          >
            حسنا
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default InstructionsModal;