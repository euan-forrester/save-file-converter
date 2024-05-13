<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>.srm</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <input-file
              @load="readSrmSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.srm)"
              acceptExtension=".srm"
              :leaveRoomForHelpIcon="false"
            />
          </div>
          <div v-else>
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <!-- Here we omit having a output file size selector because we're going to likely be given all sorts of different files and many may not be in powers-of-2 -->
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
                <template v-slot:header>.sav</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <!-- Here we omit having a output file size selector because we're going to likely be given all sorts of different files and many may not be in powers-of-2 -->
          </div>
          <div v-else>
            <input-file
              @load="readSavSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.sav)"
              acceptExtension=".sav"
              :leaveRoomForHelpIcon="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="srm-sav-convert-button"
            variant="success"
            block
            :disabled="!this.saveData || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            This may not result in a usable .sav file from all .srm files, or vice versa.
          </div>
          <div class="help">
            If you have a save file from a specific place like the <router-link to="/mister">MiSTer</router-link>,
            a <router-link to="/flash-carts">flash cart</router-link>, or the <router-link to="/retron-5">Retron 5</router-link> then please use one of those conversions instead.
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

.srm-sav-convert-button {
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

export default {
  name: 'ConvertSrmSav',
  data() {
    return {
      saveData: null,
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
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
    },
    readSrmSaveData(event) {
      this.errorMessage = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = Util.changeFilenameExtension(event.filename, 'sav');
      } catch (e) {
        this.errorMessage = e.message;
        this.saveData = null;
      }
    },
    readSavSaveData(event) {
      this.errorMessage = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = Util.changeFilenameExtension(event.filename, 'srm');
      } catch (e) {
        this.errorMessage = e.message;
        this.saveData = null;
      }
    },
    convertFile() {
      // This "conversion" does nothing but change the extension of the file. Having a different file extension than expected by their
      // emulator is a huge stumbling block for many people. We are conditioned by our operating systems to treat file extensions seriously,
      // and that they represent the format of the data in the file. However, many emulators (and other ways of playing retro games) use
      // the extensions .srm and .sav interchangably, and they do not represent anything about the data contained in the file.
      // "convert srm to sav" and vice versa continue to be top google searches in the save file converter space, indicating that this is an
      // ongoing problem for users

      const outputBlob = new Blob([this.saveData], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
