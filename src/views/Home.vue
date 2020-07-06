<template>
    <a-layout class="app-layout">
        <a-layout-header>Header</a-layout-header>
        <a-layout>
            <a-layout-sider>
                <div>
                    <a-menu mode="inline"  v-for="(item,index) in list">
                        <a-menu-item key="1" @click="AddStream(item)">
                            {{item}}
                        </a-menu-item>
                    </a-menu>
                </div>
            </a-layout-sider>
            <a-layout-content>
                <div style="margin-top: 64px;z-index: 999">
                    <video ref="mainVideo"
                           autoPlay
                           playsinline
                           controls
                    />
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<script>
    import {Client} from 'ion-sdk-js';
    export default {
        name: "Home",
        data() {
            return {
                url: "wss://" + window.location.hostname + ":8443/ws",
                client: '',
                list:[]
            }
        },
        created() {
            this.CLIENT()
        },
        mounted() {

        },
        methods: {
            pullStreamList(){
                let msg = {
                    msgType : "pullstreamlist",
                }
                this.client.broadcast(msg)
            },
            async AddStream(mid) {
                console.log("_handleAddStream", mid)
                let stream = await this.client.subscribe(mid);
                console.log(stream.mid)
                this.$refs.mainVideo.srcObject = stream
            },
            joinRoom() {
                this.client.join("222222", {
                    uid: "11111",
                    username: "w",
                    rid: "222222",
                    roomname: "test"
                });
            },
            CLIENT() {
                let config = {
                    url: this.url,
                    uid: "11111"
                };
                const client = new Client(config);
                client.on("peer-join", (id, info) => {
                    console.log("lllllllllllllllll")
                    console.log("peer-join", id, info)
                    this.$notification['success']({message: '欢迎' + info.username + "加入" + info.roomname})
                });
                client.on("peer-leave", (id) => {
                    console.log("peer-leave!");
                });
                client.on("transport-open", () => {
                    console.log("transport open!");
                    this.joinRoom()
                    this.pullStreamList()
                });
                client.on("transport-closed", () => {
                    console.log("transport closed!");
                });
                client.on("stream-add", (id, info) => {
                    console.log("stream-add %s,%s!", id, info);
                    this.list.push(id)
                });
                client.on("stream-remove", (stream) => {
                    console.log("stream-remove %s,%", stream.id);
                });
                client.on("broadcast", (mid, info) => {
                    console.log("broadcast %s,%s!", mid, info);
                });
                this.client = client
            }
        }
    }
</script>

<style scoped>
    @import "../assets/css/app.css";
</style>
