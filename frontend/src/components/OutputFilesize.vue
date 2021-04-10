<template>
  <b-row no-gutters align-h="center" align-v="center">
    <b-col cols=11>
      <b-form-select
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        :options="options"
      />
    </b-col>
    <help-button
      popover-text="Some save files found on the Internet are not the correct size for their corresponding game and so may not work on a real cartridge or with a particular emulator.
      Try creating a test save with your cartridge or emulator to find what size it expects, then adjust the value here if necessary."
      :id="this.id"
    />
  </b-row>
</template>

<style scoped>

</style>

<script>
import HelpButton from './HelpButton.vue';

export default {
  name: 'OutputFilesize',
  props: [
    'value',
    'id',
  ],
  components: {
    HelpButton,
  },
  data() {
    return {
      options: [
        { value: null, text: 'Output file size', disabled: true },
        { value: 512, text: '0.5kB (512 bytes)' },
        { value: 8192, text: '8kB (8192 bytes)' },
        { value: 65536, text: '64kB (65536 bytes)' },
        { value: 131072, text: '128kB (131072 bytes)' },
      ],
    };
  },
};
</script>
