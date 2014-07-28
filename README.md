Noise Voice
===========

WebRTC based video chat with a possibility to modify your voice with special effects (Web Audio Api)

![Noise Voice app snapshot](http://amiselaytes.com/img/snips/noise-voice.jpg "Noise Voice")

##How it works in a nutshell
The video and audio is received from the user using [getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia).

The voice is modified using [Web Audio Api](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). A great place to start with audio api is [this tutorial](http://www.html5rocks.com/en/tutorials/webaudio/intro/).

To make modifying of the voice somewhat easier I used a [tuna.js audio effects library](https://github.com/Dinahmoe/tuna), which is great and very easy to use with the only downside that it does not support Firefox. But anyway building these audio effects from scratch would be a nighmare.

To be able to connect/disconnect and adjust properties of Audio Nodes I wrote a small [audio-controls.js library](https://github.com/miselaytes-anton/noise-voice/blob/master/public/_/js/audio-controls.js), which works with native audio nodes and alos with tuna.js audio effects nodes.

The video and audio are that exchanged between users using WebRTC. Node.js is used as a signalling server. The biggest part of the WebRTC and socket.io set up is based on [this great tutorial](https://bitbucket.org/webrtc/codelab).

I also used express.js for the basic app set up.



##How to use audio-controls.js library

1. Create audio context and add fallbacks for outdated Web Audio syntax

```javascript
//defining audio context
context = new (window.AudioContext || window.webkitAudioContext)();
//fallbacks for Web Audio syntax
if (!context.createGain) {
	context.createGain = context.createGainNode;
}
if (!context.createGainNode) {
	context.createGainNode = context.createGain;
}
if (!context.createDelay)	{
  context.createDelay = context.createDelayNode;
}
if (!context.createDelayNode) {
	context.createDelayNode = context.createDelay;
}
if (!context.createScriptProcessor)	{
  context.createScriptProcessor = context.createJavaScriptNode;
}
if (!context.createJavaScriptNode)	{
  context.createJavaScriptNode= context.createScriptProcessor;
}`

2. Load tuna.js library before audio-controls.js

3. Load audio-controls.js and intializa it:
```javascript
//specify which nodes you want to use in the square brackets
audioNodes = new AudioNodes ( stream, [ "delay", "tunachorus", "tunawahwah", "tunaoverdrive",  "tunatremolo", "streamDestination"] );
```

###Methods
Turn an audio node on or off
`AudioNodes.prototype.nodeSwitch(audioNodeObject)`



