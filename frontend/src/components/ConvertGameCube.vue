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
              @load="readGameCubeSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.raw, *.gcp)"
              :leaveRoomForHelpIcon="false"
              acceptExtension=".raw,.gcp"
              ref="inputFileGameCubeSaveData"
            />
            <file-list
              :display="this.gameCubeSaveDataLargest !== null"
              :files="this.getFileListNames()"
              v-model="selectedSaveData"
              @change="changeSelectedSaveData($event)"
            />
          </div>
          <div v-else>
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <output-filesize
              :value="this.outputFilesize"
              @input="changeOutputFilesize($event)"
              platform="gamecube"
              :customFormatter="formatSize"
              overrideHelpText="Select the size of memory card that you wish to create"
            />
            <game-cube-encoding-selector
              :value="this.outputEncoding"
              @input="changeOutputEncoding($event)"
              id="gameCubeEncodingSelector"
            />
            <input-file
              @load="readGameCubeExampleFileSaveData($event)"
              :errorMessage="this.errorMessageExampleFile"
              placeholderText="Optional: example file (*.raw, *.gcp)"
              :leaveRoomForHelpIcon="false"
              acceptExtension=".raw,.gcp"
              helpText="When copying a .raw file to an original memory card, the file must contain a special ID number specific to that individual memory card.
              Provide an example file here from that memory card so that the ID number can be copied from it. This is not required when using an emulator or the Memcard Pro GC."
              ref="inputFileGameCubeExampleSaveData"
              id="inputFileGameCubeExampleSaveData"
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
                :disabled="false"
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
            <div v-if="this.individualSavesOrMemoryCard === 'memory-card'">
              <output-filesize
                class="output-filesize"
                :value="this.outputFilesize"
                @input="changeOutputFilesize($event)"
                platform="gamecube"
                :customFormatter="formatSize"
                overrideHelpText="Select the size of memory card that you wish to create"
              />
            </div>
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose files to add (*.gci)"
              :leaveRoomForHelpIcon="false"
              :allowMultipleFiles="true"
              acceptExtension=".gci"
            />
            <file-list
              :display="this.gameCubeSaveDataLargest !== null"
              :files="this.getFileListNames()"
              :enabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="gamecube-convert-button"
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
            Help: how can I <router-link to="/original-hardware?sort=gcn">copy save files to and from a GameCube console</router-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.gamecube-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}

/* Mpve this up rather than deleting the margin under the selector above so that if this isn't visible there's still margin under the one above */
.output-filesize {
  margin-top: -1em;
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
import OutputFilesize from './OutputFilesize.vue';
import ConversionDirection from './ConversionDirection.vue';
import FileList from './FileList.vue';
import IndividualSavesOrMemoryCardSelector from './IndividualSavesOrMemoryCardSelector.vue';
import GameCubeEncodingSelector from './GameCubeEncodingSelector.vue';

import GameCubeSaveData from '../save-formats/GameCube/GameCube';
import GameCubeGciSaveData from '../save-formats/GameCube/Gci';
import GameCubeUtil from '../save-formats/GameCube/Util';
import GameCubeHeader from '../save-formats/GameCube/Components/Header';

import PlatformSaveSizes from '../save-formats/PlatformSaveSizes';

const DEFAULT_OUTPUT_FILE_SIZE = 2097152; // 251 blocks (16 megabits)
const DEFAULT_OUTPUT_ENCODING = 'US-ASCII';

export default {
  name: 'ConvertGameCube',
  data() {
    return {
      gameCubeSaveDataLargest: null,
      gameCubeSaveDataResized: null,
      gameCubeSaveDataExample: null,
      errorMessage: null,
      errorMessageExampleFile: null,
      inputFilename: null,
      outputFilename: null,
      outputFilesize: DEFAULT_OUTPUT_FILE_SIZE,
      outputEncoding: DEFAULT_OUTPUT_ENCODING,
      conversionDirection: 'convertToRaw',
      selectedSaveData: null,
      individualSavesOrMemoryCard: 'individual-saves',
      individualSavesText: 'Individual saves',
      memoryCardText: 'Raw/emulator',
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    OutputFilesize,
    FileList,
    IndividualSavesOrMemoryCardSelector,
    GameCubeEncodingSelector,
  },
  computed: {
    convertButtonDisabled() {
      const haveDataSelected = (this.conversionDirection === 'convertToRaw') ? true : this.selectedSaveData === null;

      const gameCubeSaveData = (this.individualSavesOrMemoryCard === 'individual-saves') ? this.gameCubeSaveDataLargest : this.gameCubeSaveDataResized;

      return !gameCubeSaveData || gameCubeSaveData.getSaveFiles().length === 0 || !haveDataSelected || !this.outputFilename;
    },
    individualSavesOrMemoryCardText() {
      return (this.individualSavesOrMemoryCard === 'individual-saves') ? this.individualSavesText : this.memoryCardText;
    },
    largestSaveSize() {
      return PlatformSaveSizes.gamecube.at(-1); // Last element of array
    },
  },
  methods: {
    formatSize(sizeBytes) {
      const sizeMegabits = GameCubeUtil.bytesToMegabits(sizeBytes);
      const { numTotalBlocks } = GameCubeUtil.getTotalSizes(sizeMegabits);

      return `${numTotalBlocks} blocks (${sizeMegabits} megabits)`;
    },
    getFileNameFromSaveFile(saveFile) {
      // Let's just copy the same format that Dolphin uses:
      // https://github.com/dolphin-emu/dolphin/blob/58a70db588dbcdbebcb25531f85dbab5d236b60e/Source/Core/Core/HW/GCMemcard/GCMemcardUtils.cpp#L305

      const sanitizedFilename = Util.convertDescriptionToFilename(`${saveFile.publisherCode}-${saveFile.gameCode}-${saveFile.fileName}`);

      return `${sanitizedFilename}.gci`;
    },
    getFileSizeErrorMessage() {
      const sizeMegabits = GameCubeUtil.bytesToMegabits(this.outputFilesize);
      const { numTotalBlocks } = GameCubeUtil.getTotalSizes(sizeMegabits);

      return `A GameCube memory card of size ${numTotalBlocks} blocks (${sizeMegabits} megabits) is not large enough to contain all of the files specified`;
    },
    getGameCubeDataResized() {
      this.gameCubeSaveDataResized = null;
      if (this.gameCubeSaveDataLargest !== null) {
        try {
          this.gameCubeSaveDataResized = GameCubeSaveData.createWithNewSize(this.gameCubeSaveDataLargest, this.outputFilesize);
        } catch (e) {
          this.errorMessage = this.getFileSizeErrorMessage();
          this.gameCubeSaveDataResized = null;
          this.selectedSaveData = null;
        }
      }
    },
    changeOutputFilesize(newValue) {
      this.outputFilesize = newValue;
      this.errorMessage = null;

      this.getGameCubeDataResized();
    },
    changeOutputEncoding(newValue) {
      this.outputEncoding = newValue;
      this.errorMessage = null;

      if (this.gameCubeSaveDataLargest !== null) {
        try {
          this.gameCubeSaveDataLargest = GameCubeSaveData.createWithNewEncoding(this.gameCubeSaveDataLargest, this.outputEncoding);
        } catch (e) {
          this.errorMessage = 'Could not create save file for this region';
          this.gameCubeSaveDataLargest = null;
          this.selectedSaveData = null;
        }
      }

      this.getGameCubeDataResized();
    },
    changeIndividualSavesOrMemoryCard(newValue) {
      this.errorMessage = null;

      if (this.individualSavesOrMemoryCard !== newValue) {
        this.individualSavesOrMemoryCard = newValue;

        if (newValue === 'individual-saves') {
          if (this.selectedSaveData === null) {
            this.changeSelectedSaveData(0);
          }
        } else {
          if (this.inputFilename !== null) {
            this.outputFilename = Util.changeFilenameExtension(this.inputFilename, 'raw');
          }
          this.selectedSaveData = null;
          this.getGameCubeDataResized();
        }
      }
    },
    getFileListNames() {
      if ((this.gameCubeSaveDataLargest !== null) && (this.gameCubeSaveDataLargest.getSaveFiles() !== null)) {
        return this.gameCubeSaveDataLargest.getSaveFiles().map((x) => ({ displayText: `${x.comments[0]} - ${x.comments[1]}` }));
      }

      return [];
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.gameCubeSaveDataLargest = null;
      this.gameCubeSaveDataResized = null;
      this.gameCubeSaveDataExample = null;
      this.errorMessage = null;
      this.errorMessageExampleFile = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.outputFilesize = DEFAULT_OUTPUT_FILE_SIZE;
      this.outputEncoding = DEFAULT_OUTPUT_ENCODING;
      this.selectedSaveData = null;
      this.individualSavesOrMemoryCard = 'individual-saves';

      // The refs become undefined when the components are removed using a v-if
      if (this.$refs.inputFileGameCubeSaveData) {
        this.$refs.inputFileGameCubeSaveData.reset();
      }
      if (this.$refs.inputFileGameCubeExampleSaveData) {
        this.$refs.inputFileGameCubeExampleSaveData.reset();
      }
    },
    changeSelectedSaveData(newSaveData) {
      if (newSaveData !== null) {
        if ((this.gameCubeSaveDataLargest !== null) && (this.gameCubeSaveDataLargest.getSaveFiles().length > 0)) {
          this.selectedSaveData = newSaveData;
          this.outputFilename = this.getFileNameFromSaveFile(this.gameCubeSaveDataLargest.getSaveFiles()[this.selectedSaveData]);
          this.changeIndividualSavesOrMemoryCard('individual-saves');
        } else {
          this.selectedSaveData = null;
          this.outputFilename = null;
        }
      }
    },
    readGameCubeExampleFileSaveData(event) {
      this.errorMessageExampleFile = null;

      try {
        this.gameCubeSaveDataExample = GameCubeSaveData.createFromGameCubeData(event.arrayBuffer);

        this.changeOutputFilesize(this.gameCubeSaveDataExample.getArrayBuffer().byteLength);
      } catch (e) {
        this.errorMessageExampleFile = 'File appears to not be in the correct format';
        this.gameCubeSaveDataExample = null;
      }
    },
    readGameCubeSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = event.filename;
      try {
        this.gameCubeSaveDataLargest = GameCubeSaveData.createFromGameCubeData(event.arrayBuffer);

        this.individualSavesOrMemoryCard = null;

        this.changeIndividualSavesOrMemoryCard('individual-saves');
        this.changeOutputFilesize(this.gameCubeSaveDataLargest.getArrayBuffer().byteLength);

        this.getGameCubeDataResized();
      } catch (e) {
        this.errorMessage = 'File appears to not be in the correct format';
        this.gameCubeSaveDataLargest = null;
        this.gameCubeSaveDataResized = null;
        this.selectedSaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = null;
      try {
        const saveFileArrayBuffers = event.map((f) => f.arrayBuffer);
        const saveFiles = GameCubeGciSaveData.convertGcisToSaveFiles(saveFileArrayBuffers); // Note that here we use the inferred encoding. This will be overwritten when we convert to a memory card image below

        const volumeInfo = {
          formatOsTimeCode: GameCubeUtil.getOsTimeFromDate(new Date()), // Represents now, by the brower's clock. Will be ignored if no cardFlashId specified: see GameCubeHeader.writeHeader()
          rtcBias: 0,
          languageCode: GameCubeUtil.getLanguageCode('English'),
          viDtvStatus: 0,
          memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
          memcardSizeMegabits: GameCubeUtil.bytesToMegabits(this.largestSaveSize),
          encodingCode: GameCubeUtil.getEncodingCode(this.outputEncoding),
        };

        this.gameCubeSaveDataLargest = GameCubeSaveData.createFromSaveFiles(saveFiles, volumeInfo);

        if (this.gameCubeSaveDataLargest.getSaveFiles().length > 0) {
          this.outputFilename = `${Util.removeFilenameExtension(this.getFileNameFromSaveFile(this.gameCubeSaveDataLargest.getSaveFiles()[0]))}.raw`;
        } else {
          this.outputFilename = 'output.raw';
        }

        this.getGameCubeDataResized();
      } catch (e) {
        this.errorMessage = e.message;
        this.gameCubeSaveDataLargest = null;
        this.selectedSaveData = null;
      }
    },
    convertFile() {
      let outputArrayBuffer = null;

      if ((this.conversionDirection === 'convertToRaw') && (this.individualSavesOrMemoryCard === 'individual-saves')) {
        const individualArrayBuffers = GameCubeGciSaveData.convertSaveFilesToGcis(this.gameCubeSaveDataLargest.getSaveFiles());
        outputArrayBuffer = individualArrayBuffers[this.selectedSaveData];
      } else {
        if (this.gameCubeSaveDataExample !== null) {
          console.log('Trying to set the card flash id');
          const volumeInfo = {
            ...this.gameCubeSaveDataLargest.getVolumeInfo(),
            cardFlashId: this.gameCubeSaveDataExample.getVolumeInfo().cardFlashId,
          };

          this.gameCubeSaveDataLargest = GameCubeSaveData.createFromSaveFiles(this.gameCubeSaveDataLargest.getSaveFiles(), volumeInfo);

          this.getGameCubeDataResized();
        }

        outputArrayBuffer = this.gameCubeSaveDataResized.getArrayBuffer();
      }

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
