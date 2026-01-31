// src/pages/Login.jsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import LoginForm from '../components/LoginForm';
import '../styles/login.css';

const Login = () => {
    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">


            <ToastContainer 
                position="top-right"
                autoClose={3000}
                rtl={true}
                theme="colored"
            />
            <div className="row w-100 justify-content-center">
                <div className="col-md-6 col-lg-6 col-xl-5">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
};

export default Login;