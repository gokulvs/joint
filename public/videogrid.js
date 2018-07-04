var gridster = null;
// var getUserMedia =navigator.mediaDevices?navigator.mediaDevices.getUserMedia:(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);

var App = function(){
    let STATE = {
        peer : null,
        peerId : null,
        connection : 'NO_CONNECTION',
        cntr : null
    }
    this.init();
}
App.prototype = {

    getState : function(){
        return this.STATE;
    },
   _setState : function(state){
        return {...this.STATE,...state};
   },
   updateState : function(state){
       this.STATE =  this._setState(state);
   },
   init : function(){
        this.initPeer();
        // this.updateBackground('red')
        this.updateBackground();
        this.initElems();
    },
    initElems : function(){
        this.updateState({
            ctnr : document.querySelector('.gridster > ul')
        })
        this.enableReloadTrigger();
    },
    initPeer : function(){
        this.updateState({
            peer :  new Peer({
            "host": "jointserv.herokuapp.com",
            "port": 443,
            "secure": true,
            "path": "peerjs",
            "debug": 3,
            'iceServers': [{
                    url: 'stun:stun.ekiga.net'
                },
                {
                    url: 'stun:stun1.l.google.com:19302'
                },
                {
                    url: 'stun:stun2.l.google.com:19302'
                },
                {
                    url: 'stun:stun3.l.google.com:19302'
                },
                {
                    url: 'stun:stun4.l.google.com:19302'
                },
                {
                    url: 'stun:stun01.sipphone.com'
                },
                {
                    url: 'stun:stun.l.google.com:19302'
                }
            ]
            })
        });
        this.getState().peer.on('open',(id)=>{
            this.updateState({
                peerId : id,
                connection : 'OPEN'
            });
            console.log("APP State - ",this.getState());
            this.updateBackground('#34847c75');
        });
        this.getState().peer.on('connection',(data)=>{
            this.updateState({
                connection : 'CONNECTION'
            });
            console.log("APP State - ",this.getState());
        });
        this.getState().peer.on('close',(data)=>{
            this.updateState({
                connection : 'CLOSE'
            });
            console.log("APP State - ",this.getState());
        });
        this.getState().peer.on('disconnect',(data)=>{
            this.updateState({
                connection : 'DISCONNECT'
            });
            console.log("APP State - ",this.getState());
            this.updateBackground()
        });
        this.getState().peer.on('error',(error)=>{
            console.log("Error : ",error);
            this.updateState({
                connection : 'ERROR'
            });
            console.log("APP State - ",this.getState());
            this.updateBackground('#a5171752')
        });
    },
    reConnectPeer : function(){
        try{
            this.getState().peer.reconnect();
        }catch(e){
            console.log("Error reconnecting  : ",e);
        }
    },
    getUserStream  : (fun,errFn)=>{
        navigator.mediaDevices.getUserMedia({
            video :{ facingMode: "user" },
            audio:true
        }).then(fun).catch(errFn);
    },
    getRemoteStream : ()=>{

    },
    updateBackground : function(color){
        document.querySelector('.gridster > ul').style.backgroundColor  = color;
    },
    enableReloadTrigger : function(){
       $('.reload').on('click','svg',()=>{
           console.log("reloading ... ",this);
           this.reConnectPeer();
       });
    }

}

var app = new App();

!function(){
    let wWidth = screen.width,
        wHeight = screen.height;

    const baseWidth = 200,baseHeight = 200,
        minCols = Math.ceil(wWidth/baseWidth),
        minRows = Math.ceil(wHeight/baseHeight);
    
    const userOwnVideo = document.querySelector('#initial-video-out');
    gridster = $(".gridster ul").gridster({
        widget_base_dimensions: [baseWidth , baseHeight],
        min_cols : minCols,
        min_rows : minRows,
        widget_margins: [5, 5],
        helper: 'clone',
        resize: {
            enabled: true,
            axes : ['both']
        }
    }).data('gridster');

    // app.getUserStream((stream)=>{
    //     userOwnVideo.srcObject = stream;
    // },(error)=>{
    //     console.log("Error getting user video",error);
    // })

    // $('.js-resize-random').on('click', function () {
    //     // gridster.resize_widget(gridster.$widgets.eq(getRandomInt(0, 9)),
    //     //         getRandomInt(1, 4), getRandomInt(1, 4))
    // });
}();