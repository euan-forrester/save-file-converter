<template>
  <div id="app">
    <div id="nav">
      <b-row>
        <b-col class="nav-row">
          <router-link to="/mister">MiSTer</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/srm-sav">
            .srm{{'\xa0'}}
            <span class="arrow-spacing"><i class="fa fa-arrow-right-arrow-left"></i></span>
            {{'\xa0'}}.sav{{'\xa0'}}
          </router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/flash-carts">Flash{{'\xa0'}}cartridges{{'\xa0'}}/ original{{'\xa0'}}cartridges</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/nintendo-switch-online">Nintendo{{'\xa0'}}Switch{{'\xa0'}}Online</router-link> |
          <router-link to="/wii">Wii{{'\xa0'}}Virtual{{'\xa0'}}Console</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/online-emulators">Online{{'\xa0'}}emulators{{'\xa0'}}</router-link> |
          <router-link to="/retron-5">Retron{{'\xa0'}}5 / RetroFreak</router-link>
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
          <router-link to="/gba/gameshark">GBA{{'\xa0'}}-{{'\xa0'}}GameShark</router-link> |
          <router-link to="/gba/gameshark-sp">GBA{{'\xa0'}}-{{'\xa0'}}GameShark{{'\xa0'}}SP</router-link> |
          <router-link to="/gba/action-replay">GBA{{'\xa0'}}-{{'\xa0'}}Action{{'\xa0'}}Replay</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/ps1/dexdrive">PS1{{'\xa0'}}-{{'\xa0'}}DexDrive</router-link> |
          <router-link to="/ps1/psp">PS1{{'\xa0'}}-{{'\xa0'}}PSP</router-link> |
          <router-link to="/ps1/ps3">PS1{{'\xa0'}}-{{'\xa0'}}PS3</router-link> |
          <router-link to="/ps1/emulator">PS1{{'\xa0'}}-{{'\xa0'}}emulator</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/sega-saturn/saroo">Sega{{'\xa0'}}Saturn{{'\xa0'}}-{{'\xa0'}}Saroo{{'\xa0'}}<span class="new-text">(New)</span></router-link> |
          <router-link to="/sega-saturn/emulator">Sega{{'\xa0'}}Saturn{{'\xa0'}}-{{'\xa0'}}Emulator{{'\xa0'}}<span class="new-text">(New)</span></router-link> |
          <router-link to="/sega-cd">Sega{{'\xa0'}}CD</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/gamecube">GameCube{{'\xa0'}}<span class="new-text">(New)</span></router-link> |
          <router-link to="/psp">PSP{{'\xa0'}}-{{'\xa0'}}Save{{'\xa0'}}decryption</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="nav-row">
          <router-link to="/download-saves">Download{{'\xa0'}}saves</router-link> |
          <router-link to="/original-hardware">Copy{{'\xa0'}}saves{{'\xa0'}}to/from{{'\xa0'}}original{{'\xa0'}}hardware</router-link> |
          <router-link to="/utilities/erase-save">Erase{{'\xa0'}}save from cartridge</router-link>
        </b-col>
      </b-row>
      <b-row class="nav-row">
        <b-col>
          <router-link to="/other-converters">Other{{'\xa0'}}converters</router-link> |
          <router-link to="/utilities/advanced">Advanced</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <router-link to="/about">Discord{{'\xa0'}}/{{'\xa0'}}Contact{{'\xa0'}}/{{'\xa0'}}Donate</router-link>
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

.arrow-spacing {
  padding-left: 0.1em;
  padding-right: 0.1em;
}

.nav-row {
  padding-bottom: 1em;
}

.footer {
  min-height: 6em;
}

.new-text {
  color: indianred;
}

.beta-text {
  color: indianred;
}
</style>
