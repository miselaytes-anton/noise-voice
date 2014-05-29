$(".effects-show").click(function(){
			$(".effects-panel").show();
		});
$(".effects-hide").click(function(){
	$(".effects-panel").hide();
});
$(".btn-option").click(function(){
	if (!$(this).hasClass("active")) {
		$(".btn-option").removeClass("active");
		$(this).addClass("active");
	}
});
