<template>
  <div class="transaction-history">
    <div class="header-section">
      <h2>ประวัติการทำรายการ</h2>
      <div class="balance-display">
        <span class="balance-label">ยอดเงินคงเหลือ:</span>
        <span class="balance-amount">{{ formatCurrency(calculatedBalance) }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="transactions.length === 0" class="empty-state">
      <i class="fas fa-history empty-icon"></i>
      <p>ไม่มีประวัติการทำรายการ</p>
    </div>

    <div v-else class="transactions-list">
      <div v-for="transaction in transactions" :key="transaction.id" class="transaction-card">
        <div class="transaction-header">
          <div class="transaction-type-badge" :class="transaction.type">
            <i
              :class="transaction.type === 'deposit' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"
            ></i>
            {{ transaction.type === 'deposit' ? 'ฝากเงิน' : 'ถอนเงิน' }}
          </div>
          <div class="transaction-amount" :class="transaction.type">
            {{ formatCurrency(transaction.amount) }}
          </div>
        </div>

        <div class="transaction-details">
          <div class="transaction-info">
            <div class="transaction-date">
              <i class="far fa-calendar-alt"></i>
              {{ formatDate(transaction.date) }}
            </div>
            <div class="transaction-description" v-if="transaction.description">
              <i class="fas fa-comment-alt"></i>
              {{ transaction.description }}
            </div>
          </div>

          <div class="transaction-actions">
            <button
              class="action-btn edit-btn"
              @click="startEdit(transaction)"
              :disabled="editingTransaction?.id === transaction.id"
            >
              <i class="fas fa-edit"></i>
              แก้ไข
            </button>
            <button class="action-btn delete-btn" @click="confirmDelete(transaction)">
              <i class="fas fa-trash-alt"></i>
              ลบ
            </button>
          </div>
        </div>

        <!-- แบบฟอร์มแก้ไข -->
        <div v-if="editingTransaction?.id === transaction.id" class="edit-form">
          <div class="form-group">
            <label>จำนวนเงิน</label>
            <input
              type="number"
              v-model="editingTransaction.amount"
              min="0"
              max="100000"
              step="0.01"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>รายละเอียด</label>
            <input
              type="text"
              v-model="editingTransaction.description"
              placeholder="กรอกรายละเอียด (ไม่บังคับ)"
              class="form-input"
            />
          </div>
          <div class="form-actions">
            <button class="action-btn save-btn" @click="handleSaveEdit(transaction)">
              <i class="fas fa-check"></i>
              บันทึก
            </button>
            <button class="action-btn cancel-btn" @click="cancelEdit">
              <i class="fas fa-times"></i>
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบ -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          <h3>ยืนยันการลบรายการ</h3>
        </div>
        <div class="modal-content">
          <p>คุณต้องการลบรายการนี้ใช่หรือไม่?</p>
          <div class="transaction-preview" v-if="selectedTransaction">
            <div class="preview-item">
              <span class="preview-label">ประเภท:</span>
              <span class="preview-value">{{
                selectedTransaction.type === 'deposit' ? 'ฝากเงิน' : 'ถอนเงิน'
              }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">จำนวนเงิน:</span>
              <span class="preview-value">{{ formatCurrency(selectedTransaction.amount) }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">วันที่:</span>
              <span class="preview-value">{{ formatDate(selectedTransaction.date) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="deleteTransaction" class="action-btn confirm-btn" :disabled="loading">
            <i class="fas fa-check"></i>
            {{ loading ? 'กำลังลบ...' : 'ยืนยัน' }}
          </button>
          <button @click="cancelDelete" class="action-btn cancel-btn" :disabled="loading">
            <i class="fas fa-times"></i>
            ยกเลิก
          </button>
        </div>
      </div>
    </div>

    <!-- ข้อความ error -->
    <div v-if="error" class="error-toast">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.transaction-history {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .transaction-history {
    padding: 10px;
  }

  .header-section {
    padding: 15px;
  }

  .balance-label {
    font-size: 0.9rem;
  }

  .balance-amount {
    font-size: 1.2rem;
  }

  .transaction-card {
    margin-bottom: 10px;
  }

  .transaction-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .transaction-type-badge {
    font-size: 0.8rem;
  }

  .transaction-amount {
    font-size: 1rem;
  }

  .transaction-date,
  .transaction-description {
    font-size: 0.8rem;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .modal-container {
    width: 95%;
    margin: 10px;
  }
}

/* Tablet Responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  .transaction-history {
    max-width: 90%;
  }
}

/* Large Screen Responsive */
@media (min-width: 1920px) {
  .transaction-history {
    max-width: 1200px;
  }

  .header-section {
    padding: 30px;
  }

  .balance-label {
    font-size: 1.3rem;
  }

  .balance-amount {
    font-size: 1.8rem;
  }

  .transaction-card {
    padding: 20px;
  }

  .transaction-type-badge {
    font-size: 1.1rem;
    padding: 8px 16px;
  }

  .transaction-amount {
    font-size: 1.4rem;
  }

  .transaction-date,
  .transaction-description {
    font-size: 1rem;
  }

  .action-btn {
    padding: 10px 20px;
    font-size: 1rem;
  }
}

/* Small Mobile Responsive */
@media (max-width: 480px) {
  .transaction-actions {
    flex-direction: column;
    gap: 5px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-container {
    width: 100%;
    margin: 0;
    border-radius: 0;
  }

  .modal-header {
    padding: 15px;
  }

  .modal-content {
    padding: 15px;
  }

  .modal-actions {
    padding: 15px;
    flex-direction: column;
    gap: 10px;
  }

  .modal-actions button {
    width: 100%;
  }

  .preview-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .error-toast {
    width: 90%;
    font-size: 0.9rem;
  }
}

.header-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  text-align: center;
}

.balance-display {
  margin-top: 10px;
}

.balance-label {
  font-size: 1.1rem;
  color: #666;
  margin-right: 10px;
}

.balance-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.loading-container {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 48px;
  color: #bdc3c7;
  margin-bottom: 20px;
}

.transaction-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.transaction-card:hover {
  transform: translateY(-2px);
}

.transaction-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.transaction-type-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.transaction-type-badge.deposit {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.transaction-type-badge.withdraw {
  background-color: #ffebee;
  color: #c62828;
}

.transaction-amount {
  font-size: 1.2rem;
  font-weight: 500;
}

.transaction-amount.deposit {
  color: #2e7d32;
}

.transaction-amount.withdraw {
  color: #c62828;
}

.transaction-details {
  padding: 15px;
}

.transaction-info {
  margin-bottom: 15px;
}

.transaction-date,
.transaction-description {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.transaction-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #c0392b;
}

.save-btn {
  background-color: #2ecc71;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #27ae60;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.edit-form {
  padding: 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  padding: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px 10px 0 0;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.warning-icon {
  font-size: 24px;
  color: #f39c12;
  margin-right: 10px;
}

.modal-content {
  padding: 20px;
}

.transaction-preview {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.preview-label {
  color: #666;
}

.preview-value {
  font-weight: 500;
}

.modal-actions {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
}

.error-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e74c3c;
  color: white;
  padding: 12px 24px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const transactionStore = useTransactionStore()
const loading = ref(false)
const editingTransaction = ref(null)
const error = ref('')
const showDeleteConfirm = ref(false)
const selectedTransaction = ref(null)

const transactions = computed(() => transactionStore.getTransactions())
const calculatedBalance = computed(() => transactionStore.calculatedBalance)

onMounted(async () => {
  loading.value = true
  try {
    await transactionStore.loadFromStorage()
  } catch (error) {
    console.error('Error loading transactions:', error)
  } finally {
    loading.value = false
  }
})

const startEdit = (transaction) => {
  editingTransaction.value = { ...transaction }
  error.value = ''
}

const handleSaveEdit = async (originalTransaction) => {
  error.value = ''

  if (!editingTransaction.value.amount && editingTransaction.value.amount !== 0) {
    error.value = 'กรุณากรอกจำนวนเงิน'
    return
  }

  const amount = parseFloat(editingTransaction.value.amount)
  if (amount < 0) {
    error.value = 'จำนวนเงินต้องไม่ติดลบ'
    return
  }

  if (amount > 100000) {
    error.value = 'จำนวนเงินต้องไม่เกิน 100,000 บาท'
    return
  }

  try {
    await transactionStore.updateTransaction(originalTransaction.id, {
      amount: amount,
      description: editingTransaction.value.description,
    })
    editingTransaction.value = null
  } catch (err) {
    error.value = err.message
    setTimeout(() => {
      error.value = ''
    }, 3000)
  }
}

const cancelEdit = () => {
  editingTransaction.value = null
  error.value = ''
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount)
}

const confirmDelete = (transaction) => {
  selectedTransaction.value = transaction
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  selectedTransaction.value = null
  showDeleteConfirm.value = false
}

const deleteTransaction = async () => {
  if (!selectedTransaction.value) return

  loading.value = true
  error.value = ''

  try {
    await transactionStore.deleteTransaction(selectedTransaction.value.id)
    showDeleteConfirm.value = false
  } catch (err) {
    error.value = err.message
    setTimeout(() => {
      error.value = ''
    }, 3000)
  } finally {
    loading.value = false
    selectedTransaction.value = null
  }
}
</script>
