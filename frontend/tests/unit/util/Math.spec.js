import { expect } from 'chai';
import MathUtil from '@/util/Math';

describe('MathUtil', () => {
  it('should find the next largest power of 2', () => {
    expect(MathUtil.getNextLargestPowerOf2(-1)).to.equal(0);
    expect(MathUtil.getNextLargestPowerOf2(0)).to.equal(0);

    expect(MathUtil.getNextLargestPowerOf2(1)).to.equal(1);

    expect(MathUtil.getNextLargestPowerOf2(2)).to.equal(2);

    expect(MathUtil.getNextLargestPowerOf2(3)).to.equal(4);
    expect(MathUtil.getNextLargestPowerOf2(4)).to.equal(4);

    expect(MathUtil.getNextLargestPowerOf2(5)).to.equal(8);
    expect(MathUtil.getNextLargestPowerOf2(6)).to.equal(8);
    expect(MathUtil.getNextLargestPowerOf2(7)).to.equal(8);
    expect(MathUtil.getNextLargestPowerOf2(8)).to.equal(8);

    expect(MathUtil.getNextLargestPowerOf2(9)).to.equal(16);
    expect(MathUtil.getNextLargestPowerOf2(15)).to.equal(16);
    expect(MathUtil.getNextLargestPowerOf2(16)).to.equal(16);

    expect(MathUtil.getNextLargestPowerOf2(17)).to.equal(32);
    expect(MathUtil.getNextLargestPowerOf2(31)).to.equal(32);
    expect(MathUtil.getNextLargestPowerOf2(32)).to.equal(32);

    expect(MathUtil.getNextLargestPowerOf2(33)).to.equal(64);
    expect(MathUtil.getNextLargestPowerOf2(63)).to.equal(64);
    expect(MathUtil.getNextLargestPowerOf2(64)).to.equal(64);

    expect(MathUtil.getNextLargestPowerOf2(65)).to.equal(128);
    expect(MathUtil.getNextLargestPowerOf2(127)).to.equal(128);
    expect(MathUtil.getNextLargestPowerOf2(128)).to.equal(128);

    expect(MathUtil.getNextLargestPowerOf2(129)).to.equal(256);
    expect(MathUtil.getNextLargestPowerOf2(255)).to.equal(256);
    expect(MathUtil.getNextLargestPowerOf2(256)).to.equal(256);

    expect(MathUtil.getNextLargestPowerOf2(257)).to.equal(512);
    expect(MathUtil.getNextLargestPowerOf2(511)).to.equal(512);
    expect(MathUtil.getNextLargestPowerOf2(512)).to.equal(512);

    expect(MathUtil.getNextLargestPowerOf2(513)).to.equal(1024);
    expect(MathUtil.getNextLargestPowerOf2(1023)).to.equal(1024);
    expect(MathUtil.getNextLargestPowerOf2(1024)).to.equal(1024);

    expect(MathUtil.getNextLargestPowerOf2(1025)).to.equal(2048);
    expect(MathUtil.getNextLargestPowerOf2(2047)).to.equal(2048);
    expect(MathUtil.getNextLargestPowerOf2(2048)).to.equal(2048);

    expect(MathUtil.getNextLargestPowerOf2(2049)).to.equal(4096);
    expect(MathUtil.getNextLargestPowerOf2(4095)).to.equal(4096);
    expect(MathUtil.getNextLargestPowerOf2(4096)).to.equal(4096);

    expect(MathUtil.getNextLargestPowerOf2(4097)).to.equal(8192);
    expect(MathUtil.getNextLargestPowerOf2(8191)).to.equal(8192);
    expect(MathUtil.getNextLargestPowerOf2(8192)).to.equal(8192);

    expect(MathUtil.getNextLargestPowerOf2(8193)).to.equal(16384);
    expect(MathUtil.getNextLargestPowerOf2(16383)).to.equal(16384);
    expect(MathUtil.getNextLargestPowerOf2(16384)).to.equal(16384);

    expect(MathUtil.getNextLargestPowerOf2(16385)).to.equal(32768);
    expect(MathUtil.getNextLargestPowerOf2(32767)).to.equal(32768);
    expect(MathUtil.getNextLargestPowerOf2(32768)).to.equal(32768);

    expect(MathUtil.getNextLargestPowerOf2(32769)).to.equal(65536);
    expect(MathUtil.getNextLargestPowerOf2(65535)).to.equal(65536);
    expect(MathUtil.getNextLargestPowerOf2(65536)).to.equal(65536);

    expect(MathUtil.getNextLargestPowerOf2(65537)).to.equal(131072);
    expect(MathUtil.getNextLargestPowerOf2(131071)).to.equal(131072);
    expect(MathUtil.getNextLargestPowerOf2(131072)).to.equal(131072);

    expect(MathUtil.getNextLargestPowerOf2(131073)).to.equal(262144);
    expect(MathUtil.getNextLargestPowerOf2(262143)).to.equal(262144);
    expect(MathUtil.getNextLargestPowerOf2(262144)).to.equal(262144);
  });

  it('should find the next smallest power of 2', () => {
    expect(MathUtil.getNextSmallestPowerOf2(-1)).to.equal(0);
    expect(MathUtil.getNextSmallestPowerOf2(0)).to.equal(0);

    expect(MathUtil.getNextSmallestPowerOf2(1)).to.equal(1);

    expect(MathUtil.getNextSmallestPowerOf2(2)).to.equal(2);
    expect(MathUtil.getNextSmallestPowerOf2(3)).to.equal(2);

    expect(MathUtil.getNextSmallestPowerOf2(4)).to.equal(4);
    expect(MathUtil.getNextSmallestPowerOf2(5)).to.equal(4);
    expect(MathUtil.getNextSmallestPowerOf2(6)).to.equal(4);
    expect(MathUtil.getNextSmallestPowerOf2(7)).to.equal(4);

    expect(MathUtil.getNextSmallestPowerOf2(8)).to.equal(8);
    expect(MathUtil.getNextSmallestPowerOf2(9)).to.equal(8);
    expect(MathUtil.getNextSmallestPowerOf2(15)).to.equal(8);

    expect(MathUtil.getNextSmallestPowerOf2(16)).to.equal(16);
    expect(MathUtil.getNextSmallestPowerOf2(17)).to.equal(16);
    expect(MathUtil.getNextSmallestPowerOf2(31)).to.equal(16);

    expect(MathUtil.getNextSmallestPowerOf2(32)).to.equal(32);
    expect(MathUtil.getNextSmallestPowerOf2(33)).to.equal(32);
    expect(MathUtil.getNextSmallestPowerOf2(63)).to.equal(32);

    expect(MathUtil.getNextSmallestPowerOf2(64)).to.equal(64);
    expect(MathUtil.getNextSmallestPowerOf2(65)).to.equal(64);
    expect(MathUtil.getNextSmallestPowerOf2(127)).to.equal(64);

    expect(MathUtil.getNextSmallestPowerOf2(128)).to.equal(128);
    expect(MathUtil.getNextSmallestPowerOf2(129)).to.equal(128);
    expect(MathUtil.getNextSmallestPowerOf2(255)).to.equal(128);

    expect(MathUtil.getNextSmallestPowerOf2(256)).to.equal(256);
    expect(MathUtil.getNextSmallestPowerOf2(257)).to.equal(256);
    expect(MathUtil.getNextSmallestPowerOf2(511)).to.equal(256);

    expect(MathUtil.getNextSmallestPowerOf2(512)).to.equal(512);
    expect(MathUtil.getNextSmallestPowerOf2(513)).to.equal(512);
    expect(MathUtil.getNextSmallestPowerOf2(1023)).to.equal(512);

    expect(MathUtil.getNextSmallestPowerOf2(1024)).to.equal(1024);
    expect(MathUtil.getNextSmallestPowerOf2(1025)).to.equal(1024);
    expect(MathUtil.getNextSmallestPowerOf2(2047)).to.equal(1024);

    expect(MathUtil.getNextSmallestPowerOf2(2048)).to.equal(2048);
    expect(MathUtil.getNextSmallestPowerOf2(2049)).to.equal(2048);
    expect(MathUtil.getNextSmallestPowerOf2(4095)).to.equal(2048);

    expect(MathUtil.getNextSmallestPowerOf2(4096)).to.equal(4096);
    expect(MathUtil.getNextSmallestPowerOf2(4097)).to.equal(4096);
    expect(MathUtil.getNextSmallestPowerOf2(8191)).to.equal(4096);

    expect(MathUtil.getNextSmallestPowerOf2(8192)).to.equal(8192);
    expect(MathUtil.getNextSmallestPowerOf2(8193)).to.equal(8192);
    expect(MathUtil.getNextSmallestPowerOf2(16383)).to.equal(8192);

    expect(MathUtil.getNextSmallestPowerOf2(16384)).to.equal(16384);
    expect(MathUtil.getNextSmallestPowerOf2(16385)).to.equal(16384);
    expect(MathUtil.getNextSmallestPowerOf2(32767)).to.equal(16384);

    expect(MathUtil.getNextSmallestPowerOf2(32768)).to.equal(32768);
    expect(MathUtil.getNextSmallestPowerOf2(32769)).to.equal(32768);
    expect(MathUtil.getNextSmallestPowerOf2(65535)).to.equal(32768);

    expect(MathUtil.getNextSmallestPowerOf2(65536)).to.equal(65536);
    expect(MathUtil.getNextSmallestPowerOf2(65537)).to.equal(65536);
    expect(MathUtil.getNextSmallestPowerOf2(131071)).to.equal(65536);

    expect(MathUtil.getNextSmallestPowerOf2(131072)).to.equal(131072);
    expect(MathUtil.getNextSmallestPowerOf2(131073)).to.equal(131072);
    expect(MathUtil.getNextSmallestPowerOf2(262143)).to.equal(131072);

    expect(MathUtil.getNextSmallestPowerOf2(262144)).to.equal(262144);
  });

  it('should determine whether a number is a power of 2', () => {
    expect(MathUtil.isPowerOf2(-1)).to.equal(false);
    expect(MathUtil.isPowerOf2(0)).to.equal(false);

    expect(MathUtil.isPowerOf2(1)).to.equal(true);

    expect(MathUtil.isPowerOf2(2)).to.equal(true);

    expect(MathUtil.isPowerOf2(3)).to.equal(false);
    expect(MathUtil.isPowerOf2(4)).to.equal(true);

    expect(MathUtil.isPowerOf2(5)).to.equal(false);
    expect(MathUtil.isPowerOf2(6)).to.equal(false);
    expect(MathUtil.isPowerOf2(7)).to.equal(false);
    expect(MathUtil.isPowerOf2(8)).to.equal(true);

    expect(MathUtil.isPowerOf2(9)).to.equal(false);
    expect(MathUtil.isPowerOf2(15)).to.equal(false);
    expect(MathUtil.isPowerOf2(16)).to.equal(true);

    expect(MathUtil.isPowerOf2(17)).to.equal(false);
    expect(MathUtil.isPowerOf2(31)).to.equal(false);
    expect(MathUtil.isPowerOf2(32)).to.equal(true);

    expect(MathUtil.isPowerOf2(33)).to.equal(false);
    expect(MathUtil.isPowerOf2(63)).to.equal(false);
    expect(MathUtil.isPowerOf2(64)).to.equal(true);

    expect(MathUtil.isPowerOf2(65)).to.equal(false);
    expect(MathUtil.isPowerOf2(127)).to.equal(false);
    expect(MathUtil.isPowerOf2(128)).to.equal(true);

    expect(MathUtil.isPowerOf2(129)).to.equal(false);
    expect(MathUtil.isPowerOf2(255)).to.equal(false);
    expect(MathUtil.isPowerOf2(256)).to.equal(true);

    expect(MathUtil.isPowerOf2(257)).to.equal(false);
    expect(MathUtil.isPowerOf2(511)).to.equal(false);
    expect(MathUtil.isPowerOf2(512)).to.equal(true);

    expect(MathUtil.isPowerOf2(513)).to.equal(false);
    expect(MathUtil.isPowerOf2(1023)).to.equal(false);
    expect(MathUtil.isPowerOf2(1024)).to.equal(true);

    expect(MathUtil.isPowerOf2(1025)).to.equal(false);
    expect(MathUtil.isPowerOf2(2047)).to.equal(false);
    expect(MathUtil.isPowerOf2(2048)).to.equal(true);

    expect(MathUtil.isPowerOf2(2049)).to.equal(false);
    expect(MathUtil.isPowerOf2(4095)).to.equal(false);
    expect(MathUtil.isPowerOf2(4096)).to.equal(true);

    expect(MathUtil.isPowerOf2(4097)).to.equal(false);
    expect(MathUtil.isPowerOf2(8191)).to.equal(false);
    expect(MathUtil.isPowerOf2(8192)).to.equal(true);

    expect(MathUtil.isPowerOf2(8193)).to.equal(false);
    expect(MathUtil.isPowerOf2(16383)).to.equal(false);
    expect(MathUtil.isPowerOf2(16384)).to.equal(true);

    expect(MathUtil.isPowerOf2(16385)).to.equal(false);
    expect(MathUtil.isPowerOf2(32767)).to.equal(false);
    expect(MathUtil.isPowerOf2(32768)).to.equal(true);

    expect(MathUtil.isPowerOf2(32769)).to.equal(false);
    expect(MathUtil.isPowerOf2(65535)).to.equal(false);
    expect(MathUtil.isPowerOf2(65536)).to.equal(true);

    expect(MathUtil.isPowerOf2(65537)).to.equal(false);
    expect(MathUtil.isPowerOf2(131071)).to.equal(false);
    expect(MathUtil.isPowerOf2(131072)).to.equal(true);

    expect(MathUtil.isPowerOf2(131073)).to.equal(false);
    expect(MathUtil.isPowerOf2(262143)).to.equal(false);
    expect(MathUtil.isPowerOf2(262144)).to.equal(true);
  });

  it('should correctly round up to the nearest 64 bytes', () => {
    expect(MathUtil.roundUpToNearest64Bytes(-1)).to.equal(0);
    expect(MathUtil.roundUpToNearest64Bytes(0)).to.equal(0);

    expect(MathUtil.roundUpToNearest64Bytes(1)).to.equal(64);
    expect(MathUtil.roundUpToNearest64Bytes(2)).to.equal(64);
    expect(MathUtil.roundUpToNearest64Bytes(63)).to.equal(64);
    expect(MathUtil.roundUpToNearest64Bytes(64)).to.equal(64);

    expect(MathUtil.roundUpToNearest64Bytes(65)).to.equal(128);
    expect(MathUtil.roundUpToNearest64Bytes(127)).to.equal(128);
    expect(MathUtil.roundUpToNearest64Bytes(128)).to.equal(128);

    expect(MathUtil.roundUpToNearest64Bytes(129)).to.equal(192);
    expect(MathUtil.roundUpToNearest64Bytes(191)).to.equal(192);
    expect(MathUtil.roundUpToNearest64Bytes(192)).to.equal(192);

    expect(MathUtil.roundUpToNearest64Bytes(193)).to.equal(256);
    expect(MathUtil.roundUpToNearest64Bytes(255)).to.equal(256);
    expect(MathUtil.roundUpToNearest64Bytes(256)).to.equal(256);

    expect(MathUtil.roundUpToNearest64Bytes(257)).to.equal(320);
    expect(MathUtil.roundUpToNearest64Bytes(319)).to.equal(320);
    expect(MathUtil.roundUpToNearest64Bytes(320)).to.equal(320);

    expect(MathUtil.roundUpToNearest64Bytes(321)).to.equal(384);
    expect(MathUtil.roundUpToNearest64Bytes(383)).to.equal(384);
    expect(MathUtil.roundUpToNearest64Bytes(384)).to.equal(384);

    expect(MathUtil.roundUpToNearest64Bytes(385)).to.equal(448);
    expect(MathUtil.roundUpToNearest64Bytes(447)).to.equal(448);
    expect(MathUtil.roundUpToNearest64Bytes(448)).to.equal(448);

    expect(MathUtil.roundUpToNearest64Bytes(449)).to.equal(512);
    expect(MathUtil.roundUpToNearest64Bytes(511)).to.equal(512);
    expect(MathUtil.roundUpToNearest64Bytes(512)).to.equal(512);
  });

  it('should find the next multiple of 16', () => {
    expect(MathUtil.getNextMultipleOf16(-1)).to.equal(0);
    expect(MathUtil.getNextMultipleOf16(0)).to.equal(0);

    expect(MathUtil.getNextMultipleOf16(1)).to.equal(16);
    expect(MathUtil.getNextMultipleOf16(15)).to.equal(16);
    expect(MathUtil.getNextMultipleOf16(16)).to.equal(16);

    expect(MathUtil.getNextMultipleOf16(17)).to.equal(32);
    expect(MathUtil.getNextMultipleOf16(31)).to.equal(32);
    expect(MathUtil.getNextMultipleOf16(32)).to.equal(32);

    expect(MathUtil.getNextMultipleOf16(33)).to.equal(48);
    expect(MathUtil.getNextMultipleOf16(47)).to.equal(48);
    expect(MathUtil.getNextMultipleOf16(48)).to.equal(48);

    expect(MathUtil.getNextMultipleOf16(49)).to.equal(64);
    expect(MathUtil.getNextMultipleOf16(63)).to.equal(64);
    expect(MathUtil.getNextMultipleOf16(64)).to.equal(64);

    expect(MathUtil.getNextMultipleOf16(65)).to.equal(80);
    expect(MathUtil.getNextMultipleOf16(79)).to.equal(80);
    expect(MathUtil.getNextMultipleOf16(80)).to.equal(80);

    expect(MathUtil.getNextMultipleOf16(81)).to.equal(96);
    expect(MathUtil.getNextMultipleOf16(95)).to.equal(96);
    expect(MathUtil.getNextMultipleOf16(96)).to.equal(96);

    expect(MathUtil.getNextMultipleOf16(97)).to.equal(112);
    expect(MathUtil.getNextMultipleOf16(111)).to.equal(112);
    expect(MathUtil.getNextMultipleOf16(112)).to.equal(112);

    expect(MathUtil.getNextMultipleOf16(113)).to.equal(128);
    expect(MathUtil.getNextMultipleOf16(127)).to.equal(128);
    expect(MathUtil.getNextMultipleOf16(128)).to.equal(128);
  });
});
