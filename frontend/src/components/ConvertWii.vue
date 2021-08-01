<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Wii VC</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readWiiSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.bin)"
              acceptExtension=".bin"
              :leaveRoomForHelpIcon="false"
            />
            <wii-vc-platform
              v-model="outputPlatform"
              id="platform"
              v-on:input="outputPlatformChanged()"
              :errorMessage="this.platformErrorMessage"
              :disabled="this.currentlyLoadingPlatform"
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
            disableDirection="convertToRetron5"
            @change="changeConversionDirection($event)"
            id="conversion-direction"
          />
          <b-popover target="conversion-direction" triggers="focus hover" placement="bottom">
            We can currently only extract the raw save from Wii Virtual Console files.
            If converting raw saves to Wii Virtual Console files is important to you, please let us know! Contact info on the About / Contact page.
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
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="convert-button wii-convert-button"
            variant="success"
            block
            :disabled="!this.outputSaveData || !this.outputFilename || !this.outputPlatform"
            @click="convertFile()"
          >
          <div v-if="this.currentlyLoadingPlatform">
            <b-spinner small />
          </div>
          <div v-else class="wii-convert-button">
            Convert!
          </div>
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            Help: how do I copy files&nbsp;<b-link href="https://en-americas-support.nintendo.com/app/answers/detail/a_id/2709/~/how-to-move-data-from-the-wii-to-an-sd-card">from my Nintendo Wii</b-link>, or&nbsp;<b-link href="https://en-americas-support.nintendo.com/app/answers/detail/a_id/2723/~/how-to-copy-save-data-to-the-wii-from-an-sd-card">to my Nintendo Wii</b-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.convert-button {
  margin-top: 1em;
}

/* Needs to be used in 2 places: on the button itself and on the div containing the Convert! text, so that Google Tag Manager can pick it up properly
   So, it contains nothing and we have a separate class above to do the spacing */
.wii-convert-button {

}

.help {
  margin-top: 1em;
}
</style>

<script>
import path from 'path';
import { saveAs } from 'file-saver';
import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import ConversionDirection from './ConversionDirection.vue';
import WiiVcPlatform from './WiiVcPlatform.vue';
import WiiSaveData from '../save-formats/Wii/Wii';
import GetPlatform from '../save-formats/Wii/GetPlatform';
import ConvertFromPlatform from '../save-formats/Wii/ConvertFromPlatform';
import getHttpClient from '../save-formats/Wii/HttpClient';

const getPlatform = new GetPlatform(getHttpClient(GetPlatform.getBaseUrl()));

export default {
  name: 'ConvertWii',
  data() {
    return {
      outputSaveData: null,
      errorMessage: null,
      platformErrorMessage: null,
      outputFilename: null,
      outputPlatform: null,
      currentlyLoadingPlatform: null,
      conversionDirection: 'convertToEmulator',
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    WiiVcPlatform,
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.outputSaveData = null;
      this.errorMessage = null;
      this.platformErrorMessage = null;
      this.outputFilename = null;
      this.outputPlatform = null;
      this.currentlyLoadingPlatform = false;
      this.wiiSaveData = null;
      this.inputFilename = null;
    },
    changeFilenameExtension(filename, newExtension) {
      return `${path.basename(filename, path.extname(filename))}.${newExtension}`;
    },
    async readWiiSaveData(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      this.outputSaveData = null;
      this.outputPlatform = null;
      this.currentlyLoadingPlatform = false;
      this.wiiSaveData = null;
      this.inputFilename = null;
      try {
        this.wiiSaveData = WiiSaveData.createFromWiiData(event.arrayBuffer);

        if (this.wiiSaveData.getNumberOfFiles() === 0) {
          throw new Error('No save data found within file');
        }

        this.inputFilename = event.filename;

        this.currentlyLoadingPlatform = true;
        const platform = await getPlatform.get(this.wiiSaveData.getGameId());
        this.currentlyLoadingPlatform = false;

        if (platform !== GetPlatform.unknownPlatform()) {
          this.outputPlatform = platform; // Triggers outputPlatformChanged()
        } else {
          this.platformErrorMessage = 'Unable to automatically determine the platform for this save. Please select it manually.';
        }
      } catch (e) {
        this.errorMessage = e.message;
        this.outputSaveData = null;
        this.outputFilename = null;
        this.outputPlatform = null;
        this.currentlyLoadingPlatform = false;
        this.wiiSaveData = null;
        this.inputFilename = null;
      }
    },
    outputPlatformChanged() {
      this.platformErrorMessage = null;
      if ((this.wiiSaveData !== null) && (this.outputPlatform !== null)) {
        try {
          const convertedSaveData = ConvertFromPlatform(this.wiiSaveData.getFiles()[0].data, this.outputPlatform); // Potentially there are more files within the file the user gave us. But, what do we name them if we're going to upload them? Maybe just punt on this and only upload the first one and see if there's ever an example where this is a problem

          this.outputSaveData = convertedSaveData.saveData;
          this.outputFilename = this.changeFilenameExtension(this.inputFilename, convertedSaveData.fileExtension);
        } catch (e) {
          this.platformErrorMessage = 'This file does not appear to match the selected platform';
          this.outputSaveData = null;
          this.outputFilename = null;
        }
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      try {
        this.wiiSaveData = WiiSaveData.createFromEmulatorData(event.arrayBuffer);
        this.outputFilename = this.changeFilenameExtension(event.filename, 'bin');
      } catch (e) {
        this.errorMessage = e.message;
        this.outputSaveData = null;
        this.outputPlatform = null;
      }
    },
    convertFile() {
      if (this.conversionDirection === 'convertToEmulator') {
        const outputBlob = new Blob([this.outputSaveData], { type: 'application/octet-stream' });

        saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
      } else {
        const outputBlob = new Blob([this.wiiSaveData.getArrayBuffer()], { type: 'application/octet-stream' });

        saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
      }
    },
  },
};

</script>
