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
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <input-file
              @load="readDexDriveSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.gme)"
              acceptExtension=".gme"
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
            <div v-if="this.individualSavesOrMemoryCard === 'individual-saves'">
              <input-file
                @load="readEmulatorSaveData($event)"
                :errorMessage="this.errorMessage"
                placeholderText="Choose files to add"
                :leaveRoomForHelpIcon="false"
                :allowMultipleFiles="true"
                ref="inputFileEmulator"
              />
            </div>
            <div v-else>
              <input-file
                @load="readEmulatorMemcardSaveData($event)"
                :errorMessage="this.errorMessage"
                placeholderText="Choose a file to convert (*.mcr)"
                acceptExtension=".mcr"
                :leaveRoomForHelpIcon="false"
                ref="inputFileEmulatorMemcard"
              />
            </div>
            <individual-saves-or-memory-card-selector
              :value="this.individualSavesOrMemoryCard"
              @change="changeIndividualSavesOrMemoryCard($event)"
              :individualSavesText="this.individualSavesText"
              :memoryCardText="this.memoryCardText"
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
            class="ps1-dexdrive-convert-button"
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
            Help: how can I <router-link to="/original-hardware?sort=ps1">copy save files to and from a PS1 memory card</router-link>?
          </div>
          <div class="help">
            Help: how do I&nbsp;<b-link href="https://github.com/ShendoXT/memcardrex/releases">copy files to and from my DexDrive</b-link>?
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
import PS1DexDriveSaveData from '../save-formats/PS1/DexDrive';

export default {
  name: 'ConvertPs1DexDrive',
  data() {
    return {
      dexDriveSaveData: null,
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

        if (this.conversionDirection === 'convertToFormat') {
          this.selectedSaveData = null;
          this.dexDriveSaveData = null;
          this.outputFilename = null;
          // The refs become undefined when the components are removed using a v-if
          if (this.$refs.inputFileEmulator) {
            this.$refs.inputFileEmulator.reset();
          }
          if (this.$refs.inputFileEmulatorMemcard) {
            this.$refs.inputFileEmulatorMemcard.reset();
          }
        } else if (newValue === 'individual-saves') {
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
      if ((this.dexDriveSaveData !== null) && (this.dexDriveSaveData.getSaveFiles() !== null)) {
        return this.dexDriveSaveData.getSaveFiles().map((x) => ({ displayText: `${x.description} (${x.regionName})` }));
      }

      return null;
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.dexDriveSaveData = null;
      this.errorMessage = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.selectedSaveData = null;
      this.individualSavesOrMemoryCard = 'memory-card';
    },
    changeSelectedSaveData(newSaveData) {
      if (newSaveData !== null) {
        if ((this.dexDriveSaveData !== null) && (this.dexDriveSaveData.getSaveFiles().length > 0)) {
          this.selectedSaveData = newSaveData;
          this.outputFilename = this.dexDriveSaveData.getSaveFiles()[this.selectedSaveData].filename;
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
        this.dexDriveSaveData = PS1DexDriveSaveData.createFromDexDriveData(event.arrayBuffer);

        this.individualSavesOrMemoryCard = null;

        this.changeIndividualSavesOrMemoryCard('memory-card');
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
        const saveFiles = event.map((f) => ({ filename: f.filename, rawData: f.arrayBuffer, comment: 'Created with savefileconverter.com' }));

        this.dexDriveSaveData = PS1DexDriveSaveData.createFromSaveFiles(saveFiles);

        if (this.dexDriveSaveData.getSaveFiles().length > 0) {
          this.outputFilename = `${Util.convertDescriptionToFilename(this.dexDriveSaveData.getSaveFiles()[0].description)}.gme`;
        } else {
          this.outputFilename = 'output.gme';
        }
      } catch (e) {
        this.errorMessage = e.message;
        this.dexDriveSaveData = null;
        this.selectedSaveData = null;
      }
    },
    readEmulatorMemcardSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = event.filename;
      this.outputFilename = Util.changeFilenameExtension(event.filename, 'gme');
      try {
        this.dexDriveSaveData = PS1DexDriveSaveData.createFromMemoryCardData(event.arrayBuffer, 'Created with savefileconverter.com');
        this.changeIndividualSavesOrMemoryCard('memory-card');
      } catch (e) {
        this.errorMessage = 'File appears to not be in the correct format';
        this.dexDriveSaveData = null;
        this.selectedSaveData = null;
      }
    },
    convertFile() {
      let outputArrayBuffer = null;

      if (this.conversionDirection === 'convertToRaw') {
        if (this.individualSavesOrMemoryCard === 'individual-saves') {
          outputArrayBuffer = this.dexDriveSaveData.getSaveFiles()[this.selectedSaveData].rawData;
        } else {
          outputArrayBuffer = this.dexDriveSaveData.getMemoryCard().getArrayBuffer();
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
