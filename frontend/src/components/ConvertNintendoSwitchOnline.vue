<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Switch</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <input-file
              @load="readNsoSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
            <nintendo-switch-online-platform
              v-model="nsoPlatform"
              id="platform"
              v-on:input="nsoPlatformChanged()"
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
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <div v-if="this.displayOutputFileSize">
              <output-filesize v-model="outputFilesize" id="output-filesize" :platform="this.nsoPlatformClass.adjustOutputSizesPlatform()"/>
            </div>
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
              ref="inputFileEmulator"
            />
            <nintendo-switch-online-platform
              v-model="nsoPlatform"
              id="platform"
              v-on:input="nsoPlatformChanged()"
              :disabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="nintendo-switch-online-convert-button"
            variant="success"
            block
            :disabled="!this.nsoSaveData || !this.nsoPlatform || !outputFilename"
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
.nintendo-switch-online-convert-button {
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
import OutputFilesize from './OutputFilesize.vue';
import ConversionDirection from './ConversionDirection.vue';
import NintendoSwitchOnlinePlatform from './NintendoSwitchOnlinePlatform.vue';

import NsoNesSaveData from '../save-formats/NintendoSwitchOnline/Nes';
import NsoSnesSaveData from '../save-formats/NintendoSwitchOnline/Snes';
import NsoGameboySaveData from '../save-formats/NintendoSwitchOnline/Gameboy';
import NsoGameboyAdvanceSaveData from '../save-formats/NintendoSwitchOnline/GameboyAdvance';
import NsoGenesisSaveData from '../save-formats/NintendoSwitchOnline/Genesis';
import NsoN64SaveData from '../save-formats/NintendoSwitchOnline/N64';

export default {
  name: 'ConvertNintendoSwitchOnline',
  data() {
    return {
      nsoSaveData: null,
      nsoPlatform: null,
      nsoPlatformClass: null,
      errorMessage: null,
      outputFilename: null,
      outputFilesize: null,
      conversionDirection: 'convertToRaw',
      inputArrayBuffer: null,
      inputFilename: null,
      inputFileType: null,
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    OutputFilesize,
    NintendoSwitchOnlinePlatform,
  },
  computed: {
    displayOutputFileSize: {
      get() {
        return ((this.nsoPlatformClass !== null) && (this.nsoPlatformClass.adjustOutputSizesPlatform() !== null));
      },
    },
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.nsoSaveData = null;
      this.nsoPlatform = null;
      this.nsoPlatformClass = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.outputFilesize = null;
      this.inputArrayBuffer = null;
      this.inputFilename = null;
      this.inputFileType = null;
    },
    nsoPlatformChanged() {
      if (this.nsoPlatform !== null) {
        switch (this.nsoPlatform) {
          case 'NSO-NES': {
            this.nsoPlatformClass = NsoNesSaveData;
            break;
          }

          case 'NSO-SNES': {
            this.nsoPlatformClass = NsoSnesSaveData;
            break;
          }

          case 'NSO-GB': {
            this.nsoPlatformClass = NsoGameboySaveData;
            break;
          }

          case 'NSO-GBA': {
            this.nsoPlatformClass = NsoGameboyAdvanceSaveData;
            break;
          }

          case 'NSO-MD': {
            this.nsoPlatformClass = NsoGenesisSaveData;
            break;
          }

          case 'NSO-N64': {
            this.nsoPlatformClass = NsoN64SaveData;
            break;
          }

          default: {
            this.nsoPlatformClass = null;
            break;
          }
        }
      } else {
        this.nsoPlatformClass = null;
      }

      this.updateNsoSaveData();
    },
    updateNsoSaveData() {
      this.errorMessage = null;
      this.outputFilesize = null;

      if ((this.nsoPlatformClass !== null) && (this.inputArrayBuffer !== null) && (this.inputFilename !== null) && (this.inputFileType !== null)) {
        try {
          if (this.inputFileType === 'nso') {
            this.nsoSaveData = this.nsoPlatformClass.createFromNsoData(this.inputArrayBuffer);
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, this.nsoPlatformClass.getRawFileExtension());
          } else {
            this.nsoSaveData = this.nsoPlatformClass.createFromRawData(this.inputArrayBuffer);
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, this.nsoPlatformClass.getNsoFileExtension());
          }

          this.outputFilesize = this.nsoSaveData.getRawArrayBuffer().byteLength;
        } catch (e) {
          this.errorMessage = 'This file does not seem to be in the correct format';
          this.nsoSaveData = null;
        }
      } else {
        this.nsoSaveData = null;
        this.outputFilename = null;
        this.outputFilesize = null;
      }
    },
    readNsoSaveData(event) {
      this.inputFileType = 'nso';
      this.inputArrayBuffer = event.arrayBuffer;
      this.inputFilename = event.filename;

      this.updateNsoSaveData();
    },
    readEmulatorSaveData(event) {
      this.inputFileType = 'raw';
      this.inputArrayBuffer = event.arrayBuffer;
      this.inputFilename = event.filename;

      this.updateNsoSaveData();
    },
    convertFile() {
      if (this.nsoSaveData.getRawArrayBuffer().byteLength !== this.outputFilesize) {
        this.nsoSaveData = this.nsoPlatformClass.createWithNewSize(this.nsoSaveData, this.outputFilesize);
      }

      let output = null;

      if (this.conversionDirection === 'convertToRaw') {
        output = this.nsoSaveData.getRawArrayBuffer();
      } else {
        output = this.nsoSaveData.getNsoArrayBuffer();
      }

      const outputBlob = new Blob([output], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename);
    },
  },
};

</script>
