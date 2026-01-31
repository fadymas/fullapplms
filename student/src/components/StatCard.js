// src/components/StatCard.js (محدث)
import React from 'react';

function StatCard({ 
  icon, // تغيير: قبول JSX element مباشرة
  count = '0', 
  title = 'عنوان الإحصائية',
  color = '#4CACB7',
  isBalance = false
}) {
  return (
    <div className="stat-card-wrapper">
      <div className={`card stat-card h-100 ${isBalance ? 'balance-card' : ''}`}>
        <div className="card-body d-flex gap-3 align-items-center">
          <div>
            <span className="bg-badge" style={{ backgroundColor: color }}>
              {/* استبدال i ب div لعرض JSX element مباشرة */}
              <div className="icon-wrapper">
                {icon || <span className="text-white">?</span>}
              </div>
            </span>
          </div>
          <div className="flex-grow-1">
            {isBalance ? (
              <>
                <div className="title">{title}</div>
                <h4 className="mb-0 pb-0 fw-bolder">{count}</h4>
              </>
            ) : (
              <>
                <h4 className="mb-0 pb-0 fw-bolder">{count}</h4>
                <div className="title">{title}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;