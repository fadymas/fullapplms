import React, { useState } from 'react';
import { FaWallet, FaBarcode, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import StatCard from '../../../components/StatCard';
import fawryIcon from '../../../images/fawry.png';
import paymentService from '../../../api/payment.service';

const BalanceSection = ({ balance, darkMode, onRechargeSuccess }) => {
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', msg: '' });

    const handleRecharge = async () => {
        if (!code.trim()) return;

        setLoading(true);
        setFeedback({ type: '', msg: '' });

        try {
            await paymentService.useRechargeCode(code);
            setFeedback({ type: 'success', msg: 'تم شحن الرصيد بنجاح' });
            setCode('');
            if (onRechargeSuccess) onRechargeSuccess();
            setTimeout(() => {
                setShowCodeInput(false);
                setFeedback({ type: '', msg: '' });
            }, 3000);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || err.response?.data?.error || 'كود الشحن غير صحيح أو مستخدم مسبقاً';
            setFeedback({ type: 'error', msg: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-body">
            <div className="row">
                <div className="col-12 col-md-6 mb-4">
                    <StatCard
                        icon={<FaWallet />}
                        count={balance}
                        title="الرصيد الحالي في حسابك"
                        color="#4CACB7"
                        isBalance={true}
                        darkMode={darkMode}
                    />
                </div>
            </div>

            <h6 className={`pt-4 fw-bold card-text ${darkMode ? 'text-light' : ''}`}>
                اشحن رصيد بأكثر من طريقة
            </h6>
            <p className={darkMode ? 'text-light' : 'text-muted'}>
                اكتب الكود على كارت السنتر بتاعك عشان تشحنه على الأكوانت بتاعك أو اشحن عن طريق خدمة فوري.
            </p>

            <div className="d-flex gap-3 flex-column flex-md-row mb-4 align-items-start">
                <div className="flex-grow-1 w-100">
                    <Link
                        to="/fawry"
                        className="btn btn-primary w-100 px-4 py-3 d-flex align-items-center justify-content-center fw-bold"
                        style={{
                            backgroundColor: darkMode ? '#4CACB7' : '#0d6efd',
                            borderColor: darkMode ? '#4CACB7' : '#0d6efd'
                        }}
                    >
                        اشحن الرصيد من فوري
                        <img src={fawryIcon} alt="فوري" className="ms-2" style={{ height: '24px' }} />
                    </Link>
                </div>

                <div className="flex-grow-1 w-100">
                    {!showCodeInput ? (
                        <button
                            onClick={() => setShowCodeInput(true)}
                            className={`btn w-100 px-4 py-3 d-flex align-items-center justify-content-center fw-bold ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                        >
                            اشحن الرصيد من كود السنتر
                            <FaBarcode className="ms-2" size={20} />
                        </button>
                    ) : (
                        <div className={`p-3 rounded border ${darkMode ? 'border-secondary bg-dark' : 'bg-light'}`}>
                            <label className={`form-label small fw-bold ${darkMode ? 'text-light' : ''}`}>أدخل كود الشحن</label>
                            <div className="d-flex gap-2">
                                <input
                                    type="text"
                                    className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
                                    placeholder="XXXX-XXXX-XXXX"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleRecharge}
                                    className="btn btn-success px-4"
                                    disabled={loading || !code}
                                >
                                    {loading ? <FaSpinner className="fa-spin" /> : 'شحن'}
                                </button>
                                <button
                                    onClick={() => setShowCodeInput(false)}
                                    className="btn btn-outline-secondary"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                            </div>

                            {feedback.msg && (
                                <div className={`alert mt-2 mb-0 py-2 small d-flex align-items-center ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                    {feedback.type === 'success' ? <FaCheckCircle className="me-2" /> : <FaTimesCircle className="me-2" />}
                                    {feedback.msg}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceSection;
