<template>
  <div>
    <p>Add/remove header/footer</p>
  </div>
</template>

<style scoped>
.top-row {
  margin-top: 1em;
}

.utilities-advanced-header-footer-convert-button {
  margin-top: 1em;
}
</style>

<script>

export default {
  name: 'TabHeaderFooter',
  components: {

  },
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
    };
  },
  methods: {
    reset() {
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
    },
  },
};
</script>
