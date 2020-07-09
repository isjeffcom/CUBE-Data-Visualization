<template>
  <div id="app">
    <titlebar></titlebar>
    <router-view></router-view>
  </div>
</template>

<script>

import titlebar from './components/titlebar'

export default {
  name: 'App',
  components: {
    titlebar
  }
}
</script>

<style>

*{
  margin: 0;
  padding: 0;
}

button{
  background: #3994FF;
  color: #fff;
  font-weight: bold;
  text-align: center;
  appearance: none;
  border: none;
  padding: 16px;
  border: 3px solid rgba(0,0,0,0.1);
  cursor: pointer;
  transition:all .5s cubic-bezier(0.075, 0.82, 0.165, 1);
}

button:hover{
  background: #127FFF;
}

input{
  height: 30px;
  border: none;
  appearance: none;
  outline: none;
  border: 2px solid rgba(0,0,0,0);
  transition:all .5s cubic-bezier(0.075, 0.82, 0.165, 1);
}

input:focus{
  height: 30px;
  border: 2px solid #127FFF;
}

body{
  position: absolute;
  background: #1D2128;
}



#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;
}
</style>
