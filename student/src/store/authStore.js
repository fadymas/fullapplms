import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            login: (userData, accessToken, refreshToken) => set({
                user: userData,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                error: null
            }),

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            setError: (error) => set({ error }),
            setLoading: (loading) => set({ loading }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);

export default useAuthStore;
