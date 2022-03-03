<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>MiSTer</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readMisterSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
            <mister-platform
              v-model="misterPlatform"
              id="platform"
              v-on:input="misterPlatformChanged()"
              :disabled="false"
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
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
            <mister-platform
              v-model="misterPlatform"
              id="platform"
              v-on:input="misterPlatformChanged()"
              :disabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="mister-convert-button"
            variant="success"
            block
            :disabled="!this.misterSaveData || !this.misterPlatform || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.mister-convert-button {
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
import MisterPlatform from './MisterPlatform.vue';

import MisterSnesSaveData from '../save-formats/Mister/Snes';
import MisterGenesisSaveData from '../save-formats/Mister/Genesis';
import MisterPs1SaveData from '../save-formats/Mister/Ps1';

export default {
  name: 'ConvertMister',
  data() {
    return {
      misterSaveData: null,
      misterPlatform: null,
      misterPlatformClass: null,
      errorMessage: null,
      outputFilename: null,
      conversionDirection: 'convertToEmulator',
      inputArrayBuffer: null,
      inputFilename: null,
      inputFileType: null,
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    MisterPlatform,
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.misterSaveData = null;
      this.misterPlatform = null;
      this.misterPlatformClass = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.inputArrayBuffer = null;
      this.inputFilename = null;
      this.inputFileType = null;
    },
    misterPlatformChanged() {
      if (this.misterPlatform !== null) {
        switch (this.misterPlatform) {
          case 'Mister-SNES': {
            this.misterPlatformClass = MisterSnesSaveData;
            break;
          }

          case 'Mister-MD': {
            this.misterPlatformClass = MisterGenesisSaveData;
            break;
          }

          case 'Mister-PS1': {
            this.misterPlatformClass = MisterPs1SaveData;
            break;
          }

          default: {
            this.misterPlatformClass = null;
            break;
          }
        }
      } else {
        this.misterPlatformClass = null;
      }

      this.updateMisterSaveData();
    },
    updateMisterSaveData() {
      this.errorMessage = null;

      if ((this.misterPlatformClass !== null) && (this.inputArrayBuffer !== null) && (this.inputFilename !== null) && (this.inputFileType !== null)) {
        try {
          if (this.inputFileType === 'mister') {
            this.misterSaveData = this.misterPlatformClass.createFromMisterData(this.inputArrayBuffer);
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, this.misterPlatformClass.getRawFileExtension());
          } else {
            this.misterSaveData = this.misterPlatformClass.createFromRawData(this.inputArrayBuffer);
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, this.misterPlatformClass.getMisterFileExtension());
          }
        } catch (e) {
          this.errorMessage = 'This file does not seem to be in the correct format';
          this.misterSaveData = null;
        }
      } else {
        this.misterSaveData = null;
        this.outputFilename = null;
      }
    },
    readMisterSaveData(event) {
      this.inputFileType = 'mister';
      this.inputArrayBuffer = event.arrayBuffer;
      this.inputFilename = event.filename;

      this.updateMisterSaveData();
    },
    readEmulatorSaveData(event) {
      this.inputFileType = 'raw';
      this.inputArrayBuffer = event.arrayBuffer;
      this.inputFilename = event.filename;

      this.updateMisterSaveData();
    },
    convertFile() {
      const outputArrayBuffer = (this.conversionDirection === 'convertToEmulator') ? this.misterSaveData.getRawArrayBuffer() : this.misterSaveData.getMisterArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
