function style(ele, prop){
	return getComputedStyle(ele)[prop];
}
function styleInt(ele, prop){
	return parseInt(getComputedStyle(ele)[prop]);
}
function http_get_text(url, callback_success, callback_error) {
	callback_success = callback_success || function () { };
	callback_error = callback_error || function () { };
	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.onload = function () {
		if (xhr.status == 200) callback_success(xhr.responseText);
		else callback_error();
	}
	xhr.onerror = xhr.abort = xhr.ontimeout = callback_error;
	xhr.send();
}
function copy(text){ // 借助textarea/input执行复制命令
	if (document.queryCommandSupported && document.queryCommandSupported('copy')
		|| document.execCommand) {
		var textarea = document.getElementById('copy-textarea');
		if(!textarea){
			textarea = document.createElement("textarea");
			textarea.id = 'copy-textarea';
			textarea.style.position = 'fixed';
			textarea.style.top = '1e6px';
			textarea.style.opacity = "0";
			textarea.readOnly = true; //兼容在iOS环境下瞬间拉起键盘又缩回的闪烁
			document.body.append(textarea);
		}
		textarea.value = text;
		textarea.select();
		textarea.setSelectionRange(0, text.length); //兼容iOS
		if(document.execCommand('copy')) 
			return true;
	}
	return false;
}
function isBodyScrollTopAvailable(){ //scrollTop不可用或者body本就没有出现滚动条时返回false
	if(document.body.scrollTop === undefined) return false;
	var old = document.body.scrollTop;
	document.body.scrollTop = 1;
	if(document.body.scrollTop == 0) return false;
	document.body.scrollTop = old;
	return true;
}
function isObject(value) {
	var type = typeof value;
	return value != null && (type == 'object' || type == 'function');
}
function debounce(func, wait, options) {
	var lastArgs, lastThis, maxWait,
		result, timerId,
		lastCallTime, lastInvokeTime = 0,
		leading = false, maxing = false, trailing = true;
	if (typeof func != 'function') {
		throw new TypeError('Expected a function');
	}
	wait = parseInt(wait) || 0;
	if (isObject(options)) {
		leading = !!options.leading;
		maxing = 'maxWait' in options;
		maxWait = maxing ? Math.max(parseInt(options.maxWait) || 0, wait) : maxWait;
		trailing = 'trailing' in options ? !!options.trailing : trailing;
	}
	function invokeFunc(time) {
		var args = lastArgs, thisArg = lastThis;
		lastArgs = lastThis = undefined;
		lastInvokeTime = time;
		result = func.apply(thisArg, args);
		return result;
	}
	function leadingEdge(time) {
		// Reset any `maxWait` timer.
		lastInvokeTime = time;
		// Start the timer for the trailing edge.
		timerId = setTimeout(timerExpired, wait);
		// Invoke the leading edge.
		return leading ? invokeFunc(time) : result;
	}
	function remainingWait(time) {
		var timeSinceLastCall = time - lastCallTime,
			timeSinceLastInvoke = time - lastInvokeTime,
			timeWaiting = wait - timeSinceLastCall;
		return maxing
			? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
			: timeWaiting;
	}
	function shouldInvoke(time) {
		var timeSinceLastCall = time - lastCallTime,
			timeSinceLastInvoke = time - lastInvokeTime;
		// Either this is the first call, activity has stopped and we're at the
		// trailing edge, the system time has gone backwards and we're treating
		// it as the trailing edge, or we've hit the `maxWait` limit.
		return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
			(timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
	}
	function timerExpired() {
		var time = Date.now();
		if (shouldInvoke(time)) {
			return trailingEdge(time);
		}
		// Restart the timer.
		timerId = setTimeout(timerExpired, remainingWait(time));
	}
	function trailingEdge(time) {
		timerId = undefined;
		// Only invoke if we have `lastArgs` which means `func` has been
		// debounced at least once.
		if (trailing && lastArgs) {
			return invokeFunc(time);
		}
		lastArgs = lastThis = undefined;
		return result;
	}
	function cancel() {
		if (timerId !== undefined) {
			clearTimeout(timerId);
		}
		lastInvokeTime = 0;
		lastArgs = lastCallTime = lastThis = timerId = undefined;
	}
	function flush() {
		return timerId === undefined ? result : trailingEdge(Date.now());
	}
	function debounced() {
		var time = Date.now(),
			isInvoking = shouldInvoke(time);
		lastArgs = arguments;
		lastThis = this;
		lastCallTime = time;
		if (isInvoking) {
			if (timerId === undefined) {
				return leadingEdge(lastCallTime);
			}
			if (maxing) {
				// Handle invocations in a tight loop.
				clearTimeout(timerId);
				timerId = setTimeout(timerExpired, wait);
				return invokeFunc(lastCallTime);
			}
		}
		if (timerId === undefined) {
			timerId = setTimeout(timerExpired, wait);
		}
		return result;
	}
	debounced.cancel = cancel;
	debounced.flush = flush;
	return debounced;
}
function throttle(func, wait, options) {
	var leading = true, trailing = true;
	if (typeof func !== 'function') {
		throw new TypeError('Expected a function');
	}
	if (isObject(options)) {
		leading = 'leading' in options ? !!options.leading : leading
		trailing = 'trailing' in options ? !!options.trailing : trailing
	}
	return debounce(func, wait, {
		'leading': leading,
		'trailing': trailing,
		'maxWait': wait
	});
}

function html_escape(text) { // 替换文本中的html特殊字符，没有替换空白和换行符
	return text.replace(/[<>"&]/g, function(match, pos, originalText){
		switch(match){
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "&": return "&amp;";
			case "\"":return "&quot;";
			//case "\n":return "&#13;";
			//case " ":return "&nbsp;";
		}
	});
}


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
// -------------------- search.js --------------------
http_get_text('/search.json', function(responseText) {
	// console.log(response);
	var data = JSON.parse(responseText);
	window.search_items = data.map(function(item){
		return {
			title: (item.title || "").trim(),
			content: (item.content || "").trim(),
			url: item.url
		}
	})
});
window.addEventListener('DOMContentLoaded', function() {
	var $input = document.getElementById('search-input');
	var $result = document.getElementById('search-result');
	$input.addEventListener('input', function () {
		if (this.value.trim().length <= 0) return;
		var inputText = this.value.trim().toLowerCase();
		var keywords = inputText.split(/[\s\-]+/);
		// var result = '<div class="search-result-list">';
		var result = '';
		window.search_items.forEach(function (item) {
			if (item.title === '' || item.content === '') return;
			var title_lower = item.title.toLowerCase();
			var content_lower = item.content.toLowerCase();
			var index_title = -1, index_content = -1, first_occur = -1;
			for(var i = 0, keyword = ''; i < keywords.length; i++){
				keyword = keywords[i];
				index_title = title_lower.indexOf(keyword);
				index_content = content_lower.indexOf(keyword);
				if (index_title < 0 && index_content < 0) { //该关键词即没有出现在标题和内容之一
					return;
				} else {
					if (i == 0) first_occur = index_content; //第一个关键词第一次出现的位置
				}
			}
			// cut out 100 characters
			var start = first_occur - 20, end = first_occur + 80;
			if (start < 0) {start = 0; end = 100;}
			if (end > item.content.length) end = item.content.length;
			var match_content = html_escape(item.content.substring(start, end));
			var item_title = html_escape(item.title);
			// highlight all keywords
			keywords.forEach(function (keyword) {
				keyword = html_escape(keyword);
				var reg = new RegExp(keyword, "gi"); //fixme: deal with keyword that contains regex symbol
				item_title = item_title.replace(reg, '<strong class="keyword">' + keyword + '</strong>');
				match_content = match_content.replace(reg, '<strong class="keyword">' + keyword + '</strong>');
			});
			result += '<div class="search-result-item">'
				+ '<a href="' + item.url + '" target="_blank" class="title">' + item_title + '</a>'
				+ '<p class="content">' + match_content + '...</p>'
			+ "</div>";
		});
		// result += "</div>";
		$result.innerHTML = result;
	});
});


function initPostToc(scroll_dom, article_content_dom, toc_scroll_dom, toc_content_dom) {
	// var scroll_dom = document.body;
	// var article_content_dom = document.querySelector("article>.content");
	// var toc_scroll_dom = document.getElementById('toc');
	// var toc_content_dom = toc_scroll_dom.querySelector(".content");
	toc_content_dom = toc_scroll_dom; //可以是同一个，内容溢出使自身出现滚动条
	var h1List, h2List, h3List, h4List, h5List;
	h1List = h2List = h3List = h4List = h5List = [];
	var nodeList = article_content_dom.childNodes;
	// h1List = new Array();
	for (var i = 0, node = null; i < nodeList.length; i++) {
		node = nodeList[i];
		if ( node.nodeName == 'H1' ) {
			node.classList.add('anchor');
			h2List = new Array();
			h1List.push({node: node, idx: i, children: h2List});
		}
		else if ( node.nodeName == 'H2' ) {
			node.classList.add('anchor');
			h3List = new Array();
			h2List.push({node: node, idx: i, children: h3List});
		}
		else if ( node.nodeName == 'H3' ) {
			node.classList.add('anchor');
			h4List = new Array();
			h3List.push({node: node, idx: i, children: h4List});
		}
		else if ( node.nodeName == 'H4' ) {
			node.classList.add('anchor');
			h5List = new Array();
			h4List.push({node: node, idx: i, children: h5List});
		}
		else if ( node.nodeName == 'H5' ) {
			node.classList.add('anchor');
			h5List.push({node: node, idx: i, children: []});
		}
	}	
	// 递归生成树状目录索引html
	function generate(dataList){
		var content = "<ol>";
		dataList.forEach(function(data){
			if(data.children == 0)
				content += '<li><a href="javascript:;">'+data.node.innerText+'</a></li>';
			else
				content += '<li><a href="javascript:;">'+data.node.innerText+'</a>'+generate(data.children)+'</li>';
		});
		content += "</ol>"
		return content;
	}

	document.querySelector("#toc>.content").innerHTML = generate(h1List);

	function getOffsetTopBy(ele, refEle) { // refEle必修是ele的祖先且开启定位
		var actualTop = ele.offsetTop;
		var currentEle = ele.offsetParent;
		while (currentEle !== null && currentEle != refEle) {
			actualTop += currentEle.offsetTop;
			currentEle = currentEle.offsetParent;
		}
		return actualTop;
	}
	// 注: 
	// 1. 本博客滚动条在body上(而不是html)，mybody过长使得body出现滚动条
	// mybody开启了relative定位，因此获取的anchorTop是标题相对于mybody最顶端的距离(不包括网页header的50px)
	// 2. 目录(#toc)的内容(.content)过长时，#toc出现滚动条
	// .content开启了relative定位，因此获取的tocLinkTop是tocLink相对于.content最顶端的距离
	// 3. 页面生成后（若大小不变化）anchorTop和tocLinkTop都不会再改变，因此提前一次性计算
	
	//anchor与tocLink按顺序一一对应
	var anchorList = Array.prototype.slice.call(article_content_dom.querySelectorAll(".anchor"));
	var anchorTopList = anchorList.map(ele=>ele.offsetTop);
	var tocLinkList = Array.prototype.slice.call(toc_content_dom.querySelectorAll("a"));
	var tocLinkTopList = tocLinkList.map(ele=>getOffsetTopBy(ele, toc_content_dom));
	//页面大小改变时，需要重新计算anchor和tocLink的top
	window.addEventListener('resize', function(){
		anchorTopList = anchorList.map(ele=>ele.offsetTop);
		tocLinkTopList = tocLinkList.map(ele=>getOffsetTopBy(ele, toc_content_dom));
	});
	//页面滚动时，更新目录项的状态
	scroll_dom.addEventListener('scroll', debounce(function(ev){
		var i = 0, dist = 0, bodyScrollTop = scroll_dom.scrollTop;
		// console.log(bodyScrollTop, anchorTopList[0]);
		// anchor超出mybody视口上边界时认定为已经读过（刚刚超出的那个正在读）
		for(; i < anchorTopList.length; i++){
			dist = anchorTopList[i] - bodyScrollTop;
			if(dist < 1) //理论上应该为 < 0，但考虑到小数精度
				tocLinkList[i].parentNode.className = 'read';
			else
				break;
		}
		//不是一个也还没读的情况下，最后一个已经读过修改为当前正在读
		if(i > 0){ //
			tocLinkList[i - 1].parentNode.className = 'current';
			// 目录也自动滚动，使当前目录项在#toc视口正中间
			toc_scroll_dom.scrollTo({'top': tocLinkTopList[i - 1] - toc_scroll_dom.offsetHeight / 2, behavior: 'smooth'}); 
		}//
		//未读过的
		for(; i < anchorTopList.length; i++){
			tocLinkList[i].parentNode.className = '';
		}
	}, 100)); // 使用debounce, 减少更新频率
	// 每个目录链接跳转到对应标题位置，按数组索引一一对应
	for(var i = 0; i < tocLinkList.length; i++){
		(function(idx){
			tocLinkList[idx].addEventListener('click', function(ev){
				ev.preventDefault();
				scroll_dom.scrollTo({top: anchorTopList[idx], behavior: 'smooth'});
			});
		})(i);
	}
}

// -------------------- post.js --------------------
function initPostMermaid(article_content_dom){
	var mermaidList = article_content_dom.querySelectorAll('.mermaid');
	for(var i = 0; i < mermaidList.length; i++){
		var ele = mermaidList[i];
		mermaid.init({}, ele);
	}
}
function initPostMath(article_content_dom){
	MathJax.Hub.Queue(["Typeset", MathJax.Hub, article_content_dom]); //好像是异步的
}
// -------------------- code --------------------
function initPostCode(article_content_dom){
	var codeList = article_content_dom.querySelectorAll('pre code');
	for(var i = 0; i < codeList.length; i++){
		hljs.highlightBlock(codeList[i]);
		var codeInnerHtml = "<line>" + codeList[i].innerHTML.trim().replace(/\n/g, "\n</line><line>") + "\n</line>";
		codeList[i].parentNode.innerHTML = '<code><div class="code-inner">' + codeInnerHtml + '</div></code>'
		+ '<div class="code-copy-button"><span></span> <i class="fa fa-clipboard"></i></div>';
	}
	var codeCopyBtnList = article_content_dom.querySelectorAll('.code-copy-button');
	for(var i = 0; i < codeCopyBtnList.length; i++){
		var codeCopyBtn = codeCopyBtnList[i];
		codeCopyBtn.addEventListener('click', function(ev){
			var codeCopyBtnSpan = this.firstChild;
			var codeInnerLines = this.previousElementSibling.firstElementChild.childNodes;
			var code = '';
			for(var i = 0; i < codeInnerLines.length; i++)
				if(codeInnerLines[i].nodeName == 'LINE')
					code += codeInnerLines[i].innerText;
			// console.log(ev, code);
			if(copy(code))
				codeCopyBtnSpan.innerText = '复制成功';
			else
				codeCopyBtnSpan.innerText = '复制失败';
			codeCopyBtnSpan.style.opacity = 1;
			setTimeout(function(){ codeCopyBtnSpan.style.opacity = 0 }, 700);
		});
	}
}
// -------------------- footnote/tooltip --------------------
function initPostFootnote(scroll_dom, article_content_dom){
	//处理脚注及其(多个)引用的相互跳转
	var footnoteRefList = article_content_dom.querySelectorAll('sup[id^="fn_ref_"]');
	// console.log(footnoteRefList);
	for(var i = 0; i < footnoteRefList.length; i++){
		var footnoteRef = footnoteRefList[i]; //文章正文中脚注引用(sup标签)
		var footnote_id = footnoteRef.lastElementChild.getAttribute('href').slice(1); //如果是直接获取.href是完整uri，这里只取原始的#部分且去除#
		var footnote = document.getElementById(footnote_id); //对应文章尾部脚注的div标签
		footnoteRef.lastElementChild.href = 'javascript:;';
		footnote.lastElementChild.href = 'javascript:;';
		footnoteRef._footnote = footnote; //记录对应关系
		footnote._footnoteRef = footnoteRef; //记录对应关系（覆盖之前的引用，如果有）
		footnoteRef.onclick = function(){scroll_dom.scrollTo({top: this._footnote.offsetTop, behavior: 'smooth'});} //offsetTop相对mybody定位
		footnote.onclick = function(){scroll_dom.scrollTo({top: this._footnoteRef.offsetTop, behavior: 'smooth'});}
		//var footnote_text = footnote.innerText.slice(0, footnote.innerText.length-1);
		//footnoteRef.setAttribute('data-tip', footnote_text);
		//var textWidth = parseInt(getComputedStyle(footnoteRef, ':after').width); //一行时的宽度
		//var charWidth = textWidth / footnote_text.length;
		//var charsPerLine = Math.floor(Math.sqrt(footnote_text.length)*1.5);
		//var realWidth = Math.min(charsPerLine * remWidth, articleWidth);
		//footnoteRef.classList.add('tooltip-wrapper');
		//footnoteRef.innerHTML += '<span class="tooltip">'+footnote_text+'</span>'
		//处理脚注引用的tooltip
		// var footnoteRefTooltip = footnoteRefLink.lastElementChild;
		// var originWidth = styleInt(footnoteRefTooltip, 'width');
		// var realWidth = Math.min(originWidth, articleWidth / 2);
		// if(originWidth > realWidth) {
		// 	footnoteRefTooltip.style.width = realWidth + 'px';
		// 	footnoteRefTooltip.style.whiteSpace = 'pre-wrap'; //恢复多行
		// }
		// var footnoteRefLeft = footnoteRef.offsetLeft;
		// console.log(footnote_text.length, realWidth, footnoteRefLeft, footnote.offsetTop);
		// footnoteRefTooltip.style.left = Math.min(Math.max(- realWidth / 2, 0 - footnoteRefLeft), articleWidth - realWidth - footnoteRefLeft) + 'px';
	}
}

window.addEventListener('DOMContentLoaded', function() {
var is_body_scroll_top_available = isBodyScrollTopAvailable();

var scroll_dom = document.body;
var article_content_dom = document.querySelector('article .content');
var header = document.getElementsByTagName('header')[0];
var nav = document.getElementsByTagName('nav')[0];
var toc = document.getElementById('toc');
var is_post = !!toc; //有toc说明这是文章(post)

// -------------------- header --------------------
document.getElementById('nav-mobile-toggle-button').addEventListener('click', function(){
	header.classList.toggle('expand');
	if(header.classList.contains('expand')) /* header设置height:auto 无法过渡，只能手动设置*/
		header.style.height = styleInt(nav, 'height') + 75 + 'px';
	else
		header.style.height = '50px';
});
if(is_post) document.getElementById('nav-mobile-toc-button').addEventListener('click', function(){
	toc.classList.toggle('toc-show');
	header.classList.toggle('toc-show');
	// var toc_width = styleInt(toc, 'width');
	// /* 由于toc的css width计算复杂, header的width过渡难于与之对应，因此根据toc_width手动设置toc/header的固定定位*/
	// if(toc.classList.contains('toc-show')) 
	// 	toc.style.left = scroll_dom.offsetWidth - toc_width + 'px';
	// else
	// 	toc.style.left = '100%';
	// if(header.classList.contains('toc-show')) /* 由于toc的width计算复杂,header的width过渡难于与之对应，也手动设置*/
	// 	header.style.right = toc_width + 'px';
	// else
	// 	header.style.right = ''; //取消设置，由css媒体查询设置
});

function resetHeaderAndTOC(){ //收起header和toc
	header.classList.remove('expand');
	header.style.height = '50px';
	if(is_post){
		toc.classList.remove('toc-show');
		header.classList.remove('toc-show');
	}
}
document.getElementsByTagName('main')[0].addEventListener('click', resetHeaderAndTOC);
window.addEventListener('resize', resetHeaderAndTOC);

// -------------------- search --------------------
var search_msgbox = new MsgBox('search-msg-box');
document.getElementById('nav-search-button').addEventListener('click', function(){
	search_msgbox.show();
});
if(!is_post) document.getElementById('nav-mobile-search-button').addEventListener('click', function(){
	search_msgbox.show();
});

// -------------------- setting --------------------
var setting_msgbox = new MsgBox('setting-msg-box');
document.getElementById('setting').addEventListener('click', function(){
	setting_msgbox.show();
});

// -------------------- go-to-top-bottom --------------------
if(is_body_scroll_top_available){
	document.getElementById('go-to-top').href = 'javascript:;';
	document.getElementById('go-to-bottom').href = 'javascript:;';
	document.getElementById('go-to-top').onclick = function(){
		// scroll_dom.scrollTop = 0;
		scroll_dom.scrollTo({top: 0, behavior: 'smooth'});
	}
	document.getElementById('go-to-bottom').onclick = function(){
		// scroll_dom.scrollTop = '1e6';
		scroll_dom.scrollTo({top: scroll_dom.scrollHeight, behavior: 'smooth'});
	}
}

if(is_post){
	initPostCode(article_content_dom);
	initPostMermaid(article_content_dom);
	if(is_body_scroll_top_available)
		initPostFootnote(scroll_dom, article_content_dom)
	initPostToc(document.body, document.querySelector("article>.content"), document.querySelector("#toc>.content"));
} else {
	initPostCode(scroll_dom); //为了初始化主页的文章预览中的代码
}
// -------------------- add copyright on copy --------------------
document.addEventListener('copy', function (event) { //复制时添加版权信息
	var clipboardData = event.clipboardData;
	if (!clipboardData) { return; }
	var text = window.getSelection().toString();
	if (text) {
		event.preventDefault();
		clipboardData.setData('text/plain', text + '\nMade by LX');
	}
});

});
/**
 * Get offset of DOM element Helper, including these with translation
 */
const getOffset = function (el) {
	let _x = 0;
	let _y = 0;
	while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
		_x += el.offsetLeft - (el.tagName != 'BODY' ? el.scrollLeft : 0);
		_y += el.offsetTop - (el.tagName != 'BODY' ? el.scrollTop : 0);
		el = el.offsetParent;
	}
	return {
		top: _y,
		left: _x
	};
};

/**
 * Calculate offset, basing on element's settings like:
 * - anchor
 * - offset
 */
const calculateOffset = function (el, optionalOffset) {
	let elementOffsetTop = 0;
	let additionalOffset = 0;
	const windowHeight = window.innerHeight;
	const attrs = {
		offset: el.getAttribute('data-aos-offset'),
		anchor: el.getAttribute('data-aos-anchor'),
		anchorPlacement: el.getAttribute('data-aos-anchor-placement')
	};
	if (attrs.offset && !isNaN(attrs.offset)) {
		additionalOffset = parseInt(attrs.offset);
	}
	if (attrs.anchor && document.querySelectorAll(attrs.anchor)) {
		el = document.querySelectorAll(attrs.anchor)[0];
	}
	elementOffsetTop = getOffset(el).top;
	switch (attrs.anchorPlacement) {
		case 'top-bottom': // Default offset
			break;
		case 'center-bottom':
			elementOffsetTop += el.offsetHeight / 2;
			break;
		case 'bottom-bottom':
			elementOffsetTop += el.offsetHeight;
			break;
		case 'top-center':
			elementOffsetTop += windowHeight / 2;
			break;
		case 'bottom-center':
			elementOffsetTop += windowHeight / 2 + el.offsetHeight;
			break;
		case 'center-center':
			elementOffsetTop += windowHeight / 2 + el.offsetHeight / 2;
			break;
		case 'top-top':
			elementOffsetTop += windowHeight;
			break;
		case 'bottom-top':
			elementOffsetTop += el.offsetHeight + windowHeight;
			break;
		case 'center-top':
			elementOffsetTop += el.offsetHeight / 2 + windowHeight;
			break;
	}
	if (!attrs.anchorPlacement && !attrs.offset && !isNaN(optionalOffset)) {
		additionalOffset = optionalOffset;
	}
	// return final offset that will be used to trigger animation in good position
	return elementOffsetTop + additionalOffset;
};

/**
 * Set or remove aos-animate class
 */
const setState = function (el, top, once) {
	const attrOnce = el.node.getAttribute('data-aos-once');
	if (top > el.position) {
		el.node.classList.add('aos-animate');
	} else if (typeof attrOnce !== 'undefined') {
		if (attrOnce === 'false' || (!once && attrOnce !== 'true')) {
			el.node.classList.remove('aos-animate');
		}
	}
};

/**
 * Scroll logic - add or remove 'aos-animate' class on scroll
 */
const handleScroll = function ($elements, once) {
	const scrollTop = document.body.scrollTop; //window.pageYOffset;
	const windowHeight = window.innerHeight;
	// Check all registered elements positions and animate them on scroll
	$elements.forEach((el, i) => {
		setState(el, windowHeight + scrollTop, once);
	});
};

/**
* Generate initial array with elements as objects
* This array will be extended later with elements attributes values
* like 'position'
*/
const createArrayWithElements = function (elements) {
	elements = elements || document.querySelectorAll('[data-aos]');
	return Array.prototype.map.call(elements, node => ({ node }));
};


let callback = () => { };

function containsAOSNode(nodes) {
	let i, currentNode, result;
	for (i = 0; i < nodes.length; i += 1) {
		currentNode = nodes[i];
		if (currentNode.dataset && currentNode.dataset.aos) {
			return true;
		}
		result = currentNode.children && containsAOSNode(currentNode.children);
		if (result) {
			return true;
		}
	}
	return false;
}

window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

function initObserver(selector, fn) {
	const doc = window.document;
	const MutationObserver = window.MutationObserver;
	const observer = new MutationObserver(function (mutations) {
		if (!mutations) return;
		mutations.forEach(mutation => {
			const addedNodes = Array.prototype.slice.call(mutation.addedNodes);
			const removedNodes = Array.prototype.slice.call(mutation.removedNodes);
			const allNodes = addedNodes.concat(removedNodes);
			if (containsAOSNode(allNodes)) {
				return callback();
			}
		});
	});
	callback = fn;
	observer.observe(doc.documentElement, {
		childList: true,
		subtree: true,
		removedNodes: true
	});
}

/**
 * Private variables
 */
let $aosElements = [];
let initialized = false;

/**
 * Default options
 */
let options = {
	offset: 120,
	delay: 0,
	easing: 'ease',
	duration: 400,
	disable: false,
	once: false,
	startEvent: 'DOMContentLoaded',
	throttleDelay: 99,
	debounceDelay: 50,
	disableMutationObserver: false,
};

/**
 * Refresh AOS
 */
const refresh = function refresh(initialize = false) {
	// Allow refresh only when it was first initialized on startEvent
	if (initialize) initialized = true;
	if (initialized) {
		// Extend elements objects in $aosElements with their positions
		$aosElements.forEach((el, i) => {
			el.node.classList.add('aos-init');
			el.position = calculateOffset(el.node, options.offset);
		});
		// Perform scroll event, to refresh view and show/hide elements
		handleScroll($aosElements, options.once);
		return $aosElements;
	}
};
const refreshHard = function refreshHard() {
	$aosElements = createArrayWithElements();
	refresh();
};
const disable = function () {
	$aosElements.forEach(function (el, i) {
		el.node.removeAttribute('data-aos');
		el.node.removeAttribute('data-aos-easing');
		el.node.removeAttribute('data-aos-duration');
		el.node.removeAttribute('data-aos-delay');
	});
};

/**
 * Initializing AOS
 * - Create options merging defaults with user defined options
 * - Set attributes on <body> as global setting - css relies on it
 * - Attach preparing elements to options.startEvent,
 *   window resize and orientation change
 * - Attach function that handle scroll and everything connected to it
 *   to window scroll event and fire once document is ready to set initial state
 */
const init = function init(settings) {
	options = Object.assign(options, settings);

	// Create initial array with elements -> to be fullfilled later with prepare()
	$aosElements = createArrayWithElements();

	// Detect not supported browsers (<=IE9)
	// http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	const browserNotSupported = document.all && !window.atob;

	if (options.disable || browserNotSupported) {
		return disable();
	}

	/**
	 * Disable mutation observing if not supported
	 */
	if (!options.disableMutationObserver && !window.MutationObserver) {
		console.info(`
			aos: MutationObserver is not supported on this browser,
			code mutations observing has been disabled.
			You may have to call "refreshHard()" by yourself.
		`);
		options.disableMutationObserver = true;
	}

	/**
	 * Set global settings on body, based on options
	 * so CSS can use it
	 */
	document.querySelector('body').setAttribute('data-aos-easing', options.easing);
	document.querySelector('body').setAttribute('data-aos-duration', options.duration);
	document.querySelector('body').setAttribute('data-aos-delay', options.delay);

	/**
	 * Handle initializing
	 */
	if (options.startEvent === 'DOMContentLoaded' &&
		['complete', 'interactive'].indexOf(document.readyState) > -1) {
		// Initialize AOS if default startEvent was already fired
		refresh(true);
	} else if (options.startEvent === 'load') {
		// If start event is 'Load' - attach listener to window
		window.addEventListener(options.startEvent, function () {
			refresh(true);
		});
	} else {
		// Listen to options.startEvent and initialize AOS
		document.addEventListener(options.startEvent, function () {
			refresh(true);
		});
	}

	/**
	 * Refresh plugin on window resize or orientation change
	 */
	window.addEventListener('resize', debounce(refresh, options.debounceDelay, true));
	window.addEventListener('orientationchange', debounce(refresh, options.debounceDelay, true));

	/**
	 * Handle scroll event to animate elements on scroll
	 */
	document.body.addEventListener('scroll', throttle(() => {
		handleScroll($aosElements, options.once);
	}, options.throttleDelay));

	/**
	 * Observe [aos] elements
	 * If something is loaded by AJAX
	 * it'll refresh plugin automatically
	 */
	if (!options.disableMutationObserver) {
		initObserver('[data-aos]', refreshHard);
	}

	initStyle();

	return $aosElements;
};

const aos_easing_map = {
	"linear": "(.250, .250, .750, .750)",
  
	"ease": "(.250, .100, .250, 1)",
	"ease-in": "(.420, 0, 1, 1)",
	"ease-out": "(.000, 0, .580, 1)",
	"ease-in-out": "(.420, 0, .580, 1)",
  
	"ease-in-back": "(.6, -.28, .735, .045)",
	"ease-out-back": "(.175, .885, .32, 1.275)",
	"ease-in-out-back": "(.68, -.55, .265, 1.55)",
  
	"ease-in-sine": "(.47, 0, .745, .715)",
	"ease-out-sine": "(.39, .575, .565, 1)",
	"ease-in-out-sine": "(.445, .05, .55, .95)",
  
	"ease-in-quad": "(.55, .085, .68, .53)",
	"ease-out-quad": "(.25, .46, .45, .94)",
	"ease-in-out-quad": "(.455, .03, .515, .955)",
  
	"ease-in-cubic": "(.55, .085, .68, .53)",
	"ease-out-cubic": "(.25, .46, .45, .94)",
	"ease-in-out-cubic": "(.455, .03, .515, .955)",
  
	"ease-in-quart": "(.55, .085, .68, .53)",
	"ease-out-quart": "(.25, .46, .45, .94)",
	"ease-in-out-quart": "(.455, .03, .515, .955)"
};

function initStyle() {
	var easing = options.easing;
	var delay = options.delay;
	var duration = options.duration;
	var style_text = "";
	style_text += `body[data-aos-easing="${easing}"][data-aos], [data-aos][data-aos][data-aos-easing="${easing}"] { transition-timing-function: cubic-bezier${aos_easing_map[easing]}; }`;
	style_text += `body[data-aos-duration="${duration}"][data-aos], [data-aos][data-aos][data-aos-duration="${duration}"] { transition-duration: ${duration}ms; }`;
    style_text += `body[data-aos-delay="${delay}"][data-aos], [data-aos][data-aos][data-aos-delay="${delay}"] { transition-delay: 0; }`;
    style_text += `body[data-aos-delay="${delay}"][data-aos].aos-animate, [data-aos][data-aos][data-aos-delay="${delay}"].aos-animate { transition-delay: ${delay}ms; }`;
	var style = document.createElement('style');
	style.innerText = style_text;
	document.head.appendChild(style);
}

window.AOS = {
	init,
	refresh,
	refreshHard
};
