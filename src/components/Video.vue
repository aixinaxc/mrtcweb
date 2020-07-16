<template>
    <div class="conference-layout">
        <div class="main-video-layout">
            <video ref="mainVideo"
                   autoPlay
                   playsinline
            />
            <div class="main-video-name">
                <a class="main-video-name-a">{{mainVideoName}}</a>
            </div>
        </div>
        <div class="conference-local-video-layout" v-show="local.state">
            <div class="local-video-container">
                <video ref="localVideo" autoplay playsInline
                       class="local-video-size"/>
            </div>
        </div>
        <div class="conference-local-screen-layout" v-show="screen.state">
            <div class="local-video-container">
                <video ref="localScreen" autoplay playsInline
                       class="local-video-size"/>
            </div>
        </div>
        <div class="small-video-list-div">
            <div class="small-video-list">
                <div v-for="(item,index) in $StreamHandle.remotes" @click="_onChangeVideoPosition(item,index)">
                    <smallVideo :stream="item"></smallVideo>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import SmallVideo from './SmallVideo.vue'
    import {LocalStream} from 'ion-sdk-js';
    //import StreamHandle from '../assets/js/StreamHandle.js'

    export default {
        name: "VideoPage",
        props: ['client', 'local','screen'],
        banzoustream:[],
        components: {
            smallVideo: SmallVideo
        },
        watch: {
            streams : {//深度监听，可监听到对象、数组的变化
                handler(val, oldVal) {
                    console.log("streams change");
                    if (this.$StreamHandle.remotes[0] == undefined) {
                        this.$refs.mainVideo.srcObject = null
                        //this.localId = ''
                        return
                    }
                    this.$refs.mainVideo.srcObject = this.$StreamHandle.remotes[0].stream
                    this.mainVideoName = this.$StreamHandle.remotes[0].stream.info.userInfo.userName
                },
                deep: true //true 深度监听
            }
        },
        data() {
            return {
                mainVideoName: '',
                streams: [],
                streamSetting: {
                    selectedAudioDevice: "",
                    selectedVideoDevice: "",
                    resolution: "vga",
                    bandwidth: 1024,
                    codec: "vp8",
                    isDevMode: false,
                }
            }
        },
        created() {
        },
        mounted() {
        },
        methods: {
            async AddStream(mid, info) {
                console.log("_handleAddStream", mid, info)
                let stream = await this.client.subscribe(mid);
                stream.info = info;
                this.streams = this.$StreamHandle.remotes.push({mid: stream.mid, stream: stream})
            },
            async localStreamFunc(enabled) {
                console.log("handleLocalStream", navigator.mediaDevices.enumerateDevices())
                try {
                    if (enabled) {
                        this.$StreamHandle.local.stream = await LocalStream.getUserMedia({
                            codec: this.streamSetting.codec.toUpperCase(),
                            resolution: this.streamSetting.resolution,
                            bandwidth: this.streamSetting.bandwidth,
                            audio: true,
                            video: true,
                        });

                        this.$StreamHandle.startMixAudioStream() //开始进行混流

                        await this.client.publish(this.$StreamHandle.local.stream);
                        console.log("=========",this.$StreamHandle.local.stream)
                        this.$refs.localVideo.srcObject = this.$StreamHandle.local.stream
                        this.$refs.localVideo.muted = true
                        this.$StreamHandle.local.state = true
                    } else {
                        if (this.$StreamHandle.local.stream) {
                            this.client.unpublish(this.$StreamHandle.local.stream);
                            this.$StreamHandle.local.stream = null;
                        }
                    }
                    console.log("local stream", this.$StreamHandle.local.stream.getTracks())
                } catch (e) {
                    console.log("handleLocalStream error => " + e);

                }
            },
            async handleScreenSharing() {
                console.log("this.local.localScreenState", this.$StreamHandle.screen.state)
                if ( this.$StreamHandle.screen.state) {
                    this.$StreamHandle.screen.stream = await LocalStream.getDisplayMedia({
                        codec: this.streamSetting.codec.toUpperCase(),
                        resolution: this.streamSetting.resolution,
                        bandwidth: this.streamSetting.bandwidth,
                        audio: true,
                        video: true
                    });

                    this.$StreamHandle.startMixVideoStream() //开始视频混流


                    await this.client.publish(this.$StreamHandle.screen.stream);
                    console.log("this.local.localScreen", this.$StreamHandle.screen.stream.getTracks())
                    this.$refs.localScreen.srcObject = this.$StreamHandle.screen.stream
                } else {
                    if (this.$StreamHandle.screen.stream) {
                        this._unpublish(this.$StreamHandle.screen.stream)
                        this.$StreamHandle.screen.stream = null;
                    }
                }
            },
            async cleanUp() {
                console.log("cleanup")
                this.$StreamHandle.remotes.map(async item => {
                    await item.stream.unsubscribe();
                });
                this.streams = []
                await this._unpublish(this.client.local)
                this.$StreamHandle.local.stream = null;
                if(this.$StreamHandle.screen.stream){
                    this.$StreamHandle.screen.state = false
                    this.handleScreenSharing()
                }

            },
            async _unpublish(stream) {
                if (stream) {
                    if (stream) {
                        let tracks = stream.getTracks();
                        for (let i = 0, len = tracks.length; i < len; i++) {
                            await tracks[i].stop();
                        }
                        await stream.unpublish()
                    }
                }
            },
            _onChangeVideoPosition(stream, index) {
                console.log("_onChangeVideoPosition id:" + stream.mid + "  index:" + index);
                if (index == 0) {
                    return;
                }
                for (let i = 0; i < this.$StreamHandle.remotes.length; i++) {
                    if (this.$StreamHandle.remotes[i].mid === stream.mid) {
                        this.$StreamHandle.remotes.splice(i, 1);
                        break;
                    }
                }
                this.$StreamHandle.remotes.unshift(stream);
            },
            removeStream(id){
                for (let i = 0; i < this.$StreamHandle.remotes.length; i++) {
                    if (this.$StreamHandle.remotes[i].mid === id) {
                        this.$StreamHandle.remotes.splice(i, 1);
                        break;
                    }
                }
                this.streams = this.$StreamHandle.remotes
            },
        }
    }
</script>

<style scoped>
    @import "../assets/css/style.css";

    .conference-layout {
        margin-top: 0px;
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        padding: 0px;
        background-color: #4a4a4a;
    }

    .conference-layout-wating {
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .conference-local-video-layout {
        position: absolute;
        top: 30px;
        left: 50px;
    }

    .conference-local-screen-layout {
        position: absolute;
        top: 30px;
        right: 24px;
    }
</style>
