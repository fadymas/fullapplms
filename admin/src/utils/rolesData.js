// src/utils/rolesData.js
export const rolesData = [
    {
        id: 1,
        name: "مدير",
        description: "دور المدير الذي يدير النظام بالكامل",
        usersCount: 5
    },
    {
        id: 2,
        name: "معلم",
        description: "دور المعلم المسؤول عن التدريس وإنشاء الكورسات",
        usersCount: 25
    },
    {
        id: 3,
        name: "طالب",
        description: "دور الطالب الذي يتعلم من الكورسات والمواد التعليمية",
        usersCount: 150
    },
    {
        id: 4,
        name: "مشرف",
        description: "دور المشرف على المحتوى والجودة التعليمية",
        usersCount: 10
    },
    {
        id: 5,
        name: "محرر",
        description: "دور المحرر المسؤول عن مراجعة وتحرير المحتوى",
        usersCount: 8
    },
    {
        id: 6,
        name: "مراقب",
        description: "دور المراقب للمتابعة والتقارير",
        usersCount: 3
    },
    {
        id: 7,
        name: "دعم فني",
        description: "دور الدعم الفني للمساعدة التقنية",
        usersCount: 6
    },
    {
        id: 8,
        name: "مطور",
        description: "دور المطور للنظام والتطبيقات",
        usersCount: 4
    }
];

export const roleOptions = [
    { value: "مدير", label: "مدير" },
    { value: "معلم", label: "معلم" },
    { value: "طالب", label: "طالب" },
    { value: "مشرف", label: "مشرف" },
    { value: "محرر", label: "محرر" },
    { value: "مراقب", label: "مراقب" },
    { value: "دعم فني", label: "دعم فني" },
    { value: "مطور", label: "مطور" }
];