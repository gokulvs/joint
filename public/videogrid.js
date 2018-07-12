var gridster = null;
// var getUserMedia =navigator.mediaDevices?navigator.mediaDevices.getUserMedia:(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
function* idGen(){
    let gen = 100;
    while(true){
        yield "view-"+(gen++);
    }
}
var CodeEditor = function(){
    this.state = {
        data : '',
        elms :[{
            elem : document.querySelector('#code-block'),
            title : 'Text',
            mode : 'javascript'
        },{
            elem : document.querySelector('#css-block'),
            title : 'css',
            mode : 'text/css'
        }],
        editors : []
    };

    return this.init();
}
CodeEditor.prototype= {
    init : function(){
       this.codeMirrorInit();
       this.events();
    },
    codeMirrorInit : function(){
        // return CodeMirror(this.state.elm, {
        //     value: "function myScript(){return 100;}\n",
        //     mode:  "javascript",
        //     lineNumbers: true
        // });
        // The codeMirror editor object
        console.log(this);
        this.state.elms.map((editor)=>{
           this.state.editors.push(CodeMirror.fromTextArea(
                editor.elem, 
                {
                    lineNumbers     : true,
                    lineWrapping    : true,
                    matchBrackets: true,
                    theme           : "dracula",
                    tabSize         : 4,
                    indentUnit      : 4,
                    value: "function myScript(){return 100;}\n",
                    mode:  editor.mode
                })
            )
        })
    },
    refresh : function(){
        this.editor.refresh();
    },
    aceEditorInit : function(){
        var dBName=Math.floor(Math.random() * 9999999999).toString();
        var config = {
            apiKey: "AIzaSyBZfs8xPaDEgnZlICbNv5m6tZokSU9ShUQ",
            authDomain: "joint-b4413.firebaseapp.com",
            databaseURL: "https://joint-b4413.firebaseio.com",
            database:dBName,
            projectId: "joint-b4413"
          };
          firebase.initializeApp(config);
    
          // Get Firebase Database reference.
          var firepadRef = firebase.database().ref();
    
          // Create Ace editor.
          var editor = ace.edit('firepad');
          editor.setTheme("ace/theme/dracula");
            var session = editor.getSession();
            session.setUseWrapMode(true);
            session.setUseWorker(false);
            session.setMode("ace/mode/javascript");

    
          // Create Firepad.
          var firepad = Firepad.fromACE(firepadRef, editor);

          firepad.on('ready', function() {
            if (firepad.isHistoryEmpty()) {
              firepad.setText('some');
            }
          });
    },
    events : function(){
        this.state.editors.map((editor)=>{
            editor.on('change',(cm,data)=>{
                console.log(data);
            })
        })
    }
}
var VideoController = function(gridster,callStack,notify){
    this.state = {
        userVideo : $('.initial-video-out')[0]
    }
    this.generator = idGen();
    this.init();
    this.gridster = gridster;
    this.callStack = callStack;
    this.notify = notify;
    window.geticons = this.getIcons;
};
VideoController.prototype = {
    init : function(){
        this.events();
    },
    videoGen : function(callMedia,stream){
       const video =  this.create(callMedia?callMedia.peer:"userownstream");
       if(callMedia){
        this.callStack[callMedia.peer] = {
            peer : callMedia,
            video : video
        };
       }
        console.log("callStack : ",this.callStack)
        video.srcObject = stream;
    },
    compose : function(...functions){
        return (context={})=>functions.reduceRight((preReturn,fun)=>{
            if(typeof preReturn == 'function'){
                return fun(preReturn('',context),context);
            }
           return fun(preReturn,context)
        })
    },
    getIcons : function(id){
        const remove = (sub,context)=>'<div class="remove-video-view-'+context.id+'"><i class="fa fa-phone" aria-hidden="true"></i></div>'+sub
        const wrapper = (sub,context)=>'<div class="icon-wrapper">'+sub+'</div>';
        return (id=='userownstream')?'':this.compose(wrapper,remove)({id:id});
    },
    create : function(peerId){
        var id = this.generator.next().value;
        this.gridster.add_widget('<li class="'+id+'" data-peerId="'+peerId+'">'+this.getIcons(peerId)+'<video width="100%" height="100%" autoplay controls="true"></video></li>', 1, 1,1,1);
        return $('li.'+id+' video')[0];
    },
    appendStream : function(stream){
        console.log("stream : ",stream);
        this.create().srcObject = stream;
    },
    events : function(){
        $('.gridster ul').on('click','[class^="remove-video-"] i',(e)=>{
            console.log(e.target);
            if($(e.target).hasClass('fa-phone')){
                const id = $(e.target).parents('li').attr('data-peerid')
                this.notify('endCall',id);
                gridster.remove_widget($(e.target).parents('li')[0])
            }
        })
        $('.gridster ul').on('click','[class^="mute-video-"] i',(e)=>{
            if($(e.target).hasClass('fa-volume-off')){
                const id = $(e.target).parents('li').attr('data-peerid')
                this.mute(id);
                gridster.remove_widget($(e.target).parents('li')[0])
            }
        })
    }
}

var App = function(videoController=VideoController){
    let STATE = {
        peer : null,
        peerId : null,
        connection : 'NO_CONNECTION',
        cntr : null
    }

    this.callStack = {};
    this.videoController = new videoController(gridster,this.callStack,this.notify.bind(this));
    this.editor = new CodeEditor();
    this.init();
}
App.prototype = {

    getState : function(){
        return this.STATE;
    },
   _setState : function(orgState,newState){
        return {...orgState,...newState};
   },
   updateState : function(state){
       this.STATE =  this._setState(this.STATE,state);
   },
   observers : {
        'endCall' : function(peerId){
            console.log(this);
            this.callStack[peerId].peer.close();
        }
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
        this.enableTrigger();
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
        var flag;
        this.getState().peer.on('call',(call)=>{
            console.log("got call",);
            this.getUserStream((stream)=>{
                call.answer(stream);
                call.on('stream',(remoteStream)=>{
                    this.videoController.videoGen(call,remoteStream);
                    if(!flag){
                        this.videoController.videoGen(null,stream);
                        flag = true;
                    }
                });
            },(err)=>{
                console.log("Failed to get user stream");
            })
        })
    },
    notify : function(type,...args){
        this.observers[type].call(this,...args);
    },
    reConnectPeer : function(){
        try{
            this.getState().peer.reconnect();
        }catch(e){
            console.log("Error reconnecting  : ",e);
        }
    },
    endCall  : function(id){
        this.callStack[id].close();
    },
    initiateCall : function(peerId){
        const connection = this.getState().peer.connect(peerId,{
            "reliable": true
        });
        this.getUserStream((stream)=>{
            const call = this.getState().peer.call(peerId,stream);
            call.on('stream',(remoteStream)=>{
                this.videoController.videoGen(call,remoteStream);
            });
        },(err)=>{

        })
    },
    makeCall : function(){
        const input = document.querySelector('.peerid-input');
        if(input){
            input.parentNode.removeChild(input)
        }
        var dialog = $('<div class="peerid-input"><input type="text" id="peerid-prompt" placeholder="Enter remote Peer Id"/></div>');
        dialog.find('input').keypress((e)=>{
            if(e.which == 13){
                if($('#peerid-prompt').val().trim()!=""){
                    this.initiateCall($('#peerid-prompt').val());
                    Velocity(dialog[0],{
                        opacity : 0
                    },{
                        duration:100,
                        complete : ()=>{
                            dialog.remove();
                        }
                    })
                }
            }
        })
        $('.call').append(dialog);
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
    enableTrigger : function(){
       $('.reload i').on('click',(e)=>{
           console.log("reloading ... ",e.target);
           this.reConnectPeer();
           Velocity(e.target,{
               fontSize : '100px'
           },{
               duration : 60,
               complete : ()=>{
                   Velocity(e.target,{
                       fontSize: '70px'
                   },{
                    duration : 60,
                   })
               }
           })
       });
       $('.call i').on('click',(e)=>{
           this.makeCall();
       });
    },
    // toggleIcons : function* (icons,elem){
    //     let i =0;
    //     while(i<icons.length){
    //         yield icons[i++]
    //         i == icons.length && (i = 0);
    //     }
    // }

}


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
            axes : ['both'],
            resize : function(){
                app.editor.refresh();
            }
        }
    }).data('gridster');

    var app = new App();

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