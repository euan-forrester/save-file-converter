<template>
  <div>
    <b-container>
      <b-row no-gutters align-h="center" align-v="start">
        <b-col sm=12 md=5 align-self="start">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col cols=12>
              <b-jumbotron fluid :header-level="$mq | mq({ xs: 5, sm: 5, md: 5, lg: 5, xl: 4 })">
                <template v-slot:header>Flash{{'\xa0'}}cartridge</template>
              </b-jumbotron>
            </b-col>
          </b-row>
          <div v-if="this.conversionDirection === 'convertToEmulator'">
            <input-file
              @load="readFlashCartSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
            <flash-cart-type
              v-model="flashCartType"
              id="flash-cart-type"
              v-on:input="flashCartTypeChanged()"
              :disabled="false"
            />
            <div v-if="this.isSegaCd">
              <sega-cd-save-type-selector
                :value="this.segaCdSaveType"
                @change="changeSegaCdSaveType($event)"
              />
            </div>
          </div>
          <div v-else>
            <output-filename v-model="outputFilename" :leaveRoomForHelpIcon="false"/>
            <div v-if="this.displayOutputFileSize">
              <output-filesize v-model="outputFilesize" id="output-filesize" :platform="this.flashCartTypeClass.adjustOutputSizesPlatform()"/>
            </div>
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
            <div v-if="this.displayOutputFileSize">
              <output-filesize v-model="outputFilesize" id="output-filesize" :platform="this.flashCartTypeClass.adjustOutputSizesPlatform()"/>
            </div>
          </div>
          <div v-else>
            <input-file
              @load="readEmulatorSaveData($event)"
              :errorMessage="this.errorMessage"
              placeholderText="Choose a file to convert"
              :leaveRoomForHelpIcon="false"
            />
            <flash-cart-type
              v-model="flashCartType"
              id="flash-cart-type"
              v-on:input="flashCartTypeChanged()"
              :disabled="false"
            />
            <div v-if="this.isSegaCd">
              <sega-cd-save-type-selector
                :value="this.segaCdSaveType"
                @change="changeSegaCdSaveType($event)"
              />
            </div>
            <div v-if="(this.flashCartTypeClass !== null) && (this.flashCartTypeClass.requiresRomClass() !== null)">
              <input-file
                id="choose-raw-file-rom"
                @load="readRomData($event)"
                :errorMessage="null"
                :placeholderText="`Choose the ROM for this file ${getFileExtensionsString(this.flashCartTypeClass.requiresRomClass())}`"
                helpText="These save files contain some information from the corresponding ROM, and the emulator checks this information before allowing the save to be loaded.
                All processing by this website is done on your local machine, and your ROMs are not sent anywhere."
                :acceptExtension="this.flashCartTypeClass.requiresRomClass().getFileExtensions().join(',')"
                :leaveRoomForHelpIcon="true"
              />
            </div>
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-center" align-h="center">
        <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
          <b-button
            class="flash-cart-convert-button"
            variant="success"
            block
            :disabled="!this.flashCartSaveData || !this.flashCartType || !outputFilename"
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
.flash-cart-convert-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';
import Util from '../util/util';
import SegaCdUtil from '../util/SegaCd';

import InputFile from './InputFile.vue';
import OutputFilename from './OutputFilename.vue';
import OutputFilesize from './OutputFilesize.vue';
import ConversionDirection from './ConversionDirection.vue';
import FlashCartType from './FlashCartType.vue';
import SegaCdSaveTypeSelector from './SegaCdSaveTypeSelector.vue';

import GoombaEmulatorSaveData from '../save-formats/FlashCarts/GBA/GoombaEmulator';
import PocketNesEmulatorSaveData from '../save-formats/FlashCarts/GBA/PocketNesEmulator';
import SmsAdvanceEmulatorSaveData from '../save-formats/FlashCarts/GBA/SmsAdvanceEmulator';
import NesFlashCartSaveData from '../save-formats/FlashCarts/NES';
import SnesFlashCartSaveData from '../save-formats/FlashCarts/SNES';
import GenesisMegaEverdriveProGenesisFlashCartSaveData from '../save-formats/FlashCarts/Genesis/MegaEverdrivePro/Genesis';
import GenesisMegaEverdriveProSegaCdFlashCartSaveData from '../save-formats/FlashCarts/Genesis/MegaEverdrivePro/SegaCd';
import GenesisMegaEverdriveProNesFlashCartSaveData from '../save-formats/FlashCarts/Genesis/MegaEverdrivePro/NES';
import GenesisMegaEverdriveProSmsFlashCartSaveData from '../save-formats/FlashCarts/Genesis/MegaEverdrivePro/SMS';
import GenesisMegaEverdrivePro32xFlashCartSaveData from '../save-formats/FlashCarts/Genesis/MegaEverdrivePro/32X';
import GenesisMegaSdGenesisFlashCartSaveData from '../save-formats/FlashCarts/Genesis/MegaSD/Genesis';
import GenesisMegaSdSmsFlashCartSaveData from '../save-formats/FlashCarts/Genesis/MegaSD/SMS';
import GenesisMegaSd32xFlashCartSaveData from '../save-formats/FlashCarts/Genesis/MegaSD/32X';
import GbFlashCartSaveData from '../save-formats/FlashCarts/GB';
import GbaFlashCartSaveData from '../save-formats/FlashCarts/GBA/GBA';
import N64FlashCartSaveData from '../save-formats/FlashCarts/N64/N64';
import Neon64EmulatorSaveData from '../save-formats/FlashCarts/N64/Neon64Emulator';

export default {
  name: 'ConvertFlashCarts',
  data() {
    return {
      flashCartSaveData: null,
      romData: null,
      flashCartType: null,
      flashCartTypeClass: null,
      errorMessage: null,
      outputFilename: null,
      outputFilesize: null,
      conversionDirection: 'convertToEmulator',
      inputArrayBuffer: null,
      inputFilename: null,
      inputFileType: null,
      segaCdSaveType: 'internal-memory',
    };
  },
  components: {
    ConversionDirection,
    InputFile,
    OutputFilename,
    OutputFilesize,
    FlashCartType,
    SegaCdSaveTypeSelector,
  },
  computed: {
    isSegaCd: {
      get() { return (this.flashCartType === 'FlashCart-SegaCDGenesisEverdrive'); },
    },
    displayOutputFileSize: {
      get() {
        if ((this.flashCartTypeClass !== null) && (this.flashCartTypeClass.adjustOutputSizesPlatform() !== null)) {
          if (this.isSegaCd) {
            // Flash carts have fixed sizes for their RAM carts, so we don't want to adjust them.
            // Emulators may have any size
            return ((this.conversionDirection === 'convertToEmulator') && (this.segaCdSaveType === 'ram-cart'));
          }

          return true;
        }

        return false;
      },
    },
  },
  methods: {
    changeConversionDirection(newDirection) {
      this.conversionDirection = newDirection;
      this.flastCartSaveData = null;
      this.romData = null;
      this.flashCartType = null;
      this.flashCartTypeClass = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.outputFilesize = null;
      this.inputArrayBuffer = null;
      this.inputFilename = null;
      this.inputFileType = null;
      this.segaCdSaveType = 'internal-memory';
    },
    getFileExtensionsString(romFormatClass) {
      return `(${romFormatClass.getFileExtensions().map((f) => `*${f}`).join(', ')})`;
    },
    flashCartTypeChanged() {
      if (this.flashCartType !== null) {
        this.romData = null;

        switch (this.flashCartType) {
          case 'FlashCart-GoombaEmulator': {
            this.flashCartTypeClass = GoombaEmulatorSaveData;
            break;
          }

          case 'FlashCart-PocketNesEmulator': {
            this.flashCartTypeClass = PocketNesEmulatorSaveData;
            break;
          }

          case 'FlashCart-SMSAdvanceEmulator': {
            this.flashCartTypeClass = SmsAdvanceEmulatorSaveData;
            break;
          }

          case 'FlashCart-NES': {
            this.flashCartTypeClass = NesFlashCartSaveData;
            break;
          }

          case 'FlashCart-SNES': {
            this.flashCartTypeClass = SnesFlashCartSaveData;
            break;
          }

          case 'FlashCart-GenesisEverdrive': {
            this.flashCartTypeClass = GenesisMegaEverdriveProGenesisFlashCartSaveData;
            break;
          }

          case 'FlashCart-SegaCDGenesisEverdrive': {
            this.flashCartTypeClass = GenesisMegaEverdriveProSegaCdFlashCartSaveData;
            break;
          }

          case 'FlashCart-NESGenesisEverdrive': {
            this.flashCartTypeClass = GenesisMegaEverdriveProNesFlashCartSaveData;
            break;
          }

          case 'FlashCart-SMSGenesisEverdrive': {
            this.flashCartTypeClass = GenesisMegaEverdriveProSmsFlashCartSaveData;
            break;
          }

          case 'FlashCart-32XGenesisEverdrive': {
            this.flashCartTypeClass = GenesisMegaEverdrivePro32xFlashCartSaveData;
            break;
          }

          case 'FlashCart-GenesisMegaSD': {
            this.flashCartTypeClass = GenesisMegaSdGenesisFlashCartSaveData;
            break;
          }

          case 'FlashCart-SMSGenesisMegaSD': {
            this.flashCartTypeClass = GenesisMegaSdSmsFlashCartSaveData;
            break;
          }

          case 'FlashCart-32XGenesisMegaSD': {
            this.flashCartTypeClass = GenesisMegaSd32xFlashCartSaveData;
            break;
          }

          case 'FlashCart-GB': {
            this.flashCartTypeClass = GbFlashCartSaveData;
            break;
          }

          case 'FlashCart-GBA': {
            this.flashCartTypeClass = GbaFlashCartSaveData;
            break;
          }

          case 'FlashCart-N64': {
            this.flashCartTypeClass = N64FlashCartSaveData;
            break;
          }

          case 'FlashCart-Neon64Emulator': {
            this.flashCartTypeClass = Neon64EmulatorSaveData;
            break;
          }

          default: {
            this.flashCartTypeClass = null;
            break;
          }
        }
      } else {
        this.flashCartTypeClass = null;
      }

      this.segaCdSaveType = this.getDefaultSegaCdSaveType();
      this.updateFlashCartSaveData();
    },
    changeSegaCdSaveType(newSaveType) {
      this.segaCdSaveType = newSaveType;

      this.updateFlashCartSaveData();
    },
    readRomData(event) {
      this.romData = event.arrayBuffer;
      this.segaCdSaveType = this.getDefaultSegaCdSaveType();

      this.updateFlashCartSaveData();
    },
    hasRequiredRomData() {
      return (this.flashCartTypeClass !== null) && ((this.flashCartTypeClass.requiresRomClass() === null) || (this.romData !== null));
    },
    hasRequiredInputFileData() {
      return (this.inputArrayBuffer !== null) && (this.inputFilename !== null) && (this.inputFileType !== null);
    },
    getOutputFilename(inputFilename, fileExtension) {
      if (fileExtension !== null) {
        return Util.changeFilenameExtension(inputFilename, fileExtension);
      }

      return inputFilename;
    },
    getFlashCartInput() {
      if (this.isSegaCd) {
        return (this.segaCdSaveType === 'internal-memory') ? { flashCartInternalSaveArrayBuffer: this.inputArrayBuffer } : { flashCartRamCartSaveArrayBuffer: this.inputArrayBuffer };
      }

      return this.inputArrayBuffer;
    },
    getRawInput() {
      if (this.isSegaCd) {
        return (this.segaCdSaveType === 'internal-memory') ? { rawInternalSaveArrayBuffer: this.inputArrayBuffer } : { rawRamCartSaveArrayBuffer: this.inputArrayBuffer };
      }

      return this.inputArrayBuffer;
    },
    getFlashCartFilename() {
      if (this.isSegaCd) {
        return this.flashCartTypeClass.getFlashCartFileName(this.segaCdSaveType);
      }

      return this.getOutputFilename(this.inputFilename, this.flashCartTypeClass.getFlashCartFileExtension());
    },
    getRawFilename() {
      if (this.isSegaCd) {
        const filenameSuffix = (this.segaCdSaveType === 'internal-memory') ? ' - internal memory' : ' - ram cartridge';

        return `${Util.removeFilenameExtension(this.inputFilename)}${filenameSuffix}.${this.flashCartTypeClass.getRawFileExtension()}`;
      }

      return this.getOutputFilename(this.inputFilename, this.flashCartTypeClass.getRawFileExtension());
    },
    getDefaultOutputFilesize() {
      if (this.isSegaCd) {
        // All flash cart types have the same internal memory size

        if (this.segaCdSaveType === 'internal-memory') {
          return SegaCdUtil.INTERNAL_SAVE_SIZE;
        }

        // RAM cart, so ask the class the default size

        if (this.inputFileType === 'flashcart') {
          return this.flashCartTypeClass.getRawDefaultRamCartSize();
        }

        return this.flashCartTypeClass.getFlashCartDefaultRamCartSize();
      }

      return this.flashCartSaveData.getRawArrayBuffer().byteLength;
    },
    getDefaultSegaCdSaveType() {
      if (this.isSegaCd) {
        if ((this.inputArrayBuffer !== null) && (this.inputArrayBuffer.byteLength > SegaCdUtil.INTERNAL_SAVE_SIZE)) {
          return 'ram-cart';
        }
      }

      return 'internal-memory';
    },
    updateFlashCartSaveData() {
      this.errorMessage = null;

      if ((this.flashCartTypeClass !== null) && ((this.inputFileType === 'flashcart') || this.hasRequiredRomData()) && this.hasRequiredInputFileData()) {
        try {
          if (this.inputFileType === 'flashcart') {
            this.flashCartSaveData = this.flashCartTypeClass.createFromFlashCartData(this.getFlashCartInput());
            this.outputFilename = this.getRawFilename();
          } else {
            this.flashCartSaveData = this.flashCartTypeClass.createFromRawData(this.getRawInput(), this.romData);
            this.outputFilename = this.getFlashCartFilename();
          }
          this.outputFilesize = this.getDefaultOutputFilesize();
        } catch (e) {
          this.errorMessage = 'This file does not seem to be in the correct format';
          this.flashCartSaveData = null;
          this.outputFilename = null;
          this.segaCdSaveType = 'internal-memory';
        }
      } else {
        this.flashCartSaveData = null;
        this.outputFilename = null;
      }
    },
    readFlashCartSaveData(event) {
      this.inputFileType = 'flashcart';
      this.inputArrayBuffer = event.arrayBuffer;
      this.inputFilename = event.filename;
      this.segaCdSaveType = this.getDefaultSegaCdSaveType();

      this.updateFlashCartSaveData();
    },
    readEmulatorSaveData(event) {
      this.inputFileType = 'raw';
      this.inputArrayBuffer = event.arrayBuffer;
      this.inputFilename = event.filename;
      this.segaCdSaveType = this.getDefaultSegaCdSaveType();

      this.updateFlashCartSaveData();
    },
    convertFile() {
      let needsResize = false;

      if (this.isSegaCd) {
        needsResize = this.flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART).byteLength !== this.outputFilesize;
      } else {
        needsResize = this.flashCartSaveData.getRawArrayBuffer().byteLength !== this.outputFilesize;
      }

      if (needsResize) {
        this.flashCartSaveData = this.flashCartTypeClass.createWithNewSize(this.flashCartSaveData, this.outputFilesize);
      }

      let output = null;

      if (this.conversionDirection === 'convertToEmulator') {
        if (this.isSegaCd) {
          output = this.flashCartSaveData.getRawArrayBuffer(this.segaCdSaveType);
        } else {
          output = this.flashCartSaveData.getRawArrayBuffer();
        }
      } else {
        if (this.isSegaCd) { // eslint-disable-line no-lonely-if
          output = this.flashCartSaveData.getFlashCartArrayBuffer(this.segaCdSaveType);
        } else {
          output = this.flashCartSaveData.getFlashCartArrayBuffer();
        }
      }

      const outputBlob = new Blob([output], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename);
    },
  },
};

</script>
