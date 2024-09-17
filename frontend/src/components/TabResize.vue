<template>
  <div>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <output-filesize
          class="top-row"
          v-model="newSize"
          platform="all"
          ref="outputFilesize"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <pad-fill-byte
          id="pad-fill-byte"
          v-model="padFillByte"
          :disabled="!this.isIncreasingFileSize()"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readDataToResize($event)"
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
          class="utilities-advanced-resize-convert-button"
          variant="success"
          block
          :disabled="!this.canResizeFile() || !this.outputFilename"
          @click="resizeFile()"
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

.utilities-advanced-resize-convert-button {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';

import OutputFilesize from './OutputFilesize.vue';
import InputFile from './InputFile.vue';
import PadFillByte from './PadFillByte.vue';

import Util from '../util/util';
import SaveFilesUtil from '../util/SaveFiles';

const DEFAULT_PAD_FILL_BYTE = 0x00; // Most users won't have an opinion here, so set the default to be the simplest one (instead of 0xFF)

export default {
  name: 'TabResize',
  components: {
    OutputFilesize,
    InputFile,
    PadFillByte,
  },
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
      newSize: null,
      padFillByte: DEFAULT_PAD_FILL_BYTE,
    };
  },
  methods: {
    reset() {
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.newSize = null;
      this.padFillByte = DEFAULT_PAD_FILL_BYTE;

      this.$refs.inputFile.reset();
    },
    readDataToResize(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkResizeFile();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    isIncreasingFileSize() {
      return ((this.saveData !== null) && (this.newSize !== null) && (this.newSize > this.saveData.byteLength));
    },
    checkResizeFile() {
      if (this.saveData !== null) {
        // As long as this.newSize is not null, then we're good to go here. this.padFillByte will always be a valid value
        // We could choose to throw an error if this.newSize == null, but that would mean putting an error on the screen as soon
        // as the user selects a file (if they haven't filled in a size yet), which seems a bit aggressive. Just having the
        // Convert! button disabled is hopefully sufficient there.
      }
    },
    canResizeFile() {
      if ((this.saveData !== null) && (this.newSize !== null)) {
        try {
          this.checkResizeFile();
          return true;
        } catch (e) {
          return false;
        }
      }

      return false;
    },
    resizeFile() {
      const outputArrayBuffer = SaveFilesUtil.resizeRawSave(this.saveData, this.newSize, this.padFillByte);
      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};
</script>
