// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/general.css';
import 'bootstrap/dist/css/bootstrap.rtl.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'aos/dist/aos.css';
import 'swiper/swiper-bundle.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);