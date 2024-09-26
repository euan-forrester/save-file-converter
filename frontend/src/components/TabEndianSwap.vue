<template>
  <div>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <endianness-word-size
          id="endianness-word-size"
          class="top-row"
          v-model="endianWordSize"
          @input="changeEndianWordSize($event)"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readDataToEndianSwap($event)"
          :errorMessage="this.errorMessage"
          placeholderText="Choose a file to convert"
          :leaveRoomForHelpIcon="true"
          ref="inputFile"
        />
      </b-col>
    </b-row>
    <b-row class="justify-content-md-center" align-h="center">
      <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
        <b-button
          class="utilities-advanced-endian-swap-convert-button"
          variant="success"
          block
          :disabled="!this.canEndianSwap() || !this.outputFilename"
          @click="endianSwapData()"
        >
        Convert!
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<style scoped>
.top-row {
  margin-top: 1em;
}

.utilities-advanced-endian-swap-convert-button {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';

import EndiannessWordSize from './EndiannessWordSize.vue';
import InputFile from './InputFile.vue';

import Util from '../util/util';

import EndianUtil from '../util/Endian';

export default {
  name: 'TabEndianSwap',
  components: {
    EndiannessWordSize,
    InputFile,
  },
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
      endianWordSize: null,
    };
  },
  methods: {
    reset() {
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.endianWordSize = null;

      this.$refs.inputFile.reset();
    },
    readDataToEndianSwap(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkEndianWordSize();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    changeEndianWordSize() {
      this.errorMessage = null;
      try {
        this.checkEndianWordSize();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    checkEndianWordSize() {
      if ((this.saveData !== null) && (this.endianWordSize !== null) && ((this.saveData.byteLength % this.endianWordSize) !== 0)) {
        throw new Error(`File size must be a multiple of ${this.endianWordSize}. However, file size is ${this.saveData.byteLength} bytes.`);
      }
    },
    canEndianSwap() {
      return ((this.saveData !== null) && (this.endianWordSize !== null) && ((this.saveData.byteLength % this.endianWordSize) === 0));
    },
    endianSwapData() {
      const outputArrayBuffer = EndianUtil.swap(this.saveData, this.endianWordSize);
      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};
</script>
