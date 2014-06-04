function initAudioNodes(stream, includeVideo) {
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
			"delayTime": {
			  "units": 0,
			  "name": "delayTime",
			  "defaultValue": 0,
			  "maxValue": 5,
			  "minValue": 0,
			  "value": 0
			}
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
			"baseFrequency": 500,   //0 to 1
			"excursionOctaves": 2,    //1 to 6
			"sweep": 1,   //0 to 1
			"resonance": 10,    //1 to 100
			"sensitivity": 3.1622776601683795,   //-1 to 1
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
			"gain": {
			  "units": 0,
			  "name": "gain",
			  "defaultValue": 1,
			  "maxValue": 1,
			  "minValue": 0,
			  "value": 0.5
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
	//before any changes are made customSet is set to default settings
	this.settings.customSet	 = this.settings.defaultSet;
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
		switch ( nodes[ i ].name ){
			case "delay":
				var d = nodes[ i ];
				$(".delay-switch").change(d, function( ) {
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
	// if current option is "custom", save custom settings before making any changes
	if ( this.settings["customIsSelected"]==true ) { 
		this.saveCustomSet();
	}
	switch ( optionName ){
		case "clear":
			this.settings["customIsSelected"]=false;//prevent saving clear sound, option[1-3] as custom settings
			this.loadSet (this.settings.clearSound);
			break;
		case "option1":
			this.settings["customIsSelected"]=false;
			this.loadSet("option1 settings");
			break;
		case "option2":
			this.settings["customIsSelected"]=false;
			this.loadSet ("option2 settings");
			break;
		case "option3":
			this.settings["customIsSelected"]=false;
			this.loadSet ("option3 settings");
			break;
		case "custom":
			this.settings["customIsSelected"]=true;
			this.loadSet (this.settings.customSet);
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
};