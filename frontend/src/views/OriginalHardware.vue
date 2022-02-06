<template>
  <div>
    <b-row>
      <b-col>
        <h2>
          Copy saves to/from original hardware
        </h2>
      </b-col>
    </b-row>
    <div class="blank-line"/>
    <div class="d-none d-md-block"/>
    <b-table
      striped
      responsive="lg"
      :items="items"
      :fields="fields"
      :sort-compare="sortCompare"
      primary-key="index"
      sort-by="hardware"
      :sticky-header="$mq | mq({ xs: 'calc(100vh - 4em)', sm: 'calc(100vh - 4em)', md: 'calc(100vh - 4em)', lg: false, xl: false })"
    > <!-- Need a primary key to make sure Vue updates all columns of our table when sorting-->
      <template #cell(hardware)="data">
        <div v-if="data.value.hasOwnProperty('link')">
          <b-link :href="data.value.link">{{ data.value.name }}</b-link>
        </div>
        <div v-else>
          {{ data.value.name }}
        </div>
      </template>
      <template #cell()="data">
        <i :class="data.value ? 'fas fa-check fa-2x supported' : 'fas fa-times fa-2x not-supported'"></i>
      </template>
      <template #cell(show_details)="row">
        <div v-if="row.item.hasOwnProperty('software')">
          <b-button size="sm" @click="row.toggleDetails" class="mr-2">
            {{ row.detailsShowing ? 'Less' : 'More'}} info
          </b-button>
        </div>
      </template>
      <template #row-details="row">
        <div :v-if="row.item.software !== undefined">
          <b-card class="text-left">
            <b-row align-h="start">
              <b-col cols="2"/>
              <b-col cols="2"><b>Software:</b></b-col>
              <b-col><b-link :href="row.item.software.link">{{ row.item.software.name }}</b-link></b-col>
            </b-row>
            <div v-if="row.item.software.hasOwnProperty('howToRun')">
              <b-row align-h="start">
                <b-col cols="2"/>
                <b-col cols="2"><b>How to run:</b></b-col>
                <div v-if="row.item.software.hasOwnProperty('howToRunLink')">
                  <b-col><b-link :href="row.item.software.howToRunLink">{{ row.item.software.howToRun }}</b-link></b-col>
                </div>
                <div v-else>
                  <b-col>{{ row.item.software.howToRun }}</b-col>
                </div>
              </b-row>
            </div>
          </b-card>
        </div>
      </template>
      <template #table-caption><p class="contact-info">Anything missing? Found a mistake? Product discontinued? Contact savefileconverter (at) gmail (dot) com</p></template>
    </b-table>
  </div>
</template>

<style scoped>
.blank-line {
  min-height: 1em;
}

.supported {
  color: green;
}

.not-supported {
  color: lightgrey;
}

.contact-info {
  margin-left: 3em;
}

</style>

<script>
import { BTable, BCard } from 'bootstrap-vue';

export default {
  name: 'OriginalHardware',
  components: {
    BTable,
    BCard,
  },
  methods: {
    sortCompare(aRow, bRow, key, sortDesc, formatter, compareOptions, compareLocale) {
      const a = aRow[key];
      const b = bRow[key];

      if ((typeof a === 'boolean') && (typeof b === 'boolean')) {
        if (a === b) {
          return aRow.hardware.name.localeCompare(bRow.hardware.name, compareLocale, compareOptions); // Sort all of the boolean trues together by name, and the falses by name, so it's easier to read and everything is in a deterministic order
        }

        return a ? -1 : 1;
      }

      if (key === 'hardware') {
        return a.name.localeCompare(b.name, compareLocale, compareOptions);
      }

      return 0;
    },
  },
  data() {
    return {
      fields: [
        {
          key: 'hardware',
          label: 'Hardware',
          sortable: true,
          stickyColumn: true,
        },
        {
          key: 'show_details',
          label: 'More info',
        },
        {
          key: 'nes',
          label: 'NES / FC',
          sortable: true,
        },
        {
          key: 'snes',
          label: 'SNES / SFC',
          sortable: true,
        },
        {
          key: 'n64',
          label: 'N64',
          sortable: true,
        },
        {
          key: 'gcn',
          label: 'GCN',
          sortable: true,
        },
        {
          key: 'gb',
          label: 'GB / GBC',
          sortable: true,
        },
        {
          key: 'gba',
          label: 'GBA',
          sortable: true,
        },
        {
          key: 'gamegear',
          label: 'Game Gear',
          sortable: true,
        },
        {
          key: 'sms',
          label: 'SMS',
          sortable: true,
        },
        {
          key: 'genesis',
          label: 'Genesis',
          sortable: true,
        },
        {
          key: 'saturn',
          label: 'Saturn',
          sortable: true,
        },
        {
          key: 'dc',
          label: 'DC',
          sortable: true,
        },
        {
          key: 'tg16',
          label: 'TG-16',
          sortable: true,
        },
        {
          key: 'ps1',
          label: 'PS1',
          sortable: true,
        },
        {
          key: 'ps2',
          label: 'PS2',
          sortable: true,
        },
      ],
      items: [
        {
          index: 0,
          hardware: {
            name: 'RetroBlaster',
            link: 'https://retrostage.net/?product=retroblaster-programmer-2-0',
          },
          nes: true,
          snes: true,
          n64: true,
          gcn: false,
          gb: true,
          gba: true,
          gamegear: false,
          sms: false, // Feb 1, 2022: Not currently possible via a SMS-to-Genesis adapter, although an SMS-specific adapter is in the workd
          genesis: true,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 1,
          hardware: {
            name: 'RetroN 5',
            link: 'https://www.hyperkin.com/retron-5-hd-gaming-console-for-gba-gbc-gb-snes-nes-super-famicom-famicom-genesis-mega-drive-master-system-black-hyperkin.html',
          },
          nes: false, // I never could get this to work with mine, although the device supports NES/FC games
          snes: true,
          n64: false,
          gcn: false,
          gb: true,
          gba: true, // This only partially worked with mine. Some random-seeming games just wouldn't work with it
          gamegear: false,
          sms: true, // This is just an assumption, given that you can play SMS games with a SMS-to-Genesis adapter
          genesis: true,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 2,
          hardware: {
            name: 'GB Operator',
            link: 'https://www.epilogue.co/product/gb-operator',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: true,
          gba: true,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 3,
          hardware: {
            name: 'Joey Jr.',
            link: 'https://bennvenn.myshopify.com/products/usb-gb-c-cart-dumper-the-joey-jr',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: true,
          gba: true,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 4,
          hardware: {
            name: 'GBxCart RW',
            link: 'https://www.gbxcart.com/',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: true,
          gba: true,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 5,
          hardware: {
            name: 'Memcard Pro',
            link: 'https://8bitmods.com/memcard-pro-for-playstation-1-smoke-black/',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: true,
          ps2: false,
        },
        {
          index: 6,
          hardware: {
            name: 'RetroUSB AVS',
            link: 'https://www.retrousb.com/product_info.php?products_id=78',
          },
          software: {
            name: 'Scoreboard (under Firmware Downloads)',
            link: 'https://www.retrousb.com/product_info.php?products_id=78',
            howToRun: 'Requires a Windows or Mac computer',
            howToRunLink: 'https://twitter.com/retrousb/status/1154136414247882753?lang=en',
          },
          nes: true,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 7,
          hardware: {
            name: 'Retrode2',
            link: 'https://dragonbox.de/en/cartridge-dumper/retrode2.html',
          },
          nes: false,
          snes: true,
          n64: true,
          gcn: false,
          gb: true,
          gba: true,
          gamegear: false,
          sms: true,
          genesis: true,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 8,
          hardware: {
            name: 'Open Source Cartridge Reader',
            link: 'https://github.com/sanni/cartreader',
          },
          nes: true,
          snes: true,
          n64: true,
          gcn: false,
          gb: true,
          gba: true,
          gamegear: false,
          sms: true,
          genesis: true,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 9,
          hardware: {
            name: 'Raphnet N64-to-USB controller adapter',
            link: 'https://www.raphnet-tech.com/products/n64_usb_adapter_gen3/index.php',
          },
          software: {
            name: 'Raphnet Adapter Manager',
            link: 'https://www.raphnet-tech.com/products/adapter_manager/index.php',
            howToRun: 'Requires a Windows computer',
          },
          nes: false,
          snes: false,
          n64: true,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        /* Feb 3, 2022: Contacted raphnet and they say this cart programmer cannot yet read/write sram although it technically is possible. They say they will be adding this feature soon
        {
          index: 10,
          hardware: {
            name: 'Raphnet cartridge programmer',
            link: 'https://www.raphnet-tech.com/products/sms_cartridge_reader_programmer/index.php',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: true,
          sms: true,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        */
        {
          index: 11,
          hardware: {
            name: 'PS3 USB Memory Card Adapter',
            link: 'https://www.psdevwiki.com/ps3/Card_Adapter',
          },
          software: {
            name: 'MemcardRex',
            link: 'https://github.com/ShendoXT/memcardrex/releases',
            howToRun: 'Requires a Windows computer',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: true,
          ps2: false,
        },
        {
          index: 12,
          hardware: {
            name: 'PS1 DexDrive',
            link: 'https://en.wikipedia.org/wiki/DexDrive',
          },
          software: {
            name: 'MemcardRex',
            link: 'https://github.com/ShendoXT/memcardrex/releases',
            howToRun: 'Requires a Windows computer',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: true,
          ps2: false,
        },
        {
          index: 13,
          hardware: {
            name: 'PlayStation 2 + USB stick',
          },
          software: {
            name: 'uLaunchElf',
            link: 'http://ps2ulaunchelf.pbworks.com/w/page/19520134/FrontPage',
            howToRun: 'PS2 memory card with Free MCBoot preinstalled',
            howToRunLink: 'https://www.google.com/search?q=ps2+mcboot+memory+card',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: true,
          ps2: true,
        },
        {
          index: 14,
          hardware: {
            name: 'GBA + GameCube + GC-to-GBA link cable',
            link: 'https://en.wikipedia.org/wiki/GameCube_%E2%80%93_Game_Boy_Advance_link_cable',
          },
          software: {
            name: 'GBA Link Cable Dumper',
            link: 'https://github.com/FIX94/gba-link-cable-dumper',
            howToRun: 'Various methods for booting homebrew on GameCube',
            howToRunLink: 'https://www.gc-forever.com/wiki/index.php?title=Booting_homebrew',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: true,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 15,
          hardware: {
            name: 'GBA + Wii + GC-to-GBA link cable',
            link: 'https://en.wikipedia.org/wiki/GameCube_%E2%80%93_Game_Boy_Advance_link_cable',
          },
          software: {
            name: 'GBA Link Cable Dumper',
            link: 'https://github.com/FIX94/gba-link-cable-dumper',
            howToRun: 'Wii softmodding guide',
            howToRunLink: 'https://wii.guide/',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: true,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 16,
          hardware: {
            name: 'Nintendo DS + R4 cartridge',
            link: 'https://en.wikipedia.org/wiki/R4_cartridge',
          },
          software: {
            name: 'GBA Backup Tool',
            link: 'https://projectpokemon.org/home/tutorials/save-editing/managing-gba-saves/using-gba-backup-tool-r55/',
            howToRun: 'R4 cartridge',
            howToRunLink: 'https://www.google.com/search?q=best+r4+card+no+timebomb',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: true,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 17,
          hardware: {
            name: 'GameCube + GameBoy Player',
            link: 'https://en.wikipedia.org/wiki/Game_Boy_Player',
          },
          software: {
            name: 'GameBoy Interface',
            link: 'https://www.gc-forever.com/wiki/index.php?title=Game_Boy_Interface#GBA_dumper',
            howToRun: 'Various methods for booting homebrew on GameCube',
            howToRunLink: 'https://www.gc-forever.com/wiki/index.php?title=Booting_homebrew',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: true,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 18,
          hardware: {
            name: 'Turbo Everdrive',
            link: 'https://krikzz.com/our-products/cartridges/turbo-everdrive-v2.html',
          },
          software: {
            name: 'TEOS Beta4 firmware',
            link: 'https://krikzz.com/forum/index.php?topic=9417.msg71671#msg71671',
            howToRun: 'How to install OS files on Turbo Everdrive',
            howToRunLink: 'https://youtube.com/clip/UgkxzaGhUNm20tYKK8slOsuMqjbYWvJnU3d5',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: true,
          ps1: false,
          ps2: false,
        },
        {
          index: 19,
          hardware: {
            name: '64drive + UltraSave',
            link: 'http://64drive.retroactive.be/features.php',
          },
          nes: false,
          snes: false,
          n64: true,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 20,
          hardware: {
            name: 'Saturn Gamer\'s Cartridge',
            link: 'https://ppcenter.webou.net/satcart/#gamers',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: true,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 21,
          hardware: {
            name: 'Terraonion MODE',
            link: 'https://terraonion.com/en/producto/terraonion-mode/',
          },
          software: {
            name: 'Official firmware update',
            link: 'https://downloads.terraonion.com/shop/product/terraonion-mode-dreamcast-saturn-ode/view',
            howToRun: 'Copy the entire Saturn save RAM, or individual saves',
            howToRunLink: 'https://www.retrorgb.com/mode-saturn-save-restore-backup.html',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: true,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 22,
          hardware: {
            name: 'Satiator ODE',
            link: 'https://www.satiator.net/',
          },
          software: {
            name: 'Save Game Copier',
            link: 'https://github.com/slinga-homebrew/Save-Game-Copier',
            howToRun: 'Copy individual saves',
            howToRunLink: 'https://www.retrorgb.com/save-game-copier-project-by-slinga-homebrew.html',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: true,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 23,
          hardware: {
            name: 'Fenrir ODE',
            link: 'https://www.fenrir-ode.fr/',
          },
          software: {
            name: 'Save Game Copier',
            link: 'https://github.com/slinga-homebrew/Save-Game-Copier',
            howToRun: 'Copy individual saves',
            howToRunLink: 'https://www.retrorgb.com/save-game-copier-project-by-slinga-homebrew.html',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: true,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 24,
          hardware: {
            name: 'Raphnet N64-to-USB controller adapter + Transfer Pak',
            link: 'https://www.raphnet-tech.com/products/n64_usb_adapter_gen3/index.php',
          },
          software: {
            name: 'Raphnet Adapter Manager',
            link: 'https://www.raphnet.net/programmation/gcn64tools/index_en.php#8',
            howToRun: 'Requires a Windows computer',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: true,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 25,
          hardware: {
            name: 'GameCube + SD card adapter',
            link: 'https://www.google.com/search?q=gamecube+sd+card+adapter',
          },
          software: {
            name: 'GameCube Memory Manager',
            link: 'https://wiibrew.org/wiki/GameCube_Memory_Manager',
            howToRun: 'Various methods for booting homebrew on GameCube',
            howToRunLink: 'https://www.gc-forever.com/wiki/index.php?title=Booting_homebrew',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: true,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 26,
          hardware: {
            name: 'Terraonion MODE',
            link: 'https://terraonion.com/en/producto/terraonion-mode/',
          },
          software: {
            name: 'VMU Tool',
            link: 'https://bswirl.kitsunet.org/vmutool/release/about/?lg=en&menu=on',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: true,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 27,
          hardware: {
            name: 'GDEmu ODE',
            link: 'https://gdemu.wordpress.com/',
          },
          software: {
            name: 'VMU Tool',
            link: 'https://bswirl.kitsunet.org/vmutool/release/about/?lg=en&menu=on',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: true,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 27,
          hardware: {
            name: 'USB-GDROM ODE',
            link: 'http://3do-renovation.ru/USB-GDROM_Controller.htm',
          },
          software: {
            name: 'VMU Tool',
            link: 'https://bswirl.kitsunet.org/vmutool/release/about/?lg=en&menu=on',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: true,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 28,
          hardware: {
            name: 'MemCARDuino',
            link: 'http://shendohardware.blogspot.com/2013/06/memcarduino.html',
          },
          software: {
            name: 'MemcardRex',
            link: 'https://github.com/ShendoXT/memcardrex/releases',
            howToRun: 'Requires a Windows computer',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: true,
          ps2: false,
        },
        {
          index: 29,
          hardware: {
            name: 'PS1CardLink',
            link: 'https://github.com/ShendoXT/ps1cardlink',
          },
          software: {
            name: 'MemcardRex',
            link: 'https://github.com/ShendoXT/memcardrex/releases',
            howToRun: 'Requires a Windows computer',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: true,
          ps2: false,
        },
        {
          index: 30,
          hardware: {
            name: 'Raphnet PS1/PS2-to-USB controller adapter + PS1 Multitap',
            link: 'https://www.raphnet-tech.com/products/psx_to_usb/index.php',
          },
          software: {
            name: 'Raphnet Adapter Manager',
            link: 'https://www.raphnet-tech.com/products/adapter_manager/index.php',
            howToRun: 'Requires a Windows computer',
          },
          nes: false,
          snes: false,
          n64: false,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: true,
          ps2: false,
        },
        {
          index: 31,
          hardware: {
            name: 'Forever Pak 64',
            link: 'https://4layertech.com/products/forever-pak-64',
          },
          nes: false,
          snes: false,
          n64: true,
          gcn: false,
          gb: false,
          gba: false,
          gamegear: false,
          sms: false,
          genesis: false,
          saturn: false,
          dc: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
      ],
    };
  },
};
</script>
