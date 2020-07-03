<template>
    <div class="conference-layout">
        <div class="main-video-layout">
            <video ref="mainVideo"
                   autoPlay
                   playsinline
            />
            <div class="main-video-name">
                <a class="main-video-name-a">{{localId}}</a>
            </div>
        </div>
        <div class="conference-local-video-layout" v-show="local.localStreamState">
            <div class="local-video-container">
                <video ref="localVideo" autoplay playsInline
                       class="local-video-size"/>
            </div>
        </div>
        <div class="conference-local-screen-layout" v-show="local.localScreenState">
            <div class="local-video-container">
                <video ref="localScreen" autoplay playsInline
                       class="local-video-size"/>
            </div>
        </div>
        <div class="small-video-list-div">
            <div class="small-video-list">
                <div v-for="(item,index) in streams" @click="_onChangeVideoPosition(item,index)">
                    <smallVideo :stream="item"></smallVideo>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import SmallVideo from './SmallVideo.vue'
    import {LocalStream} from 'ion-sdk-js';
    import MultiStreamsMixer from 'multistreamsmixer';
    import StreamHandle from '../assets/js/StreamHandle.js'

    export default {
        name: "VideoPage",
        props: ['client', 'local'],
        banzoustream:[],
        components: {
            smallVideo: SmallVideo
        },
        watch: {
            streams: {//深度监听，可监听到对象、数组的变化
                handler(val, oldVal) {
                    console.log("streams change");
                    if (this.streams[0] == undefined) {
                        this.$refs.mainVideo.srcObject = null
                        this.localId = ''
                        return
                    }
                    this.$refs.mainVideo.srcObject = this.streams[0].stream
                    this.localId = this.streams[0].mid
                },
                deep: true //true 深度监听
            }
        },
        data() {
            return {
                localId: '',
                streams: [],
                testAudio: require('../assets/audio/test.wav'),
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
                this.streams.push({mid: stream.mid, stream: stream, sid: mid});
            },
            async localStreamFunc(enabled) {
                console.log("handleLocalStream", navigator.mediaDevices.enumerateDevices())
                try {
                    if (enabled) {
                        this.client.local = await LocalStream.getUserMedia({
                            codec: this.streamSetting.codec.toUpperCase(),
                            resolution: this.streamSetting.resolution,
                            bandwidth: this.streamSetting.bandwidth,
                            audio: true,
                            video: true,
                        });

                        //对audio进行混流
                        if(StreamHandle.streamData.length > 1){
                            let audioTrack = StreamHandle.mixAudioStream(this.client.local,StreamHandle.streamData)
                            this.client.local.removeTrack(this.client.local.getAudioTracks()[0])
                            this.client.local.addTrack(audioTrack)
                        }

                        await this.client.publish(this.client.local);
                        this.$refs.localVideo.srcObject = this.client.local
                        this.$refs.localVideo.muted = true
                        this.local.localStreamState = true
                    } else {
                        if (this.client.local) {
                            this.client.unpublish(this.client.local);
                            this.client.local = null;
                        }
                    }
                    console.log("local stream", this.client.local.getTracks())
                } catch (e) {
                    console.log("handleLocalStream error => " + e);

                }
            },
            async handleScreenSharing() {
                console.log("this.local.localScreenState", this.local.localScreenState)
                if (this.local.localScreenState) {
                    this.local.localScreen = await LocalStream.getDisplayMedia({
                        codec: this.streamSetting.codec.toUpperCase(),
                        resolution: this.streamSetting.resolution,
                        bandwidth: this.streamSetting.bandwidth,
                        audio: true,
                        video: true
                    });

                    let videoTrack = StreamHandle.mixVideoStream(this.client.local,this.local.localScreen)
                    this.local.localScreen.removeTrack(this.local.localScreen.getVideoTracks()[0])
                    this.local.localScreen.addTrack(videoTrack)

                    await this.client.publish(this.local.localScreen);
                    console.log("this.local.localScreen", this.local.localScreen.getTracks())
                    this.$refs.localScreen.srcObject = this.local.localScreen
                } else {
                    if (this.local.localScreen) {
                        this._unpublish(this.local.localScreen)
                        this.local.localScreen = null;
                    }
                }
            },
            async cleanUp() {
                console.log("cleanup")
                this.streams.map(async item => {
                    await item.stream.unsubscribe();
                });
                this.streams = []
                await this._unpublish(this.client.local)
                this.client.local = null;
                if(this.local.localScreen){
                    this.local.localScreenState = false
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
                for (let i = 0; i < this.streams.length; i++) {
                    if (this.streams[i].mid === stream.mid) {
                        this.streams.splice(i, 1);
                        break;
                    }
                }
                this.streams.unshift(stream);
            },
            removeStream(id){
                for (let i = 0; i < this.streams.length; i++) {
                    if (this.streams[i].mid === id) {
                        this.streams.splice(i, 1);
                        break;
                    }
                }
            },
            addMusicStream(file){
                StreamHandle.fileStream(file)
            }
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
