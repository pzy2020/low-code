<script lang="tsx">
import { ref,defineComponent } from 'vue'


const count = ref(0)
export default defineComponent({
    props: {
      msg: String
    },
    setup(props){
        return ()=>(
        <div>
        Hello,World {count.value}
        <h1>{props.msg}</h1>
        </div>
        
        )
    }
})
</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
