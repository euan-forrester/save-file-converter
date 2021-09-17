<template>
  <b-collapse appear v-model="display">
    <b-form-select
      v-bind:value="value"
      v-on:change="$emit('change', $event)"
      :options="options"
      :select-size="numFilesVisible"
    />
  </b-collapse>
</template>

<style scoped>

</style>

<script>

export default {
  name: 'FileList',
  props: {
    files: {
      type: Array,
      default() {
        return [];
      },
    },
    maxFilesVisible: {
      type: Number,
      default: 4,
    },
    minFilesVisible: {
      type: Number,
      default: 2,
    },
    display: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Number,
      default: null,
    },
  },
  computed: {
    options() {
      return this.files.map((f, i) => ({ value: i, text: f.description }));
    },
    numFilesVisible() {
      return Math.max(Math.min(this.files.length, this.maxFilesVisible), this.minFilesVisible);
    },
  },
};
</script>
