<template>
  <div v-if="connectedToWeb3" class="todos-container container py-4">
    <div class="card">
      <div class="card-header bg-primary text-white text-center">
        <h1 class="fs-2 my-2">{{ pageTitle }}</h1>
      </div>
      <div class="card-body">
        <input id="newtodoinput" class="form-control fs-4 mb-3" type="text" placeholder="Enter a task..."
          v-model="newTodoText" @blur="addNewTodo" @keyup.enter="addNewTodo">
        <todo-list :todos="todos" @persist="persist"></todo-list>
      </div>
    </div>
  </div>

  <div v-else class="container todos-container py-5">
    <div class="card">
      <div class="card-body text-center">
        <h4>Connecting to web3</h4>
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  </div>

  <div v-if="awaitingConfirmation" class="overlay">
    <div class="card text-center">
      <div class="card-body">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5 class="mt-3">Awaiting Confirmation</h5>
        <p>Likely less than {{ txConfirmationTimeCountdown }} seconds.</p>
        <transition name="slide-fade">
          <p v-if="slowNetwork" class="alert alert-danger">Taking longer than expected. Consider speeding up the
            transaction in Metamask.</p>
        </transition>
        <hr>
        <p>Transaction Hash: {{ shortenedTxHash }}</p>
        <a :href="'https://sepolia.etherscan.io/tx/' + web3.state.txHash" class="btn btn-primary btn-sm"
          target="_blank">View on Etherscan</a>
      </div>
    </div>
  </div>

  <div v-if="web3.state.error.code" class="overlay">
    <div class="card">
      <button v-if="web3.state.error.recoverable" type="button" class="btn-close"
        @click="web3.state.error = {}"></button>
      <div class="card-body">
        <h5>Something went wrong!</h5>
        <hr>
        <p v-html="web3.state.error.message"></p>
        <button v-if="web3.state.error.recoverable" type="button" class="btn btn-primary"
          @click="web3.state.error = {}">Dismiss</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import TodoList from '../components/TodoList.vue';
import Web3Singleton from "@/web3";

const pageTitle = "Your tasks...";
const dataFrom = ref('blockchain');
const connectedToWeb3 = ref(false);
const newTodoText = ref("");
const todos = ref([]);
const awaitingConfirmation = ref(false);
const txConfirmationTime = 15;
const txConfirmationTimeCountdown = ref(0);
const slowNetwork = ref(false);
const web3 = Web3Singleton;
const dataChanged = ref(false);
const emit = defineEmits(['dataChanged']);
const shortenedTxHash = computed(() => {
  if (web3.state.txHash) {
    return `${web3.state.txHash.slice(0, 4)}...${web3.state.txHash.slice(-4)}`;
  }
  return "";
});

onMounted(async () => {
  todos.value = await getDataFromChain();
  reorderDeletedTasks();
  setBlockchainDataHash(todos.value);
  persist();

  if (todos.value.length === 0) {
    todos.value = [
      { id: "aaa", index: 0, task: "Welcome to the EVM Todo List.", isDone: false, isDeleted: false, order: 0, edit: false, isStoredOnChain: false },
      { id: "aab", index: 0, task: "Delete these sample tasks", isDone: false, isDeleted: false, order: 0, edit: false, isStoredOnChain: false },
      { id: "aac", index: 0, task: "Start working on Blockchain Project.", isDone: false, isDeleted: false, order: 0, edit: false, isStoredOnChain: false },
      { id: "aad", index: 0, task: "Say hi, to YesbhautikX Blockchain Group.", isDone: false, isDeleted: false, order: 0, edit: false, isStoredOnChain: false },
      { id: "aae", index: 0, task: "Commit them to the blockchain 😃", isDone: false, isDeleted: false, order: 0, edit: false, isStoredOnChain: false },
    ]
  }
});

watch(
  () => web3.state.awaitingConfirmation,
  () => {
    awaitingConfirmation.value = web3.state.awaitingConfirmation;
    if (awaitingConfirmation.value) {
      slowNetwork.value = false;
      txConfirmationTimeCountdown.value = txConfirmationTime;
      window.slowNetworkTimer = setTimeout(() => {
        slowNetwork.value = web3.state.awaitingConfirmation;
      }, txConfirmationTime * 1200);
      let timer = setInterval(() => {
        if (txConfirmationTimeCountdown.value > 0) {
          txConfirmationTimeCountdown.value--;
        } else {
          clearInterval(timer);
        }
      }, 1000);
    } else {
      setBlockchainDataHash();
      persist();
    }
  }
);

watch(() => web3.state.error, () => {
  if (web3.state.error.code) {
    handleWeb3Error();
    emit('dataChanged', dataChanged.value, false);
  }
});

const getDataFromChain = async () => {
  try {
    await web3.connectToMetamask();
    await web3.setUpEventListeners();
    let taskList = await web3.getTasks();
    connectedToWeb3.value = true;
    return taskList;
  } catch (e) {
    connectedToWeb3.value = false;
    console.log("ERROR CAUGHT:", e)
  }
}

const reorderDeletedTasks = () => {
  todos.value.sort((a, b) => a.isDeleted - b.isDeleted);
}

const addNewTodo = () => {
  if (newTodoText.value.trim().length === 0) return;
  let order = todos.value.length ? (todos.value[todos.value.length - 1].order) + 1000 : 1000;
  todos.value.push({
    id: (Math.floor(Math.random() * Math.pow(16, 8))).toString(16),
    index: 0,
    task: newTodoText.value,
    isDone: false,
    isDeleted: false,
    order: order,
    edit: false,
    isStoredOnChain: false
  });
  newTodoText.value = "";
  persist();
}

const persist = () => {
  let currentDataHash = web3.getDataHash(todos.value);
  window.localStorage.setItem('currentDataHash', currentDataHash);
  window.localStorage.setItem('todoList', JSON.stringify(todos.value));
  dataChanged.value = window.localStorage.getItem('blockChainDataHash') !== currentDataHash;
  emit('dataChanged', dataChanged.value, web3.state.txConfirmed);
  web3.state.txConfirmed = false;
}

const setBlockchainDataHash = () => {
  window.localStorage.setItem('blockChainDataHash', web3.getDataHash(todos.value));
}

const handleWeb3Error = () => {
  const errorMessages = {
    80000: "<p><strong>Web3 is not available.</strong></p><p>Install and configure the Metamask extension and connect to the Sepolia testnet.</p><p>Refresh the page when ready.</p>",
    80001: `<p>You are currently connected to <strong>${web3.state.network.name.charAt(0).toUpperCase() + web3.state.network.name.slice(1)}</strong>.</p><p>This app will interact with:<ul><li>Sepolia testnet</li></ul><p>Or, if you want to spend some real-world gas fees:</p></p><p>Sepolia testnet is available as a preset in Metamask. Follow <a target='_blank' href='https://www.coingecko.com/learn/sepolia-eth#adding-sepolia-to-metamask'>this guide</a> to enable the Sepolia network. Get free testnet ETH from <a href='https://sepolia-faucet.pk910.de/' target='_blank'>here</a>.</p><p>Refresh the page when ready.</p>`,
    80002: "<p>Your browser is Web3 enabled but doesn't seem to be configured or is unable to interact with smart contracts.</p><p>Please install the Metamask extension if possible</p><p>Make sure you have set up a wallet and enabled web3 in your settings. Connect to the Sepolia testnet.</p><p>Refresh the page when ready.</p>"
  };
  web3.state.error.message = errorMessages[web3.state.error.code] || "An unknown error occurred.";
}
</script>

<style>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
</style>