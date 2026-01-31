// src/utils/coursesData.js
export const coursesData = [
    {
        id: 1,
        title: "مراجعة شهر نوفمبر أولي ثانوي",
        description: "دورة شاملة تغطي أهم الموضوعات مع شروحات مبسطة وتمارين تطبيقية ومراجعات سريعة لتثبيت المعلومات.",
        grade: "first",
        gradeText: "الأول الثانوي",
        date: "10 مارس 2025",
        price: "100",
        category: "math",
        categoryText: "رياضيات",
        image: "/images/home.webp",
        link: "https://example.com/course-link-1",
        studentsCount: 45,
        rating: 4.8
    },
    {
        id: 2,
        title: "مراجعة شهر نوفمبر ثانية ثانوي",
        description: "دورة متكاملة لطلاب الصف الثاني الثانوي تغطي المنهج بأسلوب مبسط وشيق.",
        grade: "second",
        gradeText: "الثاني الثانوي",
        date: "15 مارس 2025",
        price: "120",
        category: "science",
        categoryText: "علوم",
        image: "/images/home.webp",
        link: "https://example.com/course-link-2",
        studentsCount: 38,
        rating: 4.5
    },
    {
        id: 3,
        title: "مراجعة شهر نوفمبر ثالثة ثانوي",
        description: "مراجعة نهائية للصف الثالث الثانوي مع حلول نماذج امتحانات السنوات السابقة.",
        grade: "third",
        gradeText: "الثالث الثانوي",
        date: "20 مارس 2025",
        price: "150",
        category: "language",
        categoryText: "لغات",
        image: "/images/home.webp",
        link: "https://example.com/course-link-3",
        studentsCount: 72,
        rating: 4.9
    },
    {
        id: 4,
        title: "رياضيات أولي ثانوي - الفصل الأول",
        description: "شرح كامل لفصل الرياضيات مع أمثلة تطبيقية وتمارين محلولة.",
        grade: "first",
        gradeText: "الأول الثانوي",
        date: "5 أبريل 2025",
        price: "80",
        category: "math",
        categoryText: "رياضيات",
        image: "/images/home.webp",
        link: "https://example.com/course-link-4",
        studentsCount: 28,
        rating: 4.3
    },
    {
        id: 5,
        title: "فيزياء ثانية ثانوي - الميكانيكا",
        description: "شرح مفصل لوحدة الميكانيكا مع تجارب عملية ونماذج امتحانات.",
        grade: "second",
        gradeText: "الثاني الثانوي",
        date: "12 أبريل 2025",
        price: "110",
        category: "science",
        categoryText: "علوم",
        image: "/images/home.webp",
        link: "https://example.com/course-link-5",
        studentsCount: 41,
        rating: 4.7
    },
    {
        id: 6,
        title: "لغة عربية ثالثة ثانوي - النصوص",
        description: "تحليل النصوص العربية مع شرح البلاغة والأدب للصف الثالث الثانوي.",
        grade: "third",
        gradeText: "الثالث الثانوي",
        date: "18 أبريل 2025",
        price: "90",
        category: "language",
        categoryText: "لغات",
        image: "/images/home.webp",
        link: "https://example.com/course-link-6",
        studentsCount: 35,
        rating: 4.6
    }
];

export const gradeOptions = [
    { value: "first", label: "الأول الثانوي" },
    { value: "second", label: "الثاني الثانوي" },
    { value: "third", label: "الثالث الثانوي" }
];

export const categoryOptions = [
    { value: "math", label: "رياضيات" },
    { value: "science", label: "علوم" },
    { value: "language", label: "لغات" },
    { value: "history", label: "تاريخ" },
    { value: "geography", label: "جغرافيا" },
    { value: "computer", label: "حاسب آلي" }
];