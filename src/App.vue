<script setup>
import { ref, onMounted } from 'vue'
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

onMounted(() => {
  fetchAllData()
})
</script>

<template>
  <AppLoader v-if="loaderActif" @reveal="onLoaderReveal" @complete="onLoaderComplete" />
  <PageAccueil :start-entrance="startEntrance" />
</template>

<style>
/* Les styles globaux sont déjà dans style.css */
</style>
