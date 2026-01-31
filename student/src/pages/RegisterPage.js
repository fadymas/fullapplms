import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useUIStore from '../store/uiStore';
import '../styles/RegisterPage.css';
import registerImage from '../images/register.png';
import authService from '../api/auth.service';

const phoneRegExp = /^01[0-9]{9}$/;

const registerSchema = yup.object().shape({
  firstName: yup.string().required('الإسم الأول مطلوب'),
  lastName: yup.string().required('الإسم الأخير مطلوب'),
  phone: yup.string().required('رقم الهاتف مطلوب').matches(phoneRegExp, 'رقم الهاتف يجب أن يبدأ بـ 01 وأن يكون 11 رقمًا'),
  fatherPhone: yup.string().required('رقم ولي الأمر مطلوب').matches(phoneRegExp, 'رقم الهاتف يجب أن يبدأ بـ 01 وأن يكون 11 رقمًا'),
  grade: yup.string().required('الصف الدراسي مطلوب'),
  email: yup.string().email('البريد الإلكتروني غير صحيح').required('البريد الإلكتروني مطلوب'),
  password: yup.string().required('كلمة المرور مطلوبة').min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: yup.string().required('تأكيد كلمة المرور مطلوب').oneOf([yup.ref('password'), null], 'كلمات المرور غير متطابقة'),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { darkMode } = useUIStore();
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem('hasSeenInstructions');
    if (!hasSeenInstructions) {
      setShowInstructions(true);
    }
  }, []);

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem('hasSeenInstructions', 'true');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');

    // Map UI data to API schema
    const payload = {
      email: data.email,
      password: data.password,
      password2: data.confirmPassword,
      full_name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      guardian_phone: data.fatherPhone,
      grade: data.grade
    };

    try {
      await authService.register(payload);
      alert('تم إنشاء الحساب بنجاح!');
      navigate('/login');
    } catch (err) {
      console.error("Registration Error: ", err);
      let errorMsg = 'حدث خطأ أثناء التسجيل.';

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          errorMsg = Object.entries(data).map(([key, val]) => {
            const valText = Array.isArray(val) ? val.join(', ') : val;
            return `${key}: ${valText}`;
          }).join('\n');
        } else {
          errorMsg = JSON.stringify(data);
        }
      }
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const instructions = [
    { icon: 'fa-desktop', title: 'المنصة موقع ويب مش تطبيق', points: [{ text: 'المنصة هي موقع ويب، مش أبلكيشن، ومش محتاجة تحميل.', type: 'success' }, { text: 'تعمل على Google Chrome, Mozilla Firefox, Opera (آخر إصدار).', type: 'success' }] },
    { icon: 'fa-tablet', title: 'الأجهزة المتوافقة', points: [{ text: 'تعمل على الموبايل، اللاب توب، الكمبيوتر العادي.', type: 'success' }, { text: 'التابلت المدرسي غير مدعوم، حتى لو متهكر', type: 'error' }] },
    { icon: 'fa-user', title: 'الحساب شخصي فقط', points: [{ text: 'الحساب مخصص لاستخدامك الشخصي فقط.', type: 'error' }, { text: 'مشاركة الحساب يؤدي إلى إغلاقه نهائيًا.', type: 'error' }] },
  ];

  return (
    <>
      <Navbar />
      <div className={`register-section d-lg-flex min-vh-100 align-items-center justify-content-center ${darkMode ? 'dark-mode' : ''}`}>
        <div className="container">
          <div className="register-header text-right mb-4">
            <h4 className="welcome-title">مرحبا بك في منصة الأستاذ محمد غانم</h4>
          </div>
          <div className="main-register-container d-lg-flex">
            <div className="register-image-side d-none d-lg-flex">
              <img src={registerImage} className="img-fluid" alt="إنشاء حساب" />
            </div>
            <div className="register-form-side">
              <div className="form-card">
                <Form onSubmit={handleSubmit(onSubmit)}>
                  {apiError && <div className="alert alert-danger small py-2 text-center" style={{ whiteSpace: 'pre-wrap' }}>{apiError}</div>}

                  <div className="row">
                    <div className="col-6">
                      <Form.Group className="mb-3">
                        <Form.Label>الإسم الأول *</Form.Label>
                        <Form.Control {...register('firstName')} isInvalid={!!errors.firstName} placeholder="الإسم الأول" />
                        <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                    <div className="col-6">
                      <Form.Group className="mb-3">
                        <Form.Label>الإسم الأخير *</Form.Label>
                        <Form.Control {...register('lastName')} isInvalid={!!errors.lastName} placeholder="الإسم الأخير" />
                        <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>رقم هاتف الطالب *</Form.Label>
                    <Form.Control {...register('phone')} isInvalid={!!errors.phone} placeholder="01xxxxxxxxx" />
                    <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>رقم ولي الأمر *</Form.Label>
                    <Form.Control {...register('fatherPhone')} isInvalid={!!errors.fatherPhone} placeholder="01xxxxxxxxx" />
                    <Form.Control.Feedback type="invalid">{errors.fatherPhone?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>الصف الدراسي *</Form.Label>
                    <Form.Select {...register('grade')} isInvalid={!!errors.grade}>
                      <option value="">اختر الصف</option>
                      <option value="Grade 10">الأول الثانوي (Grade 10)</option>
                      <option value="Grade 11">الثاني الثانوي (Grade 11)</option>
                      <option value="Grade 12">الثالث الثانوي (Grade 12)</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.grade?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>البريد الإلكتروني *</Form.Label>
                    <Form.Control {...register('email')} isInvalid={!!errors.email} placeholder="example@email.com" />
                    <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>كلمة المرور *</Form.Label>
                    <Form.Control type="password" {...register('password')} isInvalid={!!errors.password} placeholder="******" />
                    <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>تأكيد كلمة المرور *</Form.Label>
                    <Form.Control type="password" {...register('confirmPassword')} isInvalid={!!errors.confirmPassword} placeholder="******" />
                    <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Button type="submit" className="w-100 step-btn mt-3" disabled={loading}>
                    {loading ? 'جاري التحميل...' : 'إنشاء الحساب'}
                  </Button>
                </Form>
              </div>

              <div className="text-center mt-3">
                <small>لديك حساب بالفعل؟ <Link to="/login" className="text-primary">تسجيل الدخول</Link></small>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />

      <Modal show={showInstructions} onHide={handleCloseInstructions} size="xl" centered>
        <Modal.Header closeButton><Modal.Title>تعليمات المنصة</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="row">
            {instructions.map((ins, i) => (
              <div className="col-md-4 mb-3 mb-md-0" key={i}>
                <div className="p-3 border rounded h-100">
                  <h6 className="d-flex align-items-center gap-2 mb-3">
                    <i className={`fas ${ins.icon} text-primary`}></i> {ins.title}
                  </h6>
                  {ins.points.map((p, j) => (
                    <p key={j} className={`small mb-1 text-${p.type === 'error' ? 'danger' : 'success'}`}>
                      <i className={`fas fa-${p.type === 'error' ? 'times' : 'check'} me-1`}></i> {p.text}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer><Button onClick={handleCloseInstructions}>قرأت التعليمات</Button></Modal.Footer>
      </Modal>
    </>
  );
}

export default RegisterPage;