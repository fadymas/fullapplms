// src/utils/aosConfig.js
import AOS from 'aos';

export const initAOS = () => {
  AOS.init({
    duration: 800,              /* مدة التحريك بالمللي ثانية */
    easing: 'ease-in-out',      /* نوع الحركة */
    once: true,                 /* تشغيل التحريك مرة واحدة فقط */
    offset: 100,                /* المسافة من الشاشة لبدء التحريك */
    delay: 100,                 /* تأخير بداية التحريك */
  });
};

export default initAOS;