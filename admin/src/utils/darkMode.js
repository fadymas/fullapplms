// src/utils/darkMode.js

// دالة لتفعيل Dark Mode على مستوى التطبيق
export const initializeDarkMode = () => {
    // قراءة التفضيل من localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;
    
    // تطبيق على body
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    return isDarkMode;
};

// دالة للتبديل بين الوضعين
export const toggleDarkMode = () => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const newMode = !isDarkMode;
    
    if (newMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // حفظ في localStorage
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    
    return newMode;
};

// دالة للتحقق من الحالة الحالية
export const isDarkModeEnabled = () => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
};