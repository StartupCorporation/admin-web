<template lang="pug">
.table-responsive.odb-margin-x-reset
  .table-wrapper(
    ref="tableWrapper",
    :style="`max-height: ${maxHeight}; overflow-y: auto`"
  )
    table.table
      thead
        tr(:class="{ 'opacity-25': loading }")
          th(v-for="(item, index) in thead", :key="index") {{ item.value }}
      tbody
        tr(
          v-for="(row, rowIndex) in tbody",
          :key="rowIndex",
          :class="{ 'opacity-25': loading }"
        )
          td(v-for="(item, index) in row", :key="index")
            a(v-if="item.link", :href="item.link") {{ item.value }}
            p(v-else) {{ item.value }}
        tr(v-if="loading")
          td(:colspan="thead.length")
            .progress.mx-auto.fade.show(style="height: 0.25rem")
              .progress-bar.progress-bar-striped.progress-bar-animated.w-100(
                role="progressbar",
                aria-valuenow="25",
                aria-valuemin="0",
                aria-valuemax="100"
              )
</template>

<script>
export default {
  props: {
    thead: {
      type: Array,
      required: true,
      default: () => [],
    },
    tbody: {
      type: Array,
      required: true,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    offset: {
      type: Number,
      required: true,
      default: 0,
    },
    limit: {
      type: Number,
      required: true,
      default: 12,
    },
    maxHeight: {
      type: String,
      default: "500px",
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0,
    },
  },

  data() {
    return {
      observer: null,
    };
  },

  watch: {
    tbody() {
      this.observeLastRow();
    },
  },

  mounted() {
    this.$emit("update");
    this.observeLastRow();
  },

  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  methods: {
    observeLastRow() {
      if (this.observer) {
        this.observer.disconnect();
      }

      const options = {
        root: this.$refs.tableWrapper,
        rootMargin: "0px",
        threshold: 1.0,
      };

      this.observer = new IntersectionObserver(this.handleIntersect, options);

      this.$nextTick(() => {
        const lastRow = this.$el.querySelector("tbody tr:last-child");
        if (lastRow) {
          this.observer.observe(lastRow);
        }
      });
    },

    handleIntersect(entries) {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !this.loading &&
          this.tbody.length < this.totalItems
        ) {
          this.$emit("load-more", this.offset + this.limit);
        }
      });
    },
  },
};
</script>

<style lang="sass" scoped>
.odb-margin-x-reset
  margin-left: -1rem
  margin-right: -1rem

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
