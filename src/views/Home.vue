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
                <a-row :gutter="[8,8]"  style="padding: 8px">
                    <a-col span="8"  v-for="(item,index) in  videoList" >
                        {{item.mid}}
                        <a-icon type="close" style="font-size:14px;float: right" @click="removeStream(index)"/>
                        <video ref="video" width="100%" height="300px" style="background: antiquewhite"
                               autoPlay
                               playsinline
                        />
                    </a-col>
                </a-row>
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
                list:[],
                videoList : []
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
                let isOpen = false;
                this.videoList.forEach(function(item) {
                   // console.log("===",item.mid,mid,item.mid == mid);
                    if(item.mid == mid){
                        isOpen = true
                    }
                });
                if(isOpen){
                    return
                }
                console.log("_handleAddStream", mid)
                let stream = await this.client.subscribe(mid);
                console.log(stream.mid)
                await this.videoList.push(stream)
                this.$refs.video[this.videoList.length-1].srcObject = stream
            },
            removeStream(index){
                this.videoList[index].unsubscribe();
                this.videoList.splice(index,1)
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
