<template>
  <v-container>
    <v-layout>
      <template v-for="preset in colorPresets">
        <v-flex
          xs4
          class="color-group"
          :key="preset.index"
          @click="nowIndex = preset.index"
          :class="{ selected: nowIndex == preset.index }"
        >
          <div class="color-block" :style="{ backgroundColor: preset.colors[0] }"></div>
          <div class="color-block" :style="{ backgroundColor: preset.colors[1] }"></div>
          <div class="color-block" :style="{ backgroundColor: preset.colors[2] }"></div>
        </v-flex>
      </template>
    </v-layout>
  </v-container>
</template>
<style>
.color-group {
  cursor: pointer;
  opacity: 0.5;
  transition-duration: 0.5s;
  transition-property: all;
}
.selected {
  opacity: 1;
}
.selected::after {
    content: '√';
    vertical-align: middle;
    color: #aaa;
    font-size: smaller;
    position: absolute;
    height: 20px;
    line-height: 20px;
    padding-left: 5px;
}
.color-block {
  display: inline-block;
  width: 20px;
  height: 20px;
}
</style>

<script>
import ColorPresets from '../../constants/color';
export default {
  props: ["initial"],
  data() {
    return {
      colorPresets: ColorPresets,
      nowIndex: 0
    };
  },
  watch: {
      nowIndex() {
          this.$emit('change', this.nowIndex);
      }
  },
  mounted() {
      this.nowIndex = this.initial;
  }
};
</script>
