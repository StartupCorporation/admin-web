<template lang="pug">
nav(aria-label="Навігація сторінкою")
  ul.pagination
    li.page-item(
      v-for="item in range",
      :class="{ active: item.isCurrent, disabled: item.isEllipsis || item.isDisabled, 'd-none d-sm-inline': item.isPrevious || item.isNext }",
      :key="(item.page && item.label) || item.page || item.label"
    )
      button.page-link(@click.prevent="clickAction(item)") 
        i.fa-solid.fa-arrow-left(v-if="item.isPrevious", aria-label="Previous page")
        i.fa-solid.fa-arrow-right( v-else-if="item.isNext", aria-label="Next page")
        i.fa-solid.fa-ellipsis( v-else-if="item.isEllipsis", aria-label="Other pages")
        span(v-else) {{ item.page }}
</template>

<script>
export default {
  props: {
    range: { type: Array, required: true },
  },
  methods: {
    async clickAction(item) {
      if (!item.isDisabled && item.page) {
        const newQuery = { ...this.$route.query };

        if (item.page === 1) {
          delete newQuery.page;
        } else {
          newQuery.page = item.page;
        }

        await this.$router.push({ query: newQuery });
        this.$emit("page-change", item.page);
      }
    },
  },
};
</script>

<style lang="sass" scoped>
$border-radius: 0.375rem

@media (max-width: 576px)
  .page-item:nth-of-type(2)
    .page-link
      border-top-left-radius: $border-radius
      border-bottom-left-radius: $border-radius

  .page-item:nth-last-of-type(2)
    .page-link
      border-top-right-radius: $border-radius
      border-bottom-right-radius: $border-radius

.page-item
  .page-link
    transition: background-color 0.5s ease-out

.page-item.active
  z-index: 10
  transform: scale(1.1)
  .page-link
    border-radius: $border-radius

.disabled
  .page-link
    background-color: transparent
    border-color: var(--bs-pagination-border-color)
</style>
