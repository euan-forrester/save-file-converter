<template>
    <div>
    <b-row no-gutters align-h="start" align-v="center">
      <b-col cols=11 sm=12>
        <div>
          <b-form-select
            v-bind:value="value"
            v-on:input="$emit('input', $event)"
            :options="options"
            :disabled="disabled"
          />
          <help-button
            popover-text="The compression algorithm to use to compress or decompress the save file"
            :id="this.id"
            class="help-button"
          />
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<style scoped>
  .help-button {
    position: absolute;
    right: -1.6em;
    top: 0em;
  }
</style>

<script>
import HelpButton from './HelpButton.vue';

export default {
  name: 'CompressionType',
  props: {
    value: {
      type: String,
      default: null,
    },
    id: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    HelpButton,
  },
  data() {
    return {
      options: [
        { value: 'zlib', text: 'zlib compression' }, // Used by retroarch (also used internally in Retron 5 files). I think this is by far the most common compression type users will run into, so I think it makes sense to make this the default
        { value: 'lzo', text: 'LZO compression' }, // This is used internally in goomba etc files, so it was easy to include here
        // We could potentially add .zip compression here as well, since we handle it elsewhere for online emulators
        // But that's the only use case I've found for it so far, and it has a dedicated page in the app and we can always ask users
        // to just use their operating system's zip program. Also, zip supports multiple files inside one .zip file, which would increase
        // the complexity of our Advanced tab, and without a use case for that it doesn't seem like the right thing to do at the moment.
      ],
    };
  },
};
</script>
