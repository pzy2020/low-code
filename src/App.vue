<script lang="tsx">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Cmps from "./views/Cmps/index.vue";
import Content from "./views/Content/index.vue";
import Edit from "./views/Edit/index.vue";
import { defineComponent } from 'vue'
export default defineComponent({
  setup(props){
    return ()=>(
      <div class="main">
      <Cmps />
      <Content />
      <Edit />
      </div>
    )
  }
})
</script>



<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
.main{
  height: 100%;
}
</style>
