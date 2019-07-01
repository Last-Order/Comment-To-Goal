<template>
  <v-flex>
    <span class="result-name">{{ name }} {{ now }} / {{ amount }} ({{ preciseNowValue }}%)</span>
    <v-progress-linear color="info" height="10" :value="nowValue"></v-progress-linear>
  </v-flex>
</template>
<style>
.result-name {
  font-size: smaller;
  color: #aaa;
}
</style>

<script>
export default {
  props: ["amount", "name", "now"],
  computed: {
    nowValue() {
      if (!this.amount || !this.now) {
        return 0;
      }
      return Math.min(100, Math.round((this.now / this.amount) * 100));
    },
    preciseNowValue() {
      if (!this.amount || !this.now) {
        return 0;
      }
      return (this.now / this.amount * 100).toFixed(2);
    }
  }
};
</script>
