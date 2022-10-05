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