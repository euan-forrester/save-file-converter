<template>
  <div>
    <b-container>
      <b-tabs v-model="tabIndex" content-class="mt-3" justified>
        <b-tab :title="'Endian\xa0swap'">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=6 align-self="center">
              <endianness-word-size
                class="top-row"
                v-model="endianWordSize"
                @input="changeEndianWordSize($event)"
              />
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=6 align-self="center">
              <input-file
                @load="readDataToEndianSwap($event)"
                :errorMessage="this.errorMessage"
                placeholderText="Choose a file to convert"
                :leaveRoomForHelpIcon="false"
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
        </b-tab>

        <b-tab title="Compression"><p>Compression</p></b-tab>
        <b-tab :title="'Byte\xa0expansion'"><p>Byte&nbsp;expansion</p></b-tab>
        <b-tab title="Slice"><p>Slice</p></b-tab>
        <b-tab title="Resize"><p>Resize</p></b-tab>
        <b-tab title="Header/footer"><p>Add/remove header/footer</p></b-tab>

      </b-tabs>

    </b-container>
  </div>
</template>

<style scoped>

.top-row {
  margin-top: 1em;
}

/* Separate class for each different button to enable tracking in google tag manager */
.utilities-advanced-endian-swap-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';
import Util from '../util/util';
import EndianUtil from '../util/Endian';
import InputFile from './InputFile.vue';
import EndiannessWordSize from './EndiannessWordSize.vue';

export default {
  name: 'AdvancedUtils',
  components: {
    InputFile,
    EndiannessWordSize,
  },
  props: {
    initialTab: {
      type: String,
      default: 'endian-swap',
    },
  },
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
      endianWordSize: null,
      tabIndex: 0,
    };
  },
  beforeMount() {
    // Need to keep these in sync with the template above. Is there a way to get these programmatically?
    const possibleTabNames = [
      'endian-swap',
      'compression',
      'byte-expansion',
      'slice',
      'resize',
      'header-footer',
    ];

    const initialTabIndex = possibleTabNames.indexOf(this.initialTab);

    this.tabIndex = (initialTabIndex >= 0) ? initialTabIndex : 0;
  },
  watch: {
    tabIndex() {
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.endianWordSize = null;
    },
  },
  methods: {
    readDataToEndianSwap(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkEndianWordSize();
      } catch (e) {
        this.errorMessage = e.message;
        this.saveData = null;
        this.outputFilename = null;
      }
    },
    changeEndianWordSize() {
      this.checkEndianWordSize();
    },
    checkEndianWordSize() {
      if ((this.saveData !== null) && (this.endianWordSize !== null) && ((this.saveData.byteLength % this.endianWordSize) !== 0)) {
        this.errorMessage = `File size must be a multiple of ${this.endianWordSize}. However, file size is ${this.saveData.byteLength} bytes.`;
      }
    },
    canEndianSwap() {
      return ((this.saveData !== null) && (this.endianWordSize !== null) && ((this.saveData.byteLength % this.endianWordSize) === 0));
    },
    endianSwapData() {
      const outputArrayBuffer = EndianUtil.swap(this.saveData, this.endianWordSize);

      this.sendArrayBuffer(outputArrayBuffer, this.outputFilename);
    },
    sendArrayBuffer(outputArrayBuffer, outputFilename) {
      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
