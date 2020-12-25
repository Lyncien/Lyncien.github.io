function HSL2RGB(h, s, l) {
    var r, g, b;
    if(s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return "RGB("+Math.round(r * 255)+","+Math.round(g * 255)+","+Math.round(b * 255)+")";
}
String.prototype.colorHex = function(){
    var that = this;
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是rgb颜色表示
    if (/^(rgb|RGB)/.test(that)) {
        var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        var strHex = "#";
        for (var i=0; i<aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16);
            if (hex.length < 2) {
                hex = '0' + hex;    
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = that;    
        }
        return strHex;
    } else if (reg.test(that)) {
        var aNum = that.replace(/#/,"").split("");
        if (aNum.length === 6) {
            return that;    
        } else if(aNum.length === 3) {
            var numHex = "#";
            for (var i=0; i<aNum.length; i+=1) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    }
    return that;
};
var size=40;
var sstep=5;
var hue=1;
var hstep=5;
function headboxflash(){
	
	size=size+sstep;
	if(size>100 || size<40) sstep=-sstep;
	hue=(hue+hstep)%360;
	colorhextext=HSL2RGB(hue/360,0.7,0.7).colorHex();
	//document.write(HSL2RGB(color/360,0.5,0.5).colorHex()+"\n")
	document.getElementById("head-pic").setAttribute('style', "box-shadow: 0 0 "+size+"px "+colorhextext+";"+"  border: 3px solid "+colorhextext+";");
	document.getElementById("head-pic-mobile").setAttribute('style', "box-shadow: 0 0 "+size+"px "+colorhextext+";"+"  border: 3px solid "+colorhextext+";");

	}(window, document)
self.setInterval(headboxflash,50); 



