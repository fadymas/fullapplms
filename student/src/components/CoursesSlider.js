// src/components/CoursesSlider.js
import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import CourseCard from './CourseCard';
import courseImage1 from '../images/register.png';
import courseImage2 from '../images/register.png';
import courseImage3 from '../images/register.png';

function CoursesSlider() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const courses = [
    { image: courseImage1, title: "مراجعة نوفمبر أولي", date: "10 مارس", description: "شرح مبسط", isFree: true },
    { image: courseImage2, title: "مراجعة نوفمبر ثانية", date: "22 أبريل", description: "تمارين", isFree: true },
    { image: courseImage3, title: "مراجعة نوفمبر ثالثة", date: "5 مايو", description: "نماذج", isFree: true },
    { image: courseImage1, title: "مراجعة ديسمبر أولي", date: "10 ديسمبر", description: "دورة مكثفة", isFree: true },
    { image: courseImage2, title: "مراجعة ديسمبر ثانية", date: "15 ديسمبر", description: "شرح كامل", isFree: true },
    { image: courseImage3, title: "مراجعة ديسمبر ثالثة", date: "20 ديسمبر", description: "امتحانات", isFree: true },
  ];

  const arrowStyle = {
    position: 'absolute',
    top: '-60px',              // فوق الصور بشوية
    zIndex: 10,
    backgroundColor: 'transparent',
    color: '#4CACB7',
    cursor: 'pointer',
    fontSize: '45px',          // حجم السهم
    fontWeight: 'bold',
    transition: '0.3s',
    userSelect: 'none'
  };

  return (
    <div className="courses pb-5">
      <div className="container position-relative">

        {/* سهم الشمال */}
        <div
          ref={prevRef}
          style={{ ...arrowStyle, right: '15px' }}
          onMouseEnter={(e) => {
            e.target.style.color = '#3fa3ad';
            e.target.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#4CACB7';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ‹
        </div>

        {/* سهم اليمين */}
        <div
          ref={nextRef}
          style={{ ...arrowStyle, left: '15px' }}
          onMouseEnter={(e) => {
            e.target.style.color = '#3fa3ad';
            e.target.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#4CACB7';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ›
        </div>

        <Swiper
          modules={[Navigation]}
          spaceBetween={30}
          slidesPerView={3}
          onInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
          }}
        >
          {courses.map((course, index) => (
            <SwiperSlide key={index}>
              <CourseCard {...course} />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </div>
  );
}

export default CoursesSlider;
