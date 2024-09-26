<template>
  <div>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readData1($event)"
          placeholderText="Choose first file to compare"
          :leaveRoomForHelpIcon="true"
          ref="inputFile1"
          class="top-row"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readData2($event)"
          placeholderText="Choose second file to compare"
          :leaveRoomForHelpIcon="true"
          ref="inputFile2"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <b-collapse appear id="id" :visible="showComparison">
          <b-list-group>
            <b-list-group-item :variant="this.variant" class="d-flex justify-content-between align-items-center">
              <div v-if="this.filesAreSame">
                Files contents are identical
              </div>
              <div v-else>
                Files contents are different
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-collapse>
      </b-col>
    </b-row>
    <b-row class="justify-content-md-center" align-h="center">
      <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
        <b-button
          class="utilities-advanced-file-compare-convert-button"
          variant="success"
          block
          :disabled="!hasAllSaveData"
          @click="compareFiles()"
        >
        Compare!
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<style scoped>
.top-row {
  margin-top: 1em;
}

.utilities-advanced-file-compare-convert-button {
  margin-top: 1em;
}
</style>

<script>
import InputFile from './InputFile.vue';

import Util from '../util/util';

export default {
  name: 'TabFileCompare',
  components: {
    InputFile,
  },
  data() {
    return {
      saveData1: null,
      saveData2: null,
      filesAreSame: false,
      showComparison: false,
    };
  },
  computed: {
    hasAllSaveData() { return ((this.saveData1 !== null) && (this.saveData2 !== null)); },
    variant() { return this.filesAreSame ? 'success' : 'danger'; },
  },
  methods: {
    reset() {
      this.saveData1 = null;
      this.saveData2 = null;
      this.filesAreSame = false;
      this.showComparison = false;

      this.$refs.inputFile1.reset();
      this.$refs.inputFile2.reset();
    },
    readData1(event) {
      this.saveData1 = event.arrayBuffer;
    },
    readData2(event) {
      this.saveData2 = event.arrayBuffer;
    },
    compareFiles() {
      if (this.hasAllSaveData) {
        this.filesAreSame = Util.arrayBuffersEqual(this.saveData1, this.saveData2);

        this.showComparison = true;
      }
    },
  },
};
</script>
