<template>
  <div>
    <b-container>
      <b-tabs v-model="tabIndex" content-class="mt-3" justified>

        <b-tab title="Resize">
          <tab-resize ref="tabResize"/>
        </b-tab>

        <b-tab :title="'Endian\xa0swap'">
          <tab-endian-swap ref="tabEndianSwap"/>
        </b-tab>

        <b-tab title="Slice">
          <tab-slice ref="tabSlice"/>
        </b-tab>

        <b-tab title="File compare">
          <tab-file-compare ref="tabFileCompare"/>
        </b-tab>

        <b-tab title="Compression">
          <tab-compression ref="tabCompression"/>
        </b-tab>

        <b-tab :title="'Byte\xa0expansion'">
          <tab-byte-expansion ref="tabByteExpansion"/>
        </b-tab>

        <div v-if="false">
        <b-tab title="Header/footer">
          <tab-header-footer ref="tabHeaderFooter"/>
        </b-tab>
        </div>

      </b-tabs>

    </b-container>
  </div>
</template>

<style scoped>

</style>

<script>
import TabResize from './TabResize.vue';
import TabEndianSwap from './TabEndianSwap.vue';
import TabSlice from './TabSlice.vue';
import TabFileCompare from './TabFileCompare.vue';
import TabCompression from './TabCompression.vue';
import TabByteExpansion from './TabByteExpansion.vue';
import TabHeaderFooter from './TabHeaderFooter.vue';

export default {
  name: 'AdvancedUtils',
  components: {
    TabResize,
    TabEndianSwap,
    TabSlice,
    TabFileCompare,
    TabCompression,
    TabByteExpansion,
    TabHeaderFooter,
  },
  props: {
    initialTab: {
      type: String,
      default: 'resize',
    },
  },
  data() {
    return {
      tabIndex: 0,
    };
  },
  beforeMount() {
    // Need to keep these in sync with the template above. Is there a way to get these programmatically?
    const possibleTabNames = [
      'resize',
      'endian-swap',
      'slice',
      'file-compare',
      'compression',
      'byte-expansion',
      'header-footer',
    ];

    const initialTabIndex = possibleTabNames.indexOf(this.initialTab);

    this.tabIndex = (initialTabIndex >= 0) ? initialTabIndex : 0;
  },
  watch: {
    tabIndex() {
      this.$refs.tabResize.reset();
      this.$refs.tabEndianSwap.reset();
      this.$refs.tabSlice.reset();
      this.$refs.tabFileCompare.reset();
      this.$refs.tabCompression.reset();
      this.$refs.tabByteExpansion.reset();
      // this.$refs.tabHeaderFooter.reset();
    },
  },
};

</script>
