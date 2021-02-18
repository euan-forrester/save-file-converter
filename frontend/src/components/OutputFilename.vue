<template>
  <b-row no-gutters align-h="center" align-v="center">
    <b-col cols=12>
      <input
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
        placeholder="Output filename">
    </b-col>
  </b-row>
</template>

<script>
export default {
  props: [
    'value',
  ],
  data() {
    return {

    };
  },
};
</script>
