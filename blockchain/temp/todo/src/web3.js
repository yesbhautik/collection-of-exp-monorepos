import { BrowserProvider, Contract, id } from "ethers";
import { contractAddresses, contractABI } from "@/todoContractInterface";
import { reactive } from "vue";

let instance = null;

class Web3 {
  signer = null;
  provider = null;
  network = null;
  contract = null;
  allowedNetworks = ["sepolia"];

  state = reactive({
    network: {},
    awaitingConfirmation: false,
    txHash: "",
    txConfirmed: false,
    error: {},
  });

  constructor() {
    if (instance) {
      throw new Error("Only one instance allowed.");
    }
    instance = this;
  }

  connectToMetamask = async () => {
    this.state.error = {};
    if (!window.ethereum) {
      this.state.error = {
        code: 80000,
        message: "Web3 not available.",
        recoverable: false,
      };
      throw new Error(this.state.error.message);
    }

    if (this.signer) {
      console.log("REFRESHING CONNECTION.");
    }
    console.log("CONNECTING TO METAMASK");

    this.provider = new BrowserProvider(window.ethereum, "any");
    try {
      this.signer = await this.provider.getSigner();
      this.network = await this.provider.getNetwork();
    } catch (e) {
      this.state.error = {
        code: 80002,
        message: "Web3 not configured.",
        recoverable: false,
      };
      throw new Error(this.state.error.message);
    }
    this.state.network = {
      name: this.network.name,
      address: this.signer.address,
    };
    if (!this.allowedNetworks.includes(this.network.name)) {
      this.state.error = {
        code: 80001,
        message: "Network not recognised.",
        recoverable: false,
      };
    }
  };

  setUpEventListeners = async () => {
    this.provider.on("network", async () => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async (e) => {
      if (e[0] !== this.signer.getAddress()) {
        window.location.reload();
      }
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  };

  getTasks = async () => {
    this.contract = new Contract(
      contractAddresses[this.state.network.name],
      contractABI,
      this.signer
    );
    let result = await this.contract.getTasksByOwner();
    return result
      .map((task) => ({
        id: Math.floor(Math.random() * Math.pow(16, 8)).toString(16),
        index: parseInt(task.index.toString()),
        task: task.task.task,
        isDone: task.task.isDone,
        isDeleted: task.task.isDeleted,
        order: parseInt(task.task.order.toString()),
        edit: false,
        isStoredOnChain: true,
      }))
      .sort((a, b) => a.order - b.order);
  };

  getDataHash = (data) => {
    return id(JSON.stringify(data));
  };

  sendTransaction = async () => {
    let taskList = JSON.parse(window.localStorage.getItem("todoList"));
    this.state.error = {};
    this.state.txConfirmed = false;
    let txData = taskList.map((task) => [
      task.index,
      [this.signer.address, task.task, task.isDone, task.isDeleted, task.order],
    ]);
    try {
      let tx = await this.contract.updateTasks(txData);
      this.state.txHash = tx.hash;
      this.state.awaitingConfirmation = true;
      await tx.wait();
      this.state.awaitingConfirmation = false;
      this.state.txConfirmed = true;
    } catch (e) {
      this.state.error = {
        code: e.info.error.code,
        message: e.info.error.message,
        recoverable: true,
      };
    }
  };
}

const Web3Singleton = new Web3();
export default Web3Singleton;
