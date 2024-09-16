<template>
  <div>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-number
          id="input-slice-start-offset"
          class="top-row"
          labelText="Starting offset:"
          helpText="The offset in bytes from the beginning of the file to begin the slice. Can be in decimal, or hexadecimal beginning with 0x"
          @input="changeSliceStartOffset($event)"
          ref="inputNumberSliceStartOffset"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-number
          id="input-slice-length"
          labelText="Length:"
          helpText="The length of data to slice, in bytes. Can be in decimal, or hexadecimal beginning with 0x"
          @input="changeSliceLength($event)"
          ref="inputNumberSliceLength"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readDataToSlice($event)"
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
          class="utilities-advanced-slice-convert-button"
          variant="success"
          block
          :disabled="!this.canSliceFile() || !this.outputFilename"
          @click="sliceFile()"
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
  
.utilities-advanced-slice-convert-button {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';

import InputNumber from './InputNumber.vue';
import InputFile from './InputFile.vue';

import Util from '../util/util';

export default {
  name: 'TabSlice',
  components: {
    InputNumber,
    InputFile,
  },
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
      sliceStartOffset: null,
      sliceLength: null,
    };
  },
  methods: {
    reset() {
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.sliceStartOffset = null;
      this.sliceLength = null;

      this.$refs.inputFile.reset();
      this.$refs.inputNumberSliceStartOffset.reset();
      this.$refs.inputNumberSliceLength.reset();
    },
    readDataToSlice(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkSliceFile();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    changeSliceStartOffset(value) {
      this.sliceStartOffset = value;
      this.changeSliceOffsetOrLength();
    },
    changeSliceLength(value) {
      this.sliceLength = value;
      this.changeSliceOffsetOrLength();
    },
    changeSliceOffsetOrLength() {
      this.errorMessage = null;
      try {
        this.checkSliceFile();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    checkSliceFile() {
      if (this.saveData !== null) {
        if ((this.sliceStartOffset !== null) && (this.sliceStartOffset > this.saveData.byteLength)) {
          throw new Error(`Specified a starting offset of ${this.sliceStartOffset} bytes, but the file is only ${this.saveData.byteLength} bytes long`);
        }

        if ((this.sliceLength !== null) && (this.sliceLength > this.saveData.byteLength)) {
          throw new Error(`Specified a length of ${this.sliceLength} bytes, but the file is only ${this.saveData.byteLength} bytes long`);
        }

        if ((this.sliceStartOffset !== null) && (this.sliceLength !== null) && ((this.sliceStartOffset + this.sliceLength) > this.saveData.byteLength)) {
          throw new Error(`Specified a starting offset of ${this.sliceStartOffset} and a length of ${this.sliceLength} bytes, `
            + `which is a total of ${this.sliceStartOffset + this.sliceLength} bytes but the file is only ${this.saveData.byteLength} bytes long`);
        }
      }
    },
    canSliceFile() {
      if ((this.saveData !== null) && (this.sliceStartOffset !== null) && (this.sliceLength !== null)) {
        try {
          this.checkSliceFile();
          return true;
        } catch (e) {
          return false;
        }
      }

      return false;
    },
    sliceFile() {
      const outputArrayBuffer = this.saveData.slice(this.sliceStartOffset, this.sliceStartOffset + this.sliceLength);
      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};
</script>
