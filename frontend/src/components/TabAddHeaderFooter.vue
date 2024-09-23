<template>
  <div>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readExampleData($event)"
          placeholderText="Choose an example file"
          :leaveRoomForHelpIcon="true"
          help-text="Choose an example file from which to copy a header or footer. A header is extra information at the start of a file, and a footer is extra information at the end"
          ref="inputFileExample"
          id="inputFileExample"
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
                Found a {{ headerSize }} byte potential header or footer
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
          first-word="Copy"
          id="headerFooterAdd"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readDestinationData($event)"
          placeholderText="Choose a file to convert"
          help-text="Choose a file to which to add the header or footer from the example file above"
          :leaveRoomForHelpIcon="true"
          ref="inputFileDestination"
          id="inputFileDestination"
        />
      </b-col>
    </b-row>
    <b-row class="justify-content-md-center" align-h="center">
      <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
        <b-button
          class="utilities-advanced-add-header-footer-convert-button"
          variant="success"
          block
          :disabled="(this.headerSize === null) || (this.headerSize === 0) || (this.destinationSaveData === null)"
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

.utilities-advanced-add-header-footer-convert-button {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';

import InputFile from './InputFile.vue';
import HeaderFooter from './HeaderFooter.vue';

import Util from '../util/util';
import MathUtil from '../util/Math';

export default {
  name: 'TabAddHeaderFooter',
  components: {
    InputFile,
    HeaderFooter,
  },
  data() {
    return {
      exampleSaveData: null,
      destinationSaveData: null,
      headerSize: null,
      headerFooter: 'header',
      outputFilename: null,
    };
  },
  methods: {
    reset() {
      this.exampleSaveData = null;
      this.destinationSaveData = null;
      this.headerSize = null;
      this.headerFooter = 'header';
      this.outputFilename = null;

      this.$refs.inputFileExample.reset();
      this.$refs.inputFileDestination.reset();
    },
    readExampleData(event) {
      this.exampleSaveData = event.arrayBuffer;
      this.headerSize = Math.max(this.exampleSaveData.byteLength - MathUtil.getNextSmallestPowerOf2(this.exampleSaveData.byteLength), 0);
    },
    readDestinationData(event) {
      this.destinationSaveData = event.arrayBuffer;
      this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;
    },
    removeHeaderFooter() {
      const outputArrayBuffer = (this.headerFooter === 'header')
        ? Util.copyHeaderFromArrayBuffer(this.exampleSaveData, this.headerSize, this.destinationSaveData)
        : Util.copyFooterFromArrayBuffer(this.exampleSaveData, this.headerSize, this.destinationSaveData);

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};
</script>
