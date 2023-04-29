# Save File Converter

Web-based tool to convert save files from retro game consoles to different formats

![Save file conversion](https://github.com/euan-forrester/save-file-converter/raw/main/images/main-window.png "Save file conversion")

Available at https://savefileconverter.com

## Upcoming features

- Be able to autodetect the format of a given save file (note that raw files need their size checked, unrecognized size means invalid file)
- PS2 formats (check out https://gamefaqs.gamespot.com/ps2/536777-suikoden-iii/saves for a potential list)
- GameCube formats (check out https://gamefaqs.gamespot.com/gamecube/533008-soulcalibur-ii/saves for a potential list)
- Saturn formats
  - Add ability to add/extract a single game's save to/from a RAM backup, similar to how PS1/N64 work
- What are the 64kB `.srm` files for SNES etc on thetechgame.com? Want to extract a 'normal' `.srm` file from them
- I need suggestions!

## Contact

If you have questions, need help, or have comments or suggestions, please hop on Discord: https://discord.gg/wtJ7xUKKTR

Or email savefileconverter (at) gmail (dot) com

## Donations

Everything on this site is free and open source with no advertising. If you find the site helpful and want to donate you can here:

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=DHDERHCQVLGPJ)

## Usecases for further thought

- Automatically add/remove header added by some flash carts (e.g. EZ Flash) given an example file
- Be able to change the size of a raw GBA save to help move between emulators

## Emulators with incompatible save formats

- (GBA) Pizza Boy GBA files incompatible with mGBA (believe mGBA uses raw files)
- (PS1) Beetle HW incompatible with DuckStation
- (Saturn) SSF incompatible with Mednafen/Beetle Saturn
- (N64) Mupen64Plus Next files incompatible with Wii64
- (32X) Picodrive has its own save format (somewhere around here? https://github.com/notaz/picodrive/blob/1d366b1ad9362fd463c42979c8a687dfc7f46c46/platform/common/emu.c#L873)

## Other feature ideas

- Convert to Wii VC
- Convert to/from Wii U VC
- Convert to/from 3DS VC
- Split/recombine GBA emulator save files (Goomba/PocketNES/SmsAdvance)

## Save file formats

- Retron5
  - https://www.retro5.net/viewtopic.php?f=5&t=67&start=10
- GameShark (GBA)
  - (partial): https://gbatemp.net/threads/converting-gsv-or-sps-files-to-sav.51838/#post-664786
  - (reading): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1025
  - (writing): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1146
  - (partial): https://github.com/mgba-emu/mgba/blob/master/src/gba/sharkport.c
- GameShark SP (GBA)
  - (reading): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1078
- GameShark (PS2)
  - (partial): https://www.ps2savetools.com/documents/xps-format/
- PS2
  - Save Tools: https://www.ps2savetools.com/
  - Save tool: 
    - http://www.csclub.uwaterloo.ca:11068/mymc/
    - https://github.com/ps2dev/mymc
  - Memory card format: http://www.csclub.uwaterloo.ca:11068/mymc/ps2mcfs.html
  - Use PS2 files on PS3: https://github.com/bucanero/apollo-ps3
  - Convert PS2 formats: https://github.com/bucanero/psv-save-converter
- Wii Virtual Console save game format (note that the files are encrypted)
  - https://wiibrew.org/wiki/Wii_Savegame_Parser
  - https://wiibrew.org/wiki/Savegame_Files
  - https://wiibrew.org/wiki/FE100
  - https://hackmii.com/2008/04/keys-keys-keys/
  - https://github.com/Plombo/segher-wii-tools
  - (writing) https://github.com/Plombo/segher-wii-tools/blob/master/twintig.c
  - https://github.com/Plombo/vcromclaim
  - https://github.com/JanErikGunnar/vcromclaim
- Wii U Virtual Console:
  - https://github.com/mstan/SaveAIO
- PSP save file decryption/encryption (note that some files require a per-game key):
  - https://www.psdevwiki.com/ps3/PSP_Savedata
  - https://github.com/BrianBTB/SED-PC (PC application that decrypts/encrypts saves)
  - https://github.com/cielavenir/psp-savedata-endecrypter (improvement to SED-PC that works with "mode 4" (whatever that is???))
  - https://wololo.net/talk/viewtopic.php?t=37556 (PSP plugin that dumps a game's key)
  - https://github.com/TheHellcat/psp-hb/blob/master/SavegameDeemer_620TN/deemer_hooker/main.c#L204 Code for a plugin that does this. It intercepts the call to save the game, and writes out a copy of the save in plaintext, plus the key
  - https://wololo.net/talk/viewtopic.php?p=137153&sid=37bd385d91e7c2d89cf1ff8d70e8c640#p137153 Discussion saying that you need to either use a plugin, or parse the executable for look for code around a certain system call to figure out what value is being passed to it
  - I can't seem to find an online list of game keys, and requiring users to install a plugin on their PSP then type a gamekey into the interface seems like too much to ask.
  - https://github.com/hrydgard/ppsspp PSP emulator
    - https://github.com/hrydgard/ppsspp/blob/master/Tools/SaveTool/decrypt.c This decrypts a savegame file
    - https://github.com/hrydgard/ppsspp/blob/81b5e080ff885e98b5761632158457ce3e5d1fb5/Core/HLE/sceKernelModule.cpp#L1251 The code before here decrypts the executable
    - https://github.com/euan-forrester/psp-encryption-webassembly Copy of the relevant code in PPSSPP, compiled into webassembly
  - For Gran Turismo the game key is device-specific. Must be generated somehow from a device ID. So can't find it in the executable.
    - So we still need a box to enter the game key instead of just ISO/eboot
    - Maybe detect this ISO and warn the user?
- NES/SNES Classic save game format
  - https://github.com/TeamShinkansen/Hakchi2-CE (tool used to write games onto the devices)
  - https://github.com/JanErikGunnar/ClassicEditionTools (scripts to convert raw saves to/from NES Classic format)
  - http://darkakuma.z-net.us/p/sfromtool.html (convert SNES ROMs and/or saves to the SNES Classic ROM and/or save format)
  - I'm not sure there's enough demand for a web-based tool that does this. The devices aren't available for sale anymore and you already have to run a Windows program to transfer the games. Also the Windows tool for the SNES Classic has the ability to convert saves already.
- PS1:
  - https://www.psdevwiki.com/ps3/PS1_Savedata
  - MemcardRex format: https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs
  - DexDrive format: https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs
  - Signing a PSP .VMP file: https://github.com/dots-tb/vita-mcr2vmp
  - PS3 format: https://psdevwiki.com/ps3/PS1_Savedata#PS1_Single_Save_.3F_.28.PSV.29
- N64:
  - https://github.com/bryc/mempak
    - https://bryc.github.io/mempak/ (online preview)
  - https://github.com/bryc/mempak/wiki/DexDrive-.N64-format
  - https://github.com/bryc/mempak/wiki/MemPak-structure
  - https://github.com/heuripedes/pj64tosrm (convert raw save to emulator format)
  - http://micro-64.com/database/gamesave.shtml (list of games which use each save type)
  - https://www.reddit.com/r/n64/comments/ezhleg/guide_how_to_backup_your_n64_saves_to_your_pc/
  - https://www.youtube.com/watch?v=PpolokImIeU (convert individual note to .eep format)
  - https://github.com/ssokolow/saveswap Swap endianness of N64 saves to move between Everdrive/emulators/etc
  - Game serial codes:
    - https://niwanetwork.org/wiki/List_of_Nintendo_64_games_by_serial_code
    - https://meanwhileblog.wordpress.com/n64-game-code-list/
- 3DS Virtual Console
  - SNES games: https://github.com/manuGMG/3ds-snes-sc
    - This tool above apparently works on some WiiU VC games as well: https://gbatemp.net/threads/release-3ds-snes-save-converter.574927/
  - Pokemon saves: https://sav2vc.fm1337.com/
  - https://github.com/mstan/SaveAIO
  - List of emulators on the 3DS: https://wiki.gbatemp.net/wiki/List_of_3DS_homebrew_emulators
  - open_agb_firm: https://github.com/profi200/open_agb_firm allows usage of the build-in GBA hardware
    - Save files from here need to be 64-bit endian-swapped to work in a regular emulator: https://github.com/exelotl/gba-eeprom-save-fix
- Sega Saturn
  - https://github.com/hitomi2500/ss-save-parser
- Gamecube
  - https://github.com/kwsch/PKHeX (Save editor for Pokemon games. Can apparently parse GCN files among others. Needs a closer look)
- Flash carts:
  - Goomba emulator (for GB/C games on GBA flash cart)
    - https://github.com/libertyernie/goombasav (save converter)
    - https://github.com/masterhou/goombacolor/blob/master/src/sram.c
    - https://www.reddit.com/r/everdrive/comments/qcgus7/using_a_gba_x5_goomba_sram_save_file_on_a_gbc_x7/****
  - N64 Everdrive
    - https://github.com/ssokolow/saveswap
    - GB/C emulator: https://github.com/lambertjamesd/gb64/blob/master/src/save.c
    - NES emulator:
      - https://github.com/hcs64/neon64v2/issues/20
      - http://themanbehindcurtain.blogspot.com/
- Sega CD:
  - https://github.com/superctr/buram/
  - Sega operating manuals
    - Standards that games were to use when interfacing with backup RAM: https://segaretro.org/images/6/6e/Sega-CD_Software_Standards.pdf
    - BIOS calls that games were to use to access backup RAM: https://segaretro.org/images/4/44/MCDBios.pdf
  - https://segaretro.org/CD_BackUp_RAM_Cart
  - https://github.com/ekeeke/Genesis-Plus-GX/issues/449
  - savesplitter tool here: https://krikzz.com/pub/support/mega-everdrive/pro-series/
- Analogue Pocket:
  - List of available cores: https://openfpga-cores-inventory.github.io/analogue-pocket/
    - Note that there are sometimes multiple cores for a particular platform (e.g. Genesis)
- Visual Boy Advance emulator
  - Explanation of its format: https://emulation.gametechwiki.com/index.php/Game_Boy_Advance_emulators#Save_formats
  - Code that does the conversion: https://github.com/libretro/vbam-libretro/blob/25fefc1b3dcdc6362c44845687bea70dd350c33a/src/libretro/gbaconv/gbaconv.c
  - Online converter: https://thysbelon.github.io/gbaconv-web/
  - Info on some ports of this emulator: https://thysbelon.github.io/2023/03/07/How-to-Convert-4GS-and-DSZ-save-files-to-SAV

## Cart reader notes
 
- Retrode2
  - Genesis: SRAM/FRAM saves are byte expanded by doubling: "HELLO" becomes "HHEELLLLOO" rather than " H E L L O" like in many emulators/flash carts
- Retroblaster
  - Same as Retrode2

## GBA save file size difficulty
- https://zork.net/~st/jottings/GBA_saves.html
- https://dillonbeliveau.com/2020/06/05/GBA-FLASH.html

## Real-Time Clock save format
- https://bgb.bircd.org/rtcsave.html

Some platforms (e.g. some MiSTer cores) append RTC data to the end of a save file. The above link describes a common format for RTC data.

## Offline use

Occassionally there's a need to use the tool offline, such as when you'll be without an Internet connection for an extended period. There's 2 methods to achieve this:

### Method 1: Use a website saving tool

You can't just right click on the page and select Save As... because the site is divided internally into many different files, and that will only download some of them.

Google `website saving tool` or something similar to find an up-to-date list of such tools.

### Method 2: Build it locally (for people comfortable with the command line and development tools)

You may need to modify some of these steps depending on your development environment, but this should give you the general idea.

#### MacOS/Linux

Install `homebrew`: https://brew.sh/

```
brew install yarn
brew install git
```
Then proceed to the [Common](https://github.com/euan-forrester/save-file-converter#common) section

#### Windows

Find an equivalent package manager to `homebrew`, and use it to install `git` and `yarn` (or install them and their dependencies manually: `git`: https://github.com/git-guides/install-git, `yarn`: https://yarnpkg.com/getting-started/install)

Then proceed to the [Common](https://github.com/euan-forrester/save-file-converter#common) section

#### Common

```
git clone git@github.com:euan-forrester/save-file-converter.git
cd save-file-converter/frontend
yarn install
yarn serve
```

Then open http://localhost:8080/ in your browser.

Note that you'll have to keep the command line window open with `yarn serve` running for as long as you want to access the site.

## Internet archive

If you need to, you can also access the site via the Internet archive here: https://web.archive.org/web/https://savefileconverter.com/
