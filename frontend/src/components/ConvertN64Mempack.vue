<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })" :class="$mq === 'md' ? 'fix-jumbotron' : ''">
                <template v-slot:header>Controller Pak</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readMempackSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.mpk)"
              acceptExtension=".mpk"
              :leaveRoomForHelpIcon="false"
            />
            <file-list
              :display="this.mempackSaveData !== null"
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
                <template v-slot:header>Individual saves</template>
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
              placeholderText="Choose files to add"
              :leaveRoomForHelpIcon="false"
              :allowMultipleFiles="true"
            />
            <file-list
              :display="this.mempackSaveData !== null"
              :files="this.getFileListNames()"
              :enabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="n64-mempack-convert-button"
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
.n64-mempack-convert-button {
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
import N64MempackSaveData from '../save-formats/N64/Mempack';

export default {
  name: 'ConvertN64Mempack',
  data() {
    return {
      mempackSaveData: null,
      errorMessage: null,
      inputFilename: null,
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
  computed: {
    convertButtonDisabled() {
      const haveDataSelected = (this.conversionDirection === 'convertToEmulator') ? true : this.selectedSaveData === null;

      return !this.mempackSaveData || this.mempackSaveData.getSaveFiles().length === 0 || !haveDataSelected || !this.outputFilename;
    },
  },
  methods: {
    getFileListNames() {
      if ((this.mempackSaveData !== null) && (this.mempackSaveData.getSaveFiles() !== null)) {
        return this.mempackSaveData.getSaveFiles().map((x) => ({ displayText: N64MempackSaveData.isCartSave(x) ? `Cartridge save: ${x.noteName}` : `${x.noteName} (${x.regionName})` }));
      }

      return [];
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.mempackSaveData = null;
      this.errorMessage = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.selectedSaveData = null;
    },
    changeSelectedSaveData(newSaveData) {
      if (this.mempackSaveData.getSaveFiles().length > 0) {
        this.selectedSaveData = newSaveData;
        this.outputFilename = N64MempackSaveData.createFilename(this.mempackSaveData.getSaveFiles()[this.selectedSaveData]);
      } else {
        this.selectedSaveData = null;
        this.outputFilename = null;
      }
    },
    readMempackSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = event.filename;
      try {
        this.mempackSaveData = N64MempackSaveData.createFromN64MempackData(event.arrayBuffer);
        this.changeSelectedSaveData(0);
      } catch (e) {
        this.errorMessage = 'File appears to not be in the correct format';
        this.mempackSaveData = null;
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
          rawData: f.rawData,
        }));

        this.mempackSaveData = N64MempackSaveData.createFromSaveFiles(saveFiles);

        if (this.mempackSaveData.getSaveFiles().length > 0) {
          this.outputFilename = `${Util.convertDescriptionToFilename(this.mempackSaveData.getSaveFiles()[0].noteName)}.mpk`;
        } else {
          this.outputFilename = 'output.mpk';
        }
      } catch (e) {
        this.errorMessage = e.message;
        this.mempackSaveData = null;
        this.selectedSaveData = null;
      }
    },
    convertFile() {
      let outputArrayBuffer = null;

      if (this.conversionDirection === 'convertToEmulator') {
        outputArrayBuffer = this.mempackSaveData.getSaveFiles()[this.selectedSaveData].rawData;
      } else {
        outputArrayBuffer = this.mempackSaveData.getArrayBuffer();
      }

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
