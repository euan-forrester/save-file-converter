<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center">
        <b-col sm=12 md=10 lg=8 xl=6>
          <b-jumbotron :header-level="$mq | mq({ xs: 5, sm: 4, md: 3 })">
            <template v-slot:header>Retron 5</template>
          </b-jumbotron>
          <file-reader @load="readRetron5SaveData($event)"></file-reader>
          <b-alert variant="danger" :show="this.errorMessage !== null">
            {{this.errorMessage}}
          </b-alert>
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
    };
  },
  components: {
    FileReader,
  },
  methods: {
    readRetron5SaveData(arrayBuffer) {
      try {
        const retron5SaveData = new Retron5SaveData(arrayBuffer);

        const rawSaveDataArrayBuffer = retron5SaveData.getRawSaveData();

        const rawSaveDataBlob = new Blob([rawSaveDataArrayBuffer], { type: 'application/octet-stream' });

        saveAs(rawSaveDataBlob, 'temp.srm'); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
      } catch (e) {
        this.errorMessage = e.message;
      }
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
