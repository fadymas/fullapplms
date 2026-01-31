// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// ترتيب الاستيراد مهم جداً
import 'bootstrap/dist/css/bootstrap.rtl.min.css'; // Bootstrap أولاً
import './styles/global.css'; // Global styles
import './index.css'; // ثم باقي الـ CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);