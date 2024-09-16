<template>
  <div>
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
          ref="inputFile"
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
  </div>
</template>

<style scoped>
.top-row {
  margin-top: 1em;
}
  
.utilities-advanced-byte-expand-convert-button {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';

import ByteExpandContract from './ByteExpandContract.vue';
import InputFile from './InputFile.vue';

import Util from '../util/util';

import GenesisUtil from '../util/Genesis';

export default {
  name: 'TabByteExpansion',
  components: {
    ByteExpandContract,
    InputFile,
  },
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
      byteExpandContractSelection: null,
    };
  },
  methods: {
    reset() {
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.byteExpandContractSelection = null;

      this.$refs.inputFile.reset();
    },
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

      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};
</script>
