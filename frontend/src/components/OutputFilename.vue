<template>
  <b-row no-gutters align-h="start" align-v="center">
    <b-col :cols="this.leaveRoomForHelpIcon ? 11 : 12" sm="12">
      <b-form-input
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        placeholder="Output filename"
      />
    </b-col>
  </b-row>
</template>

<style scoped>

::placeholder {
  color: #495057; /* bootstrap's $gray-700. Otherwise it doesn't match the placeholder color for b-form-file (and b-form-select) */
}

</style>

<script>
export default {
  name: 'OutputFilename',
  props: [
    'value',
    'leaveRoomForHelpIcon',
  ],
  data() {
    return {

    };
  },
};
</script>
