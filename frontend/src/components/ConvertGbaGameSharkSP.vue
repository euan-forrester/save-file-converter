<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>GameShark{{'\xa0'}}SP</template> <!-- Not sure why &nbsp; doesn't work here, but this does -->
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'" class="inputs-row">
            <input-file
              id="choose-gameshark-file"
              @load="readGameSharkSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.gsv)"
              acceptExtension=".gsv"
              :leaveRoomForHelpIcon="false"
            />
          </div>
          <div v-else class="inputs-row">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="true"/>
            <output-filesize v-model="outputFilesize" id="gameshark-filesize"/>
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
            Not enough is known about GameShark SP saves to be able to write out a file in this format. We can currently only extract the raw save from these files.
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
          <div v-if="this.conversionDirection === 'convertToEmulator'" class="inputs-row">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="true"/>
            <output-filesize v-model="outputFilesize" id="raw-filesize"/>
          </div>
          <div v-else class="inputs-row">
            <input-file
              id="choose-raw-file"
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="true"
            />
            <input-file
              id="choose-raw-file-rom"
              @load="readRomData($event)"
              :errorMessage="null"
              placeholderText="Choose the ROM for this file (*.gba)"
              helpText="GameShark SP save files contain some information from the corresponding ROM, and some emulators check this information before allowing the save to be loaded.
              All processing by this website is done on your local machine, and your ROMs are not sent anywhere."
              acceptExtension=".gba"
              :leaveRoomForHelpIcon="true"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="gameshark-sp-convert-button"
            variant="success"
            block
            :disabled="!this.gameSharkSaveData || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            Help: how can I <router-link to="/original-hardware?sort=gba">copy save files to and from a GBA cartridge</router-link>?
          </div>
          <div class="help">
            Help: how do I <b-link href="https://www.manualslib.com/manual/515605/Mad-Catz-Gameshark-Sp.html?page=17#manual">copy save files to and from my GameShark SP</b-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.gameshark-sp-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}

.inputs-row {
  min-height: 4.8em;
}

</style>

<script>
import { BPopover } from 'bootstrap-vue';
import { saveAs } from 'file-saver';
import Util from '../util/util';
import SaveFilesUtil from '../util/SaveFiles';
import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import OutputFilesize from './OutputFilesize.vue';
import ConversionDirection from './ConversionDirection.vue';
import GameSharkSpSaveData from '../save-formats/GBA/GameSharkSP';

export default {
  name: 'ConvertGbaGameSharkSP',
  data() {
    return {
      gameSharkSaveData: null,
      romData: null,
      emulatorSaveData: null,
      emulatorSaveDataFilename: null,
      errorMessage: null,
      outputFilename: null,
      outputFilesize: null,
      conversionDirection: 'convertToEmulator',
    };
  },
  components: {
    BPopover,
    ConversionDirection,
    InputFile,
    OutputFilename,
    OutputFilesize,
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.gameSharkSaveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.outputFilesize = null;
    },
    readGameSharkSaveData(event) {
      this.errorMessage = null;
      try {
        this.gameSharkSaveData = GameSharkSpSaveData.createFromGameSharkSpData(event.arrayBuffer);
        this.outputFilename = Util.changeFilenameExtension(event.filename, 'srm');
        this.outputFilesize = this.gameSharkSaveData.getRawSaveData().byteLength;
      } catch (e) {
        this.errorMessage = e.message;
        this.gameSharkSaveData = null;
        this.outputFilename = null;
        this.outputFilesize = null;
      }
    },
    convertFile() {
      let outputArrayBuffer = this.gameSharkSaveData.getRawSaveData();

      if (outputArrayBuffer.byteLength !== this.outputFilesize) {
        outputArrayBuffer = SaveFilesUtil.resizeRawSave(outputArrayBuffer, this.outputFilesize);
      }

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
