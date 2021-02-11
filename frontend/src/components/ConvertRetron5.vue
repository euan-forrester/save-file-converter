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
          <b-row no-gutters align-h="center" align-v="center">
            <b-col cols=12>
              <file-reader @load="readRetron5SaveData($event)"></file-reader>
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="center">
            <b-col cols=12>
              <b-alert variant="danger" :show="this.errorMessage !== null">
                {{this.errorMessage}}
              </b-alert>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm=12 md=1 align-self="center">
          <mq-layout mq="md+">
            <font-awesome-icon icon="arrow-circle-right" size="3x"/>
          </mq-layout>
          <mq-layout :mq="['xs', 'sm']">
            <font-awesome-icon icon="arrow-circle-down" size="3x"/>
          </mq-layout>
        </b-col>
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="center">
            <b-col cols=12>
              <b-jumbotron :header-level="$mq | mq({ xs: 5, sm: 4, md: 4, lg: 3 })">
                <template v-slot:header>Emulator</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="center">
            <b-col cols=12>
              <input v-model="outputFilenameEmulator" placeholder="output-filename.srm">
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center">
        <b-col sm=4 md=4 lg=2 align-self="center">
          <b-button
            variant="success"
            block
            :disabled="!this.retron5SaveData"
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
import { saveAs } from 'file-saver';
import FileReader from './FileReader.vue';
import Retron5SaveData from '../save-formats/Retron5';

export default {
  name: 'ConvertRetron5',
  data() {
    return {
      errorMessage: null,
      retron5SaveData: null,
      outputFilenameEmulator: '',
    };
  },
  components: {
    FileReader,
  },
  methods: {
    readRetron5SaveData(arrayBuffer) {
      try {
        this.retron5SaveData = new Retron5SaveData(arrayBuffer);
      } catch (e) {
        this.errorMessage = e.message;
        this.retron5SaveData = null;
      }
    },
    convertFile() {
      const rawSaveDataArrayBuffer = this.retron5SaveData.getRawSaveData();

      const rawSaveDataBlob = new Blob([rawSaveDataArrayBuffer], { type: 'application/octet-stream' });

      saveAs(rawSaveDataBlob, this.outputFilenameEmulator); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
