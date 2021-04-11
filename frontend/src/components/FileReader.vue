<template>
  <b-form-file @input="loadFile" v-model="file" class="text-left" :placeholder="this.placeholderText" :accept="this.acceptExtension"/>
</template>

<script>
export default {
  props: [
    'placeholderText',
    'acceptExtension',
  ],
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
