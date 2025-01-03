<template lang="pug">
nav.py-3(aria-label="breadcrumb", style="--bs-breadcrumb-divider: '→'")
  ol.breadcrumb.mb-0(
    itemscope="",
    itemtype="https://schema.org/BreadcrumbList"
  )
    li.breadcrumb-item(
      v-for="(item, index) in linkedItems",
      itemprop="itemListElement",
      itemscope="",
      itemtype="https://schema.org/ListItem"
    )
      fa-icon(
        v-if="item.icon",
        :icon="['far', item.icon]",
        style="margin-right: 0.375rem"
      )
      a(
        v-if="item.link",
        itemscope="",
        itemtype="https://schema.org/WebPage",
        itemprop="item",
        :itemid="item.link",
        :href="item.link"
      ) 
        span(itemprop="name") {{ item.name }}
      a(
        v-if="item.to",
        itemscope="",
        itemtype="https://schema.org/WebPage",
        itemprop="item",
        :itemid="item.to",
        :href="item.to"
      ) 
        span(itemprop="name") {{ item.name }}
      meta(itemprop="position", :content="index + 1")
    li.breadcrumb-item.active(
      aria-current="page",
      itemprop="itemListElement",
      itemscope="",
      itemtype="https://schema.org/ListItem"
    ) 
      span(itemprop="name") {{ activeItem.name }}
      meta(itemprop="position", :content="linkedItems.length + 1")
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
      validator(values) {
        // eslint-disable-next-line no-prototype-builtins
        return values.every((val) => val.hasOwnProperty("name"));
      },
    },
  },
  computed: {
    linkedItems() {
      if (this.items.length === 1) return [];

      return this.items.slice(0, this.items.length - 1);
    },
    activeItem() {
      return this.items[this.items.length - 1];
    },
  },
};
</script>

<style lang="sass" scoped>
.breadcrumb
  .breadcrumb-item
    padding: 0.25rem
</style>
