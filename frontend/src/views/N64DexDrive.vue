<template>
  <div class="home">
    <ConvertN64DexDrive/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertN64DexDrive from '@/components/ConvertN64DexDrive.vue';

export default {
  name: 'N64DexDriveView',
  components: {
    ConvertN64DexDrive,
  },
};
</script>
