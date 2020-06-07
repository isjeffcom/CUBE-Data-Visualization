<template>
    <div id="ui">
        <div id="building-info" v-if="SelectedObj && SelectedType == 'building'">

        </div>
    </div>
</template>

<script>
import EventBus from '../../bus'

export default {
    name: "ui",
    data(){
        return{
            SelectedObj: null,
            SelectedType: null,
        }
    },
    mounted(){

    },

    created(){
        // Event Register
        EventBus.$on("Selected", (obj)=>{this.selected(obj)})
    },
    methods:{

    }
}
</script>

<style scoped>

</style>