/* eslint-disable no-bitwise */

// The Sega CD format uses a 16-bit CRC that I can't seem to find a JS implementation of.
// The reference code calls it "CCITT" but I tried a couple of repos that offer similarly-named
// CRC-16 algorithms and none of them matched. So it just seemed easier to copy the code from
// the reference implementation

const CRC_TABLE_SIZE = 256;

// https://github.com/superctr/buram/blob/master/buram.c#L183
const crcTable = new Array(CRC_TABLE_SIZE).fill(0);

for (let i = 0; i < CRC_TABLE_SIZE; i += 1) {
  let d = i << 8;

  for (let j = 0; j < 8; j += 1) {
    d = (d << 1) ^ (((d & 0x8000) !== 0) ? 0x1021 : 0);
  }

  crcTable[i] = d;
}

// https://github.com/superctr/buram/blob/master/buram.c#L197
export default function (arrayBuffer) {
  let out = 0;
  const uint8Array = new Uint8Array(arrayBuffer);
  const length = arrayBuffer.byteLength;

  for (let i = 0; i < length; i += 1) {
    out = ((out << 8) ^ crcTable[uint8Array[i] ^ (out >> 8)]) & 0xFFFF;
  }

  return out >>> 0; // Convert to unsigned
}
