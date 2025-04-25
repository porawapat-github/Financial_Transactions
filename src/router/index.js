import { createRouter, createWebHistory } from 'vue-router'
import { useUserSessionStore } from '../stores/userSessionStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
    },
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterPage.vue'),
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('../components/MenuPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/deposit-withdraw',
      name: 'deposit-withdraw',
      component: () => import('../components/DepositWithdraw.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/transaction-history',
      name: 'transaction-history',
      component: () => import('../components/TransactionHistory.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userSessionStore = useUserSessionStore()

  // โหลด session เมื่อเริ่มต้น
  if (!userSessionStore.user) {
    userSessionStore.loadSession()
  }

  // ถ้าหน้านั้นต้องการการยืนยันตัวตน
  if (to.meta.requiresAuth) {
    // ตรวจสอบว่ามี session หรือไม่
    if (!userSessionStore.isAuthenticated()) {
      // ถ้าไม่มี session ให้ไปหน้า login
      next({ name: 'login' })
    } else {
      // ถ้ามี session ให้ไปหน้าที่ต้องการได้
      next()
    }
  } else if (
    (to.name === 'login' || to.name === 'register') &&
    userSessionStore.isAuthenticated()
  ) {
    // ถ้าพยายามจะไปหน้า login หรือ register ทั้งที่มี session อยู่แล้ว ให้ไปหน้า menu แทน
    next({ name: 'menu' })
  } else {
    // กรณีอื่นๆ ให้ไปหน้าที่ต้องการได้ปกติ
    next()
  }
})

export default router
