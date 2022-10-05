// smooth scrollTo
function __scrollTo(option){ //先加速后减速，执行次数total确定
	//console.log(this, 'scrollTo', option);
	var ele = this, top = option.top;
	if(option.behavior != 'smooth'){
		ele.scrollTop = top;
		return;
	}
	var dist = ele.scrollTop - top, scrollTop = ele.scrollTop;
	var total = 40, half = 20, cnt = 0;
	var diff = dist / total;
	//0->0.5x,25->1x,50->1.5x
	//51->1.48x,99->0.52x 
	var clock = setInterval(function(){
		if(cnt <= half){
			scrollTop -= diff * (cnt / half + 0.5);
			ele.scrollTop = scrollTop; //若直接从ele.scrollTop减去，会丢失一些精度，100次下来会有较大偏差
			// console.log(cnt, ele.scrollTop, diff * (cnt / half + 0.5));
		}
		else{
			scrollTop -= diff * (2.5 - cnt / half);
			ele.scrollTop = scrollTop;
			if(cnt == total - 1){
				ele.scrollTop = top; //最后设置一次确保最终位置准确
				clearInterval(clock);
			}
		}
		cnt += 1;
	}, 2); //100*3=300ms
}

function __scrollTo2(option) { //匀速，指定时间duration，但是执行次数不定
	// console.log(this, 'scrollTo2', option);
	var ele = this, top = option.top;
	if(option.behavior != 'smooth'){
		ele.scrollTop = top;
		return;
	}
	const originTop = ele.scrollTop, dist = top - originTop;
	var startTime = null;
	var duration = 500, progress = 0;
	function step(currentTime) {
		startTime = !startTime ? currentTime : startTime;
		progress = currentTime - startTime;
		ele.scrollTop = (dist * progress / duration) + originTop;
		if (progress < duration) {
			window.requestAnimationFrame(step);
		} else {
			ele.scrollTop = top;
		}
	}
	window.requestAnimationFrame(step);
}

function __scrollTo3(option) { //先加速后减速，指定时间duration，但是执行次数不定
	// console.log(this, 'scrollTo3', option);
	var ele = this, top = option.top;
	if(option.behavior != 'smooth'){
		ele.scrollTop = top;
		return;
	}
	var dist = top - ele.scrollTop, originTop = ele.scrollTop;
	var startTime = null;
	var duration = 500, percent = 0;
	function step(currentTime) {
		startTime = !startTime ? currentTime : startTime;
		percent = (currentTime - startTime) / duration;
		if(percent <= 0.5){
			ele.scrollTop = (dist * percent * percent * 2) + originTop;
		}else{
			ele.scrollTop = top - (dist * (1-percent) * (1-percent) * 2);
		}
		if (percent < 1) {
			window.requestAnimationFrame(step);
		} else {
			ele.scrollTop = top;
		}
	}
	window.requestAnimationFrame(step);
}
if(!Element.prototype.scrollTo || !CSS.supports('scroll-behavior', 'smooth'))
	Element.prototype.scrollTo = __scrollTo3;