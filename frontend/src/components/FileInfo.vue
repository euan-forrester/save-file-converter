<template>
  <b-collapse appear id="id" v-model="display">
  <b-list-group>
    <b-list-group-item class="d-flex justify-content-between align-items-center"><div>File name:</div><div>{{ fileName }}</div></b-list-group-item>
    <b-list-group-item class="d-flex justify-content-between align-items-center"><div>File size:</div><div>{{ fileSize }} bytes</div></b-list-group-item>
    <b-list-group-item class="d-flex justify-content-between align-items-center"><div>Initial padding:</div><div>{{ initialPadding }} bytes</div></b-list-group-item>
    <b-list-group-item class="d-flex justify-content-between align-items-center"><div>Remaining save size:</div><div>{{ remainingSaveSize }} bytes</div></b-list-group-item>
  </b-list-group>
  </b-collapse>
</template>

<style scoped>

</style>

<script>
import Troubleshooting from '../util/Troubleshooting';

export default {
  name: 'FileInfo',
  props: {
    fileName: null,
    fileData: null,
    id: null,
    display: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    fileSize() { return this.fileData !== null ? this.fileData.byteLength : 0; },
    initialPadding() { return this.fileData !== null ? Troubleshooting.getPadValueAndCount(this.fileData).count : 0; },
    remainingSaveSize() { return this.fileSize - this.initialPadding; },
  },
};
</script>
