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
      sort-by="product"
      :sticky-header="$mq | mq({ xs: 'calc(100vh - 4em)', sm: 'calc(100vh - 4em)', md: 'calc(100vh - 4em)', lg: false, xl: false })"
    > <!-- Need a primary key to make sure Vue updates all columns of our table when sorting-->
      <template #cell(product)="data">
        <b-link :href="data.value.link">{{ data.value.name }}</b-link>
      </template>
      <template #cell()="data">
        <i :class="data.value ? 'fas fa-check fa-2x supported' : 'fas fa-times fa-2x not-supported'"></i>
      </template>
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

</style>

<script>
import { BTable } from 'bootstrap-vue';

export default {
  name: 'OriginalHardware',
  components: {
    BTable,
  },
  methods: {
    sortCompare(aRow, bRow, key, sortDesc, formatter, compareOptions, compareLocale) {
      const a = aRow[key];
      const b = bRow[key];

      if ((typeof a === 'boolean') && (typeof b === 'boolean')) {
        if (a === b) {
          return aRow.product.name.localeCompare(bRow.product.name, compareLocale, compareOptions); // Sort all of the boolean trues together by name, and the falses by name, so it's easier to read and everything is in a deterministic order
        }

        return a ? -1 : 1;
      }

      if (key === 'product') {
        return a.name.localeCompare(b.name, compareLocale, compareOptions);
      }

      return 0;
    },
  },
  data() {
    return {
      fields: [
        {
          key: 'product',
          label: 'Product name',
          sortable: true,
          stickyColumn: true,
        },
        {
          key: 'nes',
          label: 'NES',
          sortable: true,
        },
        {
          key: 'famicom',
          label: 'Famicom',
          sortable: true,
        },
        {
          key: 'snes',
          label: 'SNES',
          sortable: true,
        },
        {
          key: 'n64',
          label: 'N64',
          sortable: true,
        },
        {
          key: 'gb',
          label: 'GB/GBC',
          sortable: true,
        },
        {
          key: 'gba',
          label: 'GBA',
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
          product: {
            name: 'RetroBlaster',
            link: 'https://retrostage.net/?product=retroblaster-programmer-2-0',
          },
          nes: true,
          famicom: true,
          snes: true,
          n64: true,
          gb: true,
          gba: true,
          sms: false,
          genesis: true,
          saturn: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 1,
          product: {
            name: 'RetroN 5',
            link: 'https://www.hyperkin.com/retron-5-hd-gaming-console-for-gba-gbc-gb-snes-nes-super-famicom-famicom-genesis-mega-drive-master-system-black-hyperkin.html',
          },
          nes: true,
          famicom: true,
          snes: true,
          n64: false,
          gb: true,
          gba: true,
          sms: true,
          genesis: true,
          saturn: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 2,
          product: {
            name: 'GB Operator',
            link: 'https://www.epilogue.co/product/gb-operator',
          },
          nes: false,
          famicom: false,
          snes: false,
          n64: false,
          gb: true,
          gba: true,
          sms: false,
          genesis: false,
          saturn: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 3,
          product: {
            name: 'Joey Jr.',
            link: 'https://bennvenn.myshopify.com/products/usb-gb-c-cart-dumper-the-joey-jr',
          },
          nes: false,
          famicom: false,
          snes: false,
          n64: false,
          gb: true,
          gba: true,
          sms: false,
          genesis: false,
          saturn: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 4,
          product: {
            name: 'GBxCart RW',
            link: 'https://www.gbxcart.com/',
          },
          nes: false,
          famicom: false,
          snes: false,
          n64: false,
          gb: true,
          gba: true,
          sms: false,
          genesis: false,
          saturn: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 5,
          product: {
            name: 'Memcard Pro',
            link: 'https://8bitmods.com/memcard-pro-for-playstation-1-smoke-black/',
          },
          nes: false,
          famicom: false,
          snes: false,
          n64: false,
          gb: false,
          gba: false,
          sms: false,
          genesis: false,
          saturn: false,
          tg16: false,
          ps1: true,
          ps2: false,
        },
        {
          index: 6,
          product: {
            name: 'RetroUSB AVS',
            link: 'https://www.retrousb.com/product_info.php?products_id=78',
          },
          nes: true,
          famicom: true,
          snes: false,
          n64: false,
          gb: false,
          gba: false,
          sms: false,
          genesis: false,
          saturn: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 7,
          product: {
            name: 'Retrode2',
            link: 'https://dragonbox.de/en/cartridge-dumper/retrode2.html',
          },
          nes: false,
          famicom: false,
          snes: true,
          n64: true,
          gb: true,
          gba: true,
          sms: true,
          genesis: true,
          saturn: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
        {
          index: 8,
          product: {
            name: 'Open Source Cartridge Reader',
            link: 'https://github.com/sanni/cartreader',
          },
          nes: true,
          famicom: true,
          snes: true,
          n64: true,
          gb: true,
          gba: true,
          sms: true,
          genesis: true,
          saturn: false,
          tg16: false,
          ps1: false,
          ps2: false,
        },
      ],
    };
  },
};
</script>
