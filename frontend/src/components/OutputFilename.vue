<template>
  <b-row no-gutters align-h="center" align-v="center">
    <b-col cols=12>
      <b-form-input
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        placeholder="Output filename"
      />
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'OutputFilename',
  props: [
    'value',
  ],
  data() {
    return {

    };
  },
};
</script>
