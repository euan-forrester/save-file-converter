<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Save state</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <input-file
            @load="readOnlineEmulatorData($event)"
            :errorMessage="this.errorMessage"
            placeholderText="Choose a file to convert"
            :leaveRoomForHelpIcon="false"
          />
          <online-emulator-platform
            v-model="platformType"
            id="platform-type"
            :disabled="false"
            v-on:input="changePlatformType($event)"
          />
          <file-list
            :display="this.displayFileList"
            :files="this.getFileListNames()"
            v-model="selectedSaveData"
            @change="changeSelectedSaveData($event)"
          />
        </b-col>
        <b-col sm=12 md=2 lg=2 xl=2 align-self="start">
          <conversion-direction
            :horizontalLayout="['md', 'lg', 'xl']"
            :verticalLayout="['xs', 'sm']"
            conversionDirection="convertToRaw"
            disableDirection="convertToFormat"
            id="conversion-direction"
          />
          <b-popover target="conversion-direction" triggers="focus hover" placement="bottom">
            It is only possible to extract an in-game save from the save state files of some online emulators.
            It isn't possible to create a new save state, nor possible to convert a save state to another emulator.
          </b-popover>
        </b-col>
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Emulator/Raw</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
          <div v-if="this.displayOutputFileSize">
            <output-filesize
              v-model="outputFilesize"
              id="output-filesize"
              :platform="this.platformType"
              @input="changeSelectedOutputFileSize($event)"
              overrideHelpText="To determine the correct file size please create a test save with the emulator, flash cart, core, etc. that you wish to use.
                For some platforms, incorrect data will be pulled from the save state if the size is not set correctly."
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="online-emulator-convert-button"
            variant="success"
            block
            :disabled="!this.hasSufficientInfoToConvert || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            Please note that you must perform an in-game save in the emulator before creating/downloading a save state. Only the in-game save can be converted.
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.online-emulator-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}
</style>

<script>
import { BPopover } from 'bootstrap-vue';
import { saveAs } from 'file-saver';
import Util from '../util/util';

import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import OutputFilesize from './OutputFilesize.vue';
import ConversionDirection from './ConversionDirection.vue';
import OnlineEmulatorPlatform from './OnlineEmulatorPlatform.vue';
import FileList from './FileList.vue';

import OnlineEmulatorWrapper from '../save-formats/OnlineEmulators/OnlineEmulatorWrapper';

export default {
  name: 'ConvertOnlineEmulator',
  data() {
    return {
      onlineEmulatorWrapper: null,
      platformType: null,
      errorMessage: null,
      outputFilename: null,
      outputFilesize: null,
      inputArrayBuffer: null,
      inputFilename: null,
      selectedSaveData: null,
    };
  },
  components: {
    BPopover,
    ConversionDirection,
    InputFile,
    OutputFilename,
    OutputFilesize,
    OnlineEmulatorPlatform,
    FileList,
  },
  asyncComputed: {
    displayOutputFileSize: {
      async get() {
        try {
          return (
            ((this.onlineEmulatorWrapper !== null) && (this.onlineEmulatorWrapper.adjustOutputSizesPlatform() !== null))
            || await this.fileSizeIsRequiredToConvert()
          );
        } catch (e) {
          return false;
        }
      },
      default: false,
    },
  },
  computed: {
    displayFileList: {
      get() {
        return ((this.onlineEmulatorWrapper !== null) && (this.onlineEmulatorWrapper.getFiles().length > 1));
      },
    },
  },
  methods: {
    async fileSizeIsRequiredToConvert() {
      return (this.inputArrayBuffer !== null)
        && (this.platformType !== null)
        && OnlineEmulatorWrapper.fileSizeIsRequiredToConvert(this.inputArrayBuffer, this.platformType);
    },
    async hasSufficientInfoToConvert() {
      return this.onlineEmulatorWrapper && this.platformType && (!this.fileSizeIsRequiredToConvert() || (this.outputFilesize !== null));
    },
    getFileListNames() {
      if ((this.onlineEmulatorWrapper !== null) && (this.onlineEmulatorWrapper.getFiles() !== null)) {
        return this.onlineEmulatorWrapper.getFiles().map(
          (x) => ({
            displayText: x.name,
          }),
        );
      }

      return [];
    },
    getFileExtensionsString(romFormatClass) {
      return `(${romFormatClass.getFileExtensions().map((f) => `*${f}`).join(', ')})`;
    },
    async hasRequiredInputFileData() {
      const fileSizeIsRequiredToConvert = await this.fileSizeIsRequiredToConvert();

      return (this.inputArrayBuffer !== null)
        && (this.inputFilename !== null)
        && (this.platformType !== null)
        && (!fileSizeIsRequiredToConvert || (this.outputFilesize !== null));
    },
    getOutputFilename(fileExtension) {
      if ((this.onlineEmulatorWrapper !== null) && (this.onlineEmulatorWrapper.getFiles().length > 0) && (this.selectedSaveData !== null)) {
        const filename = this.onlineEmulatorWrapper.getFiles()[this.selectedSaveData].name;

        if (fileExtension !== null) {
          return Util.changeFilenameExtension(filename, fileExtension);
        }

        return filename;
      }

      return null;
    },
    getSelectedSaveData() {
      return this.onlineEmulatorWrapper.getFiles()[this.selectedSaveData].emulatorSaveStateData;
    },
    changeSelectedSaveData() {
      this.outputFilename = this.getOutputFilename(OnlineEmulatorWrapper.getRawFileExtension());
    },
    async changeSelectedOutputFileSize() {
      // Here we don't reset this.selectedSaveData to null: if we can we want to retain which
      // save data the user has selected, since we're only updating the size
      this.updateOnlineEmulatorWrapper();
    },
    async changePlatformType() {
      this.onlineEmulatorWrapper = null;
      this.selectedSaveData = null; // We don't want to retain which file the user has selected if we're changing platforms
      this.updateOnlineEmulatorWrapper();
    },
    getDefaultOutputFilesize() {
      return this.getSelectedSaveData().getRawArrayBuffer().byteLength;
    },
    async updateOnlineEmulatorWrapper() {
      this.errorMessage = null;

      try {
        const hasRequiredInputFileData = await this.hasRequiredInputFileData();

        if (hasRequiredInputFileData) {
          // If we already have one, don't remake it. This can happen when loading a snes file, then selecting a different size.
          // Remaking the OnlineEmulatorWrapper will result in resetting out outputFilesize to be the default

          // Except that we need to continually remake it if the size is necessary, like the gba, because it means getting the data
          // from a different part of the save state. If the user keeps selecting different file sizes it's almost certainly because
          // they picked the wrong one initially. We have the ability to resize the save (to pad or truncate it) after the user selects
          // the correct one, but we'd need to make a different user flow to support that.
          if ((this.onlineEmulatorWrapper === null) || this.fileSizeIsRequiredToConvert()) {
            this.onlineEmulatorWrapper = await OnlineEmulatorWrapper.createFromEmulatorData(this.inputArrayBuffer, this.inputFilename, this.platformType, this.outputFilesize);

            if ((this.selectedSaveData === null) || (this.selectedSaveData < 0) || (this.selectedSaveData > this.onlineEmulatorWrapper.getFiles().length)) {
              this.selectedSaveData = 0;
            }

            this.outputFilename = this.getOutputFilename(OnlineEmulatorWrapper.getRawFileExtension());
            this.outputFilesize = this.getDefaultOutputFilesize();
          }
        } else {
          this.onlineEmulatorWrapper = null;
          this.outputFilename = null;
          this.outputFilesize = null;
          this.selectedSaveData = null;
        }
      } catch (e) {
        this.errorMessage = 'This file does not appear to be a save state that this site is able to currently support. '
          + 'If this is a save state from an online emulator and you would like to request adding support for it, please visit the Discord / Contact page.';
        this.onlineEmulatorWrapper = null;
      }
    },
    async readOnlineEmulatorData(event) {
      this.inputArrayBuffer = event.arrayBuffer;
      this.inputFilename = event.filename;

      this.onlineEmulatorWrapper = null;

      // We need to force the user to re-select the platform type, and especially the output file size, with every new
      // file they specify. Otherwise, if we first had a platform type like snes, which automatically fills in the output file size,
      // then a platform type like gba, which requires it, the user might not realize that they needed to be careful with
      // what gba file size they specified, since different file sizes come from different parts of the input file. Then the user
      // will think that the conversion "didn't work".
      this.platformType = null;
      this.outputFilesize = null;

      this.selectedSaveData = null; // When they select a new file, they should re-select which save data within it

      this.updateOnlineEmulatorWrapper();
    },
    convertFile() {
      let finalOnlineEmulatorWrapper = this.onlineEmulatorWrapper;

      const needsResize = (this.getSelectedSaveData().getRawArrayBuffer().byteLength !== this.outputFilesize);

      if (needsResize) {
        finalOnlineEmulatorWrapper = OnlineEmulatorWrapper.createWithNewSize(this.onlineEmulatorWrapper, this.outputFilesize);
      }

      const output = finalOnlineEmulatorWrapper.getFiles()[this.selectedSaveData].emulatorSaveStateData.getRawArrayBuffer();

      const outputBlob = new Blob([output], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename);
    },
  },
};

</script>
