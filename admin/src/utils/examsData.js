// src/utils/examsData.js
export const teacherExamsData = [
    {
        id: 1,
        name: "امتحان الفصل الأول - فيزياء",
        grade: "الأول الثانوي",
        course: "فيزياء",
        lecture: "المحاضرة 1-4",
        type: "فصل دراسي",
        status: "منشور",
        createdDate: "2024-01-15",
        totalQuestions: 20,
        totalMarks: 100
    },
    {
        id: 2,
        name: "امتحان شهري - رياضيات",
        grade: "الثاني الثانوي",
        course: "رياضيات",
        lecture: "المحاضرة 5-8",
        type: "شهري",
        status: "مسودة",
        createdDate: "2024-01-20",
        totalQuestions: 15,
        totalMarks: 75
    },
    {
        id: 3,
        name: "اختبار قصير - كيمياء",
        grade: "الثالث الثانوي",
        course: "كيمياء",
        lecture: "المحاضرة 3",
        type: "اختبار قصير",
        status: "منشور",
        createdDate: "2024-01-25",
        totalQuestions: 10,
        totalMarks: 50
    },
    {
        id: 4,
        name: "امتحان نهائي - تاريخ",
        grade: "الأول الثانوي",
        course: "تاريخ",
        lecture: "جميع المحاضرات",
        type: "نهائي",
        status: "مسودة",
        createdDate: "2024-01-28",
        totalQuestions: 25,
        totalMarks: 100
    },
    {
        id: 5,
        name: "امتحان تجريبي - لغة عربية",
        grade: "الثاني الثانوي",
        course: "لغة عربية",
        lecture: "المحاضرة 1-6",
        type: "تجريبي",
        status: "منشور",
        createdDate: "2024-02-01",
        totalQuestions: 30,
        totalMarks: 100
    }
];

export const studentExamsData = [
    {
        id: 1,
        studentName: "أحمد محمد",
        grade: "الأول الثانوي",
        course: "تاريخ",
        score: 85,
        totalScore: 100,
        percentage: 85,
        status: "مكتمل",
        examDate: "2024-01-10",
        submittedDate: "2024-01-10"
    },
    {
        id: 2,
        studentName: "محمد علي",
        grade: "الثاني الثانوي",
        course: "رياضيات",
        score: 92,
        totalScore: 100,
        percentage: 92,
        status: "مكتمل",
        examDate: "2024-01-12",
        submittedDate: "2024-01-12"
    },
    {
        id: 3,
        studentName: "سارة أحمد",
        grade: "الثالث الثانوي",
        course: "فيزياء",
        score: 78,
        totalScore: 100,
        percentage: 78,
        status: "مكتمل",
        examDate: "2024-01-15",
        submittedDate: "2024-01-15"
    },
    {
        id: 4,
        studentName: "علي حسن",
        grade: "الأول الثانوي",
        course: "كيمياء",
        score: 65,
        totalScore: 100,
        percentage: 65,
        status: "مكتمل",
        examDate: "2024-01-18",
        submittedDate: "2024-01-18"
    },
    {
        id: 5,
        studentName: "فاطمة إبراهيم",
        grade: "الثاني الثانوي",
        course: "لغة عربية",
        score: 88,
        totalScore: 100,
        percentage: 88,
        status: "مكتمل",
        examDate: "2024-01-20",
        submittedDate: "2024-01-20"
    },
    {
        id: 6,
        studentName: "خالد سمير",
        grade: "الثالث الثانوي",
        course: "رياضيات",
        score: 95,
        totalScore: 100,
        percentage: 95,
        status: "مكتمل",
        examDate: "2024-01-22",
        submittedDate: "2024-01-22"
    },
    {
        id: 7,
        studentName: "مريم وليد",
        grade: "الأول الثانوي",
        course: "فيزياء",
        score: 72,
        totalScore: 100,
        percentage: 72,
        status: "مكتمل",
        examDate: "2024-01-25",
        submittedDate: "2024-01-25"
    },
    {
        id: 8,
        studentName: "ياسر عمرو",
        grade: "الثاني الثانوي",
        course: "تاريخ",
        score: 81,
        totalScore: 100,
        percentage: 81,
        status: "مكتمل",
        examDate: "2024-01-28",
        submittedDate: "2024-01-28"
    }
];

export const gradeOptions = [
    { value: "", label: "جميع الصفوف" },
    { value: "الأول الثانوي", label: "الأول الثانوي" },
    { value: "الثاني الثانوي", label: "الثاني الثانوي" },
    { value: "الثالث الثانوي", label: "الثالث الثانوي" }
];

export const courseOptions = [
    { value: "", label: "جميع الكورسات" },
    { value: "تاريخ", label: "تاريخ" },
    { value: "رياضيات", label: "رياضيات" },
    { value: "فيزياء", label: "فيزياء" },
    { value: "كيمياء", label: "كيمياء" },
    { value: "لغة عربية", label: "لغة عربية" }
];

export const examTypeOptions = [
    { value: "فصل دراسي", label: "فصل دراسي" },
    { value: "شهري", label: "شهري" },
    { value: "اختبار قصير", label: "اختبار قصير" },
    { value: "نهائي", label: "نهائي" },
    { value: "تجريبي", label: "تجريبي" }
];