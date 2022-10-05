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

