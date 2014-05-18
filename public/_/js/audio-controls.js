function initAudioNodes(stream, includeVideo) {
	$(".mic-status").addClass("label-success").text("on");
	var audioNodes = new AudioNodes ( stream, [ "delay", "tunachorus", "tunawahwah", "tunaoverdrive",  "tunatremolo", "streamDestination"] );
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
			case "tunawahwah":
				var node = new tuna.WahWah({
					automode: true,                //true/false
					baseFrequency: 0.5,            //0 to 1
					excursionOctaves: 2,           //1 to 6
					sweep: 0.2,                    //0 to 1
					resonance: 10,                 //1 to 100
					sensitivity: 0.5,              //-1 to 1
					bypass: 0
				});
				break;
			case "tunaphaser":
				var node = new tuna.Phaser({
					 rate: 8,                     //0.01 to 8 is a decent range, but higher values are possible
					 depth: 0.3,                    //0 to 1
					 feedback: 0.5,                 //0 to 1+
					 stereoPhase: 100,               //0 to 180
					 baseModulationFrequency: 700,  //500 to 1500
					 bypass: 0
				 });
				break;
			case "tunaoverdrive":
				var node = new tuna.Overdrive({
					outputGain: 0.5,         //0 to 1+
                    drive: 0.7,              //0 to 1
                    curveAmount: 1,          //0 to 1
                    algorithmIndex: 5,       //0 to 5, selects one of our drive algorithms
                    bypass: 0
				});
				break;
			case "tunatremolo":
				var node = new tuna.Tremolo({
					  intensity: 1,    //0 to 1
					  rate: 8,         //0.001 to 8
					  stereoPhase: 180,    //0 to 180
					  bypass: 0
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
			case "tunawahwah":
				var tww = nodes[ i ];
				$(".tunawahwah-switch").change(tww, function() {
					that.nodeSwitch( tww );
				});
				$(".tunawahwah-baseFrequency, .tunawahwah-excursionOctaves, .tunawahwah-sweep, .tunawahwah-resonance, .tunawahwah-sensitivity, .tunawahwah-bypass").change(tww, function() {
					that.nodeChangeValue(tww, this);
				});
				break;
			case "tunaoverdrive":
				var to = nodes[ i ];
				$(".tunaoverdrive-switch").change(to, function() {
					that.nodeSwitch( to );
				});
				$(".tunaoverdrive-drive, .tunaoverdrive-algorithmIndex").change(to, function() {
					that.nodeChangeValue(to, this);
				});
				break;
			case "tunaphaser":
				var tp = nodes[ i ];
				$(".tunaphaser-switch").change(tp, function() {
					that.nodeSwitch( tp );
				});
				break;
			case "tunatremolo":
				var tt = nodes[ i ];
				$(".tunatremolo-switch").change(tt, function() {
					that.nodeSwitch( tt );
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
	console.log(nodeToSwitch+": "+ nodeToSwitch.node.isConnected );
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
	if (node instanceof Tuna.prototype.Chorus || node instanceof Tuna.prototype.WahWah || node instanceof Tuna.prototype.Overdrive || node instanceof Tuna.prototype.Phaser) {
		var elementName = element.name;
		if ( node[elementName] !="undefined"){
			node[elementName] = val;
		} else {
			console.error($(element).attr("name")+" is not an allowed setting name for tunachorus node");
		}
	}
};
