import { createApp } from "vue";
import App from "./TodoApp.vue";
import router from "./router";

import "./assets/styles.scss";

const app = createApp(App);

app.use(router);

app.mount("#app");
