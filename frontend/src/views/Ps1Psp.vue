<template>
  <div class="home">
    <ConvertPs1Psp/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertPs1Psp from '@/components/ConvertPs1Psp.vue';

export default {
  name: 'Ps1PspView',
  components: {
    ConvertPs1Psp,
  },
};
</script>
