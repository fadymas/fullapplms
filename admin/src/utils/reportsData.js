// src/utils/reportsData.js
export const reportsData = [
    {
        id: 1,
        studentName: "أحمد محمد",
        course: "رياضيات",
        lecture: "الدرس الأول",
        phone: "01114205243",
        guardianPhone: "01114205243",
        attendance: "حاضر",
        examScore: 85,
        homeworkScore: 90
    },
    {
        id: 2,
        studentName: "فاطمة علي",
        course: "فيزياء",
        lecture: "الدرس الثاني",
        phone: "01112223334",
        guardianPhone: "01155556667",
        attendance: "حاضر",
        examScore: 92,
        homeworkScore: 88
    },
    {
        id: 3,
        studentName: "محمد حسن",
        course: "كيمياء",
        lecture: "الدرس الثالث",
        phone: "01177778889",
        guardianPhone: "01199990001",
        attendance: "غائب",
        examScore: 78,
        homeworkScore: 85
    },
    {
        id: 4,
        studentName: "سارة أحمد",
        course: "رياضيات",
        lecture: "الدرس الأول",
        phone: "01122334455",
        guardianPhone: "01166778899",
        attendance: "حاضر",
        examScore: 95,
        homeworkScore: 92
    },
    {
        id: 5,
        studentName: "علي محمود",
        course: "فيزياء",
        lecture: "الدرس الأول",
        phone: "01133445566",
        guardianPhone: "01177889900",
        attendance: "حاضر",
        examScore: 88,
        homeworkScore: 85
    },
    {
        id: 6,
        studentName: "مريم سعيد",
        course: "كيمياء",
        lecture: "الدرس الثاني",
        phone: "01144556677",
        guardianPhone: "01188990011",
        attendance: "غائب",
        examScore: 72,
        homeworkScore: 78
    },
    {
        id: 7,
        studentName: "خالد إبراهيم",
        course: "رياضيات",
        lecture: "الدرس الثاني",
        phone: "01155667788",
        guardianPhone: "01199001122",
        attendance: "حاضر",
        examScore: 91,
        homeworkScore: 89
    },
    {
        id: 8,
        studentName: "نورا عمرو",
        course: "فيزياء",
        lecture: "الدرس الثالث",
        phone: "01166778899",
        guardianPhone: "01100112233",
        attendance: "حاضر",
        examScore: 84,
        homeworkScore: 87
    }
];

export const courseOptions = [
    { value: "", label: "جميع الكورسات" },
    { value: "رياضيات", label: "رياضيات" },
    { value: "فيزياء", label: "فيزياء" },
    { value: "كيمياء", label: "كيمياء" },
    { value: "تاريخ", label: "تاريخ" },
    { value: "لغة عربية", label: "لغة عربية" }
];

export const lectureOptions = [
    { value: "", label: "جميع المحاضرات" },
    { value: "الدرس الأول", label: "الدرس الأول" },
    { value: "الدرس الثاني", label: "الدرس الثاني" },
    { value: "الدرس الثالث", label: "الدرس الثالث" },
    { value: "الدرس الرابع", label: "الدرس الرابع" },
    { value: "الدرس الخامس", label: "الدرس الخامس" }
];

export const attendanceOptions = [
    { value: "", label: "جميع الحضور" },
    { value: "حاضر", label: "حاضر" },
    { value: "غائب", label: "غائب" }
];