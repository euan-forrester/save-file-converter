<template>
  <div>
    <mq-layout mq="md+">
      <font-awesome-icon icon="arrow-circle-right" size="3x"/>
    </mq-layout>
    <mq-layout :mq="['xs', 'sm']">
      <font-awesome-icon icon="arrow-circle-down" size="3x"/>
    </mq-layout>
  </div>
</template>

<script>
export default {

};
</script>
