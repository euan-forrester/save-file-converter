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
          <input-file
            @load="readRetron5SaveData($event)"
            :errorMessage="this.errorMessage"
          />
        </b-col>
        <b-col sm=12 md=1 align-self="center">
          <conversion-direction
            :horizontalLayout="['md', 'lg', 'xl']"
            :verticalLayout="['xs', 'sm']"
            :conversionDirection="this.conversionDirection"
            @change="conversionDirection=$event"
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
          <output-filename v-model="outputFilenameEmulator"/>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center">
        <b-col sm=4 md=4 lg=2 align-self="center">
          <b-button
            variant="success"
            block
            :disabled="!this.retron5SaveData || !outputFilenameEmulator"
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
      errorMessage: null,
      retron5SaveData: null,
      outputFilenameEmulator: '',
      conversionDirection: 'convertToEmulator',
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
  },
  methods: {
    readRetron5SaveData(event) {
      try {
        this.retron5SaveData = new Retron5SaveData(event.arrayBuffer);
      } catch (e) {
        this.errorMessage = e.message;
        this.retron5SaveData = null;
      }
      this.outputFilenameEmulator = `${path.basename(event.filename, path.extname(event.filename))}.srm`;
    },
    convertFile() {
      const rawSaveDataArrayBuffer = this.retron5SaveData.getRawSaveData();

      const rawSaveDataBlob = new Blob([rawSaveDataArrayBuffer], { type: 'application/octet-stream' });

      saveAs(rawSaveDataBlob, this.outputFilenameEmulator); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>

<style scoped>

</style>
