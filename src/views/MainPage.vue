<template>
    <a-layout class="app-layout">
        <a-layout-header class="app-header">
            <div class="app-header-left">
            </div>
            <div class="app-header-tool">
                <a-tooltip>
                    <template slot="title">
                        Mute/Cancel
                    </template>
                    <a-button ghost type="link" size="large" icon="audio"
                              :style=" + local.audioMuted?'':'color:red'" v-show="$StreamHandle.scene=='sub'?false:true"
                              @click="muteMediaTrack('audio', local.audioMuted)"/>
                </a-tooltip>
                <a-tooltip>
                    <template slot="title">
                        Open/Close video
                    </template>
                    <a-button ghost type="link" size="large" icon="video-camera"
                              :style=" + local.videoMuted?'':'color:red'" v-show="$StreamHandle.scene=='sub'?false:true"
                              @click="muteMediaTrack('video', local.videoMuted)"/>
                </a-tooltip>
                <a-tooltip>
                    <template slot="title">
                        Hangup
                    </template>
                    <a-button ghost type="danger" shape="circle" size="large" icon="phone" @click="showModal()"/>
                </a-tooltip>
                <a-tooltip>
                    <template slot="title">
                        Share desktop
                    </template>
                    <a-button ghost type="link" size="large" icon="desktop" v-show="$StreamHandle.scene=='sub'?false:true"
                              :style=" + screen.state?'color:red':''" @click="ScreenSharing()"/>
                </a-tooltip>
                <a-tooltip>
                    <template slot="title">
                        伴奏
                    </template>

                </a-tooltip>
            </div>
            <div class="app-header-right">

            </div>
        </a-layout-header>
        <a-layout>
            <a-layout-sider
                    defaultCollapsed
                    width="320"
                    trigger="null"
                    theme="light"
                    collapsible
                    collapsedWidth="0">
                <div class="left-container">
                    <chat ref="chat" :client="client" :config="config"></chat>
                </div>
            </a-layout-sider>

            <a-layout-content class="app-right-layout">
                <videoPage ref="video" :client="client" :local="local" :screen="screen"></videoPage>
            </a-layout-content>

        </a-layout>

        <a-modal
                title="挂断"
                :visible="visible"
                :confirm-loading="confirmLoading"
                @ok="handleOk"
                @cancel="handleCancel"
        >
            <p>您确定要挂断吗？</p>
        </a-modal>

        <a-modal
                title="配置"
                :closable='config.closable'
                :visible="config.visible"
                :confirm-loading="config.confirmLoading"
                @ok="configOk"
        >
            <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
                <a-form-item label="房间名">
                    <a-input
                            v-decorator="['roomName', { rules: [{ required: true, message: '请输入房间名!' }] }]"
                    />
                </a-form-item>
                <a-form-item label="用户名">
                    <a-input
                            v-decorator="['userName', { rules: [{ required: true, message: '请输入用户名!' }] }]"
                    />
                </a-form-item>
                <a-form-item label="模拟场景">
                    <a-select
                            v-decorator="['scene',{ rules: [{ required: true, message: '请选择要模拟的场景!' }] }]"
                            placeholder="请选择要模拟的场景"
                    >
                        <a-select-option value="meeting">会议</a-select-option>
                        <a-select-option value="" disabled>直播：</a-select-option>
                        <a-select-option value="pub">发布者</a-select-option>
                        <a-select-option value="sub">订阅者</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="选择伴奏">
                    <a-upload :before-upload="beforeUpload">
                        <a-button>
                            <a-icon type="upload"/>
                            Select File
                        </a-button>
                    </a-upload>
                </a-form-item>
            </a-form>
        </a-modal>


    </a-layout>

</template>

<script>
    import {Client} from 'ion-sdk-js';
    import md5 from 'js-md5';
    import VideoPage from '../components/Video.vue'
    import Chat from '../components/Chat.vue'
    import AFormItem from "ant-design-vue/es/form/FormItem";
    //import StreamHandle from '../assets/js/StreamHandle.js'

    export default {
        name: "MainPage",
        components: {
            AFormItem,
            videoPage: VideoPage,
            chat: Chat
        },
        watch: {
            $StreamHandle: {//深度监听，可监听到对象、数组的变化
                handler(val, oldVal) {
                    console.log("streams change111");
                    //this.localId = this.streams[0].mid
                },
                deep: true //true 深度监听
            }
        },
        data() {
            return {
                url: "wss://" + window.location.hostname + ":8443/ws",
                client: '',
                visible: false,
                confirmLoading: false,
                form: this.$form.createForm(this, {name: 'coordinated'}),
                config: {
                    closable: false,
                    visible: true,
                    confirmLoading: false,
                },
                local:{},
                screen:{}
            }
        },
        created() {

        },
        mounted() {
            // this.$refs.video.getMixedMicrophoneAndMp3()
            //console.log("navigator.mediaDevices.enumerateDevices()", navigator.mediaDevices.enumerateDevices().then(this.getDevices))
            console.log("navigator.mediaDevices.getSupportedConstraints()", navigator.mediaDevices.getSupportedConstraints())
        },
        methods: {
            beforeUpload(file) {
                //this.$refs.video.addMusicStream(file)
                this.$StreamHandle.fileStream(file)
            },
            getDevices(deviceInfos) {
                deviceInfos.forEach(function (deviceInfo) {
                    console.log('设备种类=' + deviceInfo.kind + '：设备名 = ' + deviceInfo.label + '；设备id = ' + deviceInfo.deviceId + '；groupId=' + deviceInfo.groupId);
                })
            },
            configOk(e) {
                this.form.validateFields((err, values) => {
                    console.log("--------------------------", err)
                    if (!err) {
                        console.log('Received values of form: ', values);
                        /*this.config.scene = values.scene
                        this.config.user.uid = md5(values.userName)
                        this.config.user.name = values.userName
                        this.config.room.rid = md5(values.roomName)
                        this.config.room.name = values.roomName*/
                        this.$StreamHandle.scene = values.scene
                        this.$StreamHandle.roomInfo.roomId = md5(values.roomName)
                        this.$StreamHandle.roomInfo.roomName = values.roomName
                        let userInfo = {
                            userId : md5(values.userName),
                            userName : values.userName
                        }
                        this.$StreamHandle.userInfos.push(userInfo)
                        this.CLIENT()//创建连接
                        this.config.visible = false
                    }
                });
            },
            joinRoom() {
                this.client.join(this.$StreamHandle.roomInfo.roomId, {
                    roomInfo : this.$StreamHandle.roomInfo,
                    userInfo : this.$StreamHandle.userInfos[0]
                });
                if (this.$StreamHandle.scene == "meeting" || this.$StreamHandle.scene == "pub") {
                    this.$refs.video.localStreamFunc(true)
                }
            },
            showModal() {
                this.visible = true;
            },
            async handleOk(e) {
                await this.$refs.video.cleanUp();
                await this.client.leave();
                this.visible = false
                this.config.visible = true
                //this.local.localStreamState = false
                this.$StreamHandle.local.state = false
                this.local = this.$StreamHandle.local
            },
            handleCancel(e) {
                console.log('Clicked cancel button');
                this.visible = false;
            },
            ScreenSharing() {
                this.screen.state = this.$StreamHandle.screen.state = !this.$StreamHandle.screen.state
                this.$refs.video.handleScreenSharing()
            },
            muteMediaTrack(type, enabled) {
                if (!this.$StreamHandle.local.stream) {
                    return
                }
                if (enabled) {
                    this.$StreamHandle.local.stream.unmute(type)
                } else {
                    this.$StreamHandle.local.stream.mute(type)
                }
                if (type === "audio") {
                    this.$StreamHandle.local.audioMuted = !enabled
                } else if (type === "video") {
                    this.$StreamHandle.local.videoMuted = !enabled
                }
                this.local = this.$StreamHandle.local
            },
            CLIENT() {
                let that = this
                let config = {
                    url: this.url,
                    uid: this.$StreamHandle.userInfos[0].userId
                }
                const client = new Client(config);
                client.on("peer-join", (id, info) => {
                    console.log("peer-join", id, info)
                    this.$StreamHandle.userInfos.push(info.userInfo)//保存进入该房间的人员信息
                    this.$notification['success']({message: '欢迎' + info.username + "加入" + info.roomname})
                });
                client.on("peer-leave", (id) => {
                    console.log("peer-leave!");
                });
                client.on("transport-open", () => {
                    console.log("transport open!");
                    that.joinRoom()
                });
                client.on("transport-closed", () => {
                    console.log("transport closed!");
                });
                client.on("stream-add", (id, info) => {
                    console.log("stream-add %s,%s!", id, info);
                    this.$refs.video.AddStream(id, info)

                });
                client.on("stream-remove", (stream) => {
                    console.log("stream-remove %s,%", stream.id);
                    this.$refs.video.removeStream(stream.id)
                });
                client.on("broadcast", (mid, info) => {
                    console.log("broadcast %s,%s!", mid, info);
                    this.$refs.chat.addMsg(info)
                });
                this.client = client
            }

        }
    }
</script>

<style scoped>
    @import "../assets/css/app.css";

    .left-container {
        width: 320px;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
</style>
