// src/utils/teacherProfileData.js
export const teacherData = {
    personalInfo: {
        name: "محمد غانم",
        experience: "معلم منذ 30 يوم",
        phone: "0123456789",
        email: "ahmed@example.com",
        firstName: "محمد",
        lastName: "غانم",
        birthDate: "1990-01-01",
        gender: "male",
        specialization: "تاريخ",
        bio: "معلم متخصص في التاريخ مع خبرة تزيد عن 10 سنوات في التعليم."
    },
    
    stats: {
        publishedCourses: 15,
        enrolledStudents: 250,
        averageRating: 4.8,
        totalRevenue: 5000
    },
    
    earnings: {
        currentBalance: 0,
        totalRevenue: 5000,
        transactions: [
            { date: "2025-03-15", amount: 500, source: "كورس تاريخ", status: "مكتمل" },
            { date: "2025-03-10", amount: 750, source: "كورس العلوم", status: "مكتمل" }
        ]
    },
    
    courses: [
        { 
            id: 1,
            name: "تاريخ المتقدمة", 
            students: 45, 
            rating: 4.9, 
            status: "نشط",
            price: 500
        },
        { 
            id: 2,
            name: "أساسيات الفيزياء", 
            students: 32, 
            rating: 4.7, 
            status: "نشط",
            price: 400
        },
        { 
            id: 3,
            name: "الرياضيات المتقدمة", 
            students: 28, 
            rating: 4.8, 
            status: "نشط",
            price: 450
        }
    ],
    
    students: [
        { 
            id: 1,
            name: "محمد أحمد", 
            course: "تاريخ المتقدمة", 
            registrationDate: "2025-03-01", 
            status: "نشط",
            phone: "01012345678",
            email: "mohamed@example.com"
        },
        { 
            id: 2,
            name: "فاطمة علي", 
            course: "أساسيات الفيزياء", 
            registrationDate: "2025-02-28", 
            status: "نشط",
            phone: "01087654321",
            email: "fatma@example.com"
        },
        { 
            id: 3,
            name: "أحمد محمود", 
            course: "الرياضيات المتقدمة", 
            registrationDate: "2025-03-05", 
            status: "نشط",
            phone: "01055555555",
            email: "ahmed@example.com"
        }
    ],
    
    security: {
        logoutToday: "لم يتم تسجيل الخروج بواسطة المستخدم اليوم",
        logoutWeek: "لم يتم تسجيل الخروج بواسطة المستخدم هذا الأسبوع",
        autoLogout: { 
            count: 1, 
            reason: "تلقائي من خلال التسجيل في جهاز آخر" 
        },
        devices: [
            { 
                type: "Desktop", 
                deviceName: "Unknown", 
                os: "Windows 10", 
                browser: "Chrome 142", 
                lastActivity: "02:00 الخميس، ١ يناير ١٩٧٠", 
                loginDate: "22:10 السبت، ١٥ نوفمبر ٢٠٢٥" 
            },
            { 
                type: "Mobile", 
                deviceName: "iPhone 12", 
                os: "iOS 16", 
                browser: "Safari", 
                lastActivity: "10:30 الأحد، ١ مارس ٢٠٢٥", 
                loginDate: "09:15 الأحد، ١ مارس ٢٠٢٥" 
            }
        ]
    }
};

// دالات مساعدة
export const getTotalStudents = () => {
    return teacherData.stats.enrolledStudents;
};

export const getTotalRevenue = () => {
    return teacherData.stats.totalRevenue;
};

export const getActiveCourses = () => {
    return teacherData.courses.filter(course => course.status === "نشط").length;
};

export const getAverageRating = () => {
    const courses = teacherData.courses;
    const totalRating = courses.reduce((sum, course) => sum + course.rating, 0);
    return (totalRating / courses.length).toFixed(1);
};