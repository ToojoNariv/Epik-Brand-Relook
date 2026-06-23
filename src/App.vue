<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppLoader from './components/AppLoader.vue'
import PageAccueil from './components/PageAccueil.vue'
import { fetchAllData } from './services/apiService'

const loaderActif = ref(true)
const startEntrance = ref(false)

const onLoaderReveal = () => {
  startEntrance.value = true
}

const onLoaderComplete = () => {
  loaderActif.value = false
}

const updateVh = () => {
  if (typeof window !== 'undefined') {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}

onMounted(() => {
  fetchAllData()
  updateVh()
  window.addEventListener('resize', updateVh)
  window.addEventListener('orientationchange', updateVh)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateVh)
  window.removeEventListener('orientationchange', updateVh)
})
</script>

<template>
  <AppLoader v-if="loaderActif" @reveal="onLoaderReveal" @complete="onLoaderComplete" />
  <PageAccueil :start-entrance="startEntrance" />
</template>

<style>
</style>
