<template>
  <div class="home">
    <ConvertGameShark/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertGameShark from '@/components/ConvertGameShark.vue';

export default {
  name: 'GameShark',
  components: {
    ConvertGameShark,
  },
};
</script>
