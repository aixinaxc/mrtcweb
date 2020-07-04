import MultiStreamsMixer from 'multistreamsmixer';

const StreamHandle = {
    streamData : [],
    //对上传的文件流化
    fileStream(file){
        let that = this
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        let context = new AudioContext();
        let gainNode = context.createGain();
        gainNode.connect(context.destination);
        gainNode.gain.value = 0; // don't play for self
        const reader = new FileReader();
        //reader.readAsDataURL(file);
        reader.onload = (e) => {
            console.log("e",e.target.result)
            context.decodeAudioData(e.target.result, createSoundSource);
            console.log("context",context)
        }
        reader.readAsArrayBuffer(file)
        function createSoundSource(buffer) {
            let soundSource = context.createBufferSource();
            soundSource.buffer = buffer;
            soundSource.start(0, 0 / 1000);
            soundSource.connect(gainNode);
            let destination = context.createMediaStreamDestination();
            soundSource.connect(destination);
            console.log("soundSource",soundSource)
            // durtion=second*1000 (milliseconds)
            console.log(destination.stream, buffer.duration * 1000);
            that.streamData = destination.stream
        }
    },
    //对音频进行混流
    mixAudioStream(localStream,otherStream){
        /*let sysAudioStream=new MediaStream();//创建一个媒体流
        if(localStream == null || localStream.getAudioTracks()[0] == null){
            console.log("无效的输入流")
            return null;
        }
        sysAudioStream.addTrack(localStream.getAudioTracks()[0]);//把麦克风音轨添加到新的媒体流*/
        //console.log("sysAudioStream",sysAudioStream)
        let stream = []
        stream.push(localStream)
        otherStream.forEach((item,index,array)=>{
            stream.push(item)
            //执行代码
        });
        let audioMixer = new MultiStreamsMixer(stream);
        return audioMixer.getMixedStream().getAudioTracks()[0]
    },
    //对摄像头和录屏进行混流
    mixVideoStream(cameraStream,stream){
        stream.fullcanvas = true;
        stream.width = screen.width; // or 3840
        stream.height = screen.height; // or 2160
        cameraStream.width = parseInt((20 / 100) * stream.width);
        cameraStream.height = parseInt((20 / 100) * stream.height);
        cameraStream.top = stream.height - cameraStream.height;
        cameraStream.left = stream.width - cameraStream.width;
        let mixer = new MultiStreamsMixer([stream, cameraStream]);
        mixer.frameInterval = 1;
        mixer.startDrawingFrames();
        console.log("mixer",mixer)
        return mixer.getMixedStream().getVideoTracks()[0]
    },
}
export default StreamHandle
