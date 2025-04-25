import { defineStore } from 'pinia'
import { useUserSessionStore } from './userSessionStore'

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactionsByUser: {},
    balanceByUser: {},
    loading: false,
    error: null,
  }),

  getters: {
    currentUserTransactions: (state) => {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user
      return currentUser ? state.transactionsByUser[currentUser.id] || [] : []
    },

    currentUserBalance: (state) => {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user
      return currentUser ? state.balanceByUser[currentUser.id] || 0 : 0
    },

    calculatedBalance: (state) => {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user
      if (!currentUser) return 0

      const transactions = state.transactionsByUser[currentUser.id] || []
      return transactions.reduce((total, transaction) => {
        const amount = parseFloat(transaction.amount)
        if (transaction.type === 'deposit') {
          return total + amount
        } else if (transaction.type === 'withdraw') {
          return total - amount
        }
        return total
      }, 0)
    },
  },

  actions: {
    loadFromStorage() {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user

      if (currentUser) {
        const storedData = localStorage.getItem(`transactions_${currentUser.id}`)
        if (storedData) {
          const { transactions, balance } = JSON.parse(storedData)
          this.transactionsByUser[currentUser.id] = transactions
          this.balanceByUser[currentUser.id] = this.calculatedBalance
        } else {
          this.transactionsByUser[currentUser.id] = []
          this.balanceByUser[currentUser.id] = 0
        }
      }
    },

    saveToStorage() {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user

      if (currentUser) {
        localStorage.setItem(
          `transactions_${currentUser.id}`,
          JSON.stringify({
            transactions: this.transactionsByUser[currentUser.id] || [],
            balance: this.balanceByUser[currentUser.id] || 0,
          }),
        )
      }
    },

    recalculateBalance() {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user
      if (currentUser) {
        this.balanceByUser[currentUser.id] = this.calculatedBalance
        this.saveToStorage()
      }
    },

    addTransaction(transaction) {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user

      if (!currentUser) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
      }

      if (transaction.amount < 0) {
        throw new Error('จำนวนเงินต้องไม่ติดลบ')
      }

      if (transaction.amount > 100000) {
        throw new Error('จำนวนเงินต้องไม่เกิน 100,000 บาท')
      }

      const amount = parseFloat(transaction.amount)
      const currentBalance = this.balanceByUser[currentUser.id] || 0

      if (transaction.type === 'withdraw') {
        const newBalance = currentBalance - amount
        if (newBalance < 0) {
          throw new Error('ยอดเงินไม่เพียงพอ')
        }
      }

      const newTransaction = {
        id: Date.now(),
        userId: currentUser.id,
        type: transaction.type,
        amount: amount,
        date: new Date().toISOString(),
        description: transaction.description || '',
      }

      if (!this.transactionsByUser[currentUser.id]) {
        this.transactionsByUser[currentUser.id] = []
      }

      this.transactionsByUser[currentUser.id].unshift(newTransaction)
      this.recalculateBalance()

      return newTransaction
    },

    updateTransaction(transactionId, updatedData) {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user

      if (!currentUser) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
      }

      if (updatedData.amount < 0) {
        throw new Error('จำนวนเงินต้องไม่ติดลบ')
      }

      if (updatedData.amount > 100000) {
        throw new Error('จำนวนเงินต้องไม่เกิน 100,000 บาท')
      }

      const userTransactions = this.transactionsByUser[currentUser.id] || []
      const transactionIndex = userTransactions.findIndex((t) => t.id === transactionId)

      if (transactionIndex === -1) {
        throw new Error('ไม่พบรายการที่ต้องการแก้ไข')
      }

      const originalTransaction = userTransactions[transactionIndex]
      const newAmount = parseFloat(updatedData.amount)

      let simulatedBalance = this.calculatedBalance
      if (originalTransaction.type === 'deposit') {
        simulatedBalance = simulatedBalance - originalTransaction.amount + newAmount
      } else if (originalTransaction.type === 'withdraw') {
        simulatedBalance = simulatedBalance + originalTransaction.amount - newAmount
      }

      if (simulatedBalance < 0) {
        throw new Error('ยอดเงินไม่เพียงพอ')
      }

      const updatedTransaction = {
        ...originalTransaction,
        amount: newAmount,
        description: updatedData.description,
        date: new Date().toISOString(),
      }

      userTransactions.splice(transactionIndex, 1)
      userTransactions.unshift(updatedTransaction)
      this.recalculateBalance()

      return updatedTransaction
    },

    getTransactions() {
      return this.currentUserTransactions
    },

    getBalance() {
      return this.currentUserBalance
    },

    clearData() {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user

      if (currentUser) {
        this.transactionsByUser[currentUser.id] = []
        this.balanceByUser[currentUser.id] = 0
        this.saveToStorage()
      }
    },

    setTransactions(userId, transactions) {
      this.transactionsByUser = {
        ...this.transactionsByUser,
        [userId]: transactions,
      }
      localStorage.setItem('transactions', JSON.stringify(this.transactionsByUser))
    },

    setBalance(userId, balance) {
      this.balanceByUser = {
        ...this.balanceByUser,
        [userId]: balance,
      }
      localStorage.setItem('balances', JSON.stringify(this.balanceByUser))
    },

    updateBalance(userId, amount) {
      const userStore = useUserSessionStore()
      if (!userStore.currentUser) throw new Error('ไม่พบข้อมูลผู้ใช้')

      const currentBalance = this.currentUserBalance
      const newBalance = currentBalance + amount

      if (newBalance < 0) {
        throw new Error('ยอดเงินคงเหลือไม่เพียงพอ')
      }

      this.setBalance(userId, newBalance)
      return newBalance
    },

    async deposit(amount) {
      this.loading = true
      this.error = null
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const transaction = {
          id: Date.now(),
          type: 'deposit',
          amount: amount,
          date: new Date(),
          status: 'success',
        }

        this.transactionsByUser[transaction.userId].push(transaction)

        return { success: true, transaction }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async withdraw(amount) {
      this.loading = true
      this.error = null
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (amount > this.currentUserBalance) {
          throw new Error('ยอดเงินไม่เพียงพอ')
        }

        const transaction = {
          id: Date.now(),
          type: 'withdraw',
          amount: amount,
          date: new Date(),
          status: 'success',
        }

        this.transactionsByUser[transaction.userId].push(transaction)

        return { success: true, transaction }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTransactions() {
      this.loading = true
      this.error = null
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return this.currentUserTransactions
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTransaction(transactionId) {
      const userSessionStore = useUserSessionStore()
      const currentUser = userSessionStore.user

      if (!currentUser) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
      }

      if (!this.transactionsByUser[currentUser.id]) {
        this.transactionsByUser[currentUser.id] = []
      }

      const transactionIndex = this.transactionsByUser[currentUser.id].findIndex(
        (t) => t.id === transactionId,
      )

      if (transactionIndex === -1) {
        throw new Error('ไม่พบรายการที่ต้องการลบ')
      }

      const transaction = this.transactionsByUser[currentUser.id][transactionIndex]

      if (transaction.type === 'deposit') {
        const newBalance = this.calculatedBalance - transaction.amount
        if (newBalance < 0) {
          throw new Error('ไม่สามารถลบรายการนี้ได้ เนื่องจากจะทำให้ยอดเงินติดลบ')
        }
      }

      this.transactionsByUser[currentUser.id].splice(transactionIndex, 1)

      this.recalculateBalance()

      return { success: true }
    },
  },
})
