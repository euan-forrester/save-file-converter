<template>
  <div class="home">
    <EraseCartridge/>
  </div>
</template>

<script>
// @ is an alias to /src
import EraseCartridge from '@/components/EraseCartridge.vue';

export default {
  name: 'EraseCart',
  components: {
    EraseCartridge,
  },
};
</script>
