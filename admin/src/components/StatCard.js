// src/components/ui/StatCard.jsx
import React from 'react';
import { FaBook, FaUsers, FaDollarSign, FaStar } from 'react-icons/fa';

const StatCard = ({ icon, title, value, color }) => {
    const getIcon = () => {
        switch(icon) {
            case 'book': return <FaBook />;
            case 'users': return <FaUsers />;
            case 'dollar': return <FaDollarSign />;
            case 'star': return <FaStar />;
            default: return <FaBook />;
        }
    };

    const getColor = () => {
        switch(color) {
            case 'primary': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            case 'success': return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
            case 'warning': return 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)';
            case 'danger': return 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)';
            default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    };

    return (
        <div className="card d-flex flex-column justify-content-center">
            <div className="card-body d-flex gap-3 align-items-center">
                <div>
                    <span className="bg-badge" style={{ background: getColor() }}>
                        {getIcon()}
                    </span>
                </div>
                <div>
                    <h4 className="mb-0 pb-0 fw-bolder">{value}</h4>
                    <div className="title">{title}</div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;