<template>
  <div class="home">
    <ConvertSegaSaturnEmulator/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertSegaSaturnEmulator from '@/components/ConvertSegaSaturnEmulator.vue';

export default {
  name: 'SegaSaturnEmulatorView',
  components: {
    ConvertSegaSaturnEmulator,
  },
};
</script>
