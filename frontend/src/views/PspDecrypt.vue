<template>
  <div class="home">
    <DecryptPsp/>
  </div>
</template>

<script>
// @ is an alias to /src
import DecryptPsp from '@/components/DecryptPsp.vue';

export default {
  name: 'PspDecryptView',
  components: {
    DecryptPsp,
  },
};
</script>
