<template>
  <div>
    <b-container>
      <b-tabs v-model="tabIndex" content-class="mt-3" justified>

        <b-tab :title="'Endian\xa0swap'">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <endianness-word-size
                id="endianness-word-size"
                class="top-row"
                v-model="endianWordSize"
                @input="changeEndianWordSize($event)"
              />
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <input-file
                @load="readDataToEndianSwap($event)"
                :errorMessage="this.errorMessage"
                placeholderText="Choose a file to convert"
                :leaveRoomForHelpIcon="true"
              />
            </b-col>
          </b-row>
          <b-row class="justify-content-md-center" align-h="center">
            <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
              <b-button
                class="utilities-advanced-endian-swap-convert-button"
                variant="success"
                block
                :disabled="!this.canEndianSwap() || !this.outputFilename"
                @click="endianSwapData()"
              >
              Convert!
              </b-button>
            </b-col>
          </b-row>
        </b-tab>

        <b-tab title="Compression"><p>Compression</p></b-tab>

        <b-tab :title="'Byte\xa0expansion'">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <byte-expand-contract
                id="byte-expand-contract"
                class="top-row"
                v-model="byteExpandContractSelection"
                @input="changeByteExpandContract($event)"
              />
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <input-file
                @load="readDataToByteExpandContract($event)"
                :errorMessage="this.errorMessage"
                placeholderText="Choose a file to convert"
                :leaveRoomForHelpIcon="true"
              />
            </b-col>
          </b-row>
          <b-row class="justify-content-md-center" align-h="center">
            <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
              <b-button
                class="utilities-advanced-byte-expand-convert-button"
                variant="success"
                block
                :disabled="!this.canByteExpandContract() || !this.outputFilename"
                @click="byteExpandContract()"
              >
              Convert!
              </b-button>
            </b-col>
          </b-row>
        </b-tab>

        <b-tab title="Slice">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <input-number
                id="input-slice-start-offset"
                class="top-row"
                labelText="Starting offset:"
                helpText="The offset in bytes from the beginning of the file to begin the slice. Can be in decimal, or hexadecimal beginning with 0x"
                @input="changeSliceStartOffset($event)"
              />
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <input-number
                id="input-slice-length"
                labelText="Length:"
                helpText="The length of data to slice, in bytes. Can be in decimal, or hexadecimal beginning with 0x"
                @input="changeSliceLength($event)"
              />
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <input-file
                @load="readDataToSlice($event)"
                :errorMessage="this.errorMessage"
                placeholderText="Choose a file to convert"
                :leaveRoomForHelpIcon="true"
              />
            </b-col>
          </b-row>
          <b-row class="justify-content-md-center" align-h="center">
            <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
              <b-button
                class="utilities-advanced-slice-button"
                variant="success"
                block
                :disabled="!this.canSliceFile() || !this.outputFilename"
                @click="sliceFile()"
              >
              Convert!
              </b-button>
            </b-col>
          </b-row>
        </b-tab>

        <b-tab title="Resize">
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <input-number
                id="input-new-size"
                class="top-row"
                labelText="New size:"
                helpText="The new size of the file, in bytes. Can be in decimal, or hexadecimal beginning with 0x"
                @input="changeNewSize($event)"
              />
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <pad-fill-byte
                id="pad-fill-byte"
                v-model="padFillByte"
                :disabled="!this.isIncreasingFileSize()"
              />
            </b-col>
          </b-row>
          <b-row no-gutters align-h="center" align-v="start">
            <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
              <input-file
                @load="readDataToResize($event)"
                :errorMessage="this.errorMessage"
                placeholderText="Choose a file to convert"
                :leaveRoomForHelpIcon="true"
              />
            </b-col>
          </b-row>
          <b-row class="justify-content-md-center" align-h="center">
            <b-col cols="auto" sm=4 md=3 lg=2 align-self="center">
              <b-button
                class="utilities-advanced-resize-button"
                variant="success"
                block
                :disabled="!this.canResizeFile() || !this.outputFilename"
                @click="resizeFile()"
              >
              Convert!
              </b-button>
            </b-col>
          </b-row>

        </b-tab>

        <b-tab title="Header/footer"><p>Add/remove header/footer</p></b-tab>

      </b-tabs>

    </b-container>
  </div>
</template>

<style scoped>

.top-row {
  margin-top: 1em;
}

/* Separate class for each different button to enable tracking in google tag manager */
.utilities-advanced-endian-swap-convert-button {
  margin-top: 1em;
}

.utilities-advanced-byte-expand-convert-button {
  margin-top: 1em;
}

.utilities-advanced-slice-button {
  margin-top: 1em;
}

.utilities-advanced-resize-button {
  margin-top: 1em;
}

.help {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';
import Util from '../util/util';
import EndianUtil from '../util/Endian';
import GenesisUtil from '../util/Genesis';
import SaveFilesUtil from '../util/SaveFiles';
import InputFile from './InputFile.vue';
import InputNumber from './InputNumber.vue';
import EndiannessWordSize from './EndiannessWordSize.vue';
import ByteExpandContract from './ByteExpandContract.vue';
import PadFillByte from './PadFillByte.vue';

export default {
  name: 'AdvancedUtils',
  components: {
    InputFile,
    InputNumber,
    EndiannessWordSize,
    ByteExpandContract,
    PadFillByte,
  },
  props: {
    initialTab: {
      type: String,
      default: 'endian-swap',
    },
  },
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
      endianWordSize: null,
      byteExpandContractSelection: null,
      sliceStartOffset: null,
      sliceLength: null,
      newSize: null,
      padFillByte: 0,
      tabIndex: 0,
    };
  },
  beforeMount() {
    // Need to keep these in sync with the template above. Is there a way to get these programmatically?
    const possibleTabNames = [
      'endian-swap',
      'compression',
      'byte-expansion',
      'slice',
      'resize',
      'header-footer',
    ];

    const initialTabIndex = possibleTabNames.indexOf(this.initialTab);

    this.tabIndex = (initialTabIndex >= 0) ? initialTabIndex : 0;
  },
  watch: {
    tabIndex() {
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.endianWordSize = null;
      this.byteExpandContractSelection = null;
      this.sliceStartOffset = null;
      this.sliceLength = null;
      this.newSize = null;
      this.padFillByte = 0;
    },
  },
  computed: {

  },
  methods: {
    //
    // *** Endian swapping
    //
    readDataToEndianSwap(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkEndianWordSize();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    changeEndianWordSize() {
      this.errorMessage = null;
      try {
        this.checkEndianWordSize();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    checkEndianWordSize() {
      if ((this.saveData !== null) && (this.endianWordSize !== null) && ((this.saveData.byteLength % this.endianWordSize) !== 0)) {
        throw new Error(`File size must be a multiple of ${this.endianWordSize}. However, file size is ${this.saveData.byteLength} bytes.`);
      }
    },
    canEndianSwap() {
      return ((this.saveData !== null) && (this.endianWordSize !== null) && ((this.saveData.byteLength % this.endianWordSize) === 0));
    },
    endianSwapData() {
      const outputArrayBuffer = EndianUtil.swap(this.saveData, this.endianWordSize);

      this.sendArrayBuffer(outputArrayBuffer, this.outputFilename);
    },
    //
    // *** Byte expand/contarct
    //
    readDataToByteExpandContract(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkByteExpandContract();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    changeByteExpandContract() {
      this.errorMessage = null;
      try {
        this.checkByteExpandContract();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    byteExpandSelected() {
      return ((this.byteExpandContractSelection !== null) && this.byteExpandContractSelection.startsWith('byte-expand'));
    },
    byteContractSelected() {
      return ((this.byteExpandContractSelection !== null) && this.byteExpandContractSelection.startsWith('byte-contract'));
    },
    checkByteExpandContract() {
      if (this.saveData !== null) {
        if (this.byteExpandSelected() && GenesisUtil.isByteExpanded(this.saveData) && !GenesisUtil.isEmpty(this.saveData)) {
          throw new Error('File is already byte expanded');
        } else if (this.byteContractSelected() && !GenesisUtil.isByteExpanded(this.saveData)) { // If isByteExpanded returned false then we know the file is not empty
          throw new Error('File is already byte contracted');
        }
      }
    },
    canByteExpandContract() {
      if ((this.saveData !== null) && (this.byteExpandContract !== null)) {
        try {
          this.checkByteExpandContract();
          return true;
        } catch (e) {
          return false;
        }
      }

      return false;
    },
    byteExpandContract() {
      let outputArrayBuffer = null;

      switch (this.byteExpandContractSelection) {
        case 'byte-expand-00': {
          outputArrayBuffer = GenesisUtil.byteExpand(this.saveData, 0x00);
          break;
        }

        case 'byte-expand-ff': {
          outputArrayBuffer = GenesisUtil.byteExpand(this.saveData, 0xFF);
          break;
        }

        case 'byte-expand-duplicate': {
          outputArrayBuffer = GenesisUtil.byteExpand(this.saveData, GenesisUtil.FILL_BYTE_REPEAT);
          break;
        }

        case 'byte-contract': {
          outputArrayBuffer = GenesisUtil.byteCollapse(this.saveData);
          break;
        }

        default: {
          this.errorMessage = 'Unknown byte expand/contract option selected';
          return;
        }
      }

      this.sendArrayBuffer(outputArrayBuffer, this.outputFilename);
    },
    //
    // *** Slice
    //
    readDataToSlice(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkSliceFile();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    changeSliceStartOffset(value) {
      this.sliceStartOffset = value;
      this.changeSliceOffsetOrLength();
    },
    changeSliceLength(value) {
      this.sliceLength = value;
      this.changeSliceOffsetOrLength();
    },
    changeSliceOffsetOrLength() {
      this.errorMessage = null;
      try {
        this.checkSliceFile();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    checkSliceFile() {
      if (this.saveData !== null) {
        if ((this.sliceStartOffset !== null) && (this.sliceStartOffset > this.saveData.byteLength)) {
          throw new Error(`Specified a starting offset of ${this.sliceStartOffset} bytes, but the file is only ${this.saveData.byteLength} bytes long`);
        }

        if ((this.sliceLength !== null) && (this.sliceLength > this.saveData.byteLength)) {
          throw new Error(`Specified a length of ${this.sliceLength} bytes, but the file is only ${this.saveData.byteLength} bytes long`);
        }

        if ((this.sliceStartOffset !== null) && (this.sliceLength !== null) && ((this.sliceStartOffset + this.sliceLength) > this.saveData.byteLength)) {
          throw new Error(`Specified a starting offset of ${this.sliceStartOffset} and a length of ${this.sliceLength} bytes, `
            + `which is a total of ${this.sliceStartOffset + this.sliceLength} bytes but the file is only ${this.saveData.byteLength} bytes long`);
        }
      }
    },
    canSliceFile() {
      if ((this.saveData !== null) && (this.sliceStartOffset !== null) && (this.sliceLength !== null)) {
        try {
          this.checkSliceFile();
          return true;
        } catch (e) {
          return false;
        }
      }

      return false;
    },
    sliceFile() {
      const outputArrayBuffer = this.saveData.slice(this.sliceStartOffset, this.sliceStartOffset + this.sliceLength);

      this.sendArrayBuffer(outputArrayBuffer, this.outputFilename);
    },
    //
    // *** Resize
    //
    readDataToResize(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkResizeFile();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    changeNewSize(value) {
      this.newSize = value;
      this.errorMessage = null;
      try {
        this.checkResizeFile();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    isIncreasingFileSize() {
      return ((this.saveData !== null) && (this.newSize !== null) && (this.newSize > this.saveData.byteLength));
    },
    checkResizeFile() {
      if (this.saveData !== null) {
        // As long as this.newSize is not null, then we're good to go here. this.padFillByte will always be a valid value
        // We could choose to throw an error if this.newSize == null, but that would mean putting an error on the screen as soon
        // as the user selects a file (if they haven't filled in a size yet), which seems a bit aggressive. Just having the
        // Convert! button disabled is hopefully sufficient there.
      }
    },
    canResizeFile() {
      if ((this.saveData !== null) && (this.newSize !== null)) {
        try {
          this.checkResizeFile();
          return true;
        } catch (e) {
          return false;
        }
      }

      return false;
    },
    resizeFile() {
      const outputArrayBuffer = SaveFilesUtil.resizeRawSave(this.saveData, this.newSize, this.padFillByte);

      this.sendArrayBuffer(outputArrayBuffer, this.outputFilename);
    },
    //
    // *** Send array buffer
    //
    sendArrayBuffer(outputArrayBuffer, outputFilename) {
      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};

</script>
