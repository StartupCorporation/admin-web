<template lang="pug">
.odb-widget.rounded.bg-body.p-3.h-100.vstack
  .small.muted {{ title }}
  .countup-wrap.font-monospace.fade.show.fs-1.mt-auto
    CountUp(
      start-val="0",
      :end-val="to",
      :delay="0",
      :options="options",
      :aria-valuetext="to"
    )
</template>

<script>
import CountUp from "vue-countup-v3";

export default {
  components: {
    CountUp,
  },
  props: {
    from: {
      type: Number,
      default: 0,
    },
    to: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: "",
    },
    inversiveProgress: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default: () => ({
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: ".",
      }),
    },
  },
  data() {
    return {
      isPercent: true,
      optionsPercent: {
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: ".",
        decimalPlaces: 2,
        prefix: "",
        suffix: "%",
      },
    };
  },
  computed: {
    percents() {
      let percents = this.from ? (this.to / this.from - 1) * 100 : 0;
      return percents;
    },
    amount() {
      let amount = this.to - this.from;
      return amount;
    },
    computedClasses() {
      if (this.from && !this.inversiveProgress) {
        return {
          show: this.to,
          "rotate-180 text-danger": this.percents < 0,
          "rotate-0": this.percents > 0,
        };
      } else if (this.from && this.inversiveProgress) {
        return {
          show: this.to,
          "rotate-180 text-success": this.percents < 0,
          "rotate-0 text-danger": this.percents > 0,
        };
      }
      return {
        show: this.to,
      };
    },
  },
};
</script>
