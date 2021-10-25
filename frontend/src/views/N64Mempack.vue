<template>
  <div class="home">
    <ConvertN64Mempack/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertN64Mempack from '@/components/ConvertN64Mempack.vue';

export default {
  name: 'N64Mempack',
  components: {
    ConvertN64Mempack,
  },
};
</script>
