<template>
  <div class="register-page">
    <div class="register-container">
      <h1>สมัครสมาชิก</h1>
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="name">ชื่อ-นามสกุล</label>
          <input type="text" id="name" v-model="formData.name" required />
          <div v-if="errors.name" class="field-error">{{ errors.name }}</div>
        </div>
        <div class="form-group">
          <label for="username">ชื่อผู้ใช้</label>
          <input type="text" id="username" v-model="formData.username" required />
          <div v-if="errors.username" class="field-error">{{ errors.username }}</div>
        </div>
        <div class="form-group">
          <label for="email">อีเมล</label>
          <input type="email" id="email" v-model="formData.email" required />
          <div v-if="errors.email" class="field-error">{{ errors.email }}</div>
        </div>
        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <input type="password" id="password" v-model="formData.password" required />
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
        </div>
        <div class="form-group">
          <label for="confirmPassword">ยืนยันรหัสผ่าน</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" required />
          <div v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</div>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก' }}
        </button>
      </form>
      <p class="login-link">มีบัญชีอยู่แล้ว? <router-link to="/login">เข้าสู่ระบบ</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const formData = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validateForm = () => {
  let isValid = true
  errors.value = {
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  }

  if (!formData.value.name) {
    errors.value.name = 'กรุณากรอกชื่อ-นามสกุล'
    isValid = false
  }

  if (!formData.value.username) {
    errors.value.username = 'กรุณากรอกชื่อผู้ใช้'
    isValid = false
  }

  if (!formData.value.email) {
    errors.value.email = 'กรุณากรอกอีเมล'
    isValid = false
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.value.email)) {
      errors.value.email = 'กรุณากรอกอีเมลให้ถูกต้อง'
      isValid = false
    }
  }

  if (!formData.value.password) {
    errors.value.password = 'กรุณากรอกรหัสผ่าน'
    isValid = false
  }

  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
    isValid = false
  } else if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    const result = await authStore.register({
      name: formData.value.name,
      username: formData.value.username,
      email: formData.value.email,
      password: formData.value.password,
    })
    if (result.success) {
      router.push('/login')
    }
  } catch (error) {
    errors.value.email = error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .register-page {
    padding: 15px;
  }

  .register-container {
    padding: 20px;
  }

  h1 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  input {
    padding: 10px;
    font-size: 14px;
  }

  button {
    padding: 10px;
    font-size: 14px;
  }
}

/* Small Mobile Responsive */
@media (max-width: 480px) {
  .register-page {
    padding: 10px;
  }

  .register-container {
    padding: 15px;
  }

  h1 {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  label {
    font-size: 13px;
    margin-bottom: 5px;
  }

  input {
    padding: 8px;
    font-size: 13px;
  }

  button {
    padding: 8px;
    font-size: 13px;
    margin-top: 10px;
  }

  .error-message {
    font-size: 12px;
    padding: 8px;
    margin-bottom: 10px;
  }

  .login-link {
    font-size: 12px;
    margin-top: 10px;
  }
}

/* Tablet Responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  .register-container {
    max-width: 450px;
  }
}

/* Large Screen Responsive */
@media (min-width: 1920px) {
  .register-container {
    max-width: 500px;
    padding: 50px;
  }

  h1 {
    font-size: 28px;
    margin-bottom: 40px;
  }

  .form-group {
    margin-bottom: 25px;
  }

  label {
    font-size: 16px;
    margin-bottom: 10px;
  }

  input {
    padding: 15px;
    font-size: 18px;
  }

  button {
    padding: 15px;
    font-size: 18px;
    margin-top: 20px;
  }

  .login-link {
    font-size: 16px;
    margin-top: 20px;
  }
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.login-link a {
  color: #4caf50;
  text-decoration: none;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.field-error {
  color: #c62828;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
