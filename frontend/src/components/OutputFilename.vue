<template>
  <b-row no-gutters align-h="left" align-v="center">
    <b-col :cols="this.leaveRoomForHelpIcon ? 11 : 12" sm="12">
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
    'leaveRoomForHelpIcon',
  ],
  data() {
    return {

    };
  },
};
</script>
