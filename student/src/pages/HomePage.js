// src/pages/HomePage.js
import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhyChooseCard from '../components/WhyChooseCard'
import Grades from '../components/Grades'
import Courses from '../components/Courses'
import SubscribeSection from '../components/SubscribeSection'
import AOS from 'aos'
import '../styles/general.css'

// استيراد الأيقونات من react-icons
import { FaChalkboardTeacher, FaBookOpen, FaClock, FaAward } from 'react-icons/fa'

function HomePage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    })
  }, [])

  const whyChooseData = [
    {
      icon: <FaChalkboardTeacher />,
      title: 'شرح مبسط وواضح',
      description: 'دروس مُرتبة وبشرح مبسّط يسهل فهم المفاهيم بسرعة وبثقة.'
    },
    {
      icon: <FaBookOpen />,
      title: 'محتوى منظم وحديث',
      description: 'مناهج ودورات محدثة تغطي أهم النقاط والمراجعات المطلوبة للامتحان.',
      delay: 100
    },
    {
      icon: <FaClock />,
      title: 'مرونة في التعلم',
      description: 'شاهد المحاضرات في أي وقت وبالسرعة التي تناسبك، مع تمارين واختبارات ذاتية.',
      delay: 200
    },
    {
      icon: <FaAward />,
      title: 'دعم ومتابعة وشهادات',
      description: 'متابعة مستمرة، تقييمات دورية، وشهادات عند إتمام الدورات لتعزيز السيرة الذاتية.',
      delay: 300
    }
  ]

  return (
    <>
      <Navbar />

      <main className="mt-5">
        {/* قسم البداية */}
        <section className="home-section d-flex align-items-center">
          <div className="overlay">
            <div className="container text-center">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <h1 className="mb-4 fw-bold" data-aos="fade-down">
                    مرحبًا بك في منصتنا التعليمية مستر محمد غانم لتعلم التاريخ
                  </h1>
                  <p className="mb-4" data-aos="fade-up" data-aos-delay="200">
                    منصة تعليمية تهدف الي تعليم الطلاب بأحدث الطرق الحديثة وابسطها
                  </p>
                  <a
                    href="/login"
                    className="btn join-btn btn-lg px-5"
                    data-aos="zoom-in"
                    data-aos-delay="400"
                    style={{
                      backgroundColor: '#4CACB7',
                      borderColor: '#4CACB7',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#3a9a9a'
                      e.target.style.borderColor = '#3a9a9a'
                      e.target.style.transform = 'translateY(-3px)'
                      e.target.style.boxShadow = '0 5px 15px rgba(76, 172, 183, 0.3)'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#4CACB7'
                      e.target.style.borderColor = '#4CACB7'
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    إنضم الآن
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* قسم لماذا تختار مستر محمد */}
        <section className="why-choose-section py-5" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container">
            <h2 className="mb-5 text-center fw-bold" data-aos="fade-down">
              لماذا تختار مستر محمد؟
            </h2>
            <div className="row g-4">
              {whyChooseData.map((item, index) => (
                <WhyChooseCard key={index} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* قسم الصفوف الدراسية - باستخدام Grades الجديد */}
        <section className="grades-section pb-5 pt-5" style={{ backgroundColor: '#ffffff' }}>
          <div className="container">
            <h2 className="mb-5 text-center fw-bold" data-aos="fade-down"></h2>
            <Grades />
          </div>
        </section>

        {/* قسم الكورسات المتاحة - باستخدام Courses الجديد */}
        <section className="courses-section pb-5 pt-5" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container">
            <h2 className="mb-5 fw-bold text-center" data-aos="fade-down"></h2>
            <Courses />
            <div className="d-flex justify-content-center mt-5">
              <a
                href="/courses"
                className="btn btn-lg px-5"
                data-aos="zoom-in"
                data-aos-delay="200"
                style={{
                  backgroundColor: '#EBF7F6',
                  borderColor: '#EBF7F6',
                  color: '#08345B',
                  borderRadius: '18px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#4CACB7'
                  e.target.style.borderColor = '#4CACB7'
                  e.target.style.color = 'white'
                  e.target.style.transform = 'translateY(-3px)'
                  e.target.style.boxShadow = '0 5px 15px rgba(76, 172, 183, 0.2)'
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#EBF7F6'
                  e.target.style.borderColor = '#EBF7F6'
                  e.target.style.color = '#08345B'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              ></a>
            </div>
          </div>
        </section>

        {/* قسم الإشتراك */}
        <SubscribeSection />
      </main>

      <Footer />
    </>
  )
}

export default HomePage
