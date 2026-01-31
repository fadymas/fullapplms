// src/components/ProgressCard.js
import React from 'react';

function ProgressCard({ 
  progress = 0, 
  title = 'تقدّمك',
  description = 'مقياس لكمية الدروس السابقة و المتبقية في كورساتك الحالية!' 
}) {
  return (
    <div className="progress-card">
      <div className="progress-header"></div>
      <div className="progress-content">
        <h3 className="pb-3">{title}</h3>
        <div className="progress-value">{progress}%</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="progress-description pt-3">
          {description}
        </p>
      </div>
    </div>
  );
}

export default ProgressCard;