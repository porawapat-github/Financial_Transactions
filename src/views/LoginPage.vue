<template>
  <div class="login-page">
    <div class="login-container">
      <h1>เข้าสู่ระบบ</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">ชื่อผู้ใช้</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="กรอกชื่อผู้ใช้"
          />
        </div>
        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="กรอกรหัสผ่าน"
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" :disabled="loading" class="login-button">
          <span v-if="loading">กำลังเข้าสู่ระบบ...</span>
          <span v-else>เข้าสู่ระบบ</span>
        </button>
        <div class="register-link">
          ยังไม่มีบัญชี? <router-link to="/register">สมัครสมาชิก</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login({
      username: username.value,
      password: password.value,
    })
    if (result.success) {
      router.push('/menu')
    }
  } catch (err) {
    error.value = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  font-family: 'Prompt', Arial, sans-serif;
  padding: 20px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .login-page {
    padding: 15px;
  }

  .login-container {
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

  .login-button {
    padding: 10px;
    font-size: 14px;
  }
}

/* Small Mobile Responsive */
@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }

  .login-container {
    padding: 15px;
  }

  h1 {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    font-size: 13px;
    margin-bottom: 5px;
  }

  input {
    padding: 8px;
    font-size: 13px;
  }

  .login-button {
    padding: 8px;
    font-size: 13px;
  }

  .error-message {
    font-size: 12px;
    padding: 8px;
    margin-bottom: 10px;
  }

  .register-link {
    font-size: 12px;
    margin-top: 10px;
  }
}

/* Tablet Responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  .login-container {
    max-width: 450px;
  }
}

/* Large Screen Responsive */
@media (min-width: 1920px) {
  .login-container {
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

  .login-button {
    padding: 15px;
    font-size: 18px;
  }

  .register-link {
    font-size: 16px;
    margin-top: 20px;
  }
}

.login-container {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.login-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-bottom: 15px;
  font-size: 14px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 5px;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #555;
  margin-top: 15px;
}

.register-link a {
  color: #3498db;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
