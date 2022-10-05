window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
function probability(percents) {
	return Math.round(Math.random() * 1000) < percents * 10;
}
function uniform(min, max) {
	return Math.random() * (max - min) + min;
}
function randint(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function initBackgroundParticleAnimation(_initType) {
	let meteorColor = '226, 225, 224';
	let fireflyColor = '241, 224, 113';

	let width, height, vw, vh;
	const canvas = document.getElementById('background-canvas');
	let ctx = canvas.getContext('2d');
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	
	let type = null; 

	let meteors = [];
	let meteorsNum = 24;
	let meteorHeadRadius = 0;
	let meteorTailLength = 0;
	let meteorSpeed = 0;

	let fireflys = [];
	let fireflysNum = 36;
	let fireflyRadius = 0;
	let fireflySpeed = 0;

	function resize() {
		width = window.innerWidth;
		height = window.innerHeight;
		vw = width / 100;
		vh = height / 100;
		canvas.setAttribute('width', width);
		canvas.setAttribute('height', height);
		meteorHeadRadius = vw * 0.15;
		meteorTailLength = vw * 7.5;
		meteorSpeed = vw * 0.12;
		fireflyRadius = vw * 0.2;
		fireflySpeed = vw * 0.05;
	}
	resize();
	window.addEventListener('resize', resize, false);

	for (let i = 0; i < meteorsNum; i++) {
		meteors[i] = new Meteor();
	}
	for (let i = 0; i < fireflysNum; i++) {
		fireflys[i] = new Firefly();
	}

	function changeAnimationType(_type){
		type = _type;
		if(type == 2) fireflyColor = '241, 224, 113';
		else if(type == 3) fireflyColor = '150, 205, 117';
		if(type == 1) meteorColor = '226, 225, 224';
		else if(type == 4) meteorColor = '56, 135, 210';
		for (let i = 0; i < meteorsNum; i++) {
			meteors[i].init();
		}
		for (let i = 0; i < fireflysNum; i++) {
			fireflys[i].init();
		}
		if(type == 1 || type == 4){
			ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
			ctx.shadowBlur = 5;
		}
		else if(type == 2 || type == 3){
			ctx.shadowColor = 'white';//'rgb(241, 224, 113)';
			ctx.shadowBlur = 5;
		}
	}
	changeAnimationType(_initType || 0);

	function tick() {
		ctx.clearRect(0, 0, width, height);
		if(type == 1 || type == 4)
			for (let i = 0; i < meteorsNum; i++) {
				let meteor = meteors[i];
				meteor.update();
				meteor.draw();
			}
		else if(type == 2 || type == 3)
			for (let i = 0; i < fireflysNum; i++) {
				let firefly = fireflys[i];
				firefly.update();
				firefly.draw();
			}		
		window.requestAnimationFrame(tick);
	}
	tick();
	function Firefly() {
		this.init = function() {
			this.x = uniform(-15, 75) * vw; //一开始分散在屏幕
			this.y = uniform(15, 85) * vh;
			this.dx = uniform(fireflySpeed, 1.5 * fireflySpeed);
			this.dy = uniform(0.8 * fireflySpeed, 1.5 * fireflySpeed);
			this.r = uniform(fireflyRadius * 0.5, fireflyRadius * 1.2);
			this.b = 5; //模糊级数
			this.b_h = 10; //模糊级数上界
			this.b_l = 2; //模糊级数下界
			this.c = fireflyColor;
			this.db = uniform(0.2, 0.3);
			this.opacity = 0; //透明度
			this.opacityThresh = uniform(0.8, 0.9);
			this.fadingIn = true;
		}
		this.reset = function() {
			this.x = uniform(-15, 25) * vw; //重新进入时只从屏幕偏左方出现
			this.y = uniform(15, 85) * vh;
			this.opacity = 0;
			this.fadingIn = true;
		}
		this.update = function () {
			this.x += this.dx;
			this.y += this.dy * (0.8 - Math.random()); //上下波动，但总体往下
			this.b += this.db; //模糊级数在上下界之间反复变化
			if(this.b > this.b_h || this.b < this.b_l) this.db = -this.db;
			if (this.fadingIn) {
				this.opacity += 0.01;
				if(this.opacity > this.opacityThresh) this.fadingIn = false;
			}
			if (this.x > width || this.y > height) {
				this.reset();
			}
		};
		this.draw = function() {
			ctx.shadowBlur = this.b;
			ctx.fillStyle = 'rgba(' + this.c + ',' + this.opacity + ')';
			ctx.beginPath();
			ctx.moveTo(this.x + this.r, this.y)
			ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
			ctx.fill();
		}
	}
	function Meteor() {
		this.init = function() {
			this.x = uniform(15, 115) * vw;
			this.y = uniform(-15, 75) * vh; //一开始分散在屏幕
			this.r = meteorHeadRadius;
			this.l = meteorTailLength;
			this.dx = - uniform(meteorSpeed, 1.5 * meteorSpeed);
			this.dy = - uniform(this.dx * 0.7, this.dx * 0.9); //uniform(meteorSpeed, 1.2 * meteorSpeed)
			var t = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
			this.dxUnit = this.dx / t;
			this.dyUnit = this.dy / t;
			this.opacity = 0;
			this.opacityThresh = uniform(0.6, 0.7);
			this.fadingIn = true;
			this.fadingOut = false;
		}
		this.reset = function () {
			this.x = uniform(15, 115) * vw;
			this.y = uniform(-15, 25) * vh; //重新进入时只从屏幕偏上方出现
			this.opacity = 0;
			this.fadingIn = true;
			this.fadingOut = false;
		};
		this.update = function () {
			this.x += this.dx;
			this.y += this.dy;
			if (this.fadingIn) {
				this.opacity += 0.01;
				if(this.opacity > this.opacityThresh) this.fadingIn = false;
			}
			if (this.x < (width / 8) || this.y > height - (height / 3)) {
				this.fadingOut = true;
			}
			if (this.fadingOut) {
				this.opacity -= 0.01;
				if (this.x < 0 || this.y > height || this.opacity < 0) {
					this.reset();
				}
			}
		};
		this.draw = function () {
			// meteor head
			ctx.fillStyle = 'rgba(' + meteorColor + ',' + this.opacity + ')';
			ctx.beginPath();
			ctx.moveTo(this.x + this.r, this.y)
			ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
			ctx.closePath();
			ctx.fill();
			// meteor tail
			ctx.fillStyle = 'rgba(' + meteorColor + ',' + this.opacity * 0.5 + ')';
			ctx.beginPath();
			ctx.moveTo(this.x - this.dyUnit * this.r, this.y + this.dxUnit * this.r);
			ctx.lineTo(this.x - this.dxUnit * this.l, this.y - this.dyUnit * this.l);
			ctx.lineTo(this.x + this.dyUnit * this.r, this.y - this.dxUnit * this.r);
			ctx.closePath();
			ctx.fill();
		};
	}
	return changeAnimationType;
}

var changeBackgroundAnimationType = initBackgroundParticleAnimation(); 
if (window.backgroundIdx)
	changeBackgroundAnimationType(window.backgroundIdx);