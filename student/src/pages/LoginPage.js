import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import useAuthStore from '../store/authStore';
import '../styles/Login.css';
import loginGif from '../images/Login.gif';
import authService from '../api/auth.service';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showForgetModal, setShowForgetModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [forgetEmail, setForgetEmail] = useState('');
  const [forgetError, setForgetError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(email, password);
      login(data.user, data.access, data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'فشل تسجيل الدخول. تأكد من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgetSubmit = (e) => {
    e.preventDefault();
    if (!forgetEmail.trim()) {
      setForgetError('من فضلك قم بإدخال البريد الإلكتروني المسجل علي المنصة');
      return;
    }
    setForgetError('');
    setShowForgetModal(false);
    setShowCodeModal(true);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setShowCodeModal(false);
  };

  return (
    <>
      <Navbar />

      <div className="login-container page-white-background">
        <div className="login-form-section">
          <div className="form-wrapper">
            <h4 className="login-title">مرحبا بك في منصة الأستاذ محمد</h4>

            <div className="login-card">
              <div className="card-body">
                <h5 className="text-center mb-4 fw-bold">تسجيل الدخول</h5>

                <Form onSubmit={handleLoginSubmit}>
                  {error && <div className="alert alert-danger py-2 text-center small mb-3">{error}</div>}
                  <Form.Group className="mb-3 form-group-rtl">
                    <Form.Control
                      type="email"
                      placeholder="البريد الإلكتروني"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      dir="rtl"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 form-group-rtl">
                    <Form.Control
                      type="password"
                      placeholder="كلمة المرور"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="rtl"
                      disabled={loading}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="checkbox"
                      label="تذكرني"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />

                    <Button
                      variant="link"
                      className="forget-password-btn p-0"
                      onClick={() => setShowForgetModal(true)}
                    >
                      نسيت كلمة المرور
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-100 btn-login-custom d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : 'دخول'}
                  </Button>

                  <p className="text-center mt-3 mb-0">
                    ليس لديك حساب؟{' '}
                    <Link to="/register" className="register-link-custom">سجل الان</Link>
                  </p>
                </Form>
              </div>
            </div>
          </div>
        </div>

        <div className="login-image-section d-none d-lg-block">
          <img src={loginGif} alt="تسجيل الدخول" className="login-image" />
        </div>
      </div>

      <Modal show={showForgetModal} onHide={() => setShowForgetModal(false)} centered>
        <Modal.Header closeButton className="justify-content-start">
          <Modal.Title>استعادة كلمة المرور</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h4 className="fw-bold mb-3">هل نسيت كلمة المرور</h4>
          <p className="text-muted mb-3">فضلا قم بادخال البريد الإلكتروني الخاص بحسابك</p>

          <Form onSubmit={handleForgetSubmit}>
            <Form.Group className="mb-3 form-group-rtl">
              <Form.Control
                type="email"
                placeholder="البريد الإلكتروني"
                value={forgetEmail}
                onChange={(e) => setForgetEmail(e.target.value)}
                dir="rtl"
              />
            </Form.Group>

            {forgetError && <div className="text-danger small mt-2 text-end">{forgetError}</div>}

            <Button type="submit" className="btn-login-custom w-100 mt-3">ارسال</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showCodeModal} onHide={() => setShowCodeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>إدخال الكود</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h4 className="fw-bold mb-3">تم ارسال الكود</h4>
          <p className="text-muted mb-3">فضلا قم بادخال الكود المرسل</p>

          <Form onSubmit={handleCodeSubmit}>
            <Form.Control
              type="text"
              placeholder="الكود"
              maxLength="6"
              className="text-center mb-3 code-input"
              dir="ltr"
            />
            <Button type="submit" className="btn-login-custom w-100">تأكيد</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  );
}

export default LoginPage;