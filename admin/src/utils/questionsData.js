// src/utils/questionsData.js
export const questionTypes = [
    { 
        id: 'multiple-choice', 
        name: 'اختيار متعدد', 
        icon: 'list-ul',
        description: 'سؤال باختيارات متعددة',
        color: 'primary'
    },
    { 
        id: 'true-false', 
        name: 'صح/خطأ', 
        icon: 'check-circle',
        description: 'سؤال بصح أو خطأ',
        color: 'success'
    },
    { 
        id: 'short-answer', 
        name: 'إجابة قصيرة', 
        icon: 'edit',
        description: 'سؤال بإجابة قصيرة',
        color: 'info'
    }
];

export const gradeOptions = [
    { value: '', label: 'اختر الصف' },
    { value: 'الأول الثانوي', label: 'الأول الثانوي' },
    { value: 'الثاني الثانوي', label: 'الثاني الثانوي' },
    { value: 'الثالث الثانوي', label: 'الثالث الثانوي' }
];

export const courseOptions = [
    { value: '', label: 'اختر الكورس' },
    { value: 'تاريخ', label: 'تاريخ' },
    { value: 'رياضيات', label: 'رياضيات' },
    { value: 'فيزياء', label: 'فيزياء' },
    { value: 'كيمياء', label: 'كيمياء' },
    { value: 'لغة عربية', label: 'لغة عربية' },
    { value: 'لغة إنجليزية', label: 'لغة إنجليزية' }
];

export const lectureOptions = [
    { value: '', label: 'اختر المحاضرة' },
    { value: 'المحاضرة 1', label: 'المحاضرة 1' },
    { value: 'المحاضرة 2', label: 'المحاضرة 2' },
    { value: 'المحاضرة 3', label: 'المحاضرة 3' },
    { value: 'المحاضرة 4', label: 'المحاضرة 4' },
    { value: 'المحاضرة 5', label: 'المحاضرة 5' },
    { value: 'جميع المحاضرات', label: 'جميع المحاضرات' }
];

export const examTypeOptions = [
    { value: 'exam', label: 'امتحان' },
    { value: 'homework', label: 'واجب منزلي' },
    { value: 'quiz', label: 'اختبار قصير' },
    { value: 'midterm', label: 'منتصف الفصل' },
    { value: 'final', label: 'نهائي' }
];

export const sampleQuestions = [
    {
        id: 1,
        type: 'multiple-choice',
        questionText: 'ما هو العاصمة الإدارية لمصر؟',
        options: [
            { id: 1, text: 'القاهرة', isCorrect: false },
            { id: 2, text: 'الإسكندرية', isCorrect: false },
            { id: 3, text: 'العبور', isCorrect: false },
            { id: 4, text: 'الرحاب', isCorrect: true }
        ],
        points: 2
    },
    {
        id: 2,
        type: 'true-false',
        questionText: 'مصر تقع في قارة أفريقيا',
        correctAnswer: true,
        points: 1
    },
    {
        id: 3,
        type: 'short-answer',
        questionText: 'ما هو نهر النيل؟',
        correctAnswer: 'أطول نهر في العالم',
        points: 3
    }
];