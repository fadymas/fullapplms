// src/utils/teacherRequestsData.js
export const requestsData = [
    {
        id: 1,
        title: 'طلب إنشاء كورس: مراجعة شهر نوفمبر اولي ثانوي',
        userName: 'أحمد محمد',
        userEmail: 'ahmed@example.com',
        date: '15 مارس 2025',
        status: 'pending',
        description: 'دورة شاملة تغطي أهم الموضوعات في التاريخ مع شروحات مبسطة وتمارين تطبيقية.',
        category: 'تاريخ',
        level: 'الأول الثانوي',
        duration: '4 أسابيع',
        expectedPrice: 500,
        estimatedStudents: 50,
        priority: 'high',
        requestNumber: 'REQ-001'
    },
    {
        id: 2,
        title: 'طلب إنشاء كورس: أساسيات البرمجة',
        userName: 'فاطمة علي',
        userEmail: 'fatma@example.com',
        date: '12 مارس 2025',
        status: 'pending',
        description: 'دورة تعليمية شاملة للمبتدئين في البرمجة تغطي المفاهيم الأساسية والتطبيقات العملية.',
        category: 'برمجة',
        level: 'مبتدئ',
        duration: '6 أسابيع',
        expectedPrice: 800,
        estimatedStudents: 100,
        priority: 'normal',
        requestNumber: 'REQ-002'
    },
    {
        id: 3,
        title: 'طلب إنشاء كورس: الرياضيات المتقدمة',
        userName: 'محمد أحمد',
        userEmail: 'mohamed@example.com',
        date: '10 مارس 2025',
        status: 'approved',
        approvedDate: '10 مارس 2025',
        description: 'دورة متخصصة في الرياضيات المتقدمة للطلاب الجامعيين.',
        category: 'رياضيات',
        level: 'متقدم',
        duration: '8 أسابيع',
        expectedPrice: 1200,
        estimatedStudents: 30,
        notes: 'المستخدم لديه خبرة سابقة في التدريس',
        requestNumber: 'REQ-003'
    },
    {
        id: 4,
        title: 'طلب إنشاء كورس: الفيزياء الحديثة',
        userName: 'سارة خالد',
        userEmail: 'sara@example.com',
        date: '8 مارس 2025',
        status: 'approved',
        approvedDate: '8 مارس 2025',
        description: 'استكشاف أحدث النظريات في الفيزياء مع تطبيقات عملية.',
        category: 'فيزياء',
        level: 'متقدم',
        duration: '10 أسابيع',
        expectedPrice: 1500,
        estimatedStudents: 25,
        requestNumber: 'REQ-004'
    },
    {
        id: 5,
        title: 'طلب إنشاء كورس: الطبخ المنزلي',
        userName: 'لينا حسن',
        userEmail: 'lina@example.com',
        date: '5 مارس 2025',
        status: 'rejected',
        rejectedDate: '5 مارس 2025',
        rejectionReason: 'المحتوى لا يتناسب مع المنهج التعليمي للمنصة',
        description: 'تعليم الطبخ المنزلي مع وصفات متنوعة من جميع أنحاء العالم.',
        category: 'طبخ',
        level: 'مبتدئ',
        duration: '12 أسبوع',
        expectedPrice: 600,
        estimatedStudents: 40,
        requestNumber: 'REQ-005'
    },
    {
        id: 6,
        title: 'طلب إنشاء كورس: التصوير الفوتوغرافي',
        userName: 'عمر يوسف',
        userEmail: 'omar@example.com',
        date: '3 مارس 2025',
        status: 'rejected',
        rejectedDate: '3 مارس 2025',
        rejectionReason: 'عدم كفاية المحتوى التعليمي والخبرة المطلوبة',
        description: 'دورة شاملة في التصوير الفوتوغرافي من الأساسيات إلى التقنيات المتقدمة.',
        category: 'تصوير',
        level: 'متوسط',
        duration: '8 أسابيع',
        expectedPrice: 900,
        estimatedStudents: 35,
        requestNumber: 'REQ-006'
    },
    {
        id: 7,
        title: 'طلب إنشاء كورس: اللغة الإنجليزية للمحادثة',
        userName: 'نورا سعيد',
        userEmail: 'nora@example.com',
        date: '1 مارس 2025',
        status: 'pending',
        description: 'دورة مكثفة لتحسين مهارات المحادثة باللغة الإنجليزية للمستوى المتوسط.',
        category: 'لغات',
        level: 'متوسط',
        duration: '6 أسابيع',
        expectedPrice: 700,
        estimatedStudents: 45,
        priority: 'high',
        requestNumber: 'REQ-007'
    },
    {
        id: 8,
        title: 'طلب إنشاء كورس: تطوير تطبيقات الجوال',
        userName: 'خالد عمرو',
        userEmail: 'khaled@example.com',
        date: '28 فبراير 2025',
        status: 'approved',
        approvedDate: '28 فبراير 2025',
        description: 'تعليم تطوير تطبيقات الجوال باستخدام تقنيات حديثة مثل React Native.',
        category: 'برمجة',
        level: 'متقدم',
        duration: '12 أسبوع',
        expectedPrice: 1800,
        estimatedStudents: 20,
        notes: 'المدرب حاصل على شهادات معتمدة',
        requestNumber: 'REQ-008'
    }
];

// دالات مساعدة
export const getRequestsCount = () => requestsData.length;

export const getPendingRequestsCount = () => 
    requestsData.filter(request => request.status === 'pending').length;

export const getApprovedRequestsCount = () => 
    requestsData.filter(request => request.status === 'approved').length;

export const getRejectedRequestsCount = () => 
    requestsData.filter(request => request.status === 'rejected').length;

export const getRequestsByCategory = (category) => 
    requestsData.filter(request => request.category === category);

export const getRequestsByLevel = (level) => 
    requestsData.filter(request => request.level === level);

export const getRequestsByDateRange = (startDate, endDate) => {
    // دالة لفلترة الطلبات حسب النطاق الزمني
    return requestsData.filter(request => {
        const requestDate = new Date(request.date);
        return requestDate >= startDate && requestDate <= endDate;
    });
};

export const getRequestStats = () => {
    const total = getRequestsCount();
    const pending = getPendingRequestsCount();
    const approved = getApprovedRequestsCount();
    const rejected = getRejectedRequestsCount();
    
    return {
        total,
        pending,
        approved,
        rejected,
        pendingPercentage: ((pending / total) * 100).toFixed(1),
        approvedPercentage: ((approved / total) * 100).toFixed(1),
        rejectedPercentage: ((rejected / total) * 100).toFixed(1)
    };
};

export const categories = [
    'تاريخ',
    'رياضيات',
    'علوم',
    'لغات',
    'برمجة',
    'تصوير',
    'طبخ',
    'فنون',
    'أعمال'
];

export const levels = [
    'مبتدئ',
    'متوسط',
    'متقدم',
    'خبير'
];

export const priorities = [
    { value: 'low', label: 'منخفض', color: 'info' },
    { value: 'normal', label: 'عادي', color: 'primary' },
    { value: 'high', label: 'عالي', color: 'warning' },
    { value: 'urgent', label: 'عاجل', color: 'danger' }
];