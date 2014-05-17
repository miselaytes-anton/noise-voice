function initAudioNodes(stream) {
	$(".mic-status").addClass("label-success").text("on");
	//cash the video tracks for of the media stream before modification
	//somehow after stream goes though audio nodes, video track disappears
	var videoTracks = stream.getVideoTracks();
	var audioNodes = new AudioNodes ( stream, [ "delay", "tunachorus", "streamDestination"] );
	// add the cashed video track back to the stream
	audioNodes.stream.addTrack(videoTracks[0]);
	return audioNodes.stream;
};

function AudioNodes(stream, nodesNames) {
	//if no extra nodes were provided default to an empty array
	this.nodes = nodesNames || [ ];
	//if any tuna nodes as arguments then initialize tuna
	for (i=0; i< this.nodes.length; i++) {
		if (/tuna/.test(this.nodes[ i ] ) ) {
			tuna = new Tuna(context);
			break;
		}
	}
	//add the default nodes to the array of nodes' names
	this.nodes.unshift("input");
	this.nodes.push("gain", "compressor", "destination");
	
	//if streamDestination is part of the array, move it to the end of the array
	var index = this.nodes.indexOf("streamDestination");
	if (index > -1) {
		this.nodes.splice(index, 1);
		this.nodes.push("streamDestination");
	}
	this.createNodes(stream);
	this.stream = this.nodes[ this.nodes.length -1].node.stream;
}

AudioNodes.prototype.createNodes = function (stream) {	
	for (i=0;i <this.nodes.length; i++)	{
		var nodeName = this.nodes[ i ];
		this.nodes[ i ] = {"name": nodeName};
		switch( nodeName ) {
			case "input":
				//only output audio
				var node = context.createMediaStreamSource( stream );	
				break;
			case "delay":
				//max delay time is 5 seconds
				var node = context.createDelay(5);
				node.delayTime.value = 0;
				break;
			case "gain":
				var node = context.createGain();
				//default gain value
				node.gain.value = 0.5;
				break;
			case "tunachorus":
				var node = new tuna.Chorus({
					 rate: 8,         //0.01 to 8+
					 feedback: 0.85,     //0 to 1+
					 delay: 0.0045,     //0 to 1
					 bypass: 0          //the value 1 starts the effect as bypassed, 0 or 1
				 });
				break;
			case "compressor":
				var node = context.createDynamicsCompressor();
				break;
			case "streamDestination":
				var node = context.createMediaStreamDestination();
				break;	
			case "destination":
				var node = context.destination;
				break;
			default:
				console.error(this.nodes[ i ]+" is not an allowed node type");
				return;
		}
		if (typeof node =='object') { 
			//set the connection status of each node to connected
			this.nodes[ i ].node =  node; 
			this.nodes[ i ].node.isConnected=true;
			
		}
	
		//connect the nodes
		if ( i>0 ) {
			//connect streamDestination to the node before destination (compressor)
			if ( this.nodes[ i ].name =="streamDestination" )	{
				this.nodes[ i-2 ].node.connect( this.nodes[ i ].node);
			} else {
				this.nodes[ i-1 ].node.connect( this.nodes[ i ].node.input || this.nodes[ i ].node);
			}
		}
	}
	this.attachEvents(this.nodes);
};

AudioNodes.prototype.attachEvents = function(nodes) {
	var that=this;
	for ( i=0; i<nodes.length; i++  ) {
		switch ( nodes[ i ].name ){
			case "delay":
				var d = nodes[ i ];
				$(".delay-switch").change(d, function( ) {
					//console.log("switch "+n.name)
					that.nodeSwitch( d );
				});
				$(".delay-value").change(d, function() {
					that.nodeChangeValue(d , this);
				});
				break;
			case "gain":
				var g = nodes[ i ];
				$(".gain-value").change( g, function() {
					that.nodeChangeValue(g, this);
				});
				break;
			case "tunachorus":
				var tc = nodes[ i ];
				$(".tunachorus-switch").change(tc, function() {
					that.nodeSwitch( tc );
				});
				$(".tunachorus-delay").change(tc, function() {
					that.nodeChangeValue(tc, this);
				});
				break;
		}//switch
	}//for
};

AudioNodes.prototype.nodeSwitch = function(nodeToSwitch) {
	//get the previous and next connected nodes in audio graph
	//look for a node which is connected and brake
	var nodeIndex = this.nodes.indexOf(nodeToSwitch);
	for (i=1; i < this.nodes.length; i++) {
		if (this.nodes[ nodeIndex - i ].node.isConnected) { 
			 var previousNode   = this.nodes[ nodeIndex - i ].node || null; 
			break;
		}
	}
	for (i=1; i < this.nodes.length; i++) {
		if (this.nodes[ nodeIndex +i ].node.isConnected) { 
			var nextNode   = this.nodes[ nodeIndex + i ].node || null; 
			break;
		}
	}
	//disconnect the node if its connected, otherwise - connect 
	if ( nodeToSwitch.node.isConnected ) {
		previousNode.disconnect(0);
		nodeToSwitch.node.disconnect(0);
		previousNode.connect(nextNode.input || nextNode);
	} else {
		previousNode.disconnect(0);
		previousNode.connect(nodeToSwitch.node.input || nodeToSwitch.node);
		nodeToSwitch.node.connect(nextNode.input || nextNode);
	}
	//toogle node's connection state
	nodeToSwitch.node.isConnected = !nodeToSwitch.node.isConnected;
};


AudioNodes.prototype.nodeChangeValue = function (nodeToAdjust, element) {
	var val = parseFloat(element.value);
	var node = nodeToAdjust.node;
	if (node instanceof GainNode) {
			node.gain.value = val;
	}
	if (node instanceof DelayNode) {
		node.delayTime.value = val;
	}
	if (node instanceof Tuna.prototype.Chorus) {
		switch (element.name){
			case "rate":
				node.rate = val;
				break;
			case "feedback":
				node.feedback = val;
				break;
			case "delay":
				node.delay = val;
				break;
			case "bypass":
				node.bypass = val;
				break;
			default:
				console.error($(element).attr("name")+" is not an allowed setting name for tunaChorus node");
		}
	}
}
;var isChannelReady;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

//this is one of the many available stun servers, more: https://gist.github.com/yetithefoot/7592580
var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

//just take this setting for granted..
var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

/////////////////////////////////////////////
/*
SOCKETS
*/
//emitting a on connected event
var socket = io.connect();

if (typeof room != 'undefined') {
  console.log('Create or join room', room);
  //server reacts to this event by emitting either "create" or "join" events depending on the situation
  socket.emit('create or join', room);
}

socket.on('created', function (room){
  console.log('Created room ' + room);
  isInitiator = true;
});

socket.on('full', function (room){
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function (room){
  console.log('This peer has joined room ' + room);
  isChannelReady = true;
});

socket.on('log', function (array){
	//writes arguments in a single line
	console.log.apply(console, array);
 
});

////////////////////////////////////////////////from here V

function sendMessage(message){
	console.log('Client sending message: ', message);
  // if (typeof message === 'object') {
  //   message = JSON.stringify(message);
  // }
  socket.emit('message', message);
}

socket.on('message', function (message){
  console.log('Client received message:', message);
  if (message === 'got user media') {
  	maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

function handleUserMedia(stream) {
	//modify audio with web audio/tuna.js nodes
	var stream = initAudioNodes(stream);
	console.log('Adding local stream.');
	localVideo.src = window.URL.createObjectURL(stream);
	localStream = stream;
	sendMessage('got user media');
	if (isInitiator) {
	maybeStart();
	}
}

function handleUserMediaError(error){
  console.log('getUserMedia error: ', error);
}

var constraints = {video: true, audio: true};
getUserMedia(constraints, handleUserMedia, handleUserMediaError);

console.log('Getting user media with constraints', constraints);

if (location.hostname != "localhost") {
  requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
}

function maybeStart() {
  if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function(e){
	sendMessage('bye');
}

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
      return;
  }
}

function handleIceCandidate(event) {
  console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
  } else {
    console.log('End of candidates.');
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}

function handleCreateOfferError(event){
  console.log('createOffer() error: ', e);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
}

function setLocalAndSendMessage(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message' , sessionDescription);
  sendMessage(sessionDescription);
}

function requestTurn(turn_url) {
  var turnExists = false;
  for (var i in pc_config.iceServers) {
    if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turn_url);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
      	console.log('Got TURN server: ', turnServer);
        pc_config.iceServers.push({
          'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turn_url, true);
    xhr.send();
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
//  console.log('Session terminated.');
  // stop();
  // isInitiator = false;
}

function stop() {
  isStarted = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
  pc.close();
  pc = null;
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
  var sdpLines = sdp.split('\r\n');
  var mLineIndex;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('m=audio') !== -1) {
        mLineIndex = i;
        break;
      }
  }
  if (mLineIndex === null) {
    return sdp;
  }

  // If Opus is available, set it as the default in m line.
  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) {
        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
      }
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) { // Format of media starts from the fourth.
      newLine[index++] = payload; // Put target payload to the first.
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(' ');
  // Scan from end for the convenience of removing an item.
  for (var i = sdpLines.length-1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}
