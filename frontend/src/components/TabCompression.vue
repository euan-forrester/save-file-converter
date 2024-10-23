<template>
  <div>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <compression-type
          id="compression-type"
          class="top-row"
          v-model="compressionType"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <compression-decompression
          id="compression-decompression"
          v-model="compressionDecompression"
        />
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="start">
      <b-col sm=12 md=7 lg=5 xl=4 align-self="center">
        <input-file
          @load="readDataToCompressDecompress($event)"
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
          class="utilities-advanced-compression-convert-button"
          variant="success"
          block
          :disabled="!this.canCompressDecompress() || !this.outputFilename"
          @click="compressDecompressFile()"
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
.utilities-advanced-compression-convert-button {
  margin-top: 1em;
}
</style>

<script>
import { saveAs } from 'file-saver';

import CompressionType from './CompressionType.vue';
import CompressionDecompression from './CompressionDecompression.vue';
import InputFile from './InputFile.vue';

import Util from '../util/util';

import CompressionZlib from '../util/CompressionZlib';
import CompressionGzip from '../util/CompressionGzip';
import CompressionLzo from '../util/CompressionLzo';

const DEFAULT_COMPRESSION_TYPE = 'zlib'; // I think the most common use here will be decompressing retroarch files, which uses zlib
const DEFAULT_COMPRESSION_DECOMPRESSION = 'decompress';

export default {
  name: 'TabCompression',
  components: {
    CompressionType,
    CompressionDecompression,
    InputFile,
  },
  data() {
    return {
      saveData: null,
      errorMessage: null,
      outputFilename: null,
      compressionType: DEFAULT_COMPRESSION_TYPE,
      compressionDecompression: DEFAULT_COMPRESSION_DECOMPRESSION,
    };
  },
  methods: {
    reset() {
      this.saveData = null;
      this.errorMessage = null;
      this.outputFilename = null;
      this.compressionType = DEFAULT_COMPRESSION_TYPE;
      this.compressionDecompression = DEFAULT_COMPRESSION_DECOMPRESSION;

      this.$refs.inputFile.reset();
    },
    readDataToCompressDecompress(event) {
      this.errorMessage = null;
      this.outputFilename = null;
      try {
        this.saveData = event.arrayBuffer;
        this.outputFilename = `${Util.removeFilenameExtension(event.filename)} (converted)${Util.getExtension(event.filename)}`;

        this.checkCompressDecompress();
      } catch (e) {
        this.errorMessage = e.message;
      }
    },
    getCompressedDecompressedData() {
      if (this.saveData !== null) {
        switch (this.compressionDecompression) {
          case 'compress': {
            switch (this.compressionType) {
              case 'zlib': {
                try {
                  return CompressionZlib.compress(this.saveData);
                } catch (e) {
                  throw new Error('Unable to compress the specified data using zlib compression');
                }
              }

              case 'gzip': {
                try {
                  return CompressionGzip.compress(this.saveData);
                } catch (e) {
                  throw new Error('Unable to compress the specified data using gzip compression');
                }
              }

              case 'lzo': {
                try {
                  return CompressionLzo.compress(this.saveData);
                } catch (e) {
                  throw new Error('Unable to compress the specified data using LZO compression');
                }
              }

              default: {
                throw new Error('Unknown compression type');
              }
            }
          }

          case 'decompress': {
            switch (this.compressionType) {
              case 'zlib': {
                try {
                  return CompressionZlib.decompress(this.saveData);
                } catch (e) {
                  throw new Error('Unable to decompress the specified data using zlib compression');
                }
              }

              case 'gzip': {
                try {
                  return CompressionGzip.decompress(this.saveData);
                } catch (e) {
                  throw new Error('Unable to decompress the specified data using gzip compression');
                }
              }

              case 'lzo': {
                try {
                  return CompressionLzo.decompress(this.saveData);
                } catch (e) {
                  throw new Error('Unable to decompress the specified data using LZO compression');
                }
              }

              default: {
                throw new Error('Unknown compression type');
              }
            }
          }

          default: {
            throw new Error('Unknown compression/decompression selection');
          }
        }
      }

      throw new Error('No save data specified');
    },
    checkCompressDecompress() {
      if (this.saveData !== null) {
        // If this throws an Error, just let it through to the caller
        this.getCompressedDecompressedData();
      }
    },
    canCompressDecompress() {
      try {
        this.checkCompressDecompress();
        return true;
      } catch (e) {
        return false;
      }
    },
    compressDecompressFile() {
      const outputArrayBuffer = this.getCompressedDecompressedData();
      const outputBlob = new Blob([outputArrayBuffer], { type: 'application/octet-stream' });

      saveAs(outputBlob, this.outputFilename); // Frustratingly, in Firefox the dialog says "from: blob:" and apparently this can't be changed: https://github.com/eligrey/FileSaver.js/issues/101
    },
  },
};
</script>
