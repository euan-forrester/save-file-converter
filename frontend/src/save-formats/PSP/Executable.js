/* eslint-disable no-bitwise */

import PspEncryptionUtil from './PspEncryptionUtil';
import Util from '../../util/util';
import CompressionGzip from '../../util/CompressionGzip';

// The header structure of this file is described here: https://github.com/hrydgard/ppsspp/blob/master/Core/ELF/PrxDecrypter.h#L26

const LITTLE_ENDIAN = true;

const MAGIC_ENCODING = 'US-ASCII';

const ENCRYPTED_MAGIC_OFFSET = 0;
const UNENCRYPTED_MAGIC_OFFSET = 0;
const ENCRYPTED_MAGIC = '~PSP';
const ELF_MAGIC = '\x7FELF';
const ELF_MAGIC_OFFSET = 0x150;

const COMPRESSION_ATTRIBUTES_OFFSET = 0x06;
const ELF_SIZE_OFFSET = 0x28;
const PSP_SIZE_OFFSET = 0x2C;

const COMPRESSION_ATTRIBUTES_IS_GZIP = 0x01;

export default class PspExecutable {
  static createFromEncryptedData(encryptedExecutableArrayBuffer) {
    // First get some information from our header

    Util.checkMagic(encryptedExecutableArrayBuffer, ENCRYPTED_MAGIC_OFFSET, ENCRYPTED_MAGIC, MAGIC_ENCODING);

    const headerDataView = new DataView(encryptedExecutableArrayBuffer);

    const compressionAttributes = headerDataView.getUint16(COMPRESSION_ATTRIBUTES_OFFSET, LITTLE_ENDIAN);
    const elfSize = headerDataView.getUint32(ELF_SIZE_OFFSET, LITTLE_ENDIAN);
    const pspSize = headerDataView.getUint32(PSP_SIZE_OFFSET, LITTLE_ENDIAN);

    const isGzipped = ((compressionAttributes & COMPRESSION_ATTRIBUTES_IS_GZIP) !== 0);
    const maxElfSize = Math.max(elfSize, pspSize);

    // Call our function to decrypt the data

    let unencryptedExecutableArrayBuffer = Util.getFilledArrayBuffer(maxElfSize, 0x00);

    const unencryptedExecutablePtr = PspEncryptionUtil.bufferToPtr(unencryptedExecutableArrayBuffer);
    const encryptedExecutablePtr = PspEncryptionUtil.bufferToPtr(encryptedExecutableArrayBuffer);

    let executableSize = PspEncryptionUtil.decryptExecutable(encryptedExecutablePtr, unencryptedExecutablePtr, pspSize);

    // Apparently there can be an ELF hiding inside
    // Taken from https://github.com/hrydgard/ppsspp/blob/2a372caef9acbc7ff20bcca3c25b2ab92294f283/Core/HLE/sceKernelModule.cpp#L1320
    if (executableSize <= 0) {
      Util.checkMagic(encryptedExecutableArrayBuffer, ELF_MAGIC_OFFSET, ELF_MAGIC, MAGIC_ENCODING);
      executableSize = pspSize - ELF_MAGIC_OFFSET;
      unencryptedExecutableArrayBuffer = encryptedExecutableArrayBuffer.slice(ELF_MAGIC_OFFSET, ELF_MAGIC_OFFSET + executableSize);
    } else {
      unencryptedExecutableArrayBuffer = PspEncryptionUtil.ptrToArrayBuffer(unencryptedExecutablePtr, pspSize);
    }

    PspEncryptionUtil.free(encryptedExecutablePtr);
    PspEncryptionUtil.free(unencryptedExecutablePtr);

    // See if we need to decompress our unencrypted data

    if (isGzipped) {
      unencryptedExecutableArrayBuffer = CompressionGzip.decompress(unencryptedExecutableArrayBuffer);
    }

    // Final check that we've got an ELF file

    Util.checkMagic(unencryptedExecutableArrayBuffer, UNENCRYPTED_MAGIC_OFFSET, ELF_MAGIC, MAGIC_ENCODING);

    const executableInfo = {
      compressionAttributes,
      elfSize,
      pspSize,
    };

    return new PspExecutable(encryptedExecutableArrayBuffer, unencryptedExecutableArrayBuffer, executableInfo);
  }

  // This constructor creates a new object from the encrypted and unencrypted binary representations of a PSP executable
  constructor(encryptedArrayBuffer, unencryptedArrayBuffer, executableInfo) {
    this.encryptedArrayBuffer = encryptedArrayBuffer;
    this.unencryptedArrayBuffer = unencryptedArrayBuffer;
    this.executableInfo = executableInfo;
  }

  getUnencryptedArrayBuffer() {
    return this.unencryptedArrayBuffer;
  }

  getEncryptedArrayBuffer() {
    return this.encryptedArrayBuffer;
  }

  getExecutableInfo() {
    return this.executableInfo;
  }
}
