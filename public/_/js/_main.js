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
		"<p><a href=https://github.com/miselaytes-anton'>GitHub</a></p>"+
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

});