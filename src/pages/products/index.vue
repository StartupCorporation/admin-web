<template lang="pug">
.container
  nav.navbar
    .my-1
      a.btn.btn-primary(href="/admin/products/create")
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
            th Назва
            th Опис
            th Ціна, грн
            th Кількість на складі
            th Категорія
            th(style="width: 11px; height: 11px")
        tbody
          tr(v-for="product in products")
            td {{ product.name }}
            td {{ product.description }}
            td {{ product.price }}
            td {{ product.stockQuantity }}
            td {{ product.category }}
            td
              .btn-group
                a.btn.btn-primary(:href="'/admin/products/' + product.id")
                  i.fa-solid.fa-pen-to-square
                button.btn.btn-secondary
                  i.fa-solid.fa-trash(
                    data-bs-toggle="modal",
                    data-bs-target="#deleteModal",
                    @click="handleTrashButton(product.id, product.name)"
                  )

  .row(v-if="pagination && pagination.totalPages > 1 && pagination.count > 0")
    .col.pb-2.d-flex
      Paginator.mx-auto(:range="pagination.getRange()")

<!-- Modal -->
#deleteModal.modal.fade(
  data-bs-backdrop="static",
  data-bs-keyboard="false",
  tabindex="-1",
  aria-labelledby="deleteModalLabel",
  aria-hidden="true"
)
  .modal-dialog
    .modal-content
      .modal-header
        h1#deleteModalLabel.modal-title.fs-5 Видалити продукт
        button.btn-close(
          type="button",
          data-bs-dismiss="modal",
          aria-label="Close"
        )
      .modal-body
        p Ви впечені що хочете видалити продукт «{{ productToDelete.name }}»?
      .modal-footer
        button.btn.btn-primary(
          type="button",
          data-bs-dismiss="modal",
          @click="handelDeleteProduct(productToDelete.id)"
        ) Видалити
</template>

<script>
import getData from "../../utils/fetch.js";
import { Pagination } from "../../utils/pagination.js";
import Paginator from "../../components/Paginator.vue";
import DigitsWidget from "../../components/DigitsWidget.vue";

const { VITE_API_SERVER, VITE_NGINX_SERVER } = process.env;

export default {
  components: { DigitsWidget, Paginator },
  watch: {
    "$route.query": {
      handler: "loadProductsData",
    },
  },
  data() {
    return {
      VITE_NGINX_SERVER,
      products: [],
      productToDelete: { id: "", name: "" },
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

      let count = 0;
      const data = await getData(VITE_API_SERVER + "/api/products", {
        offset,
        limit: this.limit,
      });

      this.products = data;
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
    handleTrashButton(id, name) {
      this.productToDelete.id = id;
      this.productToDelete.name = name;
    },
    handelDeleteProduct(id) {
      fetch(VITE_API_SERVER + "/api/products/" + id, { method: "DELETE" });
      this.loadProductsData();
    },
  },
};
</script>
