window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
function initBackgroundParticleAnimation(_initType) {
	const circleColor = '180, 184, 240';
	let meteorColor = '226, 225, 224';
	let fireflyColor = '241, 224, 113';

	const canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d');
	let width, height, vw, vh;
	let type = null; 

	//const Density = 0.03;
	//let Count = 0;

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
		canvas.setAttribute('width', width);
		canvas.setAttribute('height', height);
		vw = width / 100;
		vh = height / 100;
		//Count = Math.floor(Math.max(width, height) * Density);
		//console.log(Count);
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

	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	function changeAnimationType(_type){
		type = _type;
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
		if(type == 2) fireflyColor = '241, 224, 113';
		else if(type == 3) fireflyColor = '150, 205, 117';
		if(type == 1) meteorColor = '226, 225, 224';
		else if(type == 4) meteorColor = '56, 135, 210';
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
			this.dx = uniform(fireflySpeed, 1.5 * fireflySpeed)// + (+this.isMeteor) * speedCoeff * uniform(50, 120) + speedCoeff * 2;
			this.dy = uniform(0.8 * fireflySpeed, 1.5 * fireflySpeed)// + (+this.isMeteor) * speedCoeff * uniform(50, 120);
			this.r = uniform(fireflyRadius * 0.5, fireflyRadius * 1.2);
			this.b = 5;
			this.b_h = 10;
			this.b_l = 2;
			this.db = uniform(0.2, 0.3);
			this.opacity = 0;
			this.opacityDiff = 0.01;
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
			this.b += this.db;
			if(this.b > this.b_h || this.b < this.b_l) this.db = -this.db;
			if (this.fadingIn) {
				this.fadingIn = !(this.opacity > this.opacityThresh);
				this.opacity += this.opacityDiff;
			}
			if (this.x > width || this.y > height) {
				this.reset();
			}
		};
		this.draw = function() {
			ctx.shadowBlur = this.b;
			ctx.fillStyle = 'rgba(' + fireflyColor + ',' + this.opacity + ')';
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
			this.dx = - uniform(meteorSpeed, 1.5 * meteorSpeed);
			this.dy = - uniform(this.dx * 0.7, this.dx * 0.9); //uniform(meteorSpeed, 1.2 * meteorSpeed)
			var t = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
			this.dxUnit = this.dx / t;
			this.dyUnit = this.dy / t;
			this.opacity = 0;
			this.opacityDiff = 0.01;
			this.opacityThresh = uniform(0.6, 0.7);
			this.fadingIn = true;
			this.fadingOut = null;
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
			if (this.x < (width / 4) || this.y > height - (height / 3)) {
				this.fadingOut = true;
			}
			if (this.fadingIn) {
				this.fadingIn = !(this.opacity > this.opacityThresh);
				this.opacity += this.opacityDiff;
			}
			if (this.fadingOut) {
				this.opacity -= this.opacityDiff;
				if (this.x < 0 || this.y > height || this.opacity < 0) {
					this.fadingOut = false;
					this.reset();
				}
			}
		};
		this.draw = function () {
			// meteor head
			ctx.fillStyle = 'rgba(' + meteorColor + ',' + this.opacity + ')';
			ctx.beginPath();
			ctx.moveTo(this.x + meteorHeadRadius, this.y)
			ctx.arc(this.x, this.y, meteorHeadRadius, 0, 2 * Math.PI, false);
			ctx.closePath();
			ctx.fill();
			// meteor tail
			ctx.fillStyle = 'rgba(' + meteorColor + ',' + this.opacity * 0.5 + ')';
			ctx.beginPath();
			ctx.moveTo(this.x - this.dyUnit * meteorHeadRadius, this.y + this.dxUnit * meteorHeadRadius);
			ctx.lineTo(this.x - this.dxUnit * meteorTailLength, this.y - this.dyUnit * meteorTailLength);
			ctx.lineTo(this.x + this.dyUnit * meteorHeadRadius, this.y - this.dxUnit * meteorHeadRadius);
			ctx.closePath();
			ctx.fill();
		};
	}
	return changeAnimationType;
}
