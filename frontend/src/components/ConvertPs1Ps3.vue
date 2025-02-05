<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>PS3</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <input-file
              @load="readPs3SaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose files to add (*.PSV)"
              acceptExtension=".PSV"
              :leaveRoomForHelpIcon="false"
              :allowMultipleFiles="true"
            />
            <file-list
              :display="this.ps3SaveData !== null"
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
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
            <file-list
              :display="this.ps3SaveData !== null"
              :files="this.getFileListNames()"
              :enabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="ps1-ps3-convert-button"
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
            Help: how do I&nbsp;<b-link href="https://gbatemp.net/threads/tutorial-transfer-saves-from-ps1-to-ps3.573038/">copy PS1 save files to and from my PS3</b-link>? (Begin at step 3)
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.ps1-ps3-convert-button {
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
import Ps3SaveData from '../save-formats/PS1/Ps3';

export default {
  name: 'ConvertPs1Ps3',
  data() {
    return {
      ps3SaveData: null,
      errorMessage: null,
      inputFilename: null,
      outputFilename: null,
      conversionDirection: 'convertToRaw',
      selectedSaveData: null,
      individualSavesOrMemoryCard: 'memory-card',
      individualSavesText: 'Individual save',
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
      const haveDataSelected = (this.individualSavesOrMemoryCard === 'individual-saves') ? (this.selectedSaveData !== null) : true;

      return !this.ps3SaveData || this.ps3SaveData.getSaveFiles().length === 0 || !haveDataSelected || !this.outputFilename;
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
          // this.inputFilename is null because we can select multiple .PSV files to combine
          // Leaving this.outputFilename blank seems a bit crummy because it might not be clear why
          // the Convert button stays disabled, plus it may also not be clear that the new file
          // should have a .mcr extension.
          // So let's just pick the first filename as a placeholder and the user can change it if they wish

          if ((this.ps3SaveData !== null) && (this.ps3SaveData.getSaveFiles().length > 0)) {
            this.outputFilename = Util.changeFilenameExtension(this.ps3SaveData.getSaveFiles()[0].filename, 'mcr');
          }
          this.selectedSaveData = null;
        }
      }
    },
    getFileListNames() {
      if ((this.ps3SaveData !== null) && (this.ps3SaveData.getSaveFiles() !== null)) {
        return this.ps3SaveData.getSaveFiles().map((x) => ({ displayText: `${x.description} (${x.regionName})` }));
      }

      return [];
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.ps3SaveData = null;
      this.errorMessage = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.selectedSaveData = null;
      this.individualSavesOrMemoryCard = 'memory-card';

      if (this.conversionDirection === 'convertToFormat') {
        // Can only convert individual saves to PS3 format. Maybe we should auto detect whether we
        // were given an individual save or a memory card image and adjust accodingly (and allow the user
        // to choose an individual save from the memory card image)?
        this.changeIndividualSavesOrMemoryCard('individual-saves');
      }
    },
    changeSelectedSaveData(newSaveData) {
      if (newSaveData !== null) {
        if ((this.ps3SaveData !== null) && (this.ps3SaveData.getSaveFiles().length > 0)) {
          this.selectedSaveData = newSaveData;
          if (this.conversionDirection === 'convertToRaw') {
            this.outputFilename = this.ps3SaveData.getSaveFiles()[this.selectedSaveData].filename;
          } else {
            this.outputFilename = this.ps3SaveData.getPs3SaveFiles()[this.selectedSaveData].filename;
          }
          this.changeIndividualSavesOrMemoryCard('individual-saves');
        } else {
          this.selectedSaveData = null;
          this.outputFilename = null;
        }
      }
    },
    readPs3SaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = null;
      try {
        const saveFiles = event.map((f) => ({ filename: f.filename, rawData: f.arrayBuffer }));

        this.ps3SaveData = Ps3SaveData.createFromPs3SaveFiles(saveFiles);

        this.individualSavesOrMemoryCard = null;

        this.changeIndividualSavesOrMemoryCard('memory-card');
      } catch (e) {
        this.errorMessage = 'File appears to not be in the correct format';
        this.ps3SaveData = null;
        this.selectedSaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = null;
      try {
        const saveFiles = [{ filename: event.filename, rawData: event.arrayBuffer }];

        this.ps3SaveData = Ps3SaveData.createFromPs1SaveFiles(saveFiles);
        this.changeSelectedSaveData(0);
      } catch (e) {
        this.errorMessage = e.message;
        this.ps3SaveData = null;
        this.selectedSaveData = null;
      }
    },
    convertFile() {
      let outputArrayBuffer = null;

      if (this.conversionDirection === 'convertToRaw') {
        if (this.individualSavesOrMemoryCard === 'individual-saves') {
          outputArrayBuffer = this.ps3SaveData.getSaveFiles()[this.selectedSaveData].rawData;
        } else {
          outputArrayBuffer = this.ps3SaveData.getMemoryCard().getArrayBuffer();
        }
      } else {
        outputArrayBuffer = this.ps3SaveData.getPs3SaveFiles()[this.selectedSaveData].rawData;
      }

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
