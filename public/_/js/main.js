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
$(".option1, .option2, .option3").click(function(){
	if (!$(this).hasClass("active")) {
		$(".btn-option").removeClass("active");
		$(this).addClass("active");
		//audioNodes.setOption("option");
	}
});
