// src/components/common/Footer.jsx
import React from 'react';
import { FaFacebookSquare, FaWhatsapp, FaYoutubeSquare, FaInstagram } from 'react-icons/fa';
import '../styles/footer.css';

const Footer = ({ sidebarCollapsed, darkMode = false }) => {
  return (
    <div className={`footer p-4 ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container-fluid pt-4">
        <div className="row justify-content-between">
          <div className="col-lg-6 col-md-6 mb-4 mb-md-0">
            <img src="/images/logo.png" alt="Logo" height="65px" />
            <p className="pt-4 smallText">
              منصة تعليمية تهدف الي تعليم الطلاب بأحدث الطرق الحديثة وابسطها
            </p>
          </div>
          
          <div className="col-lg-2 col-md-5">
            <p className="smallText mb-2 text-start text-md-end">تواصل معنا من خلال</p>
            <div className="socials d-flex justify-content-start justify-content-md-end">
              <a className="text-decoration-none px-1" href="#" target="_blank" rel="noreferrer">
                <FaFacebookSquare className="fs-4" />
              </a>
              <a className="text-decoration-none px-1" href="#" target="_blank" rel="noreferrer">
                <FaWhatsapp className="fs-4" />
              </a>
              <a className="text-decoration-none px-1" href="#" target="_blank" rel="noreferrer">
                <FaYoutubeSquare className="fs-4" />
              </a>
              <a className="text-decoration-none px-1" href="#" target="_blank" rel="noreferrer">
                <FaInstagram className="fs-4" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="row border-top mt-4 linkFooter border-secondary justify-content-between">
          <div className="col-lg-6 col-md-5 pt-3">
            <p className="mb-0 text-center text-md-start">
              جميع الحقوق محفوظة &copy; 
              <a href="https://www.facebook.com/mohamed.essa.abdelhamead/" className="ps-1">
                Mohamed Essa
              </a>
            </p>
          </div>
          
          <div className="col-lg-5 col-md-6 pt-3">
            <div className="d-flex justify-content-center justify-content-md-end">
              <div>
                <a className="text-decoration-none px-2" href="/privacy-policy">
                  الخصوصية
                </a>
                <a className="text-decoration-none px-2" href="/terms">
                  الشروط والأحكام
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;