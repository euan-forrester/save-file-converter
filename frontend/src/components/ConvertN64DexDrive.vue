<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
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
              placeholderText="Choose a file to convert (*.n64)"
              acceptExtension=".n64"
              :leaveRoomForHelpIcon="false"
            />
            <file-list
              :display="this.dexDriveSaveData !== null"
              :files="this.getFileListNames()"
              v-model="selectedSaveData"
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
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })" :class="$mq === 'md' ? 'fix-jumbotron' : ''">
                <template v-slot:header>{{ individualSavesOrMemoryCardText }}</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <individual-saves-or-memory-card-selector
              :value="this.individualSavesOrMemoryCard"
              @change="changeIndividualSavesOrMemoryCard($event)"
              :individualSavesText="this.individualSavesText"
              :memoryCardText="this.memoryCardText"
            />
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose files to add"
              :leaveRoomForHelpIcon="false"
              :allowMultipleFiles="true"
            />
            <file-list
              :display="this.dexDriveSaveData !== null"
              :files="this.getFileListNames()"
              :enabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="n64-dexdrive-convert-button"
            variant="success"
            block
            :disabled="this.convertButtonDisabled"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            Help: how can I <router-link to="/original-hardware?sort=n64">copy save files to and from an N64 cartridge or Controller Pak</router-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.n64-dexdrive-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}

/* We have so much text in our jumbotron that at the md size it wants to be vertically larger than the other one. So let's constrain it and move the text upwards insie it */
.fix-jumbotron {
  max-height: 11.5em;
}

.fix-jumbotron > div {
  margin-top: -1em;
}
</style>

<script>
import { saveAs } from 'file-saver';
import Util from '../util/util';
import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import ConversionDirection from './ConversionDirection.vue';
import FileList from './FileList.vue';
import IndividualSavesOrMemoryCardSelector from './IndividualSavesOrMemoryCardSelector.vue';
import N64DexDriveSaveData from '../save-formats/N64/DexDrive';
import N64MempackSaveData from '../save-formats/N64/Mempack';

export default {
  name: 'ConvertN64DexDrive',
  data() {
    return {
      dexDriveSaveData: null,
      errorMessage: null,
      inputFilename: null,
      outputFilename: null,
      conversionDirection: 'convertToEmulator',
      selectedSaveData: null,
      individualSavesOrMemoryCard: 'individual-saves',
      individualSavesText: 'Individual saves',
      memoryCardText: 'Controller Pak',
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    FileList,
    IndividualSavesOrMemoryCardSelector,
  },
  computed: {
    convertButtonDisabled() {
      const haveDataSelected = (this.conversionDirection === 'convertToEmulator') ? true : this.selectedSaveData === null;

      return !this.dexDriveSaveData || this.dexDriveSaveData.getSaveFiles().length === 0 || !haveDataSelected || !this.outputFilename;
    },
    individualSavesOrMemoryCardText() {
      return (this.individualSavesOrMemoryCard === 'individual-saves') ? this.individualSavesText : this.memoryCardText;
    },
  },
  methods: {
    changeIndividualSavesOrMemoryCard(newValue) {
      if (this.individualSavesOrMemoryCard !== newValue) {
        this.individualSavesOrMemoryCard = newValue;

        if (newValue === 'individual-saves') {
          if (this.selectedSaveData === null) {
            this.changeSelectedSaveData(0);
          }
        } else {
          if (this.inputFilename !== null) {
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, 'mpk');
          }
          this.selectedSaveData = null;
        }
      }
    },
    getFileListNames() {
      if ((this.dexDriveSaveData !== null) && (this.dexDriveSaveData.getSaveFiles() !== null)) {
        return this.dexDriveSaveData.getSaveFiles().map((x) => ({ displayText: N64MempackSaveData.isCartSave(x) ? `Cartridge save: ${x.noteName}` : `${x.noteName} (${x.regionName})` }));
      }

      return [];
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.dexDriveSaveData = null;
      this.errorMessage = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.selectedSaveData = null;
      this.individualSavesOrMemoryCard = 'individual-saves';
    },
    changeSelectedSaveData(newSaveData) {
      if (newSaveData !== null) {
        if ((this.dexDriveSaveData !== null) && (this.dexDriveSaveData.getSaveFiles().length > 0)) {
          this.selectedSaveData = newSaveData;
          this.outputFilename = N64MempackSaveData.createFilename(this.dexDriveSaveData.getSaveFiles()[this.selectedSaveData]);
          this.changeIndividualSavesOrMemoryCard('individual-saves');
        } else {
          this.selectedSaveData = null;
          this.outputFilename = null;
        }
      }
    },
    readDexDriveSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = event.filename;
      try {
        this.dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(event.arrayBuffer);

        const containsCartSave = this.dexDriveSaveData.getSaveFiles().some((x) => N64MempackSaveData.isCartSave(x));

        this.individualSavesOrMemoryCard = null;

        if (containsCartSave) {
          this.changeIndividualSavesOrMemoryCard('individual-saves');
          this.changeSelectedSaveData(0);
        } else {
          this.changeIndividualSavesOrMemoryCard('memory-card');
        }
      } catch (e) {
        this.errorMessage = 'File appears to not be in the correct format';
        this.dexDriveSaveData = null;
        this.selectedSaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = null;
      try {
        let saveFiles = event.map((f) => ({ parsedFilename: N64MempackSaveData.parseFilename(f.filename), rawData: f.arrayBuffer }));

        saveFiles = saveFiles.map((f) => ({
          noteName: f.parsedFilename.noteName,
          gameSerialCode: f.parsedFilename.gameSerialCode,
          publisherCode: f.parsedFilename.publisherCode,
          comment: 'Created with savefileconverter.com',
          rawData: f.rawData,
        }));

        this.dexDriveSaveData = N64DexDriveSaveData.createFromSaveFiles(saveFiles);

        if (this.dexDriveSaveData.getSaveFiles().length > 0) {
          this.outputFilename = `${Util.convertDescriptionToFilename(this.dexDriveSaveData.getSaveFiles()[0].noteName)}.n64`;
        } else {
          this.outputFilename = 'output.n64';
        }
      } catch (e) {
        this.errorMessage = e.message;
        this.dexDriveSaveData = null;
        this.selectedSaveData = null;
      }
    },
    convertFile() {
      let outputArrayBuffer = null;

      if (this.conversionDirection === 'convertToEmulator') {
        if (this.individualSavesOrMemoryCard === 'individual-saves') {
          outputArrayBuffer = this.dexDriveSaveData.getSaveFiles()[this.selectedSaveData].rawData;
        } else {
          outputArrayBuffer = this.dexDriveSaveData.getMempack().getArrayBuffer();
        }
      } else {
        outputArrayBuffer = this.dexDriveSaveData.getArrayBuffer();
      }

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
