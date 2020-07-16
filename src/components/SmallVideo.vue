<template>
    <div class="small-video-div" >
        <video
                ref="smallVideo"
                autoPlay
                playsInline
                class="small-video-size"
        />
        <div class="small-video-id-div">
            <a class="small-video-id-a">{{stream.stream.info.userInfo.userName}}</a>
        </div>
    </div>
</template>

<script>
    export default {
        name: "smallVideo",
        props: ['client', 'stream'],
        data(){
            return{

            }
        },
        mounted() {
            this.openStream()
        },
        methods:{
            openStream(){
                console.log("this.stream.stream",this.stream)
                this.$refs.smallVideo.srcObject = this.stream.stream
            }
        }
    }
</script>

<style scoped>

</style>
