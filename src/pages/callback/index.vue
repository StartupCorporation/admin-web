<template lang="pug">
.container
  nav.navbar

  .row.g-2.mb-2
    .col(v-for="(widget, key) in widgets", :key="key")
      DigitsWidget(
        :title="widget.title",
        :to="widget.to",
        :rounded="widget.rounded",
        :options="widget.options",
        :inversive-progress="widget.inversiveProgress"
      )

  .row.g-4(v-if="count")
    .col-md-4
      #callbackList.list-group
        .list-group-item(
          v-for="(callback, index) in callbacks",
          :key="callback.id",
          :class="{ active: selectedCallback && selectedCallback.id === callback.id }",
          @click="selectCallback(callback)",
          style="cursor: pointer"
        )
          .d-flex.justify-content-between.align-items-center
            span
              | {{ callback.customerName }}
              | &nbsp
              small.text-muted.ml-2 {{ getRelativeTime(callback.createdTime) }}

    .col-md-8
      .card(v-if="selectedCallback")
        .card-header
          strong Деталі запиту
        .card-body
          p
            strong Ім'я клієнта:
            | &nbsp {{ selectedCallback.customerName }}
          p
            strong Номер телефону:
            | &nbsp
            a(:href="`tel:${selectedCallback.phoneNumber}`") {{ selectedCallback.phoneNumber ? phoneNumber(selectedCallback.phoneNumber) : selectedCallback.phoneNumber }}
            | &nbsp
            small.text-danger {{ selectedCallback.messageCustomer ? "не телефонуйте мені" : "" }}
          p
            strong Коментар:
            | &nbsp
            span
              | {{ selectedCallback.comment }}
          p
            strong Дата запиту:
            | &nbsp {{ formatDate(selectedCallback.createdTime) }}
            | &nbsp
            small.text-muted ({{ getRelativeTime(selectedCallback.createdTime) }})
          .text-center
            button.btn.btn-primary(@click="handelDelete(selectedCallback.id)") Питання вирішено
      .alert.alert-info(v-else)
        | Виберіть запит для перегляду деталей
</template>

<script>
import getData from "../../utils/fetch.js";
import { Pagination } from "../../utils/pagination.js";
import Paginator from "../../components/Paginator.vue";
import DigitsWidget from "../../components/DigitsWidget.vue";
import dayjs from "../../utils/dayjs.js";
import { phoneNumber } from "../../utils/phone.js";

const { VITE_API_SERVER } = process.env;

export default {
  components: { DigitsWidget, Paginator },
  watch: {
    "$route.query": {
      handler: "loadCallbackData",
    },
    count(newVal) {
      this.widgets.CallbacksCount.to = newVal;
    },
  },
  data() {
    return {
      callbacks: [],
      count: 0,
      offset: 0,
      limit: 12,
      pagination: {},
      widgets: {
        CallbacksCount: {
          title: "Кількість",
          from: 0,
          to: 0,
          rounded: true,
          options: {},
          inversiveProgress: false,
        },
      },
      selectedCallback: null,
    };
  },
  async created() {
    await this.loadCallbackData();
  },
  methods: {
    async loadCallbackData() {
      const offset = (this.$route.query.page - 1) * this.limit || 0;

      let count = 0;
      const data = await getData(VITE_API_SERVER + "/api/callback-requests", {
        offset,
        limit: this.limit,
      });

      this.callbacks = data;
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
    async handelDelete(id) {
      await fetch(VITE_API_SERVER + "/api/callback-requests/" + id, {
        method: "DELETE",
      });
      this.selectedCallback = null;
      this.loadCallbackData();
    },
    getRelativeTime(date) {
      return dayjs(date).fromNow();
    },
    formatDate(date) {
      return dayjs(date).format("DD.MM.YYYY HH:mm");
    },
    phoneNumber,
    selectCallback(callback) {
      if (this.selectedCallback && this.selectedCallback.id === callback.id) {
        this.selectedCallback = null;
      } else {
        this.selectedCallback = callback;
      }
    },
  },
};
</script>
