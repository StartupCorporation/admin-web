import { createRouter, createWebHistory } from "vue-router";

import Default from "../pages/default/index.vue";

import Callback from "../pages/callback/index.vue";
import Categories from "../pages/categories/index.vue";
import CategoriesCreate from "../pages/categories/create.vue";
import CategoriesEdit from "../pages/categories/edit.vue";
import Products from "../pages/products/index.vue";
import ProductsCreate from "../pages/products/create.vue";
import ProductsEdit from "../pages/products/edit.vue";

import NotFound from "../pages/not-found/index.vue";

const routes = [
  {
    path: "/admin",
    component: Default,
  },

  {
    path: "/admin/callback",
    component: Callback,
  },
  {
    path: "/admin/categories",
    component: Categories,
  },
  {
    path: "/admin/categories/create",
    component: CategoriesCreate,
  },
  {
    path: "/admin/categories/:id",
    component: CategoriesEdit,
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
    path: "/admin/products/:id",
    component: ProductsEdit,
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
