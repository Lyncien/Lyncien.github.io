function __scrollTo(o){var l,r,s,t,n=this,c=o.top;"smooth"==o.behavior?(o=n.scrollTop-c,l=n.scrollTop,r=0,s=o/40,t=setInterval(function(){r<=20?(l-=s*(r/20+.5),n.scrollTop=l):(l-=s*(2.5-r/20),n.scrollTop=l,39==r&&(n.scrollTop=c,clearInterval(t))),r+=1},2)):n.scrollTop=c}function __scrollTo2(o){var r=this,s=o.top;if("smooth"==o.behavior){const e=r.scrollTop,i=s-e;var t=null,n=500,c=0;window.requestAnimationFrame(function o(l){c=l-(t=t||l),r.scrollTop=i*c/n+e,c<n?window.requestAnimationFrame(o):r.scrollTop=s})}else r.scrollTop=s}function __scrollTo3(o){var r,s,t,n,c,e=this,i=o.top;"smooth"==o.behavior?(r=i-e.scrollTop,s=e.scrollTop,t=null,n=500,c=0,window.requestAnimationFrame(function o(l){c=(l-(t=t||l))/n,e.scrollTop=c<=.5?r*c*c*2+s:i-r*(1-c)*(1-c)*2,c<1?window.requestAnimationFrame(o):e.scrollTop=i})):e.scrollTop=i}Element.prototype.scrollTo&&CSS.supports("scroll-behavior","smooth")||(Element.prototype.scrollTo=__scrollTo3);