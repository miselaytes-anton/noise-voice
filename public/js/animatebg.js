//animate waved background
var block = document.querySelector(".block--animate");
var currentPosition = 0;
function animatebg() {
	block.style.backgroundPosition = currentPosition+"px 0px"
	currentPosition = currentPosition+5;
} 
window.setInterval(animatebg, 40);
