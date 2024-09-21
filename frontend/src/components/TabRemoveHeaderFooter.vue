<template>
  <div>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readData($event)"
          placeholderText="Choose a file to convert"
          :leaveRoomForHelpIcon="true"
          ref="inputFile"
          class="top-row"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <b-collapse appear id="id" :visible="this.headerSize !== null">
          <b-list-group>
            <b-list-group-item :variant="this.headerSize === 0 ? 'danger' : 'success'" class="d-flex justify-content-between align-items-center">
              <div v-if="this.headerSize !== 0">
                Found a {{ headerSize }} byte header or footer
              </div>
              <div v-else>
                No header or footer found
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-collapse>
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <header-footer
          v-model="headerFooter"
        />
      </b-col>
    </b-row>
    <b-row class="justify-content-md-center" align-h="center">
      <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
        <b-button
          class="utilities-advanced-remove-header-footer-convert-button"
          variant="success"
          block
          :disabled="(this.headerSize === null) || (this.headerSize === 0)"
          @click="removeHeaderFooter()"
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

.utilities-advanced-remove-header-footer-convert-button {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';

import InputFile from './InputFile.vue';
import HeaderFooter from './HeaderFooter.vue';

import Util from '../util/util';
import MathUtil from '../util/Math';
import PaddingUtil from '../util/Padding';

export default {
  name: 'TabRemoveHeaderFooter',
  components: {
    InputFile,
    HeaderFooter,
  },
  data() {
    return {
      saveData: null,
      headerSize: null,
      headerFooter: 'header',
      outputFilename: null,
    };
  },
  methods: {
    reset() {
      this.saveData = null;
      this.headerSize = null;
      this.headerFooter = 'header';
      this.outputFilename = null;

      this.$refs.inputFile.reset();
    },
    readData(event) {
      this.saveData = event.arrayBuffer;
      this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;
      this.headerSize = Math.ceil(this.saveData.byteLength - MathUtil.getNextSmallestPowerOf2(this.saveData.byteLength), 0);
    },
    removeHeaderFooter() {
      const outputArrayBuffer = (this.headerFooter === 'header')
        ? PaddingUtil.removePaddingFromStart(this.saveData, this.headerSize)
        : PaddingUtil.removePaddingFromEnd(this.saveData, this.headerSize);
      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};
</script>
