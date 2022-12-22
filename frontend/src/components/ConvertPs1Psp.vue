<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>PSP</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <input-file
              @load="readpspSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.vmp)"
              acceptExtension=".vmp"
              :leaveRoomForHelpIcon="false"
            />
            <file-list
              :display="this.pspSaveData !== null"
              :files="this.getFileListNames()"
              v-model="selectedSaveData"
              @change="changeSelectedSaveData($event)"
            />
          </div>
          <div v-else>
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <memory-card-selector v-model="memoryCardIndex" @change="changeMemoryCardIndex()" />
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
              :display="this.pspSaveData !== null"
              :files="this.getFileListNames()"
              :enabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="ps1-psp-convert-button"
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
            Help: how do I&nbsp;<b-link href="https://www.wikihow.com/Put-Game-Saves-on-Your-PSP">copy PS1 saves to and from my PSP</b-link>?
          </div>
          <div class="help">
            Help: how can I <router-link to="/original-hardware?sort=ps1">copy save files to and from a PS1 memory card</router-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.ps1-psp-convert-button {
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
import MemoryCardSelector from './MemoryCardSelector.vue';
import PspSaveData from '../save-formats/PS1/Psp';

export default {
  name: 'ConvertPs1Psp',
  data() {
    return {
      pspSaveData: null,
      errorMessage: null,
      inputFilename: null,
      outputFilename: null,
      conversionDirection: 'convertToRaw',
      selectedSaveData: null,
      memoryCardIndex: 0,
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
    MemoryCardSelector,
    IndividualSavesOrMemoryCardSelector,
  },
  computed: {
    convertButtonDisabled() {
      const haveDataSelected = (this.conversionDirection === 'convertToRaw') ? true : this.selectedSaveData === null;

      return !this.pspSaveData || this.pspSaveData.getSaveFiles().length === 0 || !haveDataSelected || !this.outputFilename;
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
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, 'mcr');
          }
          this.selectedSaveData = null;
        }
      }
    },
    getFileListNames() {
      if ((this.pspSaveData !== null) && (this.pspSaveData.getSaveFiles() !== null)) {
        return this.pspSaveData.getSaveFiles().map((x) => ({ displayText: `${x.description} (${x.regionName})` }));
      }

      return [];
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.pspSaveData = null;
      this.errorMessage = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.selectedSaveData = null;
      this.memoryCardIndex = 0;
      this.individualSavesOrMemoryCard = 'memory-card';

      if (newDirection === 'convertToFormat') {
        this.changeMemoryCardIndex();
      }
    },
    changeMemoryCardIndex() {
      this.outputFilename = `SCEVMC${this.memoryCardIndex}.VMP`;
    },
    changeSelectedSaveData(newSaveData) {
      if (newSaveData !== null) {
        if ((this.pspSaveData !== null) && (this.pspSaveData.getSaveFiles().length > 0)) {
          this.selectedSaveData = newSaveData;
          this.outputFilename = this.pspSaveData.getSaveFiles()[this.selectedSaveData].filename;
          this.changeIndividualSavesOrMemoryCard('individual-saves');
        } else {
          this.selectedSaveData = null;
          this.outputFilename = null;
        }
      }
    },
    readpspSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = event.filename;
      try {
        this.pspSaveData = PspSaveData.createFromPspData(event.arrayBuffer);

        this.individualSavesOrMemoryCard = null;

        this.changeIndividualSavesOrMemoryCard('memory-card');
      } catch (e) {
        this.errorMessage = 'File appears to not be in the correct format';
        this.pspSaveData = null;
        this.selectedSaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = null;
      try {
        const saveFiles = event.map((f) => ({ filename: f.filename, rawData: f.arrayBuffer, comment: 'Created with savefileconverter.com' }));

        this.pspSaveData = PspSaveData.createFromSaveFiles(saveFiles);
      } catch (e) {
        this.errorMessage = e.message;
        this.pspSaveData = null;
        this.selectedSaveData = null;
      }
    },
    convertFile() {
      let outputArrayBuffer = null;

      if (this.conversionDirection === 'convertToRaw') {
        if (this.individualSavesOrMemoryCard === 'individual-saves') {
          outputArrayBuffer = this.pspSaveData.getSaveFiles()[this.selectedSaveData].rawData;
        } else {
          outputArrayBuffer = this.pspSaveData.getMemoryCard().getArrayBuffer();
        }
      } else {
        outputArrayBuffer = this.pspSaveData.getArrayBuffer();
      }

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
