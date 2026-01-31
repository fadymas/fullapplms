// src/components/SubscribeSection.js
import React, { useState } from 'react';
import '../styles/HomePage.css';

function SubscribeSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا يمكن إضافة كود الإشتراك
    setEmail('');
  };

  return (
    <section className="subscribe-section py-5" style={{ backgroundColor: '#ffffff' }}>
      <div className="container">
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h2 className="fw-bold mb-4">اشترك في نشرتنا البريدية</h2>
            <p className="mb-4">احصل على آخر الأخبار والتحديثات عن الدورات الجديدة والعروض الحصرية</p>
            <form onSubmit={handleSubmit} className="d-flex gap-2 justify-content-center">
              <input 
                type="email" 
                className="form-control w-50" 
                placeholder="ادخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="btn" 
                style={{
                  backgroundColor: '#4CACB7',
                  borderColor: '#4CACB7',
                  color: 'white',
                  borderRadius: '50px',   // مستدير
                  padding: '0.6rem 2rem'  // زيادة الحجم لو تحب
                }}
              >
                اشتراك
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SubscribeSection;
