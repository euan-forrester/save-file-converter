<template>
  <div class="home">
    <ConvertGbaActionReplay/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertGbaActionReplay from '@/components/ConvertGbaActionReplay.vue';

export default {
  name: 'GbaActionReplayView',
  components: {
    ConvertGbaActionReplay,
  },
};
</script>
