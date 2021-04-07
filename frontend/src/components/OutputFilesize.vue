<template>
  <b-row no-gutters align-h="center" align-v="center">
    <b-col cols=12>
      <b-form-select
        v-model="selected"
        :options="options"
      />
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'OutputFilesize',
  props: [
    'value',
  ],
  data() {
    return {
      selected: null,
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
