$(".effects-show").click(function(){
			$(".effects-panel").show();
		});
$(".effects-hide").click(function(){
	$(".effects-panel").hide();
});
$(".option").click(function(){
	if (!$(this).hasClass("active")) {
		$(".option").removeClass("active");
		$(this).addClass("active");
	}
});
