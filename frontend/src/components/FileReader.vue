<template>
  <b-form-file
    @input="loadFile"
    v-model="file"
    class="text-left"
    :placeholder="this.placeholderText"
    :accept="this.acceptExtension"
    :multiple="this.allowMultipleFiles"
    ref="bFormFile"
  />
</template>

<script>
export default {
  props: {
    placeholderText: {
      type: String,
      default: '',
    },
    acceptExtension: {
      type: String,
      default: '',
    },
    allowMultipleFiles: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      file: null,
    };
  },
  computed: {
    userSelectedSomething() {
      return this.allowMultipleFiles ? this.file.length > 0 : this.file !== null; // model is [] or null if user cancels the dialog box, depending on whether multiple is set
    },
  },
  methods: {
    reset() {
      this.$refs.bFormFile.reset();
    },
    // FileReader has a bit of a nonstandard interface, so wrap it in a Promise
    // https://stackoverflow.com/a/46568146
    makeReadFilePromise(file) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
          resolve(fr.result);
        };
        fr.onerror = reject;
        fr.readAsArrayBuffer(file);
      });
    },
    async loadFile() {
      if (this.userSelectedSomething) {
        if (this.allowMultipleFiles) {
          const arrayBuffers = await Promise.all(this.file.map((f) => this.makeReadFilePromise(f)));

          this.$emit('load', this.file.map((f, i) => ({ filename: f.name, arrayBuffer: arrayBuffers[i] })));
        } else {
          const reader = new FileReader();

          reader.onload = (e) => this.$emit('load', { filename: this.file.name, arrayBuffer: e.target.result });
          reader.readAsArrayBuffer(this.file);
        }
      }
    },
  },
};
</script>
