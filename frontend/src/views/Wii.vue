<template>
  <div class="home">
    <ConvertWii/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertWii from '@/components/ConvertWii.vue';

export default {
  name: 'WiiView',
  components: {
    ConvertWii,
  },
};
</script>
