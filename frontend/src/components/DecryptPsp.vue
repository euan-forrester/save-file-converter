<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>PSP encrypted</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readEncryptedSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to decrypt (*.BIN)"
              acceptExtension=".BIN"
              :leaveRoomForHelpIcon="false"
            />
          </div>
          <div v-else>
            <output-filename
              v-model="outputFilename"
              :leaveRoomForHelpIcon="true"
              id="output-filename-encrypted"
              helpText="Be sure to set the same filename here as the original encrypted file created by your PSP or emulator:
              this filename is baked into the PARAM.SFO file that you will download in addition to the encrypted file.
              Please copy both the new encrypted file and new PARAM.SFO over top of the corresponding files on your PSP or created by your emulator."
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
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>PSP decrypted</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
          </div>
          <div v-else>
            <input-file
              @load="readUnencryptedSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to encrypt (*.BIN)"
              acceptExtension=".BIN"
              :leaveRoomForHelpIcon="false"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="psp-encryption-button"
            variant="success"
            block
            :disabled="!this.pspSaveData || !outputFilename"
            @click="convertFile()"
          >
          Convert!
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="help">
            Help: how do I&nbsp;<b-link href="https://www.wikihow.com/Put-Game-Saves-on-Your-PSP">copy save files to and from my PSP</b-link>?
          </div>
          <div class="help">
            Help: how do I&nbsp;<b-link href="https://psp.brewology.com/downloads/download.php?id=13861&mcid=1">get a game key file for a particular game</b-link>?
          </div>
          <div class="help">
            Help: how do I&nbsp;<b-link href="https://forums.afterdawn.com/threads/guide-how-to-install-plugins-on-a-psp-includes-on-how-to-install-two-or-more.657638/">install a plugin on my PSP</b-link>?
          </div>
          <div class="help">
            Help: how do I&nbsp;<b-link href="https://revive.today/psp/cfw/">install custom firmware on my PSP</b-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

/* Separate class for each different button to enable tracking in google tag manager */
.psp-encryption-button {
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
import ConversionDirection from './ConversionDirection.vue';
import PspSaveData from '../save-formats/PSP/Savefile';

export default {
  name: 'DecryptPsp',
  data() {
    return {
      pspSaveData: null,
      errorMessage: null,
      outputFilename: null,
      conversionDirection: 'convertToEmulator',
    };
  },
  async mounted() {
    await PspSaveData.init();
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.pspSaveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
    },
    async readEncryptedSaveData(event) {
      this.errorMessage = null;
      try {
        this.pspSaveData = await PspSaveData.createFromEncryptedData(event.arrayBuffer, Buffer.from('01020304050607080900010203040506', 'hex'));
        this.outputFilename = Util.appendToFilename(event.filename, '_decrypted');
      } catch (e) {
        this.errorMessage = e.message;
        this.pspSaveData = null;
      }
    },
    async readUnencryptedSaveData(event) {
      this.errorMessage = null;
      try {
        this.pspSaveData = await PspSaveData.createFromUnencryptedData(event.arrayBuffer, Buffer.from('01020304050607080900010203040506', 'hex'));
        this.outputFilename = Util.appendToFilename(event.filename, '_encrypted');
      } catch (e) {
        this.errorMessage = e.message;
        this.pspSaveData = null;
      }
    },
    convertFile() {
      const outputArrayBuffer = (this.conversionDirection === 'convertToEmulator') ? this.pspSaveData.getUnencryptedArrayBuffer() : this.pspSaveData.getEncryptedArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
