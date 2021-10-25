<template>
  <div id="app">
    <div id="nav">
      <b-row>
        <b-col class="nav-row">
          <router-link to="/retron-5">Retron{{'\xa0'}}5{{'\xa0'}}/{{'\xa0'}}RetroFreak</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/wii">Wii{{'\xa0'}}Virtual{{'\xa0'}}Console (NES, SNES, N64, TG-16, SMS, Genesis, Neo{{'\xa0'}}Geo, C64)</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/n64/dexdrive">N64{{'\xa0'}}-{{'\xa0'}}DexDrive</router-link> |
          <router-link to="/n64/controller-pak">N64{{'\xa0'}}-{{'\xa0'}}Controller{{'\xa0'}}Pak{{'\xa0'}}/{{'\xa0'}}emulator</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/gameshark">GBA{{'\xa0'}}-{{'\xa0'}}GameShark</router-link> |
          <router-link to="/gameshark-sp">GBA{{'\xa0'}}-{{'\xa0'}}GameShark{{'\xa0'}}SP</router-link> |
          <router-link to="/action-replay">GBA{{'\xa0'}}-{{'\xa0'}}Action{{'\xa0'}}Replay</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/ps1/dexdrive">PS1{{'\xa0'}}-{{'\xa0'}}DexDrive</router-link> |
          <router-link to="/ps1/psp">PS1{{'\xa0'}}-{{'\xa0'}}PSP</router-link> |
          <router-link to="/ps1/emulator">PS1{{'\xa0'}}-{{'\xa0'}}emulator</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <router-link to="/troubleshooting">Troubleshooting{{'\xa0'}}(Beta)</router-link> |
          <router-link to="/other-converters">Other{{'\xa0'}}converters</router-link> |
          <router-link to="/download-saves">Download{{'\xa0'}}saves</router-link> |
          <router-link to="/about">About{{'\xa0'}}/{{'\xa0'}}Contact</router-link>
        </b-col>
      </b-row>
      <hr/>
    </div>
    <router-view/>
    <div class="footer"/> <!-- Add some blank space at the bottom to look better -->
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 2em;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.nav-row {
  padding-bottom: 1em;
}

.footer {
  min-height: 6em;
}
</style>
