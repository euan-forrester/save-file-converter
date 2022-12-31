<template>
  <div class="about">

    <b-row class="justify-content-md-center header-row">
      <h2>Join us on Discord</h2>
    </b-row>

    <b-row class="justify-content-md-center">
      <b-col cols="3">
        <b-link href="https://discord.gg/wtJ7xUKKTR">
          <b-img src="discord-channels.png"/>
        </b-link>
        <b-link href="https://discord.gg/wtJ7xUKKTR">https://discord.gg/wtJ7xUKKTR</b-link>
      </b-col>
    </b-row>

    <b-row class="justify-content-md-center header-row">
      <h2>Contact by email</h2>
    </b-row>
    <b-row class="justify-content-md-center">
      savefileconverter{{'\xa0'}}(at){{'\xa0'}}gmail{{'\xa0'}}(dot){{'\xa0'}}com
    </b-row>

    <b-row class="justify-content-md-center header-row">
      <h2>Donate</h2>
    </b-row>
    <b-row class="justify-content-md-center">
      Everything on this site is free and open source with no advertising. If you find the site helpful and want to donate you can here:
    </b-row>
    <b-row class="justify-content-md-center">
      <div>
        <form action="https://www.paypal.com/donate" method="post" target="_top">
          <input type="hidden" name="hosted_button_id" value="DHDERHCQVLGPJ" />
          <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="Donate with PayPal" alt="Donate with PayPal button" />
        </form>
      </div>
    </b-row>

    <b-row class="justify-content-md-center header-row">
      <h2>Contribute code</h2>
    </b-row>
    <b-row class="justify-content-md-center">
      <b-link href="https://github.com/euan-forrester/save-file-converter">
        https://github.com/euan-forrester/save-file-converter
      </b-link>
    </b-row>

  </div>
</template>

<style scoped>
.header-row {
  padding-top: 1em;
}
</style>

<script>
export default {
  name: 'AboutView',
};
</script>
