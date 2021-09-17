<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>DexDrive</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readDexDriveSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.gme)"
              acceptExtension=".gme"
              :leaveRoomForHelpIcon="false"
            />
            <file-list
              :display="this.dexDriveSaveData !== null"
              :files="this.dexDriveSaveData ? this.dexDriveSaveData.getSaveFiles() : []"
              :maxFilesVisible="this.MAX_FILES_VISIBLE"
              :v-model="this.selectedSaveData"
              @change="changeSelectedSaveData($event)"
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
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="ps1-dexdrive-convert-button"
            variant="success"
            block
            :disabled="!this.dexDriveSaveData || this.dexDriveSaveData.getSaveFiles().length === 0 || this.selectedSaveData === null || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            Help: how do I&nbsp;<b-link href="https://github.com/ShendoXT/memcardrex/releases">copy files to and from my DexDrive</b-link>?
          </div>
          <div class="help">
            Help: how do I copy save files to and from a PS1 memory card?<br><b-link href="http://ps2ulaunchelf.pbworks.com/w/page/19520134/FrontPage">PS2 + USB stick</b-link> or <b-link href="https://github.com/ShendoXT/memcardrex/releases">PS3 USB memory card adaptor</b-link> or <b-link href="https://github.com/ShendoXT/memcardrex/releases">DexDrive</b-link> or <b-link href="https://8bitmods.com/memcard-pro-for-playstation-1-smoke-black/">MemCard Pro</b-link>
          </div>
          <div class="help">
            Help: how do I <b-link href="https://www.google.com/search?q=ps2+mcboot+memory+card">run homebrew software on my PS2</b-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.ps1-dexdrive-convert-button {
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
import FileList from './FileList.vue';
import Ps1DexDriveSaveData from '../save-formats/PS1/DexDrive';

export default {
  name: 'ConvertPs1DexDrive',
  data() {
    return {
      MAX_FILES_VISIBLE: Ps1DexDriveSaveData.NUM_BLOCKS,
      dexDriveSaveData: null,
      errorMessage: null,
      outputFilename: null,
      conversionDirection: 'convertToEmulator',
      selectedSaveData: null,
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    FileList,
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.dexDriveSaveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.selectedSaveData = null;
    },
    changeSelectedSaveData(newSaveData) {
      this.selectedSaveData = newSaveData;
      this.outputFilename = this.dexDriveSaveData.getSaveFiles()[this.selectedSaveData].filename;
    },
    readDexDriveSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      try {
        this.dexDriveSaveData = Ps1DexDriveSaveData.createFromDexDriveData(event.arrayBuffer);
        this.changeSelectedSaveData(0);
      } catch (e) {
        this.errorMessage = e.message;
        this.dexDriveSaveData = null;
        this.selectedSaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      try {
        this.dexDriveSaveData = Ps1DexDriveSaveData.createFromSaveFiles(event.arrayBuffer);
        this.outputFilename = Util.changeFilenameExtension(event.filename, 'gme');
      } catch (e) {
        this.errorMessage = e.message;
        this.dexDriveSaveData = null;
        this.selectedSaveData = null;
      }
    },
    convertFile() {
      console.log(`Trying to upload save data at index ${this.selectedSaveData}`);
      const outputArrayBuffer = (this.conversionDirection === 'convertToEmulator') ? this.dexDriveSaveData.getSaveFiles()[this.selectedSaveData].rawData : this.dexDriveSaveData.getArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
