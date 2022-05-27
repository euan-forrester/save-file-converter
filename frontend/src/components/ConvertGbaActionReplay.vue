<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Action Replay</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readActionReplaySaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert (*.xps)"
              acceptExtension=".xps"
              :leaveRoomForHelpIcon="false"
            />
          </div>
          <div v-else>
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <output-filesize v-model="outputFilesize" id="gameshark-filesize" platform="gba"/>
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
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Emulator/Raw</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <output-filesize v-model="outputFilesize" id="gameshark-filesize" platform="gba"/>
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
            class="action-replay-convert-button"
            variant="success"
            block
            :disabled="!this.actionReplaySaveData || !outputFilename"
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
            Help: how do I copy files to and from my <b-link href="https://www.youtube.com/watch?v=o7WQYnYYT6Y">Action Replay DSi</b-link> or <b-link href="http://uk.codejunkies.com/downloads/manuals/armax_gba_ds_english.pdf">Action Replay MAX DUO</b-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

.action-replay-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';
import Util from '../util/util';
import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import OutputFilesize from './OutputFilesize.vue';
import ConversionDirection from './ConversionDirection.vue';
import ActionReplaySaveData from '../save-formats/GBA/ActionReplay';

export default {
  name: 'ConvertGbaActionReplay',
  data() {
    return {
      actionReplaySaveData: null,
      errorMessage: null,
      outputFilename: null,
      outputFilesize: null,
      conversionDirection: 'convertToEmulator',
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    OutputFilesize,
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.actionReplaySaveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.outputFilesize = null;
    },
    readActionReplaySaveData(event) {
      this.errorMessage = null;
      try {
        this.actionReplaySaveData = ActionReplaySaveData.createFromActionReplayData(event.arrayBuffer);
        this.outputFilename = Util.changeFilenameExtension(event.filename, 'srm');
        this.outputFilesize = this.actionReplaySaveData.getRawSaveData().byteLength;
      } catch (e) {
        this.errorMessage = e.message;
        this.actionReplaySaveData = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      try {
        this.actionReplaySaveData = ActionReplaySaveData.createFromEmulatorData(event.arrayBuffer);
        this.outputFilename = Util.changeFilenameExtension(event.filename, 'xps');
        this.outputFilesize = this.actionReplaySaveData.getRawSaveData().byteLength;
      } catch (e) {
        this.errorMessage = e.message;
        this.actionReplaySaveData = null;
      }
    },
    convertFile() {
      if (this.actionReplaySaveData.getRawSaveData().byteLength !== this.outputFilesize) {
        this.actionReplaySaveData = ActionReplaySaveData.createWithNewSize(this.actionReplaySaveData, this.outputFilesize);
      }

      const outputArrayBuffer = (this.conversionDirection === 'convertToEmulator') ? this.actionReplaySaveData.getRawSaveData() : this.actionReplaySaveData.getArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
