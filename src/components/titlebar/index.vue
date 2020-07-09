<template>
    <div id="titlebar">
        <div id="tb-logo">
            <img :src="'./assets/imgs/logo.png'" alt="">
        </div>
    </div>
</template>

<script>
export default {
    name: "titlebar",
    data(){
        return{

        }
    }
}
</script>

<style scoped>
#titlebar{
    position: fixed;
    top: 0px;
    left: 0px;
    background: rgba(0,0,0,0.2);
    width: 100%;
    height: 40px;
    padding: 24px;
}

#tb-logo img{
    width: 160px;
}
</style>