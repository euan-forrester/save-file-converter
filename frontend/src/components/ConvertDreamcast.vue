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
              @load="readDreamcastSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.bin)"
              :leaveRoomForHelpIcon="false"
              acceptExtension=".bin"
              ref="inputFileDreamcastSaveData"
            />
            <file-list
              :display="this.dreamcastSaveData !== null"
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
                :class="($mq === 'md') ? 'fix-jumbotron' : ''"
              >
                <template v-slot:header>Individual saves</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToRaw'">
            <div v-if="this.individualSaveType === 'dci'">
              <output-filename
                v-model="outputFilename"
                :leaveRoomForHelpIcon="true"
                :disabled="false"
              />
            </div>
            <div v-else>
              <output-filename
                v-model="outputFilenameVmi"
                :leaveRoomForHelpIcon="true"
                :disabled="false"
              />
              <output-filename
                v-model="outputFilenameVms"
                :leaveRoomForHelpIcon="true"
                :disabled="false"
              />
            </div>
            <dreamcast-individual-save-type-selector
              :value="this.individualSaveType"
              @change="changeIndividualSaveType($event)"
            />
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose files to add (*.dci)"
              :leaveRoomForHelpIcon="false"
              :allowMultipleFiles="true"
              acceptExtension=".dci"
            />
            <file-list
              :display="this.dreamcastSaveData !== null"
              :files="this.getFileListNames()"
              :enabled="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="dreamcast-convert-button"
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
            Help: how can I <router-link to="/original-hardware?sort=dc">copy save files to and from a Dreamcast console</router-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.dreamcast-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}

/* Mpve this up rather than deleting the margin under the selector above so that if this isn't visible there's still margin under the one above */
.output-filesize {
  margin-top: -1em;
}

/* We have so much text in our jumbotron that at the md size it wants to be vertically larger than the other one. So let's constrain it and move the text upwards inside it */
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
import DreamcastIndividualSaveTypeSelector from './DreamcastIndividualSaveTypeSelector.vue';

import DreamcastSaveData from '../save-formats/Dreamcast/Dreamcast';
import DreamcastDciSaveData from '../save-formats/Dreamcast/IndividualSaves/Dci';
import DreamcastVmiVmsSaveData from '../save-formats/Dreamcast/IndividualSaves/VmiVms';

const DEFAULT_ICON_SHAPE = 0;
const DEFAULT_INDIVIDUAL_SAVE_TYPE = 'dci';

export default {
  name: 'ConvertDreamcast',
  data() {
    return {
      dreamcastSaveData: null,
      errorMessage: null,
      inputFilename: null,
      outputFilename: null,
      outputFilenameVmi: null,
      outputFilenameVms: null,
      conversionDirection: 'convertToRaw',
      selectedSaveData: null,
      individualSaveType: DEFAULT_INDIVIDUAL_SAVE_TYPE,
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    FileList,
    DreamcastIndividualSaveTypeSelector,
  },
  computed: {
    convertButtonDisabled() {
      const haveDataSelected = (this.conversionDirection === 'convertToRaw') ? true : this.selectedSaveData === null;

      const hasOutputFilename = ((this.individualSaveType === 'dci') && (this.outputFilename !== null))
        || ((this.individualSaveType !== 'dci') && (this.outputFilenameVmi !== null) && (this.outputFilenameVms !== null));

      return !this.dreamcastSaveData || this.dreamcastSaveData.getSaveFiles().length === 0 || !haveDataSelected || !hasOutputFilename;
    },
  },
  methods: {
    changeIndividualSaveType(newValue) {
      if (this.individualSaveType !== newValue) {
        this.individualSaveType = newValue;
        this.outputFilename = null;
        this.outputFilenameVmi = null;
        this.outputFilenameVms = null;

        this.changeSelectedSaveData(this.selectedSaveData);
      }
    },
    getFileNameFromSaveFile(saveFile) {
      return Util.convertDescriptionToFilename(`${saveFile.filename}`);
    },
    getFileListNames() {
      if ((this.dreamcastSaveData !== null) && (this.dreamcastSaveData.getSaveFiles() !== null)) {
        return this.dreamcastSaveData.getSaveFiles().map((x) => ({ displayText: `${x.storageComment} - ${x.fileComment}` }));
      }

      return [];
    },
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.dreamcastSaveData = null;
      this.errorMessage = null;
      this.inputFilename = null;
      this.outputFilename = null;
      this.outputFilenameVmi = null;
      this.outputFilenameVms = null;
      this.selectedSaveData = null;
      this.individualSaveType = DEFAULT_INDIVIDUAL_SAVE_TYPE;

      // The refs become undefined when the components are removed using a v-if
      if (this.$refs.inputFileDreamcastSaveData) {
        this.$refs.inputFileDreamcastSaveData.reset();
      }
    },
    changeSelectedSaveData(newSaveData) {
      if (newSaveData !== null) {
        if ((this.dreamcastSaveData !== null) && (this.dreamcastSaveData.getSaveFiles().length > 0)) {
          this.selectedSaveData = newSaveData;

          const filename = this.getFileNameFromSaveFile(this.dreamcastSaveData.getSaveFiles()[this.selectedSaveData]);

          if (this.individualSaveType === 'dci') {
            this.outputFilename = `${filename}.dci`;
          } else {
            this.outputFilenameVmi = `${filename}.vmi`;
            this.outputFilenameVms = `${filename}.vms`;
          }
        } else {
          this.selectedSaveData = null;
          this.outputFilename = null;
          this.outputFilenameVmi = null;
          this.outputFilenameVms = null;
        }
      }
    },
    readDreamcastSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = event.filename;
      try {
        this.dreamcastSaveData = DreamcastSaveData.createFromDreamcastData(event.arrayBuffer);
      } catch (e) {
        this.errorMessage = 'File appears to not be in the correct format';
        this.dreamcastSaveData = null;
        this.selectedSaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      this.selectedSaveData = null;
      this.inputFilename = null;
      try {
        const saveFileArrayBuffers = event.map((f) => f.arrayBuffer);
        const saveFiles = saveFileArrayBuffers.map((saveFileArrayBuffer) => DreamcastDciSaveData.convertIndividualSaveToSaveFile(saveFileArrayBuffer));

        const volumeInfo = {
          useCustomColor: false,
          timestamp: new Date(),
          iconShape: DEFAULT_ICON_SHAPE,
        };

        this.dreamcastSaveData = DreamcastSaveData.createFromSaveFiles(saveFiles, volumeInfo);

        if (this.dreamcastSaveData.getSaveFiles().length > 0) {
          this.outputFilename = `${this.getFileNameFromSaveFile(this.dreamcastSaveData.getSaveFiles()[0])}.bin`;
        } else {
          this.outputFilename = 'output.bin';
        }
      } catch (e) {
        this.errorMessage = e.message;
        this.dreamcastSaveData = null;
        this.selectedSaveData = null;
        this.outputFilename = null;
        this.outputFilenameVmi = null;
        this.outputFilenameVms = null;
      }
    },
    convertFile() {
      const outputFileList = [];

      if (this.conversionDirection === 'convertToRaw') {
        const saveFile = this.dreamcastSaveData.getSaveFiles()[this.selectedSaveData];

        if (this.individualSaveType === 'dci') {
          outputFileList.push({
            arrayBuffer: DreamcastDciSaveData.convertSaveFileToDci(saveFile),
            filename: this.outputFilename,
          });
        } else {
          const vmiVmsSaveFile = {
            ...saveFile,
            description: 'Created by savefileconverter.com',
            copyright: 'savefileconverter.com',
            resourceName: saveFile.filename, // Will be truncated from 12 -> 8 characters
          };

          const { vmiArrayBuffer, vmsArrayBuffer } = DreamcastVmiVmsSaveData.convertSaveFileToVmiVms(vmiVmsSaveFile);

          outputFileList.push(
            {
              arrayBuffer: vmiArrayBuffer,
              filename: this.outputFilenameVmi,
            },
            {
              arrayBuffer: vmsArrayBuffer,
              filename: this.outputFilenameVms,
            },
          );
        }
      } else {
        outputFileList.push({
          arrayBuffer: this.dreamcastSaveData.getArrayBuffer(),
          filename: this.outputFilename,
        });
      }

      outputFileList.forEach((outputFile) => {
        const outputBlob = new Blob([outputFile.arrayBuffer], { type: 'application/octet-stream' });

        saveAs(outputBlob, outputFile.filename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
      });
    },
  },
};

</script>
