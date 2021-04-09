<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="center">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 4 })">
                <template v-slot:header>GameShark</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readGameSharkSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
            />
          </div>
          <div v-else>
            <output-filename v-model="outputFilename"/>
            <output-filesize v-model="outputFilesize"/>
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
              <b-jumbotron :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 4 })">
                <template v-slot:header>Emulator/Raw</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <output-filename v-model="outputFilename"/>
            <output-filesize v-model="outputFilesize"/>
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
            />
            <input-file
              @load="readRomData($event)"
              :errorMessage="null"
              placeholderText="Choose the ROM for this file"
            />
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="convert-button"
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
            Help: how do I&nbsp;<b-link href="https://gamehacking.org/vb/forum/video-game-hacking-and-development/school-of-hacking/14153-gameshark-advance-and-color-save-backup">copy files to and from my GameShark</b-link>?
          </div>
          <div class="help">
            Help: how do I copy save files to and from a GBA cartridge?<br><b-link href="https://github.com/FIX94/gba-link-cable-dumper">GBA + GameCube/Wii + link cable</b-link> or <b-link href="https://www.gc-forever.com/wiki/index.php?title=Game_Boy_Interface#GBA_dumper">GameCube + GameBoy Player</b-link> or <b-link href="https://projectpokemon.org/home/tutorials/save-editing/managing-gba-saves/using-gba-backup-tool-r55/">Nintendo DS</b-link> or <router-link to="/retron-5">Retron 5</router-link>
          </div>
          <div class="help">
            Help: how do I run homebrew software on my <b-link href="https://www.gc-forever.com/wiki/index.php?title=Booting_Homebrew">GameCube</b-link>, <b-link href="https://wii.guide">Wii</b-link>, or <b-link href="https://www.google.com/search?q=best+r4+card+no+timebomb">Nintendo DS</b-link>?
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped>

.convert-button {
  margin-top: 15px;
}

.help {
  margin-top: 30px;
}
</style>

<script>
import path from 'path';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import OutputFilesize from './OutputFilesize.vue';
import ConversionDirection from './ConversionDirection.vue';
import GameSharkSaveData from '../save-formats/GameShark';

export default {
  name: 'ConvertGameShark',
  data() {
    return {
      gameSharkSaveData: null,
      romData: null,
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
      this.gameSharkSaveData = null;
      this.romData = null;
      this.errorMessage = null;
      this.outputFilename = null;
    },
    changeFilenameExtension(filename, newExtension) {
      return `${path.basename(filename, path.extname(filename))}.${newExtension}`;
    },
    removeFilenameExtension(filename) {
      return `${path.basename(filename, path.extname(filename))}`;
    },
    readRomData(event) {
      this.romData = event.arrayBuffer;
    },
    readGameSharkSaveData(event) {
      this.errorMessage = null;
      try {
        this.gameSharkSaveData = GameSharkSaveData.createFromGameSharkData(event.arrayBuffer);
        this.outputFilename = this.changeFilenameExtension(event.filename, 'sav');
        this.outputFilesize = this.gameSharkSaveData.getRawSaveData().byteLength;
      } catch (e) {
        this.errorMessage = e.message;
        this.gameSharkSaveData = null;
        this.outputFilename = null;
        this.outputFilesize = null;
      }
    },
    readEmulatorSaveData(event) {
      this.errorMessage = null;
      try {
        const title = this.removeFilenameExtension(event.filename);
        const date = dayjs().format('DD/MM/YYYY hh:mm:ss a');
        const notes = 'Created with savefileconverter.com';
        this.gameSharkSaveData = GameSharkSaveData.createFromEmulatorData(event.arrayBuffer, title, date, notes, this.romData);
        this.outputFilename = this.changeFilenameExtension(event.filename, 'sps');
        this.outputFilesize = this.gameSharkSaveData.getRawSaveData().byteLength;
      } catch (e) {
        this.errorMessage = e.message;
        this.gameSharkSaveData = null;
        this.outputFilename = null;
        this.outputFilesize = null;
      }
    },
    convertFile() {
      if (this.gameSharkSaveData.getRawSaveData().byteLength !== this.outputFilesize) {
        this.gameSharkSaveData = GameSharkSaveData.createWithNewSize(this.gameSharkSaveData, this.outputFilesize);
      }

      const outputArrayBuffer = (this.conversionDirection === 'convertToEmulator') ? this.gameSharkSaveData.getRawSaveData() : this.gameSharkSaveData.getArrayBuffer();

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
