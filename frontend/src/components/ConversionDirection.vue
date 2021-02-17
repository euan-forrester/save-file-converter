<template>
  <div>
    <mq-layout mq="md+">
      <div v-if="this.conversionDirection ==='convertToEmulator'">
        <font-awesome-icon icon="arrow-circle-right" size="3x"/>
      </div>
      <div v-else>
        <font-awesome-icon icon="arrow-circle-left" size="3x"/>
      </div>
    </mq-layout>
    <mq-layout :mq="['xs', 'sm']">
      <div v-if="this.conversionDirection ==='convertToEmulator'">
        <font-awesome-icon icon="arrow-circle-down" size="3x"/>
      </div>
      <div v-else>
        <font-awesome-icon icon="arrow-circle-up" size="3x"/>
      </div>
    </mq-layout>
  </div>
</template>

<script>
export default {
  props: {
    conversionDirection: String,
  },
};
</script>
