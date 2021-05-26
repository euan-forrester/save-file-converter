<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Emulator/Raw<br>Test save</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <input-file
            @load="readRetron5SaveData($event)"
            placeholderText="Choose a file that you know works (*.srm)"
            acceptExtension=".srm"
            :leaveRoomForHelpIcon="true"
            helpText="Make a test save using the emulator or cartridge that you want to use, to compare against the file that's not working."
            id="known-working-input-file"
          />
        </b-col>
        <b-col sm=12 md=2 lg=2 xl=2 align-self="start">
          <mq-layout :mq="['md', 'lg', 'xl']">
            <i class="fa fa-arrow-circle-right fa-3x horizontal-arrow"></i>
          </mq-layout>
          <mq-layout :mq="['xs', 'sm']">
            <i class="fa fa-arrow-circle-down fa-3x vertical-arrow"></i>
          </mq-layout>
        </b-col>
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Emulator/Raw Needs fixed</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <input-file
            @load="readEmulatorSaveData($event)"
            placeholderText="Choose the file that's not working (*.srm)"
            acceptExtension=".srm"
            :leaveRoomForHelpIcon="true"
            helpText="The system will compare the file that's not working against the test save you made to try and figure out how to change it."
            id="needs-fixed-input-file"
          />
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="troubleshooting-button"
            variant="success"
            block
            :disabled="!this.testSaveData || !this.brokenSaveData"
            @click="fixFile()"
          >
          Attempt fix!
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            Tip: if this tool doesn't work for you, try opening both files in a hex editor and looking for similarities or differences that may help you fix the file.
          </div>
          <div class="help">
            Did this page help you? Please tell me if it did or if it didn't: savefileconverter{{'\xa0'}}(at){{'\xa0'}}gmail{{'\xa0'}}(dot){{'\xa0'}}com
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.troubleshooting-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}

.horizontal-arrow {
  margin-top: 2.2em;
  margin-left: 0.5em;
  margin-right: 0.5em;
}

.vertical-arrow {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

</style>

<script>
import { saveAs } from 'file-saver';
import InputFile from './InputFile.vue';

export default {
  name: 'TroubleshootingUtils',
  data() {
    return {
      testSaveData: null,
      brokenSaveData: null,
      outputFilename: null,
    };
  },
  components: {
    InputFile,
  },
  methods: {
    readTestSaveData(event) {
      this.testSaveData = event.arrayBuffer;
    },
    readBrokenSaveData(event) {
      this.brokenSaveData = event.arrayBuffer;
    },
    fixFile() {
      const outputArrayBuffer = null;

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
