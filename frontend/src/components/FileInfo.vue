<template>
  <b-collapse appear id="id" :value="display">
  <b-list-group>
    <b-list-group-item :variant="fileNameVariant" class="d-flex justify-content-between align-items-center">
      <div>File name:</div><div>{{ fileName }}</div>
    </b-list-group-item>
    <b-list-group-item :variant="fileSizeVariant" class="d-flex justify-content-between align-items-center">
      <div>File size:</div><div>{{ fileSize }} bytes</div>
    </b-list-group-item>
    <b-list-group-item :variant="initialPaddingVariant" class="d-flex justify-content-between align-items-center">
      <div>Initial padding:</div><div>{{ initialPadding }} bytes</div>
    </b-list-group-item>
    <b-list-group-item :variant="remainingSaveSizeVariant" class="d-flex justify-content-between align-items-center">
      <div>Remaining save size:</div><div>{{ remainingSaveSize }} bytes</div>
    </b-list-group-item>
  </b-list-group>
  </b-collapse>
</template>

<style scoped>

</style>

<script>
import PaddingUtil from '../util/Padding';

export default {
  name: 'FileInfo',
  props: {
    fileName: null,
    fileData: null,
    otherFileName: null,
    otherFileData: null,
    fileAttributeEqualVariant: null,
    fileAttributeNotEqualVariant: null,
    id: null,
    display: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    fileSize() { return this.getFileSize(this.fileData); },
    initialPadding() { return this.getInitialPadding(this.fileData); },
    remainingSaveSize() { return this.getRemainingSaveSize(this.fileData); },
    fileNameVariant() {
      if (!this.fileName || !this.otherFileName) {
        return null;
      }

      if (this.fileName === this.otherFileName) {
        return this.fileAttributeEqualVariant;
      }

      return this.fileAttributeNotEqualVariant;
    },
    fileSizeVariant() { return this.getVariantForNumericalValue(this.getFileSize); },
    initialPaddingVariant() { return this.getVariantForNumericalValue(this.getInitialPadding); },
    remainingSaveSizeVariant() { return this.getVariantForNumericalValue(this.getRemainingSaveSize); },
  },
  methods: {
    getFileSize(fileData) { return fileData ? fileData.byteLength : 0; },
    getInitialPadding(fileData) { return fileData ? PaddingUtil.getPadValueAndCount(fileData).count : 0; },
    getRemainingSaveSize(fileData) { return this.getFileSize(fileData) - this.getInitialPadding(fileData); },
    getVariantForNumericalValue(getter) {
      if (!this.fileData || !this.otherFileData) {
        return null;
      }

      if (getter(this.fileData) === getter(this.otherFileData)) {
        return this.fileAttributeEqualVariant;
      }

      return this.fileAttributeNotEqualVariant;
    },
  },
};
</script>
