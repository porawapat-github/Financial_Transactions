<template>
  <div id="app">
    <router-view></router-view>
    <!-- แสดงเนื้อหาตาม route -->
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: 'Prompt', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f5f5f5;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.vue-devtools__panel {
  display: none !important; /* ซ่อน div vue-devtools__panel */
}

/* คุณสามารถเพิ่มสไตล์ที่นี่ */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5; /* พื้นหลังสีเทาอ่อน */
}
</style>
