<template>
  <div id="app">
    <div id="nav">
      <b-row>
        <b-col class="nav-row">
          <router-link to="/retron-5">Retron{{'\xa0'}}5{{'\xa0'}}/{{'\xa0'}}RetroFreak</router-link> |
          <router-link to="/gameshark">GameShark{{'\xa0'}}(GBA)</router-link> |
          <router-link to="/gameshark-sp">GameShark{{'\xa0'}}SP{{'\xa0'}}(GBA)</router-link> |
          <router-link to="/action-replay">Action{{'\xa0'}}Replay{{'\xa0'}}(GBA)</router-link> |
          <router-link to="/wii">Wii{{'\xa0'}}Virtual{{'\xa0'}}Console</router-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <router-link to="/troubleshooting">Troubleshooting{{'\xa0'}}(Beta)</router-link> |
          <router-link to="/other-converters">Other{{'\xa0'}}converters</router-link> |
          <router-link to="/about">About{{'\xa0'}}/{{'\xa0'}}Contact</router-link>
        </b-col>
      </b-row>
    </div>
    <router-view/>
    <mq-layout :mq="['xs', 'sm']">
      <div class="footer"/> <!-- Add some blank space at the bottom to look better on mobile -->
    </mq-layout>
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
  min-height: 7em;
}
</style>
