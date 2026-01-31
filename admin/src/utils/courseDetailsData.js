// src/utils/courseDetailsData.js
export const courseDetailsData = [
    {
        id: 1,
        title: 'مراجعة شهر نوفمبر اولي ثانوي',
        description: 'دورة شاملة تغطي أهم الموضوعات في التاريخ مع شروحات مبسطة وتمارين تطبيقية ومراجعات سريعة لتثبيت المعلومات.',
        teacher: 'أحمد محمد',
        duration: '4 أسابيع',
        startDate: '10 مارس 2025',
        studentsCount: 150,
        specialization: 'تاريخ',
        publishDate: '1 مارس 2025',
        image: 'images/home.webp',
        videoId: 'dQw4w9WgXcQ', // YouTube video ID مثال
        price: 500,
        category: 'تاريخ',
        level: 'الأول الثانوي',
        rating: 4.8,
        reviewsCount: 45,
        language: 'العربية',
        certificate: true
    },
    {
        id: 2,
        title: 'أساسيات الفيزياء',
        description: 'دورة تعليمية شاملة للمبتدئين في الفيزياء تغطي المفاهيم الأساسية والتطبيقات العملية.',
        teacher: 'محمد أحمد',
        duration: '6 أسابيع',
        startDate: '15 مارس 2025',
        studentsCount: 200,
        specialization: 'فيزياء',
        publishDate: '5 مارس 2025',
        image: 'images/physics.jpg',
        videoId: 'abc123',
        price: 600,
        category: 'علوم',
        level: 'الثاني الثانوي',
        rating: 4.9,
        reviewsCount: 60,
        language: 'العربية',
        certificate: true
    },
    {
        id: 3,
        title: 'الرياضيات المتقدمة',
        description: 'دورة متخصصة في الرياضيات المتقدمة للطلاب الجامعيين تغطي مواضيع متقدمة في الجبر والتفاضل والتكامل.',
        teacher: 'سارة خالد',
        duration: '8 أسابيع',
        startDate: '20 مارس 2025',
        studentsCount: 120,
        specialization: 'رياضيات',
        publishDate: '10 مارس 2025',
        image: 'images/math.jpg',
        videoId: 'xyz789',
        price: 800,
        category: 'رياضيات',
        level: 'متقدم',
        rating: 4.7,
        reviewsCount: 35,
        language: 'العربية',
        certificate: true
    }
];

export const lecturesData = [
    {
        id: 1,
        courseId: 1,
        courseName: 'مراجعة شهر نوفمبر اولي ثانوي',
        lectureNumber: 'Lecture 1',
        titlePart1: 'مقدمة في الفيزياء',
        titlePart2: 'تفاصيل إضافية للشرح',
        materialFile: 'files/lecture1-material.pdf',
        homeworkFile: 'files/lecture1-homework.pdf',
        videoDescription: 'واجبات منزلية الفصل الأول',
        examScore: 85,
        homeworkScore: 90,
        dateAdded: '2025-03-01',
        duration: '1:30:00'
    },
    {
        id: 2,
        courseId: 1,
        courseName: 'مراجعة شهر نوفمبر اولي ثانوي',
        lectureNumber: 'Lecture 2',
        titlePart1: 'القوانين الأساسية في الفيزياء',
        titlePart2: 'تطبيقات عملية',
        materialFile: 'files/lecture2-material.pdf',
        homeworkFile: 'files/lecture2-homework.pdf',
        videoDescription: 'شرح تمارين الفصل الثاني',
        examScore: 88,
        homeworkScore: 92,
        dateAdded: '2025-03-05',
        duration: '1:45:00'
    },
    {
        id: 3,
        courseId: 1,
        courseName: 'مراجعة شهر نوفمبر اولي ثانوي',
        lectureNumber: 'Lecture 3',
        titlePart1: 'التاريخ الحديث',
        titlePart2: 'أهم الأحداث التاريخية',
        materialFile: 'files/lecture3-material.pdf',
        homeworkFile: 'files/lecture3-homework.pdf',
        videoDescription: 'مراجعة تاريخية شاملة',
        examScore: 90,
        homeworkScore: 85,
        dateAdded: '2025-03-10',
        duration: '2:00:00'
    },
    {
        id: 4,
        courseId: 1,
        courseName: 'مراجعة شهر نوفمبر اولي ثانوي',
        lectureNumber: 'Lecture 4',
        titlePart1: 'الجغرافيا الطبيعية',
        titlePart2: 'الخصائص الجغرافية',
        materialFile: 'files/lecture4-material.pdf',
        homeworkFile: 'files/lecture4-homework.pdf',
        videoDescription: 'تمارين جغرافية متنوعة',
        examScore: 87,
        homeworkScore: 89,
        dateAdded: '2025-03-15',
        duration: '1:20:00'
    },
    {
        id: 5,
        courseId: 2,
        courseName: 'أساسيات الفيزياء',
        lectureNumber: 'Lecture 1',
        titlePart1: 'مقدمة في الميكانيكا',
        titlePart2: 'القوانين الأساسية',
        materialFile: 'files/physics-lecture1.pdf',
        homeworkFile: 'files/physics-homework1.pdf',
        videoDescription: 'شرح قوانين نيوتن',
        examScore: 82,
        homeworkScore: 88,
        dateAdded: '2025-03-02',
        duration: '1:50:00'
    }
];

// دالات مساعدة
export const getCourseById = (id) => {
    return courseDetailsData.find(course => course.id === parseInt(id));
};

export const getLecturesByCourseId = (courseId) => {
    return lecturesData.filter(lecture => lecture.courseId === parseInt(courseId));
};

export const getTotalLecturesCount = (courseId) => {
    return getLecturesByCourseId(courseId).length;
};

export const getAverageExamScore = (courseId) => {
    const lectures = getLecturesByCourseId(courseId);
    if (lectures.length === 0) return 0;
    
    const totalScore = lectures.reduce((sum, lecture) => sum + lecture.examScore, 0);
    return Math.round(totalScore / lectures.length);
};

export const getAverageHomeworkScore = (courseId) => {
    const lectures = getLecturesByCourseId(courseId);
    if (lectures.length === 0) return 0;
    
    const totalScore = lectures.reduce((sum, lecture) => sum + lecture.homeworkScore, 0);
    return Math.round(totalScore / lectures.length);
};

export const getCourseStats = (courseId) => {
    const lectures = getLecturesByCourseId(courseId);
    
    return {
        totalLectures: lectures.length,
        averageExamScore: getAverageExamScore(courseId),
        averageHomeworkScore: getAverageHomeworkScore(courseId),
        totalDuration: lectures.reduce((sum, lecture) => {
            const [hours, minutes, seconds] = lecture.duration.split(':').map(Number);
            return sum + (hours * 3600) + (minutes * 60) + seconds;
        }, 0),
        lastAdded: lectures.length > 0 
            ? new Date(lectures[lectures.length - 1].dateAdded).toLocaleDateString('ar-EG')
            : 'لا يوجد'
    };
};

export const courseCategories = [
    'تاريخ',
    'رياضيات',
    'فيزياء',
    'كيمياء',
    'أحياء',
    'جغرافيا',
    'لغة عربية',
    'لغة إنجليزية'
];

export const courseLevels = [
    'الأول الثانوي',
    'الثاني الثانوي',
    'الثالث الثانوي',
    'متوسط',
    'متقدم'
];