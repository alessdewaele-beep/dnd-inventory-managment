<template>
  <div class="min-h-screen bg-parchment dark:bg-parchment-dark transition-colors duration-200">
    <router-view />
    <p-confirmpopup class="my-confirmpopup" />
    <p-toast />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>
