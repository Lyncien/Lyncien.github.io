// -------------------- setting background-image and animation --------------------

var backgroundIdx = parseInt(localStorage.getItem('background-index') || '1');
var backgroundAuto = localStorage.getItem('background-auto') || 'true';
var backgroundAutoIntervalId;

function changeBackgroundAndAnimation(){
	localStorage.setItem('background-index', backgroundIdx);
	document.documentElement.style.backgroundImage = 'url("/img/bg' + backgroundIdx + '.webp")'; //切换背景图片
	if(window.changeBackgroundAnimationType) window.changeBackgroundAnimationType(backgroundIdx); //切换背景粒子
}

window.addEventListener('DOMContentLoaded', function () {
	// init ui
	var select_bg_btns = document.querySelectorAll('#setting-msg-box button');
	for(var i = 0; i < select_bg_btns.length; i++){
		select_bg_btns[i].addEventListener('click', function(){
			backgroundIdx = parseInt(this.dataset.idx);
			changeBackgroundAndAnimation();
		})
	}
	var bg_auto_checkbox = document.querySelector('#setting-msg-box input[type="checkbox"]');
	bg_auto_checkbox.checked = backgroundAuto == 'true' ? true : false;
	bg_auto_checkbox.addEventListener('change', function(){
		console.log(this.checked);
		backgroundAuto = this.checked ? 'true': 'false';
		localStorage.setItem('background-auto', backgroundAuto);
		if(backgroundAuto == 'true')
			backgroundAutoIntervalId = setInterval(function(){
				backgroundIdx = (backgroundIdx) % 4 + 1;
				changeBackgroundAndAnimation();
			}, 60000);
		else{
			clearInterval(backgroundAutoIntervalId);
			backgroundAutoIntervalId = undefined;
		}
	});
	bg_auto_checkbox.dispatchEvent(new Event('change'));
});

changeBackgroundAndAnimation(); //change bg as fast as possible