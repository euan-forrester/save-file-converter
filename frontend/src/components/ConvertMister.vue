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
            <div v-if="this.isSegaCd">
              <sega-cd-save-type-selector
                :value="this.segaCdSaveType"
                @change="changeSegaCdSaveType($event)"
              />
            </div>
            <div v-if="this.displayOutputFileSize">
              <output-filesize v-model="outputFilesize" id="output-filesize" :platform="this.misterPlatformClass.adjustOutputSizesPlatform()"/>
            </div>
          </div>
          <div v-else>
            <div v-if="this.isSegaCd">
              <input-file
                @load="readEmulatorSaveData($event, 'rawInternalSaveArrayBuffer')"
                :errorMessage="this.errorMessage"
                placeholderText="Choose an internal save file to convert"
                :leaveRoomForHelpIcon="false"
              />
              <input-file
                @load="readEmulatorSaveData($event, 'rawRamCartSaveArrayBuffer')"
                :errorMessage="this.errorMessage"
                placeholderText="Choose a RAM cart save file to convert"
                :leaveRoomForHelpIcon="false"
              />
            </div>
            <div v-else>
              <input-file
                @load="readEmulatorSaveData($event)"
                :errorMessage="this.errorMessage"
                placeholderText="Choose a file to convert"
                :leaveRoomForHelpIcon="false"
              />
            </div>
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
import OutputFilesize from './OutputFilesize.vue';
import ConversionDirection from './ConversionDirection.vue';
import MisterPlatform from './MisterPlatform.vue';
import SegaCdSaveTypeSelector from './SegaCdSaveTypeSelector.vue';

import MisterNesSaveData from '../save-formats/Mister/Nes';
import MisterSnesSaveData from '../save-formats/Mister/Snes';
import MisterGameboySaveData from '../save-formats/Mister/Gameboy';
import MisterGameboyAdvanceSaveData from '../save-formats/Mister/GameboyAdvance';
import MisterGameGearSaveData from '../save-formats/Mister/GameGear';
import MisterSmsSaveData from '../save-formats/Mister/Sms';
import MisterGenesisSaveData from '../save-formats/Mister/Genesis';
import MisterSegaCdSaveData from '../save-formats/Mister/SegaCd';
import MisterPcEngineSaveData from '../save-formats/Mister/PcEngine';
import MisterPs1SaveData from '../save-formats/Mister/Ps1';
import MisterWonderSwanSaveData from '../save-formats/Mister/WonderSwan';

export default {
  name: 'ConvertMister',
  data() {
    return {
      misterSaveData: null,
      misterPlatform: null,
      misterPlatformClass: null,
      errorMessage: null,
      outputFilename: null,
      outputFilesize: null,
      conversionDirection: 'convertToEmulator',
      inputArrayBuffer: null,
      inputFilename: null,
      inputFileType: null,
      segaCdSaveType: 'internal-memory',
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    OutputFilesize,
    MisterPlatform,
    SegaCdSaveTypeSelector,
  },
  computed: {
    isSegaCd: {
      get() { return (this.misterPlatform !== null) && (this.misterPlatform === 'Mister-MCD'); },
    },
    displayOutputFileSize: {
      get() {
        if ((this.misterPlatformClass !== null) && (this.misterPlatformClass.adjustOutputSizesPlatform() !== null)) {
          if (this.isSegaCd) {
            return (this.segaCdSaveType === 'ram-cart');
          }

          return true;
        }

        return false;
      },
    },
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.misterSaveData = null;
      this.misterPlatform = null;
      this.misterPlatformClass = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.outputFilesize = null;
      this.inputArrayBuffer = null;
      this.inputFilename = null;
      this.inputFileType = null;
      this.segaCdSaveType = 'internal-memory';
    },
    changeSegaCdSaveType(newSaveType) {
      this.segaCdSaveType = newSaveType;
      if ((this.inputFilename !== null) && (this.misterPlatformClass !== null)) {
        this.outputFilename = this.getSegaCdRawFileName();
      }
    },
    getSegaCdRawFileName() {
      return `${Util.removeFilenameExtension(this.inputFilename)}${this.misterPlatformClass.getRawFileExtension(this.segaCdSaveType)}`;
    },
    misterPlatformChanged() {
      const prevMisterPlatformClass = this.misterPlatformClass;

      if (this.misterPlatform !== null) {
        switch (this.misterPlatform) {
          case 'Mister-NES': {
            this.misterPlatformClass = MisterNesSaveData;
            break;
          }

          case 'Mister-SNES': {
            this.misterPlatformClass = MisterSnesSaveData;
            break;
          }

          case 'Mister-GB': {
            this.misterPlatformClass = MisterGameboySaveData;
            break;
          }

          case 'Mister-GBA': {
            this.misterPlatformClass = MisterGameboyAdvanceSaveData;
            break;
          }

          case 'Mister-GG': {
            this.misterPlatformClass = MisterGameGearSaveData;
            break;
          }

          case 'Mister-SMS': {
            this.misterPlatformClass = MisterSmsSaveData;
            break;
          }

          case 'Mister-MD': {
            this.misterPlatformClass = MisterGenesisSaveData;
            break;
          }

          case 'Mister-MCD': {
            this.misterPlatformClass = MisterSegaCdSaveData;
            break;
          }

          case 'Mister-PCE': {
            this.misterPlatformClass = MisterPcEngineSaveData;
            break;
          }

          case 'Mister-PS1': {
            this.misterPlatformClass = MisterPs1SaveData;
            break;
          }

          case 'Mister-WS': {
            this.misterPlatformClass = MisterWonderSwanSaveData;
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

      // We use different input boxes in the UI depending on whether there are 1 or 2 raw files to read,
      // and so we want to wipe out any input file info that may be lurking internally when we switch to showing a different input box
      if ((prevMisterPlatformClass !== null) && (this.misterPlatformClass !== null) && (this.conversionDirection !== 'convertToEmulator')) {
        if (prevMisterPlatformClass.getNumRawFiles() !== this.misterPlatformClass.getNumRawFiles()) {
          this.inputFileType = null;
          this.inputArrayBuffer = null;
          this.inputFilename = null;
          this.segaCdSaveType = null;
        }
      }

      this.updateMisterSaveData();
    },
    updateMisterSaveData() {
      this.errorMessage = null;
      this.outputFilesize = null;

      if ((this.misterPlatformClass !== null) && (this.inputArrayBuffer !== null) && (this.inputFilename !== null) && (this.inputFileType !== null)) {
        try {
          if (this.inputFileType === 'mister') {
            this.misterSaveData = this.misterPlatformClass.createFromMisterData(this.inputArrayBuffer);
            if (this.isSegaCd) {
              this.outputFilename = this.getSegaCdRawFileName();
            } else {
              this.outputFilename = Util.changeFilenameExtension(this.inputFilename, this.misterPlatformClass.getRawFileExtension());
            }
          } else {
            this.misterSaveData = this.misterPlatformClass.createFromRawData(this.inputArrayBuffer);
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, this.misterPlatformClass.getMisterFileExtension());
          }
          this.outputFilesize = this.misterSaveData.getRawSaveSize();
        } catch (e) {
          this.errorMessage = 'This file does not seem to be in the correct format';
          this.misterSaveData = null;
        }
      } else {
        this.misterSaveData = null;
        this.outputFilename = null;
        this.outputFilesize = null;
        this.segaCdSaveType = 'internal-memory';
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
      if (this.misterSaveData.getRawSaveSize() !== this.outputFilesize) {
        this.misterSaveData = this.misterPlatformClass.createWithNewSize(this.misterSaveData, this.outputFilesize);
      }

      let output = null;

      if (this.conversionDirection === 'convertToEmulator') {
        if (this.isSegaCd) {
          output = this.misterSaveData.getRawArrayBuffer(this.segaCdSaveType);
        } else {
          output = this.misterSaveData.getRawArrayBuffer();
        }
      } else {
        output = this.misterSaveData.getMisterArrayBuffer();
      }

      const outputBlob = new Blob([output], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename);
    },
  },
};

</script>
