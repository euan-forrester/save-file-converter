<template>
  <b-collapse appear id="id" :visible="display">
  <b-list-group>
    <b-list-group-item :variant="this.variant" class="d-flex justify-content-between align-items-center">
      <div>File size:</div><div>{{ fileSize }} bytes</div>
    </b-list-group-item>
  </b-list-group>
  </b-collapse>
</template>

<style scoped>

</style>

<script>

export default {
  name: 'FileSize',
  props: {
    fileData: null,
    variant: null,
    id: null,
    display: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    fileSize() { return this.fileData ? this.fileData.byteLength : 0; },
  },
};
</script>
