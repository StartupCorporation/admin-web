<template lang="pug">
.progress.mx-auto.fade.fixed-top.bg-body(
  style="height: 0.25rem",
  :class="{ show: showCondition }"
)
  .progress-bar.progress-bar-striped.progress-bar-animated(
    role="progressbar",
    :style="{ width: progressWidth }",
    aria-valuenow="25",
    aria-valuemin="0",
    aria-valuemax="100"
  )
</template>

<script>
export default {
  props: {
    total: {
      type: Number,
      required: true,
    },
    completed: {
      type: Number,
      required: true,
    },
  },
  computed: {
    progressWidth() {
      const total = this.total;
      const completed = this.completed;
      const value = completed / total;
      return value ? `${value * 100}%` : "10%";
    },
    showCondition() {
      return this.total != this.completed;
    },
  },
};
</script>
