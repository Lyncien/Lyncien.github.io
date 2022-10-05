// -------------------- msg-box.js --------------------
function MsgBox(ele_id, close_on_click_bg){
	close_on_click_bg = close_on_click_bg === undefined ? true : close_on_click_bg;
	var self = this;
	this.ele = document.getElementById(ele_id); //容器，铺满屏幕，微透明的黑色背景
	this.body = this.ele.firstElementChild;
	this.closeButton = this.body.firstElementChild;
	this.closeButton.addEventListener('click', function(){self.hide();}); //点击x，关闭信息框
	if(close_on_click_bg) this.ele.addEventListener('click', function(){self.hide();}); //点击背景，关闭信息框
	this.body.addEventListener('click', function(ev){
		if(ev.target != self.closeButton) ev.stopPropagation();
	}); //点击信息框，取消冒泡到背景，不关闭信息框
}
MsgBox.prototype.show = function(){
	this.ele.classList.add('acitve');
}
MsgBox.prototype.hide = function(){
	if(this.ele.classList.contains('acitve'))
		this.ele.classList.remove('acitve');
}
