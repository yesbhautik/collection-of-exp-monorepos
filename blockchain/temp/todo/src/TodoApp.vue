<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <RouterLink to="/" class="navbar-brand">Todo App</RouterLink>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink to="/" class="nav-link">Your tasks</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/about" class="nav-link">About</RouterLink>
            </li>
          </ul>
        </div>
        <div class="d-flex align-items-center">
          <transition name="fade">
            <div v-if="showConfirmed" class="alert alert-success me-2">
              Transaction confirmed
            </div>
          </transition>
          <button class="btn btn-danger" v-if="showCommitLink" :disabled="disableCommitLink"
            @click="commitToBlockchain">Commit to blockchain</button>
        </div>
      </div>
    </nav>
  </header>
  <div class="container-fluid mt-4">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" @dataChanged="dataChanged" />
    </router-view>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, RouterView } from 'vue-router';
import Web3Singleton from "@/web3";

const showCommitLink = ref(false);
const disableCommitLink = ref(false);
const showConfirmed = ref(false);
const web3 = Web3Singleton;

const dataChanged = (val, isConfirmed = false) => {
  showCommitLink.value = val;
  disableCommitLink.value = false;
  if (isConfirmed) {
    showConfirmed.value = true;
    setTimeout(() => {
      showConfirmed.value = false;
    }, 3000);
  }
}

const commitToBlockchain = async () => {
  disableCommitLink.value = true;
  await web3.sendTransaction();
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>