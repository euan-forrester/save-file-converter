<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="center">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="center">
            <b-col cols=12>
              <b-jumbotron :header-level="$mq | mq({ xs: 5, sm: 4, md: 4, lg: 3 })">
                <template v-slot:header>Retron 5</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readRetron5SaveData($event)"
              :errorMessage="this.errorMessage"
            />
          </div>
          <div v-else>
            <output-filename v-model="outputFilename"/>
          </div>
        </b-col>
        <b-col sm=12 md=2 lg=1 xl=1 align-self="center">
          <conversion-direction
            :horizontalLayout="['md', 'lg', 'xl']"
            :verticalLayout="['xs', 'sm']"
            :conversionDirection="this.conversionDirection"
            @change="changeConversionDirection($event)"
          />
        </b-col>
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="center">
            <b-col cols=12>
              <b-jumbotron :header-level="$mq | mq({ xs: 5, sm: 4, md: 4, lg: 3 })">
                <template v-slot:header>Emulator</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <output-filename v-model="outputFilename"/>
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="convert-button"
            variant="success"
            block
            :disabled="!this.retron5SaveData || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import path from 'path';
import { saveAs } from 'file-saver';
import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import ConversionDirection from './ConversionDirection.vue';
import Retron5SaveData from '../save-formats/Retron5';

export default {
  name: 'ConvertRetron5',
  data() {
    return {
      retron5SaveData: null,
      errorMessage: null,
      outputFilename: null,
      conversionDirection: 'convertToEmulator',
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
    changeFilenameExtension(filename, newExtension) {
      return `${path.basename(filename, path.extname(filename))}.${newExtension}`;
    },
    readRetron5SaveData(event) {
      this.errorMessage = null;
      try {
        this.retron5SaveData = Retron5SaveData.createFromRetron5Data(event.arrayBuffer);
      } catch (e) {
        this.errorMessage = e.message;
        this.retron5SaveData = null;
      }
      this.outputFilename = this.changeFilenameExtension(event.filename, 'srm');
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      try {
        this.retron5SaveData = Retron5SaveData.createFromEmulatorData(event.arrayBuffer);
      } catch (e) {
        this.errorMessage = e.message;
        this.retron5SaveData = null;
      }
      this.outputFilename = this.changeFilenameExtension(event.filename, 'sav');
    },
    convertFile() {
      const outputArrayBuffer = (this.conversionDirection === 'convertToEmulator') ? this.retron5SaveData.getRawSaveData() : this.retron5SaveData.getArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>

<style scoped>

.convert-button {
  margin-top: 10px;
}

</style>
