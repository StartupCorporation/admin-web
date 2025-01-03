<template lang="pug">
.container
  nav.navbar
    .my-1
      a.btn.btn-primary(
        href="/admin/products/create",
      )
        i.fa-solid.fa-plus.me-2
        | Додати продукт
  .row.g-2.mb-2
    .col(v-for="(widget, key) in widgets")
      DigitsWidget(
        :title="widget.title",
        :to="widget.to",
        :rounded="widget.rounded",
        :options="widget.options",
        :inversive-progress="widget.inversiveProgress"
      )
  .bg-body.rounded.overflow-hidden.mb-2
    .table-responsive
      table.table
        thead
          tr
            th
            th Назва
            th Опис
            th Кількість
        tbody
          tr(v-for="product in products")
            td
            td
            td
            td 

  .row(v-if="pagination && pagination.totalPages > 1 && pagination.count > 0")
    .col.pb-2.d-flex
      Paginator.mx-auto(:range="pagination.getRange()")
</template>

<script>
import getData from "../../utils/fetch.js";
import { Pagination } from "../../utils/pagination.js";
import Paginator from "../../components/Paginator.vue";
import DigitsWidget from "../../components/DigitsWidget.vue";

const { VITE_API_SERVER } = process.env;

export default {
  components: { DigitsWidget, Paginator },
  watch: {
    "$route.query": {
      handler: "loadProductsData",
    },
  },
  data() {
    return {
      product: [],
      count: 0,
      offset: 0,
      limit: 12,
      pagination: {},
      widgets: {
        activeUsers: {
          title: "Кількість продуктів",
          from: 0,
          to: 0,
        },
      },
    };
  },
  async created() {
    await this.loadProductsData();

    this.widgets.activeUsers.to = this.count;
  },
  methods: {
    async loadProductsData() {
      const offset = (this.$route.query.page - 1) * this.limit || 0;

      const {
        data: { totalCount: count, contracts },
      } = await getData(
        VITE_API_SERVER + "/admin/contracts/journalists?",
        {
          offset,
          limit: this.limit,
        },
        this.$route.path,
        { Authorization: getCookie("auth._token.local") }
      );

      this.contracts = contracts;
      this.count = count;
      this.offset = offset;

      if (this.count) {
        this.pagination = new Pagination({
          currentPage: parseInt(this.$route.query.page) || 1,
          count: this.count,
          limit: this.limit,
        });
      } else {
        this.pagination = {};
      }
    },
  },
};
</script>
