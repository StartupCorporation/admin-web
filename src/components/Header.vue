<template lang="pug">
nav.navbar.navbar-expand.bg-body
  .fader
  .fader
  .navbar-collapse.justify-content-start.overflow-auto.no-scroll
    a.navbar-brand(href="/") 🏠
    ul.navbar-nav
      li.nav-item(v-for="item in navItems", :key="item.text")
        a.nav-link(
          :class="{ active: isActive(item.href) }",
          aria-current="page",
          :href="item.href"
        ) {{ item.text }}

ProgressBar(:total="totalRequests", :completed="completedRequests")
</template>

<script>
import ProgressBar from "./Progress.vue";

export default {
  components: { ProgressBar },
  data() {
    return {
      navItems: [
        {
          text: "Зворотній зв'язок",
          href: "/admin/callback",
        },
        {
          text: "Категорії",
          href: "/admin/categories",
        },
        {
          text: "Продукти",
          href: "/admin/products",
        },
      ],
    };
  },
  computed: {
    completedRequests() {
      return this.$networkStatus.completedRequests;
    },
    totalRequests() {
      return this.$networkStatus.totalRequests;
    },
  },
  methods: {
    isActive(route) {
      return this.$route.path === route;
    },
  },
};
</script>

<style lang="sass" scoped>
.navbar
  margin: 0 -0.75rem

.no-scroll
  padding-left: 2.75rem
  padding-right: 2.75rem
  -ms-overflow-style: none
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none

a.nav-link
  white-space: nowrap

.fader
  background: linear-gradient(to right, var(--bs-body-bg) 20%, #FFFFFF00)
  position: absolute
  height: 100%
  width: 2.75rem
  pointer-events: none
  + .fader
    right: 0
    transform: rotate(180deg)
</style>
