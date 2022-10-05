function style(t,e){return getComputedStyle(t)[e]}function styleInt(t,e){return parseInt(getComputedStyle(t)[e])}function http_get_text(t,e,n){e=e||function(){},n=n||function(){};var o=new XMLHttpRequest;o.open("get",t,!0),o.onload=function(){200==o.status?e(o.responseText):n()},o.onerror=o.abort=o.ontimeout=n,o.send()}function copy(t){if(document.queryCommandSupported&&document.queryCommandSupported("copy")||document.execCommand){var e=document.getElementById("copy-textarea");if(e||((e=document.createElement("textarea")).id="copy-textarea",e.style.position="fixed",e.style.top="1e6px",e.style.opacity="0",e.readOnly=!0,document.body.append(e)),e.value=t,e.select(),e.setSelectionRange(0,t.length),document.execCommand("copy"))return!0}return!1}function isBodyScrollTopAvailable(){if(void 0===document.body.scrollTop)return!1;var t=document.body.scrollTop;return document.body.scrollTop=1,0!=document.body.scrollTop&&(document.body.scrollTop=t,!0)}function isObject(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}function debounce(o,n,t){var r,i,u,c,a,d,l=0,p=!1,f=!1,e=!0;if("function"!=typeof o)throw new TypeError("Expected a function");function m(t){var e=r,n=i;return r=i=void 0,l=t,c=o.apply(n,e)}function s(t){var e=t-d;return void 0===d||n<=e||e<0||f&&u<=t-l}function y(){var t,e=Date.now();if(s(e))return v(e);a=setTimeout(y,(e=n-((t=e)-d),f?Math.min(e,u-(t-l)):e))}function v(t){return a=void 0,e&&r?m(t):(r=i=void 0,c)}function g(){var t=Date.now(),e=s(t);if(r=arguments,i=this,d=t,e){if(void 0===a)return l=e=d,a=setTimeout(y,n),p?m(e):c;if(f)return clearTimeout(a),a=setTimeout(y,n),m(d)}return void 0===a&&(a=setTimeout(y,n)),c}return n=parseInt(n)||0,isObject(t)&&(p=!!t.leading,f="maxWait"in t,u=f?Math.max(parseInt(t.maxWait)||0,n):u,e="trailing"in t?!!t.trailing:e),g.cancel=function(){void 0!==a&&clearTimeout(a),r=d=i=a=void(l=0)},g.flush=function(){return void 0===a?c:v(Date.now())},g}function throttle(t,e,n){var o=!0,r=!0;if("function"!=typeof t)throw new TypeError("Expected a function");return isObject(n)&&(o="leading"in n?!!n.leading:o,r="trailing"in n?!!n.trailing:r),debounce(t,e,{leading:o,trailing:r,maxWait:e})}function html_escape(t){return t.replace(/[<>"&]/g,function(t,e,n){switch(t){case"<":return"&lt;";case">":return"&gt;";case"&":return"&amp;";case'"':return"&quot;"}})}