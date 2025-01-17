import { createRouter, createWebHistory } from "vue-router";

import Default from "../pages/default/index.vue";

import Products from "../pages/products/index.vue";
import ProductsCreate from "../pages/products/create.vue";

import NotFound from "../pages/not-found/index.vue";

const routes = [
  {
    path: "/admin",
    component: Default,
  },

  {
    path: "/admin/products",
    component: Products,
  },
  {
    path: "/admin/products/create",
    component: ProductsCreate,
  },

  {
    path: "/:catchAll(.*)",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
