import { defineStore } from 'pinia'

export const useUserSessionStore = defineStore('userSession', {
  state: () => ({
    user: null,
  }),

  actions: {
    setUser(user) {
      this.user = user
      sessionStorage.setItem('user_session', JSON.stringify(user))
    },

    clearUser() {
      this.user = null
      sessionStorage.removeItem('user_session')
    },

    loadSession() {
      const savedSession = sessionStorage.getItem('user_session')
      if (savedSession) {
        this.user = JSON.parse(savedSession)
        return true
      }
      return false
    },

    isAuthenticated() {
      return !!this.user
    },

    getUser() {
      return this.user
    },
  },
})
