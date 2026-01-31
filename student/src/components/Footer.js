import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Footer.css'
import logo from '../images/logo.png'
import { FaFacebookSquare, FaWhatsapp, FaYoutubeSquare, FaInstagram } from 'react-icons/fa'

function Footer() {
  const linkStyle = { color: 'white', textDecoration: 'none', padding: '0 8px' }

  return (
    <div
      className="footer"
      style={{
        backgroundColor: '#08345B',
        color: 'white',
        padding: '20px 0'
      }}
    >
      <div className="container-fluid pt-4 ">
        <div className="row justify-content-between">
          <div className="col-lg-6 col-md-6">
            <img src={logo} alt="شعار الموقع" height="65px" />
            <p style={{ paddingTop: '1rem', color: 'white', fontSize: '0.9rem' }}>
              منصة تعليمية تهدف الي تعليم الطلاب بأحدث الطرق الحديثة وابسطها
            </p>
          </div>

          <div className="col-lg-2 col-md-5">
            <p style={{ color: 'white', marginBottom: '0.5rem' }}>تواصل معنا من خلال</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <a href="#" target="_blank" rel="noreferrer">
                <FaFacebookSquare size={28} style={{ margin: '0 8px', color: 'white' }} />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <FaWhatsapp size={28} style={{ margin: '0 8px', color: 'white' }} />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <FaYoutubeSquare size={28} style={{ margin: '0 8px', color: 'white' }} />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <FaInstagram size={28} style={{ margin: '0 8px', color: 'white' }} />
              </a>
            </div>
          </div>
        </div>

        <div
          className="row border-top mt-4 justify-content-between"
          style={{ borderColor: '#4CACB7', textAlign: 'start', paddingTop: '1rem' }}
        >
          <div className="col-lg-6 col-md-5">
            <p className="d-none d-md-block" style={{ color: 'white', margin: 0 }}>
              جميع الحقوق محفوظة &copy;
              <a href="https://www.facebook.com/mohamed.essa.abdelhamead/" style={linkStyle}>
                Mohamed Essa
              </a>
            </p>
          </div>
          <div className="col-lg-5 col-md-6 pt-3">
            <div className="d-flex justify-content-end">
              <div>
                <Link to="/privacy-policy" style={linkStyle}>
                  الخصوصية
                </Link>
                <Link to="/terms" style={linkStyle}>
                  الشروط والأحكام
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
