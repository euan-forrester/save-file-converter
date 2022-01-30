<template>
  <div>
    <b-row>
      <b-col>
        <h2>
          Copy saves to/from real hardware
        </h2>
      </b-col>
    </b-row>
    <div class="blank-line"/>
    <div class="d-none d-md-block"/>
    <b-table striped hover :items="items" :fields="fields">
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
  color:  lightgrey;
}

</style>

<script>
import { BTable } from 'bootstrap-vue';

export default {
  name: 'RealHardware',
  components: {
    BTable,
  },
  data() {
    return {
      fields: [
        {
          key: 'product',
          label: 'Product name',
        },
        {
          key: 'nes',
          label: 'NES',
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
          product: {
            name: 'RetroBlaster',
            link: 'https://retrostage.net/?product=retroblaster-programmer-2-0',
          },
          nes: true,
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
          product: {
            name: 'RetroN 5',
            link: 'https://www.hyperkin.com/retron-5-hd-gaming-console-for-gba-gbc-gb-snes-nes-super-famicom-famicom-genesis-mega-drive-master-system-black-hyperkin.html',
          },
          nes: true,
          snes: true,
          n64: false,
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
          product: {
            name: 'GB Operator',
            link: 'https://www.epilogue.co/product/gb-operator',
          },
          nes: false,
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
          product: {
            name: 'Joey Jr.',
            link: 'https://bennvenn.myshopify.com/products/usb-gb-c-cart-dumper-the-joey-jr',
          },
          nes: false,
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
          product: {
            name: 'GBxCart RW',
            link: 'https://www.gbxcart.com/',
          },
          nes: false,
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
          product: {
            name: 'Memcard Pro',
            link: 'https://8bitmods.com/memcard-pro-for-playstation-1-smoke-black/',
          },
          nes: false,
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
          product: {
            name: 'RetroUSB AVS',
            link: 'https://www.retrousb.com/product_info.php?cPath=36&products_id=78&osCsid=57b224729a57c970466b063c02d2a56b',
          },
          nes: true,
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
      ],
    };
  },
};
</script>
