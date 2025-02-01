<template lang="pug">
.container
  nav.navbar
    .my-1
      a.btn.btn-primary(href="/admin/categories/create")
        i.fa-solid.fa-plus.me-2
        | Додати категорію
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
            th(style="width: 11px; height: 11px")
        tbody
          tr(v-for="category in categories")
            td(style="width: 110px; height: 110px")
              .h-100.w-100.d-flex.justify-content-center.align-items-center
                img(
                  :src="VITE_NGINX_SERVER + '/images/' + category.image",
                  style="max-width: 100px; max-height: 100px"
                )
            td {{ category.name }}
            td {{ category.description }}
            td
              .btn-group
                a.btn.btn-primary
                  i.fa-solid.fa-pen-to-square
                button.btn.btn-secondary
                  i.fa-solid.fa-trash(
                    data-bs-toggle="modal",
                    data-bs-target="#deleteModal",
                    @click="handleTrashButton(category.id, category.name)"
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
        h1#deleteModalLabel.modal-title.fs-5 Видалити категорію
        button.btn-close(
          type="button",
          data-bs-dismiss="modal",
          aria-label="Close"
        )
      .modal-body
        p Ви впечені що хочете видалити категорію «{{ categoryToDelete.name }}»?
      .modal-footer
        button.btn.btn-primary(
          type="button",
          data-bs-dismiss="modal",
          @click="handelDeleteCategory(categoryToDelete.id)"
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
      handler: "loadCategoriesData",
    },
  },
  data() {
    return {
      VITE_NGINX_SERVER,
      categories: [],
      categoryToDelete: { id: "", name: "" },
      count: 0,
      offset: 0,
      limit: 12,
      pagination: {},
      widgets: {
        CategoriesCount: {
          title: "Кількість категорій",
          from: 0,
          to: 0,
        },
      },
    };
  },
  async created() {
    await this.loadCategoriesData();

    this.widgets.CategoriesCount.to = this.count;
  },
  methods: {
    async loadCategoriesData() {
      const offset = (this.$route.query.page - 1) * this.limit || 0;

      let count = 0;
      const data = await getData(VITE_API_SERVER + "/api/categories", {
        offset,
        limit: this.limit,
      });

      this.categories = data;
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
      this.categoryToDelete.id = id;
      this.categoryToDelete.name = name;
    },
    handelDeleteCategory(id) {
      fetch(VITE_API_SERVER + "/api/categories/" + id, { method: "DELETE" });
      this.loadCategoriesData();
    },
  },
};
</script>
