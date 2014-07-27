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
}