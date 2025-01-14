<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })" :class="$mq === 'md' ? 'fix-jumbotron' : ''">
                <template v-slot:header>Saroo</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <input-file
              @load="readSegaSaturnSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.BIN)"
              acceptExtension=".BIN"
              :leaveRoomForHelpIcon="false"
            />
            <file-list
              :display="this.segaSaturnSaveData !== null"
              :files="this.getFileListNames()"
              v-model="selectedSaveData"
              @change="changeSelectedSaveData($event)"
            />
          </div>
          <div v-else>
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <sega-cd-save-type-selector
              :value="this.segaCdSaveType"
              @change="changeSegaCdSaveType($event)"
              ramCartText="Backup cartridge"
            />
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
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <output-filename
              v-model="outputFilename"
            />
          </div>
          <div v-else>
            <input-file
              @load="readIndividualFileSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose files to add (*.BUP)"
              acceptExtension=".BUP"
              :leaveRoomForHelpIcon="false"
              :allowMultipleFiles="true"
            />
            <div v-if="this.needsSaturnRomData">
              <input-file
                @load="readSaturnRom($event)"
                :errorMessage="this.saturnRomErrorMessage"
                placeholderText="Select track 1 from the game's .bin/.cue files"
                acceptExtension=".bin"
                :leaveRoomForHelpIcon="true"
                helpText="Saroo internal memory files require additional information about the game. It's generally contained in track 1 of the games .bin/.cue files.
                You can only add saves from one game at a time to Saroo internal memory files."
                ref="inputFileSaturnRomData"
              />
            </div>
            <file-list
              :display="this.segaSaturnSaveData !== null"
              :files="this.getFileListNames()"
              :enabled="false"
              :showMessageWhenEmpty="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="sega-saturn-saroo-convert-button"
            variant="success"
            block
            :disabled="this.convertButtonDisabled"
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
.sega-saturn-saroo-convert-button {
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
import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import ConversionDirection from './ConversionDirection.vue';
import FileList from './FileList.vue';
import SegaCdSaveTypeSelector from './SegaCdSaveTypeSelector.vue';
import SegaSaturnBupSaveData from '../save-formats/SegaSaturn/Bup';
import SarooSegaSaturnInternalSaveData from '../save-formats/SegaSaturn/Saroo/Internal';
import SarooSegaSaturnCartSaveData from '../save-formats/SegaSaturn/Saroo/Cart';
import SarooSegaSaturnSystemSaveData from '../save-formats/SegaSaturn/Saroo/System';
import SegaSaturnCueBin from '../rom-formats/SegaSaturnCueBin';

export default {
  name: 'ConvertSegaSaturnSaroo',
  data() {
    return {
      segaSaturnSaveData: null,
      bupsArray: null,
      saveFiles: null,
      errorMessage: null,
      inputFilename: null,
      outputFilename: null,
      conversionDirection: 'convertToRaw',
      segaCdSaveType: 'internal-memory',
      selectedSaveData: null,
      saturnRomData: null,
      saturnRomErrorMessage: null,
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    FileList,
    SegaCdSaveTypeSelector,
  },
  computed: {
    convertButtonDisabled() {
      const haveDataSelected = (this.conversionDirection === 'convertToRaw') ? true : this.selectedSaveData === null;

      return !this.segaSaturnSaveData || this.segaSaturnSaveData.getSaveFiles().length === 0 || !haveDataSelected || !this.outputFilename || !this.hasSaturnRomDataIfNeeded;
    },
    needsSaturnRomData() {
      return (this.conversionDirection === 'convertToFormat') && (this.segaCdSaveType === 'internal-memory');
    },
    hasSaturnRomDataIfNeeded() {
      return !this.needsSaturnRomData || (this.saturnRomData !== null);
    },
  },
  methods: {
    getFileListNames() {
      if ((this.segaSaturnSaveData !== null) && (this.segaSaturnSaveData.getSaveFiles() !== null)) {
        return this.segaSaturnSaveData.getSaveFiles().map(
          (x) => ({
            displayText: `${x.name} - ${x.comment}`,
          }),
        );
      }

      return [];
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.segaSaturnSaveData = null;
      this.bupsArray = null;
      this.saveFiles = null;
      this.errorMessage = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.selectedSaveData = null;
      this.segaCdSaveType = 'internal-memory';
      this.saturnRomData = null;
      this.saturnRomErrorMessage = null;

      this.setOutputFilename();
    },
    changeSelectedSaveData(newSaveData) {
      if (this.segaSaturnSaveData.getSaveFiles().length > 0) {
        this.selectedSaveData = newSaveData;
        this.outputFilename = `${this.segaSaturnSaveData.getSaveFiles()[this.selectedSaveData].name}.BUP`;
      } else {
        this.selectedSaveData = null;
        this.outputFilename = null;
      }
    },
    setOutputFilename() {
      if (this.conversionDirection === 'convertToFormat') {
        if (this.segaCdSaveType === 'internal-memory') {
          this.outputFilename = 'SS_SAVE.BIN';
        } else {
          this.outputFilename = 'SS_MEMS.BIN';
        }
      }
    },
    changeSegaCdSaveType(newValue) {
      if (this.segaCdSaveType !== newValue) {
        this.segaCdSaveType = newValue;
        this.saturnRomData = null;
        this.segaSaturnSaveData = null;
        if (this.$refs.inputFileSaturnRomData) {
          this.$refs.inputFileSaturnRomData.reset();
        }
        this.tryToCreateSegaSaturnSaveDataFromSaveFiles();
        this.setOutputFilename();
      }
    },
    readSaturnRom(event) {
      this.saturnRomErrorMessage = null;
      try {
        this.saturnRomData = new SegaSaturnCueBin(event.arrayBuffer);
        this.tryToCreateSegaSaturnSaveDataFromSaveFiles();
      } catch (e) {
        this.saturnRomErrorMessage = 'This does not appear to be track 1 of a Sega Saturn game in .cue/.bin format';
      }
    },
    readSegaSaturnSaveData(event) {
      if (this.segaCdSaveType !== null) {
        this.errorMessage = null;
        this.selectedSaveData = null;
        this.inputFilename = event.filename;
        try {
          if (SarooSegaSaturnInternalSaveData.isInternalSarooData(event.arrayBuffer)) { // SS_SAVE.BIN
            this.segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSarooData(event.arrayBuffer);
          } else if (SarooSegaSaturnCartSaveData.isCartSarooData(event.arrayBuffer)) { // SS_MEMS.BIN
            this.segaSaturnSaveData = SarooSegaSaturnCartSaveData.createFromSarooData(event.arrayBuffer);
          } else if (SarooSegaSaturnSystemSaveData.isSystemSarooData(event.arrayBuffer)) { // SS_BUP.BIN
            this.segaSaturnSaveData = SarooSegaSaturnSystemSaveData.createFromSarooData(event.arrayBuffer);
          } else {
            throw new Error('Could not find a matching Saroo file type');
          }

          this.bupsArray = SegaSaturnBupSaveData.convertSaveFilesToBups(this.segaSaturnSaveData.getSaveFiles());
          this.changeSelectedSaveData(0);
        } catch (e) {
          this.errorMessage = 'File appears to not be in the correct format';
          this.segaSaturnSaveData = null;
          this.bupsArray = null;
          this.saveFiles = null;
          this.selectedSaveData = null;
        }
      }
    },
    readIndividualFileSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = null;
      try {
        this.bupsArray = event.map((f) => f.arrayBuffer);

        this.saveFiles = SegaSaturnBupSaveData.convertBupsToSaveFiles(this.bupsArray);

        this.tryToCreateSegaSaturnSaveDataFromSaveFiles();
      } catch (e) {
        this.errorMessage = e.message;
        this.segaSaturnSaveData = null;
        this.bupsArray = null;
        this.saveFiles = null;
        this.selectedSaveData = null;
      }
    },
    tryToCreateSegaSaturnSaveDataFromSaveFiles() {
      if ((this.saveFiles !== null) && this.hasSaturnRomDataIfNeeded) {
        this.errorMessage = null;
        this.selectedSaveData = null;
        this.inputFilename = null;
        try {
          if (this.segaCdSaveType === 'internal-memory') {
            const gameSaveFiles = [
              {
                gameId: this.saturnRomData.getGameId(),
                saveFiles: this.saveFiles,
              },
            ];
            this.segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSaveFiles(gameSaveFiles);
          } else {
            this.segaSaturnSaveData = SarooSegaSaturnCartSaveData.createFromSaveFiles(this.saveFiles);
          }
        } catch (e) {
          this.errorMessage = e.message;
          this.segaSaturnSaveData = null;
          this.selectedSaveData = null;
          this.outputFilename = null;
          // Leave this.bupsArray and this.saveFiles and this.saturnRomData alone, so we can try a different sega cd save type (internal vs cart)
        }
      }
    },
    convertFile() {
      let outputArrayBuffer = null;

      if (this.conversionDirection === 'convertToRaw') {
        outputArrayBuffer = this.bupsArray[this.selectedSaveData];
      } else {
        outputArrayBuffer = this.segaSaturnSaveData.getArrayBuffer();
      }

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
