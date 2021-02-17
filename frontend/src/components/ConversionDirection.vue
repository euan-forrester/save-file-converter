<template>
  <div>
    <mq-layout :mq="this.horizontalLayout">
      <div v-if="this.conversionDirection ==='convertToEmulator'">
        <font-awesome-icon icon="arrow-circle-right" size="3x"/>
      </div>
      <div v-else>
        <font-awesome-icon icon="arrow-circle-left" size="3x"/>
      </div>
    </mq-layout>
    <mq-layout :mq="this.verticalLayout">
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
    horizontalLayout: Array,
    verticalLayout: Array,
    conversionDirection: String,
  },
};
</script>
