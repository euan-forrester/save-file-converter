<template>
  <label class="text-reader">
    <b-form-file @change="loadFile"/>
  </label>
</template>

<script>
export default {
  methods: {
    loadFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => this.$emit('load', e.target.result);
      reader.readAsArrayBuffer(file);
    },
  },
};
</script>
