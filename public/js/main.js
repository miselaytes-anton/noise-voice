appSupported = true;
if ( !window.webkitAudioContext && !navigator.webkitGetUserMedia) {
	appSupported = false;
	$(".modal").modal();
}

$(document).ready(function(){
	$(".effects-show").click(function(){
			$(".effects-panel").show();
		});
	$(".effects-hide").click(function(){
		$(".effects-panel").hide();
	});

	$(".option-clear").click(function(){
		if (!$(this).hasClass("active")) {
			$(".btn-option").removeClass("active");
			$(this).addClass("active");
			audioNodes.selectOption("clear");
		}
	});
	$(".option-custom").click(function(){
		if (!$(this).hasClass("active")) {
			$(".btn-option").removeClass("active");
			$(this).addClass("active");
			audioNodes.selectOption("custom");
		}
	});
	$(".option1").click(function(){
		if (!$(this).hasClass("active")) {
			$(".btn-option").removeClass("active");
			$(this).addClass("active");
			audioNodes.selectOption("option1");
		}
	});
	$(".option2").click(function(){
		if (!$(this).hasClass("active")) {
			$(".btn-option").removeClass("active");
			$(this).addClass("active");
			audioNodes.selectOption("option2");
		}
	});
	$(".option3").click(function(){
		if (!$(this).hasClass("active")) {
			$(".btn-option").removeClass("active");
			$(this).addClass("active");
			audioNodes.selectOption("option3");
		}
	});
	//animate waved bg
	var block = $(".block--animate");
	var currentPosition = 0;
	if (typeof block !="null") { window.setInterval(animatebg, 40); }
	function animatebg() {
		block.css("background-position", currentPosition+"px 0px");
		currentPosition = currentPosition+5;
	} 
	//initalize bootsrap popover
	var popoverContent = 
		"<button type='button' class='close' aria-hidden='true'>&times;</button>"+
		"<h3>About</h3>" +
		"<p>This is an experimental app built with node.js, express.js, sockets.io, WebRTC, Web Audio Api, and tuna.js library. </p>"+
		"<p>It allows you to modify your voice with special effects and invite someone to have a video chat directly in your browser. So far it only works in Google Chrome. </p>"+
		"<p><a href='https://github.com/miselaytes-anton/noise-voice'>GitHub</a></p>"+
		"<h3>Contact</h3>"+
		"<p><a href='http://amiselaytes.com'>amiselaytes.com</a>, a.miselaytes@gmail.com</p>";
	
	$(".about-popover").popover({
		"content":popoverContent,
		"html":true,
		"placement":"top"
	});
	$(".about-popover").click(function(){
		$(".close").click (function(){
			$(".about-popover").popover("hide");
			console.log("close");
		});
	});

});;function initAudioNodes(stream, includeVideo) {
	audioNodes = new AudioNodes ( stream, [ "delay", "tunachorus", "tunawahwah", "tunaoverdrive",  "tunatremolo", "streamDestination"] );
	//start with a clear sound to avoid scared users
	audioNodes.loadSet (audioNodes.settings.clearSound);
	if (includeVideo) {
		//cash the video tracks for of the media stream before modification
		//somehow after stream goes though audio nodes, video track disappears
		var videoTracks = stream.getVideoTracks();
		// add the cashed video track back to the stream
		audioNodes.stream.addTrack(videoTracks[0]);
	}
	return audioNodes.stream;
};

function AudioNodes(stream, nodesNames) {
	//set settings for different effects combinations of audio nodes
	this.setSettings();
	this.createNodes( stream, nodesNames);
	//get the stream from MediaStreamDestinationNode
	this.stream = this.nodes[ this.nodes.length -1].node.stream;
	//save the custom settings
	//this.saveCustomSet ();
}
AudioNodes.prototype.setSettings = function( ) {
	this.settings = {};
	this.settings.defaultSet= {
		  "input": {
			"isConnected": true //this is just an indicator, but it does not have any effect on the actual connection status
		  },
		  "delay": {
			"isConnected": true,
			"delayTime": 0
		  },
		  "tunachorus": {
			"isConnected": true,
			"rate": 8,  //0.01 to 8+
			"feedback": 0.85,  //0 to 1+
			"delay": 0.00045,  //0 to 1
			"bypass": false    //the value 1 starts the effect as bypassed, 0 or 1
		  },
		  "tunawahwah": {
			"isConnected": true,
			"automode": true,  //true/false
			"baseFrequency": 0.5,   //0 to 1
			"excursionOctaves": 2,    //1 to 6
			"sweep": 1,   //0 to 1
			"resonance": 10,    //1 to 100
			"sensitivity": 0.5,   //-1 to 1
			"bypass": false
		  },
		  "tunaoverdrive": {
			"isConnected": true,
				"outputGain": 0.5,         //0 to 1+
				"drive": 0.7,              //0 to 1
				"curveAmount": 1,          //0 to 1
				"algorithmIndex": 5,       //0 to 5, selects one of our drive algorithms
				"bypass": 0
		  },
		  "tunaphaser": {
			"isConnected": true,
			"rate": 8,                     //0.01 to 8 is a decent range, but higher values are possible
			"depth": 0.3,                    //0 to 1
			"feedback": 0.5,                 //0 to 1+
			"stereoPhase": 100,               //0 to 180
			"baseModulationFrequency": 700,  //500 to 1500
			"bypass": 0
		  },
		  "tunatremolo": {
			"isConnected": true,
			"intensity": 1,    //0 to 1
			"rate": 8,         //0.001 to 8
			"stereoPhase": 180,    //0 to 180
			"bypass": false
		  },
		  "gain": {
			"isConnected": true,
			"gain": 0.5
		  },
		  "compressor": {
			"isConnected": true
		  },
		  "destination": {
			"isConnected": true
		  },
		  "streamDestination": {
			"isConnected": true
		  }
	};
	this.settings.clearSound = {
				  "delay": { "isConnected": false},
				  "tunachorus": { "isConnected": false},
				  "tunawahwah": { "isConnected": false},
				  "tunaoverdrive": { "isConnected": false},
				  "tunaphaser": { "isConnected": false},
				  "tunatremolo": { "isConnected": false},
				  "gain": {
						"gain": {
							"value": 0.5
						}
				  }
				};
	this.settings.underWater = {
				"delay": {
					"isConnected": true,
					"delayTime": {
					  "value": 0.5
					}
				},
				"tunachorus": {
					"isConnected": true,
					"feedback": 0.85
				},
				"tunawahwah": {
					"isConnected": true,
					"baseFrequency": 0,
					"excursionOctaves": 1,
					"resonance": 100,
					"sensitivity": 0.5
				},
				"tunaoverdrive": {
					"isConnected": false
				},
				"tunatremolo": {
					"isConnected": false
				},
				"gain": {
					"isConnected": true,
					"gain": {
					  "value": 0.9
					}
				}
	};
	this.settings.spaceSignal = {
		  "delay": {
			"isConnected": true,
			"delayTime": {
			  "value": 0
			}
		  },
		  "tunachorus": {
			"isConnected": true,
			"feedback": 0.85,
			"delay": 0.004
		  },
		  "tunawahwah": {
			"isConnected": true,
			"baseFrequency": 0.8,
			"excursionOctaves": 3,
			"resonance": 10,
			"sensitivity": 0.8
		  },
		  "tunaoverdrive": {
			"isConnected": false
			},
		  "tunatremolo": {
			"isConnected": false
		  },
		  "gain": {
			"isConnected": true,
			"gain": {
			  "value": 0.5
			}
		  }
	};
	this.settings.brokenRadio = {
		"delay": {
			"isConnected": false
		},
		"tunachorus": {
			"isConnected": false
		},
		"tunawahwah": {
			"isConnected": false
		},
		"tunaoverdrive": {
			"isConnected": true,
			"drive": 0.7,
			"algorithmIndex": 1,
		},
		"tunatremolo": {
			"isConnected": true,
			"intensity": 0.2,
			"rate": 8,
			"stereoPhase": 8,
			"bypass": false
		},
		"gain": {
			"isConnected": true,
			"gain": {
			  "value": 0.3
			}
		},
		"compressor": {
			"isConnected": true
		},
		"destination": {
			"isConnected": true
		},
		"streamDestination": {
			"isConnected": true
		}
	};
	//create an object with properties names for each node
	this.properties={};
	for (var prop in this.settings.defaultSet)	{
		if (this.settings.defaultSet.hasOwnProperty(prop)){
			this.properties[ prop ] = [ ];
			for (var attr in this.settings.defaultSet[prop])	{
				if (this.settings.defaultSet[prop].hasOwnProperty(attr)){ 
					this.properties[ prop ].push(attr);
				}
			}//for attr
		}
	}//for prop
};
//this function creates the default audio nodes and nodes given in nodesNames array
AudioNodes.prototype.createNodes = function (stream, nodesNames, settings) {	
	//if no extra nodes were provided default to an empty array
	this.nodes = nodesNames || [ ];
	//if any tuna nodes are given as arguments then initialize tuna
	for (var i=0; i< this.nodes.length; i++) {
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
	//create the audio nodes based on the nodes names array
	//set the settings to default
	var settings = this.settings.defaultSet;
	for (var i=0;i <this.nodes.length; i++)	{
		var nodeName = this.nodes[ i ];
		var nodeSettings = settings[nodeName];
		this.nodes[ i ] = {"name": nodeName};
		switch( nodeName ) {
			case "input":
				//only output audio
				var node = context.createMediaStreamSource( stream );	
				break;
			case "delay":
				//max delay time is 5 seconds
				var node = context.createDelay(5);
				node.delayTime.value = settings.delay.delayTime || 0;
				break;
			case "gain":
				var node = context.createGain();
				//default gain value
				node.gain.value = nodeSettings.gain;
				break;
			case "tunachorus":
				var node = new tuna.Chorus(nodeSettings);
				break;
			case "tunawahwah":
				var node = new tuna.WahWah(nodeSettings);
				break;
			case "tunaphaser":
				var node = new tuna.Phaser(nodeSettings);
				break;
			case "tunaoverdrive":
				var node = new tuna.Overdrive(nodeSettings);
				break;
			case "tunatremolo":
				var node = new tuna.Tremolo(nodeSettings);
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
		//this is just an indicator,  it does not have any effect on the actual connection status
		node.isConnected = nodeSettings.isConnected;
		if (typeof node =='object') { 
			//set the connection status of each node to connected
			this.nodes[ i ].node =  node; 
		}
	
		//connect the nodes
		if ( i>0 ) {
			//connect mediaStreamDestination to the node before destination (compressor)
			if ( this.nodes[ i ].name =="streamDestination" )	{
				this.nodes[ i-2 ].node.connect( this.nodes[ i ].node);
			} else {
				this.nodes[ i-1 ].node.connect( this.nodes[ i ].node.input || this.nodes[ i ].node);
			}
		}
	}
	this.attachEvents(this.nodes);
};
//this function attaches change events to audio nodes effects panel (checks, and range inputs)
AudioNodes.prototype.attachEvents = function(nodes) {
	var that=this;
	for (var  i=0; i<nodes.length; i++  ) {
		var nodeProperties = this.properties[nodes[ i ].name]
		//generate the selectors based on the properties object for this node
		var switchSelector = "."+ nodes[ i ].name +"-switch";
		var inputValuesSelector = "";
		for (var prop in nodeProperties){
			// exclude isConnected property form selectors
			if ( nodeProperties.hasOwnProperty(prop) && nodeProperties[prop]!="isConnected" ) {
				inputValuesSelector += "." + nodes[ i ].name + "-" + nodeProperties[prop] +", ";
			}
		}
		//trim the last coma and space( ,) away
		inputValuesSelector=inputValuesSelector.substring(0, inputValuesSelector.length - 2);
		
		switch ( nodes[ i ].name ){
			case "delay":
				var d = nodes[ i ];
				$(switchSelector).change(d, function( ) {
					that.nodeSwitch( d );
				});
				$(inputValuesSelector).change(d, function() {
					that.nodeChangeValue(d , this);
				});
				break;
			case "gain":
				var g = nodes[ i ];
				$(inputValuesSelector).change( g, function() {
					that.nodeChangeValue(g, this);
				});
				break;
			case "tunachorus":
				var tc = nodes[ i ];
				$(switchSelector).change(tc, function() {
					that.nodeSwitch( tc );
				});
				$(inputValuesSelector).change(tc, function() {
					that.nodeChangeValue(tc, this);
				});
				break;
			case "tunawahwah":
				var tww = nodes[ i ];
				$(switchSelector).change(tww, function() {
					that.nodeSwitch( tww );
				});
				$(inputValuesSelector).change(tww, function() {
					that.nodeChangeValue(tww, this);
				});
				break;
			case "tunaoverdrive":
				var to = nodes[ i ];
				$(switchSelector).change(to, function() {
					that.nodeSwitch( to );
				});
				$(inputValuesSelector).change(to, function() {
					that.nodeChangeValue(to, this);
				});
				break;
			case "tunaphaser":
				var tp = nodes[ i ];
				$(switchSelector).change(tp, function() {
					that.nodeSwitch( tp );
				});
				break;
			case "tunatremolo":
				var tt = nodes[ i ];
				$(switchSelector).change(tt, function() {
					that.nodeSwitch( tt );
				});
				break;
			
		}//switch
	}//for
};

//this function resets the inputs' values in the front-end
AudioNodes.prototype.resetInputs = function( ) {
	var settings= this.settings.defaultSet;
	for (var prop in settings){
		if(settings.hasOwnProperty(prop)){
			var nodeSettings = settings[prop];
			var switchSelector = "."+prop+"-switch";
			if (document.querySelector(switchSelector)!=null)	{
				document.querySelector(switchSelector).checked=nodeSettings.isConnected;
			}
			for (var attr in nodeSettings){
				var inputValueSelector =  "." + prop + "-" +attr;
				if(nodeSettings.hasOwnProperty(attr) && document.querySelector(inputValueSelector) !=null){
						document.querySelector(inputValueSelector).value=nodeSettings[ attr ];
				}
			}//for attr
		}//if
	}//for
};

//this function toggles audio node's connection status
AudioNodes.prototype.nodeSwitch = function(nodeToSwitch) {
	//get the previous and next connected nodes in the audio graph
	//look for a node which is connected and brake
	var nodeIndex = this.nodes.indexOf(nodeToSwitch);
	for (var i=1; i < this.nodes.length; i++) {
		if (this.nodes[ nodeIndex - i ].node.isConnected) { 
			 var previousNode   = this.nodes[ nodeIndex - i ].node || null; 
			break;
		}
	}
	for (var i=1; i < this.nodes.length; i++) {
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

//this function sets the value of an audio node to the value of coresponding range input
AudioNodes.prototype.nodeChangeValue = function (nodeToAdjust, element) {
	var val = parseFloat(element.value);
	var node = nodeToAdjust.node;
	if (node instanceof GainNode) {
			node.gain.value = val;
	}
	if (node instanceof DelayNode) {
		node.delayTime.value = val;
	}
	if (node instanceof Tuna.prototype.Chorus || node instanceof Tuna.prototype.WahWah || node instanceof Tuna.prototype.Overdrive || node instanceof Tuna.prototype.Phaser) {
		var elementName = element.name;
		if ( node[elementName] !="undefined"){
			node[elementName] = val;
		} else {
			console.error($(element).attr("name")+" is not an allowed setting name for this tuna node");
		}
	}
};

//this function retrieves the current audio node settings and saves them as custom settings
//saves the current custom settings to this.settings.customSet
AudioNodes.prototype.saveCustomSet = function () {
	var nodes = this.nodes;
	this.settings.customSet = {};
	for (var i=0;i<nodes.length;i++) {
		var nodeName = nodes[i].name;
		var node = nodes[i].node;
		this.settings.customSet[nodeName] = {};
		//this.settings.customSet[nodeName].isConnected = nodes[i].node.isConnected;
		var customSet = this.settings.customSet[nodeName];
		
		//get the properties for which to set the settings
		if (this.properties[nodeName] !="undefined") {
			var properties = this.properties[nodeName] || [ ];
		}
		
		//this loop copies the properties from the audio nodes object  to the settings object
		for (var j=0;j<properties.length;j++){
			var property = properties[ j ];
			if (typeof node[ property ] =="object")	{
				customSet[ property ] = {};
				for (var prop in node[  property ] ) {
					if (node[  property ].hasOwnProperty(prop) ) {
						customSet[  property  ][ prop ] =node[  property  ][ prop ];
					}
				}//for in
			} else /*if (property!="isConnected")*/ {
					customSet [ property ] =node[ property ];
				}
		}//for j
		
	}//for i
};

//this function sets the right audio nodes settings depending on which option is provided as an argument
AudioNodes.prototype.selectOption = function (optionName) {
	switch ( optionName ){
		case "clear":
			this.loadSet (this.settings.clearSound);
			break;
		case "option1":
			this.loadSet (this.settings.underWater);
			break;
		case "option2":
			this.loadSet (this.settings.spaceSignal);
			break;
		case "option3":
			this.loadSet (this.settings.brokenRadio);
			break;
		case "custom":
			this.resetInputs();
			this.loadSet (this.settings.defaultSet);
			break;
		default:
			console.error("unknown option's name");
	}//switch
};


//this is a helper function for "selectOption" function. It changes the settings of audio nodes to settings provided as an argument
AudioNodes.prototype.loadSet = function ( settings ) {

	//load settings for each of the audio nodes
	for (var i=0;i<this.nodes.length;i++) {
		var node = this.nodes[ i ]; //the actual audio node
		var nodeName = this.nodes[ i ].name; //name of the actual node
		var settingsNode = settings[nodeName];	//audio node in the settings' object
		//if there were no new settings provided for the current node than jump to the next node
		if (typeof settingsNode =="undefined") { continue;}
		//if settings require connection, but the actual node is not connected
		if (settingsNode.isConnected != node.node.isConnected && typeof settingsNode.isConnected!="undefined") {
			this.nodeSwitch(node);
		}
		
		for (var prop in settingsNode ) {
			if (settingsNode.hasOwnProperty(prop)){
				if (typeof settingsNode[ prop ] =="object")	{
					for (var attr in settingsNode[ prop ] ) {
						if (settingsNode[ prop ].hasOwnProperty(attr) && settingsNode [ prop ] [ attr ] !="undefined") {
							node.node[ prop ][ attr ] = settingsNode [ prop ] [ attr ];
						}
					}//for in
			} else {
					if (settingsNode [ prop ] !="undefined") {
						node.node[ prop ]= settingsNode [ prop ];
					}	
				}
			}//else
		}
	}//for i
};;if (appSupported) {
	var isChannelReady;
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
	  //console.log('Create or join room', room);
	  //server reacts to this event by emitting either "create" or "join" events depending on the situation
	  socket.emit('create or join', room);
	}

	socket.on('created', function (room){
	  //console.log('Created room ' + room);
	  isInitiator = true;
	});

	socket.on('full', function (room){
	  //console.log('Room ' + room + ' is full');
	});

	socket.on('join', function (room){
	  //console.log('Another peer made a request to join room ' + room);
	  //console.log('This peer is the initiator of room ' + room + '!');
	  isChannelReady = true;
	});

	socket.on('joined', function (room){
	  //console.log('This peer has joined room ' + room);
	  isChannelReady = true;
	});

	socket.on('log', function (array){
		//writes arguments in a single line
		//console.log.apply(console, array);
	 
	});

	////////////////////////////////////////////////from here V

	function sendMessage(message){
		//console.log('Client sending message: ', message);
	  // if (typeof message === 'object') {
	  //   message = JSON.stringify(message);
	  // }
	  socket.emit('message', message);
	}

	socket.on('message', function (message){
	  //console.log('Client received message:', message);
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
		var stream = initAudioNodes(stream, true);
		//console.log('Adding local stream.');
		localVideo.src = window.URL.createObjectURL(stream);
		localStream = stream;
		sendMessage('got user media');
		if (isInitiator) {
		maybeStart();
		}
	}

	function handleUserMediaError(error){
	  //console.log('getUserMedia error: ', error);
	}

	var constraints = {video: true, audio: true};
	//if current page is video-room page then get user media
	if ( /room/.test(window.location.pathname) ) { getUserMedia(constraints, handleUserMedia, handleUserMediaError) ;}

	//console.log('Getting user media with constraints', constraints);

	if (location.hostname != "localhost") {
	  requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
	}

	function maybeStart() {
	  if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
		createPeerConnection();
		pc.addStream(localStream);
		isStarted = true;
		//console.log('isInitiator', isInitiator);
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
		//console.log('Created RTCPeerConnnection');
	  } catch (e) {
		//console.log('Failed to create PeerConnection, exception: ' + e.message);
		alert('Cannot create RTCPeerConnection object.');
		  return;
	  }
	}

	function handleIceCandidate(event) {
	  //console.log('handleIceCandidate event: ', event);
	  if (event.candidate) {
		sendMessage({
		  type: 'candidate',
		  label: event.candidate.sdpMLineIndex,
		  id: event.candidate.sdpMid,
		  candidate: event.candidate.candidate});
	  } else {
		//console.log('End of candidates.');
	  }
	}

	function handleRemoteStreamAdded(event) {
	  //console.log('Remote stream added.');
	  remoteVideo.src = window.URL.createObjectURL(event.stream);
	  remoteStream = event.stream;
	}

	function handleCreateOfferError(event){
	  //console.log('createOffer() error: ', e);
	}

	function doCall() {
	  //console.log('Sending offer to peer');
	  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
	}

	function doAnswer() {
	  //console.log('Sending answer to peer.');
	  pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
	}

	function setLocalAndSendMessage(sessionDescription) {
	  // Set Opus as the preferred codec in SDP if Opus is present.
	  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
	  pc.setLocalDescription(sessionDescription);
	  //console.log('setLocalAndSendMessage sending message' , sessionDescription);
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
		//console.log('Getting TURN server from ', turn_url);
		// No TURN server. Get one from computeengineondemand.appspot.com:
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
		  if (xhr.readyState === 4 && xhr.status === 200) {
			var turnServer = JSON.parse(xhr.responseText);
			//console.log('Got TURN server: ', turnServer);
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
	  //console.log('Remote stream added.');
	  remoteVideo.src = window.URL.createObjectURL(event.stream);
	  remoteStream = event.stream;
	}

	function handleRemoteStreamRemoved(event) {
	  //console.log('Remote stream removed. Event: ', event);
	}

	function hangup() {
	  //console.log('Hanging up.');
	  stop();
	  sendMessage('bye');
	}

	function handleRemoteHangup() {
	//  //console.log('Session terminated.');
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

}//appSupported