<template>
  <label class="text-reader">
    <b-form-file @input="loadFile" v-model="file"/>
  </label>
</template>

<script>
export default {
  data() {
    return {
      file: null,
    };
  },
  methods: {
    loadFile() {
      const reader = new FileReader();

      reader.onload = (e) => this.$emit('load', { filename: this.file.name, arrayBuffer: e.target.result });
      reader.readAsArrayBuffer(this.file);
    },
  },
};
</script>
