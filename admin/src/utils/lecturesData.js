// src/utils/lecturesData.js
export const lecturesData = [
    {
        id: 1,
        courseId: 1,
        courseName: "مقدمة في الفيزياء",
        lectureNumber: "Lecture 1",
        titlePart1: "مقدمة في الفيزياء",
        titlePart2: "تفاصيل إضافية للشرح",
        materialFile: "/materials/physics-lecture1.pdf",
        homeworkFile: "/homeworks/physics-hw1.pdf",
        videoDescription: "واجبات منزلية الفصل الأول",
        examScore: 85,
        homeworkScore: 90
    },
    {
        id: 2,
        courseId: 1,
        courseName: "مقدمة في الفيزياء",
        lectureNumber: "Lecture 2",
        titlePart1: "القوة والحركة",
        titlePart2: "قوانين نيوتن للحركة",
        materialFile: "/materials/physics-lecture2.pdf",
        homeworkFile: "/homeworks/physics-hw2.pdf",
        videoDescription: "حل تمارين القوة والحركة",
        examScore: 78,
        homeworkScore: 88
    },
    {
        id: 3,
        courseId: 1,
        courseName: "مقدمة في الفيزياء",
        lectureNumber: "Lecture 3",
        titlePart1: "الطاقة والحرارة",
        titlePart2: "قوانين الديناميكا الحرارية",
        materialFile: "/materials/physics-lecture3.pdf",
        homeworkFile: "/homeworks/physics-hw3.pdf",
        videoDescription: "تمارين الطاقة والحرارة",
        examScore: 92,
        homeworkScore: 85
    },
    {
        id: 4,
        courseId: 1,
        courseName: "مقدمة في الفيزياء",
        lectureNumber: "Lecture 4",
        titlePart1: "الكهرباء الساكنة",
        titlePart2: "قانون كولوم والمجال الكهربائي",
        materialFile: "/materials/physics-lecture4.pdf",
        homeworkFile: "/homeworks/physics-hw4.pdf",
        videoDescription: "حل مسائل الكهرباء الساكنة",
        examScore: 80,
        homeworkScore: 92
    },
    {
        id: 5,
        courseId: 2,
        courseName: "الجبر الخطي",
        lectureNumber: "Lecture 1",
        titlePart1: "المصفوفات والمحددات",
        titlePart2: "عمليات المصفوفات الأساسية",
        materialFile: "/materials/algebra-lecture1.pdf",
        homeworkFile: "/homeworks/algebra-hw1.pdf",
        videoDescription: "تمارين المصفوفات",
        examScore: 95,
        homeworkScore: 88
    },
    {
        id: 6,
        courseId: 2,
        courseName: "الجبر الخطي",
        lectureNumber: "Lecture 2",
        titlePart1: "المتجهات والفضاءات",
        titlePart2: "الفضاءات المتجهة",
        materialFile: "/materials/algebra-lecture2.pdf",
        homeworkFile: "/homeworks/algebra-hw2.pdf",
        videoDescription: "تمارين المتجهات",
        examScore: 87,
        homeworkScore: 90
    },
    {
        id: 7,
        courseId: 3,
        courseName: "الكيمياء العضوية",
        lectureNumber: "Lecture 1",
        titlePart1: "الهيدروكربونات",
        titlePart2: "الألكانات والألكينات",
        materialFile: "/materials/chemistry-lecture1.pdf",
        homeworkFile: "/homeworks/chemistry-hw1.pdf",
        videoDescription: "تمارين الهيدروكربونات",
        examScore: 82,
        homeworkScore: 86
    },
    {
        id: 8,
        courseId: 3,
        courseName: "الكيمياء العضوية",
        lectureNumber: "Lecture 2",
        titlePart1: "المجموعات الوظيفية",
        titlePart2: "الكحولات والأحماض",
        materialFile: "/materials/chemistry-lecture2.pdf",
        homeworkFile: "/homeworks/chemistry-hw2.pdf",
        videoDescription: "تمارين المجموعات الوظيفية",
        examScore: 89,
        homeworkScore: 91
    }
];

export const gradeOptions = [
    { value: "first", label: "الأول الثانوي" },
    { value: "second", label: "الثاني الثانوي" },
    { value: "third", label: "الثالث الثانوي" }
];

export const courseOptions = [
    { value: "physics", label: "مقدمة في الفيزياء" },
    { value: "algebra", label: "الجبر الخطي" },
    { value: "chemistry", label: "الكيمياء العضوية" },
    { value: "biology", label: "علم الأحياء" },
    { value: "calculus", label: "حساب التفاضل والتكامل" },
    { value: "statistics", label: "الإحصاء" }
];

export const fileTypes = [
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".mp4", ".avi", ".mov"
];