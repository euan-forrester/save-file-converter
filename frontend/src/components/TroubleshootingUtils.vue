<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Emulator/Raw</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <input-file
            @load="readRawData($event)"
            :errorMessage="this.errorMessage"
            placeholderText="Choose a file to troubleshoot (*.srm)"
            acceptExtension=".srm"
            :leaveRoomForHelpIcon="false"
          />
        </b-col>
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">

          </b-row>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="retron5-convert-button"
            variant="success"
            block
            :disabled="!this.retron5SaveData || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            Tip 1: Create a test save. Compare its size with the file you're troubleshooting.
          </div>
          <div class="help">
            Tip 2: Use a hex editor to open the test save and the one you're troubleshooting. Look for any similarities or differences.
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.retron5-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}
</style>

<script>
import path from 'path';
import { saveAs } from 'file-saver';
import InputFile from './InputFile.vue';
import Retron5SaveData from '../save-formats/Retron5';

export default {
  name: 'TroubleshootingUtils',
  data() {
    return {
      rawSaveData: null,
      errorMessage: null,
      outputFilename: null,
    };
  },
  components: {
    InputFile,
  },
  methods: {
    changeFilenameExtension(filename, newExtension) {
      return `${path.basename(filename, path.extname(filename))}.${newExtension}`;
    },
    readRawSaveData(event) {
      this.errorMessage = null;
      try {
        this.retron5SaveData = Retron5SaveData.createFromRetron5Data(event.arrayBuffer);
        this.outputFilename = this.changeFilenameExtension(event.filename, 'srm');
      } catch (e) {
        this.errorMessage = e.message;
        this.retron5SaveData = null;
      }
    },
    convertFile() {
      const outputArrayBuffer = (this.conversionDirection === 'convertToEmulator') ? this.retron5SaveData.getRawSaveData() : this.retron5SaveData.getArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
