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
	$(".about-popover").popover();

});