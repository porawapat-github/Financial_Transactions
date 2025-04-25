<template>
  <div class="deposit-withdraw">
    <div class="balance-section">
      <h2>ยอดเงินคงเหลือ</h2>
      <p class="balance">{{ formatCurrency(balance) }}</p>
    </div>

    <div class="transaction-form">
      <h2>{{ isDeposit ? 'ฝากเงิน' : 'ถอนเงิน' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="amount">จำนวนเงิน</label>
          <input
            type="number"
            id="amount"
            v-model="amount"
            min="0"
            step="0.01"
            required
            placeholder="กรอกจำนวนเงิน"
          />
        </div>
        <div class="form-group">
          <label for="description">รายละเอียด</label>
          <input
            type="text"
            id="description"
            v-model="description"
            placeholder="กรอกรายละเอียด (ไม่บังคับ)"
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div class="button-group">
          <button type="button" class="toggle-button" @click="toggleTransactionType">
            {{ isDeposit ? 'เปลี่ยนเป็นถอนเงิน' : 'เปลี่ยนเป็นฝากเงิน' }}
          </button>
          <button type="submit" :disabled="loading" class="submit-button">
            {{ isDeposit ? 'ฝากเงิน' : 'ถอนเงิน' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const transactionStore = useTransactionStore()
const amount = ref('')
const description = ref('')
const isDeposit = ref(true)
const loading = ref(false)
const error = ref('')

// โหลดข้อมูลเมื่อ component ถูก mount
onMounted(() => {
  transactionStore.loadFromStorage()
})

// คำนวณยอดเงินคงเหลือ
const balance = computed(() => transactionStore.getBalance())

const toggleTransactionType = () => {
  isDeposit.value = !isDeposit.value
  error.value = ''
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(value)
}

const handleSubmit = async () => {
  if (!amount.value) {
    error.value = 'กรุณากรอกจำนวนเงิน'
    return
  }

  const transactionAmount = parseFloat(amount.value)
  if (transactionAmount < 0) {
    error.value = 'จำนวนเงินต้องไม่ติดลบ'
    return
  }

  if (transactionAmount > 100000) {
    error.value = 'จำนวนเงินต้องไม่เกิน 100,000 บาท'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await transactionStore.addTransaction({
      type: isDeposit.value ? 'deposit' : 'withdraw',
      amount: transactionAmount,
      description: description.value,
    })

    // รีเซ็ตฟอร์ม
    amount.value = ''
    description.value = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// เพิ่ม watcher สำหรับ input amount
watch(amount, (newValue) => {
  if (newValue) {
    const value = parseFloat(newValue)
    if (value > 100000) {
      error.value = 'จำนวนเงินต้องไม่เกิน 100,000 บาท'
    } else {
      error.value = ''
    }
  }
})
</script>

<style scoped>
.deposit-withdraw {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .deposit-withdraw {
    padding: 10px;
  }

  .balance-section {
    padding: 15px;
  }

  .balance {
    font-size: 2rem !important;
  }

  .transaction-form {
    padding: 15px;
  }

  .button-group {
    flex-direction: column;
  }

  input {
    font-size: 14px !important;
    padding: 8px !important;
  }

  .toggle-button,
  .submit-button {
    width: 100%;
    padding: 10px;
    font-size: 14px;
  }
}

/* Small Mobile Responsive */
@media (max-width: 480px) {
  .deposit-withdraw {
    padding: 5px;
  }

  .balance {
    font-size: 1.8rem !important;
  }

  h2 {
    font-size: 1.2rem;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    font-size: 14px;
  }

  .error-message {
    font-size: 13px;
    padding: 8px;
  }
}

/* Tablet Responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  .deposit-withdraw {
    max-width: 90%;
  }

  .balance {
    font-size: 2.2rem;
  }
}

/* Large Screen Responsive */
@media (min-width: 1920px) {
  .deposit-withdraw {
    max-width: 800px;
  }

  .balance-section {
    padding: 30px;
  }

  .balance {
    font-size: 3rem;
  }

  .transaction-form {
    padding: 30px;
  }

  h2 {
    font-size: 1.8rem;
  }

  input {
    padding: 15px;
    font-size: 18px;
  }

  .toggle-button,
  .submit-button {
    padding: 15px;
    font-size: 18px;
  }
}

.balance-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.balance {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0;
}

.transaction-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.toggle-button,
.submit-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-button {
  background-color: #95a5a6;
  color: white;
}

.toggle-button:hover {
  background-color: #7f8c8d;
}

.submit-button {
  background-color: #3498db;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>
