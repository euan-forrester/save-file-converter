<template>
  <div class="home">
    <ConvertPs1Emulator/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertPs1Emulator from '@/components/ConvertPs1Emulator.vue';

export default {
  name: 'Ps1EmulatorView',
  components: {
    ConvertPs1Emulator,
  },
};
</script>
