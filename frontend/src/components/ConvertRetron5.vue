<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Retron 5</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <input-file
              @load="readRetron5SaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.sav)"
              acceptExtension=".sav"
              :leaveRoomForHelpIcon="false"
            />
          </div>
          <div v-else>
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
          </div>
        </b-col>
        <b-col sm=12 md=2 lg=2 xl=2 align-self="start">
          <conversion-direction
            :horizontalLayout="['md', 'lg', 'xl']"
            :verticalLayout="['xs', 'sm']"
            :conversionDirection="this.conversionDirection"
            @change="changeConversionDirection($event)"
          />
        </b-col>
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Emulator/Raw</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
          </div>
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
            Help: how do I&nbsp;<b-link href="https://projectpokemon.org/home/tutorials/save-editing/managing-gb-gbc-saves/using-the-retron-5-r53/">copy files to and from my Retron 5</b-link>?
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
import { saveAs } from 'file-saver';
import Util from '../util/util';
import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import ConversionDirection from './ConversionDirection.vue';
import Retron5SaveData from '../save-formats/Retron5/Retron5';

export default {
  name: 'ConvertRetron5',
  data() {
    return {
      retron5SaveData: null,
      errorMessage: null,
      outputFilename: null,
      conversionDirection: 'convertToRaw',
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.retron5SaveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
    },
    readRetron5SaveData(event) {
      this.errorMessage = null;
      try {
        this.retron5SaveData = Retron5SaveData.createFromRetron5Data(event.arrayBuffer);
        this.outputFilename = Util.changeFilenameExtension(event.filename, 'srm');
      } catch (e) {
        this.errorMessage = e.message;
        this.retron5SaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      try {
        this.retron5SaveData = Retron5SaveData.createFromEmulatorData(event.arrayBuffer);
        this.outputFilename = Util.changeFilenameExtension(event.filename, 'sav');
      } catch (e) {
        this.errorMessage = e.message;
        this.retron5SaveData = null;
      }
    },
    convertFile() {
      const outputArrayBuffer = (this.conversionDirection === 'convertToRaw') ? this.retron5SaveData.getRawArrayBuffer() : this.retron5SaveData.getRetron5ArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
