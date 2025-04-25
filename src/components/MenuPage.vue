<template>
  <button class="menu-toggle" @click="toggleMenu" v-if="isMobile">
    <i :class="['fas', menuActive ? 'fa-times' : 'fa-bars']"></i>
  </button>
  <div class="screen">
    <div :class="['menu', { active: menuActive }]">
      <div class="navbar">
        <h1>เมนู</h1>
      </div>
      <div class="menu-items">
        <router-link to="/menu" class="menu-item" @click="setActiveComponent('deposit')">
          <i class="fas fa-money-bill-wave"></i>
          <span>ฝากเงิน - ถอนเงิน</span>
        </router-link>
        <router-link to="/menu" class="menu-item" @click="setActiveComponent('history')">
          <i class="fas fa-history"></i>
          <span>ประวัติการทำรายการ</span>
        </router-link>
        <div class="menu-footer">
          <button class="logout-button" @click="handleLogout" :disabled="loading">
            <i class="fas fa-sign-out-alt"></i>
            <span>{{ loading ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}</span>
          </button>
        </div>
      </div>
    </div>
    <div :class="['menu-screen', { shifted: menuActive && isMobile }]">
      <div class="navbar">
        <h1>ธุรกรรม</h1>
      </div>
      <div class="content">
        <transition name="slide" appear>
          <div v-if="showContent">
            <DepositWithdraw v-show="activeComponent === 'deposit'" />
            <TransactionHistory v-show="activeComponent === 'history'" />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DepositWithdraw from './DepositWithdraw.vue'
import TransactionHistory from './TransactionHistory.vue'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const showContent = ref(false)
const activeComponent = ref(null)
const loading = ref(false)
const menuActive = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    menuActive.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  setActiveComponent('deposit')
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const toggleMenu = () => {
  menuActive.value = !menuActive.value
}

const setActiveComponent = (component) => {
  showContent.value = true
  activeComponent.value = component
  if (isMobile.value) {
    menuActive.value = false
  }
}

const handleLogout = async () => {
  try {
    loading.value = true
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

body {
  margin: 0;
  font-family: 'Prompt', Arial, sans-serif;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.screen {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.menu {
  width: 300px;
  height: 100vh;
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  z-index: 10;
  transition: transform 0.3s ease;
}

.menu-screen {
  flex: 1;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  margin-left: 300px;
  height: 100vh;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 60px 20px 20px 20px;
  position: relative;
  background-color: #f8f9fa;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .menu {
    transform: translateX(-100%);
  }

  .menu.active {
    transform: translateX(0);
  }

  .menu-screen {
    margin-left: 0;
  }

  .menu-screen.shifted {
    margin-left: 300px;
  }

  .navbar {
    padding: 10px !important;
  }

  .navbar h1 {
    font-size: 20px !important;
  }

  .menu-toggle {
    display: block !important;
  }
}

/* Tablet Responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  .menu {
    width: 250px;
  }

  .menu-screen {
    margin-left: 250px;
  }

  .menu-item {
    padding: 12px 20px !important;
  }

  .menu-item i {
    font-size: 18px !important;
  }

  .menu-item span {
    font-size: 14px !important;
  }
}

/* Large Screen Responsive */
@media (min-width: 1920px) {
  .menu {
    width: 350px;
  }

  .menu-screen {
    margin-left: 350px;
  }

  .menu-item {
    padding: 18px 30px !important;
  }

  .menu-item i {
    font-size: 24px !important;
  }

  .menu-item span {
    font-size: 18px !important;
  }
}

/* Menu Toggle Button */
.menu-toggle {
  display: none;
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 20;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}

/* Slide animation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.navbar {
  background-color: #1a252f;
  color: white;
  padding: 10px 20px;
  text-align: center;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 2;
}

.menu-items {
  padding: 20px 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: calc(100vh - 50px);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  position: relative;
  overflow: hidden;
  margin: 0 10px;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.menu-item:hover::before {
  transform: translateX(100%);
}

.menu-item:hover {
  background-color: #34495e;
  border-left: 4px solid #3498db;
  color: #fff;
  transform: translateX(5px);
}

.menu-item i {
  font-size: 20px;
  margin-right: 15px;
  width: 24px;
  text-align: center;
  transition: transform 0.3s ease;
}

.menu-item:hover i {
  transform: scale(1.1);
}

.menu-item span {
  font-size: 16px;
  transition: transform 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item:hover span {
  transform: translateX(5px);
}

h1 {
  font-size: 25px;
  color: #fff;
  margin: 0;
  font-weight: 500;
}

/* Active menu item style */
.router-link-active {
  background-color: #34495e;
  border-left: 4px solid #3498db;
  color: #fff;
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.3);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.menu-footer {
  margin-top: auto;
  padding: 10px 30px 10px 45px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  background-color: transparent;
  color: #ecf0f1;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.logout-button:hover {
  background-color: #e74c3c;
  color: white;
}

.logout-button i {
  font-size: 18px;
  margin-right: 15px;
  width: 24px;
  text-align: center;
}

@media (max-width: 480px) {
  .menu {
    width: 100%;
  }

  .menu.active {
    transform: translateX(0);
  }

  .menu-screen.shifted {
    margin-left: 0;
    opacity: 0.5;
  }

  .navbar {
    padding: 10px;
  }

  .menu-item {
    padding: 12px 15px;
  }

  .menu-footer {
    padding: 10px 15px;
  }

  .logout-button {
    padding: 10px 15px;
    font-size: 14px;
  }
}
</style>
