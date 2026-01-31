// src/components/forms/LoginForm.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import authService from '../api/auth.service'
import useAuthStore from '../store/authStore'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { login, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await authService.login(email, password)
      login(data.user, data.access, data.refresh)
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (data.user.role === 'teacher') {
        navigate('/teacher/dashboard')
      }
      //   navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data.detail || 'فشل تسجيل الدخول. تأكد من البيانات.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow-lg border-0 rounded-4 login-card">
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <img src="/images/logo.png" alt="Logo" className="mb-3" style={{ height: '60px' }} />
          {/* تغيير لون كلمة "تسجيل الدخول" إلى #4CACB7 */}
          <h2 className="fw-bold" style={{ color: '#4CACB7' }}>
            تسجيل الدخول
          </h2>
          <p className="text-muted">أدخل بياناتك للوصول إلى حسابك</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold" style={{ color: '#333' }}>
              البريد الإلكتروني
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control form-control-lg text-end"
                id="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="rtl"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#333' }}>
              كلمة المرور
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock />
              </span>
              <input
                type="password"
                className="form-control form-control-lg text-end"
                id="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="rtl"
              />
            </div>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-login btn-lg fw-semibold">
              <FaSignInAlt className="me-2" />
              تسجيل الدخول
            </button>
          </div>
        </form>

        {error && <div className="alert alert-danger py-2 text-center small mb-3">{error}</div>}
      </div>
    </div>
  )
}

export default LoginForm
