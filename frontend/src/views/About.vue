<template>
  <div class="about">

    <b-row class="justify-content-center">
      <b-col cols="11" md="5">
        <b-row class="justify-content-center">
          <h2>Join us on Discord</h2>
        </b-row>
        <b-row class="justify-content-center">
          <b-col>
            <b-row class="justify-content-center">
              <b-link href="https://discord.gg/wtJ7xUKKTR">
                <b-img src="discord-channels.png"/>
              </b-link>
            </b-row>
            <b-row class="justify-content-center">
              <b-link href="https://discord.gg/wtJ7xUKKTR">
                https://discord.gg/wtJ7xUKKTR
              </b-link>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <b-row class="justify-content-center">

      <b-col cols="11" md="4">
        <b-row class="justify-content-center header-row">
          <h2>Contact by email</h2>
        </b-row>
        <b-row class="justify-content-center info-row">
          savefileconverter{{'\xa0'}}(at) gmail{{'\xa0'}}(dot){{'\xa0'}}com
        </b-row>
      </b-col>

      <b-col cols="11" md="3">
        <b-row class="justify-content-center header-row">
          <h2>Donate</h2>
        </b-row>
        <b-row class="justify-content-center info-row">
          Everything on this site is free and open source with no advertising. If you find the site helpful and want to donate you can here:
          <div class="donate-button">
            <form action="https://www.paypal.com/donate" method="post" target="_top">
              <input type="hidden" name="hosted_button_id" value="DHDERHCQVLGPJ" />
              <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="Donate with PayPal" alt="Donate with PayPal button" />
            </form>
          </div>
        </b-row>
      </b-col>

      <b-col cols="11" md="4">
        <b-row class="justify-content-center header-row">
          <h2>Contribute code</h2>
        </b-row>
        <b-row class="justify-content-center info-row">
          <b-link href="https://github.com/euan-forrester/save-file-converter">
            https://github.com/euan-forrester/save-file-converter
          </b-link>
        </b-row>
      </b-col>

    </b-row>

  </div>
</template>

<style scoped>
.header-row {
  padding-top: 2em;
  padding-left: 0.5em;
  padding-right: 0.5em;
}
.info-row {
  padding-left: 0.5em;
  padding-right: 0.5em;
}
.donate-button {
  padding-top: 1em;
}
</style>

<script>
export default {
  name: 'AboutView',
};
</script>
