<template lang="pug">
table.table
  thead
    tr(:class="{ 'opacity-25': loading }")
      th(v-for="field in fields")
        span(v-if="field.sorted", @click="sortItems(field)")
          fa-icon.me-1(:icon="getSortIcon(field.key)")
          | {{ field.label }}
        span(v-else) {{ field.label }}
    tr
      th(:colspan="fields.length", v-if="loading")
        .progress.mx-auto.fade.show(style="height: 0.25rem")
          .progress-bar.progress-bar-striped.progress-bar-animated.w-100(
            role="progressbar",
            aria-valuenow="25",
            aria-valuemin="0",
            aria-valuemax="100"
          )
  tbody(:class="{ 'opacity-25': loading }")
    tr(v-for="item in items")
      td(v-for="field in fields")
        slot(:name="`cell(${field.key})`", :row="item")
          | {{ item[field.key] }}
.row(v-if="paginationShow")
  .col.pb-2.d-flex
    Paginator.mx-auto(
      v-if="pagination && pagination.totalPages > 1 && pagination.count > 0",
      :range="pagination.getRange()"
    )
</template>

<script>
import { Pagination } from ".././utils/pagination.js";
import Paginator from "./Paginator.vue";

export default {
  components: { Paginator },
  props: {
    fields: {
      type: Array,
      required: true,
      default: () => [],
    },
    paginationShow: {
      type: Boolean,
      default: true,
    },
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
    itemsLength: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      sortKeys: "",
      sortDirection: "",
      limit: 12,
      pagination: {},
    };
  },
  watch: {
    items(newItems) {
      if (newItems.length) {
        this.update();
      }
    },
  },
  mounted() {
    this.$emit("update:options");
  },
  methods: {
    sortItems(field) {
      this.$router.push({
        query: {
          ...this.$route.query,
          sortKeys: field.key,
          sortDirection:
            this.$route.query.sortDirection === "ASC" ? "DESC" : "ASC",
        },
      });
    },
    getSortIcon(sortKey) {
      if (!this.$route.query?.sortKeys?.includes(sortKey))
        return ["far", "arrow-up-arrow-down"];
      return [
        "far",
        this.$route.query.sortDirection === "DESC" ? "arrow-down" : "arrow-up",
      ];
    },
    update() {
      this.pagination = new Pagination({
        currentPage: parseInt(this.$route.query.page) || 1,
        count: this.itemsLength,
        limit: this.limit,
      });
    },
  },
};
</script>

<style lang="sass" scoped>
table
  thead
    tr
      th:first-child
        padding-left: 1rem
  tbody
    tr
      td:first-child
        padding-left: 1rem
</style>
