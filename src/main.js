import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router.js";
import network from "./plugins/network.js";
import abortController from "./plugins/abort-controller.js";

import "./scss/styles.sass";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap";

const app = createApp(App);

app.use(network, router);
app.use(abortController);

app.use(router);
app.mount("#app");
