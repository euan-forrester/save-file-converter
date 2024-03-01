<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Erase save</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <input-file
            @load="readSaveData($event)"
            :errorMessage="this.errorMessage"
            placeholderText="Choose a file to convert"
            :leaveRoomForHelpIcon="false"
          />
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="utilities-erase-save-convert-button"
            variant="success"
            block
            :disabled="!this.saveData || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
      <hr/>
      <b-row>
        <b-col>
          <div class="help">
            Instructions:
          </div>
          <b-row class="justify-content-md-left, help" align-h="center">
            <b-col sm=12 md=6>
              <div class="help, text-left">
                <ol>
                  <li>Use a cartridge reader to copy the save from the cartridge to your computer</li>
                  <li>Make a backup copy of the save if you wish</li>
                  <li>Convert the save using this tool</li>
                  <li>Use the cartridge reader to copy the new save to the cartridge</li>
                </ol>
              </div>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.utilities-erase-save-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';
import SaveFilesUtil from '../util/SaveFiles';
import Util from '../util/util';
import InputFile from './InputFile.vue';

export default {
  name: 'EraseSave',
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
    };
  },
  components: {
    InputFile,
  },
  methods: {
    readSaveData(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = Util.getFilename(event.filename);
      } catch (e) {
        this.errorMessage = e.message;
        this.saveData = null;
      }
    },
    convertFile() {
      const outputArrayBuffer = SaveFilesUtil.getEraseCartridgeSave(this.saveData);

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
