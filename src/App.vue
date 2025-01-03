<template lang="pug">
.container-fluid
  Header
router-view
</template>

<script>
import Header from "/src/components/Header.vue";

export default {
  components: { Header },
};
</script>
