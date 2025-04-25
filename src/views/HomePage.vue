<template>
  <div class="home-page">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserSessionStore } from '../stores/userSessionStore'

const router = useRouter()
const userSessionStore = useUserSessionStore()

onMounted(() => {
  if (!userSessionStore.isAuthenticated()) {
    router.push('/login')
  } else {
    router.push('/menu')
  }
})
</script>

<style scoped>
.home-page {
  height: 100vh;
  overflow: hidden;
}
</style>
