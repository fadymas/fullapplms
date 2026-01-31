import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set) => ({
      darkMode: false,
      sidebarCollapsed: false,
      
      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        if (newMode) {
          document.body.classList.add('dark-mode');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.body.classList.remove('dark-mode');
          document.documentElement.setAttribute('data-theme', 'light');
        }
        return { darkMode: newMode };
      }),
      
      setDarkMode: (val) => set(() => {
        if (val) {
          document.body.classList.add('dark-mode');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.body.classList.remove('dark-mode');
          document.documentElement.setAttribute('data-theme', 'light');
        }
        return { darkMode: val };
      }),

      setSidebarCollapsed: (val) => set(() => {
        if (val) {
          document.body.classList.add('sidebar-collapsed');
        } else {
          document.body.classList.remove('sidebar-collapsed');
        }
        return { sidebarCollapsed: val };
      }),
      
      toggleSidebar: () => set((state) => {
        const newVal = !state.sidebarCollapsed;
        if (newVal) {
          document.body.classList.add('sidebar-collapsed');
        } else {
          document.body.classList.remove('sidebar-collapsed');
        }
        return { sidebarCollapsed: newVal };
      }),
    }),
    {
      name: 'ui-settings',
    }
  )
);

export default useUIStore;
