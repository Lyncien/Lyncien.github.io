var size = 40;
var ds = 10;
var hue = 1;
var dh = 10;
var profile_pic;
function flashHeadPic(){
	//console.log(this);
	size = size + ds;
	if(size > 100 || size < 40) ds = -ds;
	hue = (hue + dh) % 360;
	colorHexText = "hsl(" + hue + ", " + "70%, 70%" + ")"
	styleText = "box-shadow: 0 0 " + size + "px " + colorHexText +
				"; border: 3px solid " + colorHexText + ";"
	profile_pic[0].setAttribute('style', styleText);
	profile_pic[1].setAttribute('style', styleText);
}
window.addEventListener("load", function(){
	profile_pic = document.getElementsByClassName("profilepic");
	//console.log(profilepic.length) == 2, head_pic(in left-col.ejs) and head_pic_moblie(in mobile-nav.ejs)
	self.setInterval(flashHeadPic, 200); 
})





