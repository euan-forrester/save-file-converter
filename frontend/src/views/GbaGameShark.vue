<template>
  <div class="home">
    <ConvertGbaGameShark/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertGbaGameShark from '@/components/ConvertGbaGameShark.vue';

export default {
  name: 'GbaGameShark',
  components: {
    ConvertGbaGameShark,
  },
};
</script>
