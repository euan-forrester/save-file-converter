<template>
  <div class="home">
    <ConvertFlashCarts/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertFlashCarts from '@/components/ConvertFlashCarts.vue';

export default {
  name: 'FlashCartsView',
  components: {
    ConvertFlashCarts,
  },
};
</script>
