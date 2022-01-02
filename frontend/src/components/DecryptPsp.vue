<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
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
              placeholderText="Choose a file to decrypt"
              :leaveRoomForHelpIcon="false"
            />
            <input-file
              @load="readGamekeyFile($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose your game key file"
              :leaveRoomForHelpIcon="false"
            />
          </div>
          <div v-else>
            <output-filename
              v-model="outputFilename"
              :leaveRoomForHelpIcon="true"
              id="output-filename-encrypted"
              helpText="Be sure to set the same filename here as the original encrypted file created by your PSP or emulator.
              This filename is baked into the PARAM.SFO file that you will download in addition to the encrypted file.
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
              placeholderText="Choose a file to encrypt"
              :leaveRoomForHelpIcon="false"
            />
            <input-file
              @load="readParamSfoFile($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose the PARAM.SFO file"
              acceptExtension=".SFO"
              :leaveRoomForHelpIcon="false"
            />
            <input-file
              @load="readGamekeyFile($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose your game key file"
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
            :disabled="!this.hasEnoughInfoToConvertFile()"
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
      pspDataArrayBuffer: null,
      paramSfoArrayBuffer: null,
      gamekeyArrayBuffer: null,
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
      this.pspDataArrayBuffer = null;
      this.paramSfoArrayBuffer = null;
      this.gamekeyArrayBuffer = null;
      this.errorMessage = null;
      this.outputFilename = null;
    },
    readGamekeyFile(event) {
      this.gamekeyArrayBuffer = event.arrayBuffer;
      this.errorMessage = null;
    },
    readParamSfoFile(event) {
      this.paramSfoArrayBuffer = event.arrayBuffer;
      this.errorMessage = null;
    },
    readEncryptedSaveData(event) {
      this.pspDataArrayBuffer = event.arrayBuffer;
      this.outputFilename = Util.appendToFilename(event.filename, '_decrypted');
      this.errorMessage = null;
    },
    readUnencryptedSaveData(event) {
      this.pspDataArrayBuffer = event.arrayBuffer;
      this.outputFilename = null;
      this.errorMessage = null;
    },
    hasEnoughInfoToConvertFile() {
      if (this.conversionDirection === 'convertToEmulator') {
        // Decrypting
        return this.pspDataArrayBuffer && this.gamekeyArrayBuffer && this.outputFilename;
      }

      // Encrypting
      return this.pspDataArrayBuffer && this.gamekeyArrayBuffer && this.outputFilename && this.paramSfoArrayBuffer;
    },
    convertFile() {
      try {
        if (this.conversionDirection === 'convertToEmulator') {
          // Decrypting

          const pspSaveData = PspSaveData.createFromEncryptedData(this.pspDataArrayBuffer, this.gamekeyArrayBuffer);

          const outputBlob = new Blob([pspSaveData.getUnencryptedArrayBuffer()], { type: 'application/octet-stream' });

          saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
        } else {
          // Encrypting

          const pspSaveData = PspSaveData.createFromUnencryptedData(this.pspDataArrayBuffer, Util.getFilename(this.outputFilename), this.paramSfoArrayBuffer, this.gamekeyArrayBuffer);

          const outputBlobEncrypted = new Blob([pspSaveData.getEncryptedArrayBuffer()], { type: 'application/octet-stream' });

          saveAs(outputBlobEncrypted, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101

          const outputBlobParamSfo = new Blob([pspSaveData.getParamSfoArrayBuffer()], { type: 'application/octet-stream' });

          saveAs(outputBlobParamSfo, 'PARAM.SFO'); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
        }
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
  },
};

</script>
