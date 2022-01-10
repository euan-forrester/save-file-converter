import { expect } from 'chai';
import PspIso from '@/rom-formats/PspIso';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const TEST_ISOS = true; // Even small ISOs take a long time to load
const TEST_RETAIL_ISOS = true; // They're quite large files and so take several seconds to load

const TIMEOUT_MS = 40000; // Need to load in some large files

const DIR = './tests/unit/rom-formats/data/psp';

const CASTLEVANIA_ISO_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles.ISO`;
const CASTLEVANIA_EXECUTABLE_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles - EBOOT.BIN`;
const CASTLEVANIA_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const CASTLEVANIA_GAME_ID = 'ULUS10277';

const FINAL_FANTASY_TACTICS_ISO_FILENAME = `${DIR}/retail/Final Fantasy Tactics - War of the Lions.ISO`;
const FINAL_FANTASY_TACTICS_EXECUTABLE_FILENAME = `${DIR}/retail/Final Fantasy Tactics - War of the Lions - EBOOT.BIN`;
const FINAL_FANTASY_TACTICS_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const FINAL_FANTASY_TACTICS_GAME_ID = 'ULUS10297';

const MEGA_MAN_ISO_FILENAME = `${DIR}/retail/Mega Man Maverick Hunter X.ISO`;
const MEGA_MAN_EXECUTABLE_FILENAME = `${DIR}/retail/Mega Man Maverick Hunter X - EBOOT.BIN`;
const MEGA_MAN_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const MEGA_MAN_GAME_ID = 'ULUS10068';

const NEED_FOR_SPEED_ISO_FILENAME = `${DIR}/retail/Need for Speed Underground Rivals.ISO`;
const NEED_FOR_SPEED_EXECUTABLE_FILENAME = `${DIR}/retail/Need for Speed Underground Rivals - EBOOT.BIN`;
const NEED_FOR_SPEED_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const NEED_FOR_SPEED_GAME_ID = 'ULUS10007';

const ENCRYPTED_EXECUTABLE_MAGIC0_ISO = `${DIR}/encrypted-executable-magic0.iso`;
const ENCRYPTED_EXECUTABLE_MAGIC0 = `${DIR}/encrypted-executable-magic0 - EBOOT.BIN`;
const ENCRYPTED_EXECUTABLE_MAGIC0_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const ENCRYPTED_EXECUTABLE_MAGIC0_GAME_ID = 'ULUS12345';

const ENCRYPTED_EXECUTABLE_MAGIC1_ISO = `${DIR}/encrypted-executable-magic1.iso`;
const ENCRYPTED_EXECUTABLE_MAGIC1 = `${DIR}/encrypted-executable-magic1 - EBOOT.BIN`;
const ENCRYPTED_EXECUTABLE_MAGIC1_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const ENCRYPTED_EXECUTABLE_MAGIC1_GAME_ID = 'ULUS12345';

const UNENCRYPTED_EXECUTABLE_ISO = `${DIR}/unencrypted-executable.iso`;
const UNENCRYPTED_EXECUTABLE = `${DIR}/unencrypted-executable - BOOT.BIN`;
const UNENCRYPTED_EXECUTABLE_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/BOOT.BIN';
const UNENCRYPTED_EXECUTABLE_GAME_ID = 'ULUS12345';

const ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_ISO = `${DIR}/encrypted-executable-incorrect-magic.iso`;
const ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC = `${DIR}/encrypted-executable-incorrect-magic - BOOT.BIN`;
const ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/BOOT.BIN';
const ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_GAME_ID = 'ULUS12345';

const ENCRYPTED_EXECUTABLE_ALTERNATIVE_BOOT_ISO = `${DIR}/encrypted-executable-alternative-boot.iso`;
const ENCRYPTED_EXECUTABLE_ALTERNATIVE_BOOT = `${DIR}/encrypted-executable-alternative-boot - EBOOT.DNR`;
const ENCRYPTED_EXECUTABLE_ALTERNATIVE_BOOT_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.DNR';
const ENCRYPTED_EXECUTABLE_ALTERNATIVE_BOOT_GAME_ID = 'ULUS12345';

const ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_ISO = `${DIR}/encrypted-executable-other-alternative-boot.iso`;
const ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT = `${DIR}/encrypted-executable-other-alternative-boot - GBL`;
const ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_EXECUTABLE_PATH = '/PSP_GAME/USRDIR/DATA/GIM/GBL';
const ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_GAME_ID = 'NPJH00100';

const ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_WRONG_GAME_ID_ISO = `${DIR}/encrypted-executable-other-alternative-boot-wrong-game-id.iso`;
const ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_WRONG_GAME_ID = `${DIR}/encrypted-executable-other-alternative-boot-wrong-game-id - EBOOT.BIN`;
const ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_WRONG_GAME_ID_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_WRONG_GAME_ID_GAME_ID = 'ULUS12345';

TEST_ISOS && TEST_RETAIL_ISOS && describe('PSP retail ISO parsing', function () { // eslint-disable-line func-names, no-unused-expressions
  this.timeout(TIMEOUT_MS); // Can't use arrow function above if referencing 'this' here

  it('should find an encrypted executable in the Castlevania ISO', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(CASTLEVANIA_ISO_FILENAME);
    const executableFileExists = await ArrayBufferUtil.fileExists(CASTLEVANIA_EXECUTABLE_FILENAME);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists) { // These files are not included in our repo for obvious reasons
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_ISO_FILENAME);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_EXECUTABLE_FILENAME);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'Castlevania');

      expect(pspIso.getExecutableInfo().gameId).to.equal(CASTLEVANIA_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal(CASTLEVANIA_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });

  it('should find an encrypted executable in the Final Fantasy Tactics ISO', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(FINAL_FANTASY_TACTICS_ISO_FILENAME);
    const executableFileExists = await ArrayBufferUtil.fileExists(FINAL_FANTASY_TACTICS_EXECUTABLE_FILENAME);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists) { // These files are not included in our repo for obvious reasons
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FINAL_FANTASY_TACTICS_ISO_FILENAME);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FINAL_FANTASY_TACTICS_EXECUTABLE_FILENAME);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'FinalFantasyTactics');

      expect(pspIso.getExecutableInfo().gameId).to.equal(FINAL_FANTASY_TACTICS_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal(FINAL_FANTASY_TACTICS_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });

  it('should find an encrypted executable in the Mega Man ISO', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(MEGA_MAN_ISO_FILENAME);
    const executableFileExists = await ArrayBufferUtil.fileExists(MEGA_MAN_EXECUTABLE_FILENAME);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists) { // These files are not included in our repo for obvious reasons
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_MAN_ISO_FILENAME);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_MAN_EXECUTABLE_FILENAME);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'MegaMan');

      expect(pspIso.getExecutableInfo().gameId).to.equal(MEGA_MAN_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal(MEGA_MAN_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });

  it('should find an encrypted executable in the Need for Speed ISO', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(NEED_FOR_SPEED_ISO_FILENAME);
    const executableFileExists = await ArrayBufferUtil.fileExists(NEED_FOR_SPEED_EXECUTABLE_FILENAME);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists) { // These files are not included in our repo for obvious reasons
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEED_FOR_SPEED_ISO_FILENAME);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEED_FOR_SPEED_EXECUTABLE_FILENAME);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'NeedForSpeed');

      expect(pspIso.getExecutableInfo().gameId).to.equal(NEED_FOR_SPEED_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal(NEED_FOR_SPEED_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });
});

TEST_ISOS && describe('PSP test ISO parsing', function () { // eslint-disable-line func-names, no-unused-expressions
  this.timeout(TIMEOUT_MS); // Can't use arrow function above if referencing 'this' here

  it('should find an encrypted executable matching magic 0', async () => {
    const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_MAGIC0_ISO);
    const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_MAGIC0);

    const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableMagic0');

    expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_MAGIC0_GAME_ID);
    expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_MAGIC0_EXECUTABLE_PATH);
    expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
  });

  it('should find an encrypted executable matching magic 1', async () => {
    const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_MAGIC1_ISO);
    const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_MAGIC1);

    const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableMagic1');

    expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_MAGIC1_GAME_ID);
    expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_MAGIC1_EXECUTABLE_PATH);
    expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
  });

  it('should find an unencrypted executable if there is no encrypted one', async () => {
    const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_EXECUTABLE_ISO);
    const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_EXECUTABLE);

    const pspIso = await PspIso.Create(isoArrayBuffer, 'UnencryptedExecutable');

    expect(pspIso.getExecutableInfo().gameId).to.equal(UNENCRYPTED_EXECUTABLE_GAME_ID);
    expect(pspIso.getExecutableInfo().path).to.equal(UNENCRYPTED_EXECUTABLE_EXECUTABLE_PATH);
    expect(pspIso.getExecutableInfo().encrypted).to.equal(false);
    expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
  });

  it('should find an unencrypted executable if the encrypted one\'s magic doesn\'t match', async () => {
    const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_ISO);
    const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC);

    const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableMagicDoesNotMatch');

    expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_GAME_ID);
    expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_EXECUTABLE_PATH);
    expect(pspIso.getExecutableInfo().encrypted).to.equal(false);
    expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
  });

  it('should find an encrypted executable in an alternative location', async () => {
    const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_ALTERNATIVE_BOOT_ISO);
    const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_ALTERNATIVE_BOOT);

    const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableAlternativeLocation');

    expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_ALTERNATIVE_BOOT_GAME_ID);
    expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_ALTERNATIVE_BOOT_EXECUTABLE_PATH);
    expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
  });

  it('should find an encrypted executable in an other alternative location', async () => {
    const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_ISO);
    const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT);

    const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableOtherAlternativeLocation');

    expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_GAME_ID);
    expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_EXECUTABLE_PATH);
    expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
  });

  it('should not find an encrypted executable in an other alternative location if the game ID doen\'t match', async () => {
    const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_WRONG_GAME_ID_ISO);
    const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_WRONG_GAME_ID);

    const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableOtherAlternativeLocationWrongGameId');

    expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_WRONG_GAME_ID_GAME_ID);
    expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_OTHER_ALTERNATIVE_BOOT_WRONG_GAME_ID_EXECUTABLE_PATH);
    expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
  });
});
