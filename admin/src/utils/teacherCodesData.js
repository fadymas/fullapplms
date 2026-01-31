// src/utils/teacherCodesData.js
export const codesData = [
    {
        id: 1,
        grade: 'الأول الثانوي',
        course: 'تاريخ',
        code: 'CODE123456',
        status: 'نشط',
        createdDate: '2024-01-15',
        uses: 5,
        maxUses: 10
    },
    {
        id: 2,
        grade: 'الثاني الثانوي',
        course: 'تاريخ',
        code: 'CODE789012',
        status: 'نشط',
        createdDate: '2024-01-14',
        uses: 3,
        maxUses: 10
    },
    {
        id: 3,
        grade: 'الثالث الثانوي',
        course: 'تاريخ',
        code: 'CODE345678',
        status: 'نشط',
        createdDate: '2024-01-13',
        uses: 8,
        maxUses: 10
    },
    {
        id: 4,
        grade: 'الأول الثانوي',
        course: 'رياضيات',
        code: 'MATH123456',
        status: 'نشط',
        createdDate: '2024-01-12',
        uses: 2,
        maxUses: 15
    },
    {
        id: 5,
        grade: 'الثاني الثانوي',
        course: 'رياضيات',
        code: 'MATH789012',
        status: 'غير نشط',
        createdDate: '2024-01-11',
        uses: 0,
        maxUses: 15
    },
    {
        id: 6,
        grade: 'الثالث الثانوي',
        course: 'رياضيات',
        code: 'MATH345678',
        status: 'نشط',
        createdDate: '2024-01-10',
        uses: 10,
        maxUses: 15
    },
    {
        id: 7,
        grade: 'الأول الثانوي',
        course: 'علوم',
        code: 'SCI123456',
        status: 'مستخدم',
        createdDate: '2024-01-09',
        uses: 20,
        maxUses: 20
    },
    {
        id: 8,
        grade: 'الثاني الثانوي',
        course: 'علوم',
        code: 'SCI789012',
        status: 'نشط',
        createdDate: '2024-01-08',
        uses: 7,
        maxUses: 20
    },
    {
        id: 9,
        grade: 'الثالث الثانوي',
        course: 'علوم',
        code: 'SCI345678',
        status: 'منتهي',
        createdDate: '2024-01-07',
        uses: 15,
        maxUses: 15
    },
    {
        id: 10,
        grade: 'الأول الثانوي',
        course: 'لغة عربية',
        code: 'ARAB123456',
        status: 'نشط',
        createdDate: '2024-01-06',
        uses: 4,
        maxUses: 25
    },
    {
        id: 11,
        grade: 'الثاني الثانوي',
        course: 'لغة عربية',
        code: 'ARAB789012',
        status: 'نشط',
        createdDate: '2024-01-05',
        uses: 6,
        maxUses: 25
    },
    {
        id: 12,
        grade: 'الثالث الثانوي',
        course: 'لغة عربية',
        code: 'ARAB345678',
        status: 'نشط',
        createdDate: '2024-01-04',
        uses: 9,
        maxUses: 25
    }
];

export const gradeOptions = [
    'الأول الثانوي',
    'الثاني الثانوي',
    'الثالث الثانوي',
    'الأول الإعدادي',
    'الثاني الإعدادي',
    'الثالث الإعدادي'
];

export const courseOptions = [
    'تاريخ',
    'رياضيات',
    'علوم',
    'لغة عربية',
    'لغة إنجليزية',
    'فيزياء',
    'كيمياء',
    'أحياء',
    'جغرافيا'
];

export const statusOptions = [
    { value: 'active', label: 'نشط', color: 'success' },
    { value: 'inactive', label: 'غير نشط', color: 'secondary' },
    { value: 'used', label: 'مستخدم', color: 'info' },
    { value: 'expired', label: 'منتهي', color: 'danger' }
];

// دالات مساعدة
export const getTotalCodes = () => codesData.length;

export const getActiveCodes = () => 
    codesData.filter(code => code.status === 'نشط').length;

export const getUsedCodes = () => 
    codesData.filter(code => code.status === 'مستخدم').length;

export const getExpiredCodes = () => 
    codesData.filter(code => code.status === 'منتهي').length;

export const generateNewCode = (grade, course) => {
    const prefix = course.substring(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `${prefix}${randomPart}`;
};

export const getCodesByGrade = (grade) => 
    codesData.filter(code => code.grade === grade);

export const getCodesByCourse = (course) => 
    codesData.filter(code => code.course === course);