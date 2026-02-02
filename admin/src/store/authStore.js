import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'

// Define how Zustand should interact with cookies
const cookieStorage = {
  getItem: (name) => Cookies.get(name) || null,
  setItem: (name, value) =>
    Cookies.set(name, value, {
      expires: 7, // Cookie expires in 7 days
      secure: false, // Only send over HTTPS
      sameSite: 'strict'
    }),
  removeItem: (name) => Cookies.remove(name)
}

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

      login: (userData, accessToken, refreshToken) =>
        set({
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
        })

        useAuthStore.persist.clearStorage()
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ loading })
    }),
    {
      name: 'auth-storage',
      // This tells Zustand to use our cookieStorage instead of localStorage
      storage: createJSONStorage(() => cookieStorage),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore
