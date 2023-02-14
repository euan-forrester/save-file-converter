<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Raw/emulator</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <input-file
              @load="readSegaCdSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
            <file-list
              :display="this.segaCdSaveData !== null"
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
              <b-jumbotron
                fluid
                :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })"
                :class="($mq === 'md') && (this.individualSavesOrMemoryCard === 'individual-saves') ? 'fix-jumbotron' : ''"
              >
                <template v-slot:header>{{ individualSavesOrMemoryCardText }}</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <div v-if="this.individualSavesOrMemoryCard === 'individual-saves'">
              <output-filename
                v-model="outputFilename"
                :leaveRoomForHelpIcon="true"
                :disabled="true"
                helpText="The filename for an individual save contains important information that the game needs to find this save data. Please do not modify it after downloading the save."
              />
            </div>
            <div v-else>
             <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            </div>
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
              :display="this.segaCdSaveData !== null"
              :files="this.getFileListNames()"
              :enabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="sega-cd-convert-button"
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
            Help: how can I <router-link to="/original-hardware?sort=segacd">copy save files to and from a Sega CD console</router-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.sega-cd-convert-button {
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
import SegaCdSaveData from '../save-formats/SegaCd/SegaCd';

export default {
  name: 'ConvertSegaCd',
  data() {
    return {
      segaCdSaveData: null,
      errorMessage: null,
      inputFilename: null,
      outputFilename: null,
      conversionDirection: 'convertToRaw',
      selectedSaveData: null,
      individualSavesOrMemoryCard: 'memory-card',
      individualSavesText: 'Individual saves',
      memoryCardText: 'Raw/emulator',
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
      const haveDataSelected = (this.conversionDirection === 'convertToRaw') ? true : this.selectedSaveData === null;

      return !this.segaCdSaveData || this.segaCdSaveData.getSaveFiles().length === 0 || !haveDataSelected || !this.outputFilename;
    },
    individualSavesOrMemoryCardText() {
      return (this.individualSavesOrMemoryCard === 'individual-saves') ? this.individualSavesText : this.memoryCardText;
    },
  },
  methods: {
    getFileNameFromSaveFile(saveFile) {
      return `${saveFile.filename}-${saveFile.dataIsEncoded ? 'ECC' : 'RAW'}.bin`;
    },
    getSaveFileFromFileName(filename) {
      const rawIndex = filename.indexOf('-RAW');
      const eccIndex = filename.indexOf('-ECC');

      if ((rawIndex < 0) === (eccIndex < 0)) {
        throw new Error('This does not appear to be the filename of a Sega CD individual save');
      }

      return {
        filename: filename.slice(0, Math.max(rawIndex, eccIndex)),
        dataIsEncoded: (eccIndex >= 0),
      };
    },
    changeIndividualSavesOrMemoryCard(newValue) {
      if (this.individualSavesOrMemoryCard !== newValue) {
        this.individualSavesOrMemoryCard = newValue;

        if (newValue === 'individual-saves') {
          if (this.selectedSaveData === null) {
            this.changeSelectedSaveData(0);
          }
        } else {
          if (this.inputFilename !== null) {
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, 'brm');
          }
          this.selectedSaveData = null;
        }
      }
    },
    getFileListNames() {
      if ((this.segaCdSaveData !== null) && (this.segaCdSaveData.getSaveFiles() !== null)) {
        return this.segaCdSaveData.getSaveFiles().map((x) => ({ displayText: `${x.filename}` }));
      }

      return [];
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.segaCdSaveData = null;
      this.errorMessage = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.selectedSaveData = null;
      this.individualSavesOrMemoryCard = 'memory-card';
    },
    changeSelectedSaveData(newSaveData) {
      if (newSaveData !== null) {
        if ((this.segaCdSaveData !== null) && (this.segaCdSaveData.getSaveFiles().length > 0)) {
          this.selectedSaveData = newSaveData;
          this.outputFilename = this.getFileNameFromSaveFile(this.segaCdSaveData.getSaveFiles()[this.selectedSaveData]);
          this.changeIndividualSavesOrMemoryCard('individual-saves');
        } else {
          this.selectedSaveData = null;
          this.outputFilename = null;
        }
      }
    },
    readSegaCdSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = event.filename;
      try {
        this.segaCdSaveData = SegaCdSaveData.createFromSegaCdData(event.arrayBuffer);

        this.individualSavesOrMemoryCard = null;

        this.changeIndividualSavesOrMemoryCard('memory-card');
      } catch (e) {
        this.errorMessage = 'File appears to not be in the correct format';
        this.segaCdSaveData = null;
        this.selectedSaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = null;
      try {
        const saveFiles = event.map((f) => ({
          ...this.getSaveFileFromFileName(f.filename),
          fileData: f.arrayBuffer,
        }));

        this.segaCdSaveData = SegaCdSaveData.createFromSaveFiles(saveFiles, 8192); // FIXME: Need to allow user to select size

        if (this.segaCdSaveData.getSaveFiles().length > 0) {
          this.outputFilename = `${Util.convertDescriptionToFilename(this.segaCdSaveData.getSaveFiles()[0].filename)}.brm`;
        } else {
          this.outputFilename = 'output.brm';
        }
      } catch (e) {
        this.errorMessage = e.message;
        this.segaCdSaveData = null;
        this.selectedSaveData = null;
      }
    },
    convertFile() {
      let outputArrayBuffer = null;

      if ((this.conversionDirection === 'convertToRaw') && (this.individualSavesOrMemoryCard === 'individual-saves')) {
        outputArrayBuffer = this.segaCdSaveData.getSaveFiles()[this.selectedSaveData].fileData;
      } else {
        // FIXME: Need to resize here based on size user has selected
        outputArrayBuffer = this.segaCdSaveData.getArrayBuffer();
      }

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
