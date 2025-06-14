<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Erase save using Retron 5</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <input-file
            @load="readRetron5SaveData($event)"
            :errorMessage="this.errorMessage"
            placeholderText="Choose a file to convert (*.sav)"
            acceptExtension=".sav"
            :leaveRoomForHelpIcon="false"
          />
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="retron5-erase-save-convert-button"
            variant="success"
            block
            :disabled="!this.retron5SaveData || !outputFilename"
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
                  <li>Use the Retron 5 to copy the save from the cartridge to an SD card</li>
                  <li>Make a backup copy of the save from the SD card if you wish</li>
                  <li>Convert the save from the SD card using this tool</li>
                  <li>Overwrite the save on the SD card with the new one you just created</li>
                  <li>Use the Retron 5 to copy the new save from the SD card to the cartridge</li>
                </ol>
              </div>
            </b-col>
          </b-row>
          <div class="help">
            Help: how do I&nbsp;<b-link href="https://projectpokemon.org/home/tutorials/save-editing/managing-gb-gbc-saves/using-the-retron-5-r53/">copy files to and from my Retron 5</b-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.retron5-erase-save-convert-button {
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
import Retron5SaveData from '../save-formats/Retron5/Retron5';

export default {
  name: 'Retron5EraseSave',
  data() {
    return {
      retron5SaveData: null,
      errorMessage: null,
      outputFilename: null,
    };
  },
  components: {
    InputFile,
  },
  methods: {
    readRetron5SaveData(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.retron5SaveData = Retron5SaveData.createFromRetron5Data(event.arrayBuffer);
        this.outputFilename = Util.getFilename(event.filename);
      } catch (e) {
        this.errorMessage = e.message;
        this.retron5SaveData = null;
      }
    },
    convertFile() {
      const outputRawSave = SaveFilesUtil.getEraseCartridgeSave(this.retron5SaveData.getRawArrayBuffer());

      const outputArrayBuffer = Retron5SaveData.createFromEmulatorData(outputRawSave).getRetron5ArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
