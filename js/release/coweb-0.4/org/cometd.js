define(function(){typeof dojo!=="undefined"?dojo.provide("org.cometd"):(this.org=this.org||{},org.cometd={}),org.cometd.JSON={},org.cometd.JSON.toJSON=org.cometd.JSON.fromJSON=function(a){throw"Abstract"},org.cometd.Utils={},org.cometd.Utils.isString=function(a){if(a===undefined||a===null)return!1;return typeof a==="string"||a instanceof String},org.cometd.Utils.isArray=function(a){if(a===undefined||a===null)return!1;return a instanceof Array},org.cometd.Utils.inArray=function(a,b){for(var c=0;c<b.length;++c)if(a==b[c])return c;return-1},org.cometd.Utils.setTimeout=function(a,b,c){return setTimeout(function(){try{b()}catch(c){a._debug("Exception invoking timed function",b,c)}},c)},org.cometd.TransportRegistry=function(){var a=[],b={};this.getTransportTypes=function(){return a.slice(0)},this.findTransportTypes=function(c,d,e){var f=[];for(var g=0;g<a.length;++g){var h=a[g];b[h].accept(c,d,e)===!0&&f.push(h)}return f},this.negotiateTransport=function(c,d,e,f){for(var g=0;g<a.length;++g){var h=a[g];for(var i=0;i<c.length;++i)if(h==c[i]){var j=b[h];if(j.accept(d,e,f)===!0)return j}}return null},this.add=function(c,d,e){var f=!1;for(var g=0;g<a.length;++g)if(a[g]==c){f=!0;break}f||(typeof e!=="number"?a.push(c):a.splice(e,0,c),b[c]=d);return!f},this.find=function(c){for(var d=0;d<a.length;++d)if(a[d]==type)return b[type];return null},this.remove=function(c){for(var d=0;d<a.length;++d)if(a[d]==c){a.splice(d,1);var e=b[c];delete b[c];return e}return null},this.reset=function(){for(var c=0;c<a.length;++c)b[a[c]].reset()}},org.cometd.Transport=function(){var a,b;this.registered=function(c,d){a=c,b=d},this.unregistered=function(){a=null,b=null},this._debug=function(){b._debug.apply(b,arguments)},this.getConfiguration=function(){return b.getConfiguration()},this.getAdvice=function(){return b.getAdvice()},this.setTimeout=function(a,c){return org.cometd.Utils.setTimeout(b,a,c)},this.convertToMessages=function(a){if(org.cometd.Utils.isString(a))try{return org.cometd.JSON.fromJSON(a)}catch(b){this._debug("Could not convert to JSON the following string",'"'+a+'"');throw b}if(org.cometd.Utils.isArray(a))return a;if(a===undefined||a===null)return[];if(a instanceof Object)return[a];throw"Conversion Error "+a+", typeof "+typeof a},this.accept=function(a,b,c){throw"Abstract"},this.getType=function(){return a},this.send=function(a,b){throw"Abstract"},this.reset=function(){this._debug("Transport",a,"reset")},this.abort=function(){this._debug("Transport",a,"aborted")},this.toString=function(){return this.getType()}},org.cometd.Transport.derive=function(a){function b(){}b.prototype=a;return new b},org.cometd.RequestTransport=function(){function l(a){if(d!==null)throw"Concurrent metaConnect requests not allowed, request id="+d.id+" not yet completed";var b=++c;this._debug("Transport",this,"metaConnect send",b,a);var e={id:b,metaConnect:!0};h.call(this,a,e),d=e}function k(a,b){var c=org.cometd.Utils.inArray(a,e);c>=0&&e.splice(c,1);if(f.length>0){var d=f.shift(),h=d[0],j=d[1];this._debug("Transport dequeued request",j.id);if(b)this.getConfiguration().autoBatch&&g.call(this,h),i.call(this,h),this._debug("Transport completed request",a.id,h);else{var k=this;this.setTimeout(function(){k.complete(j,!1,j.metaConnect),h.onFailure(j.xhr,"error","Previous request failed")},0)}}}function j(a){var b=a.id;this._debug("Transport",this,"metaConnect complete",b);if(d!==null&&d.id!==b)throw"Longpoll request mismatch, completing request "+b;d=null}function i(a){var b=++c,d={id:b,metaConnect:!1};e.length<this.getConfiguration().maxConnections-1?(this._debug("Transport",this,"sending request",b,a),h.call(this,a,d),e.push(d)):(this._debug("Transport queueing request",b,a),f.push([a,d]))}function h(a,b){this.transportSend(a,b),b.expired=!1;if(!a.sync){var c=this.getConfiguration().maxNetworkDelay,d=c;b.metaConnect===!0&&(d+=this.getAdvice().timeout),this._debug("Transport",this,"waiting at most",d,"ms for the response, maxNetworkDelay =",c);var e=this;b.timeout=this.setTimeout(function(){b.expired=!0,b.xhr&&b.xhr.abort();var c="Request "+b.id+" of transport "+e.getType()+" exceeded "+d+" ms max network delay";e._debug(c),e.complete(b,!1,b.metaConnect),a.onFailure(b.xhr,"timeout",c)},d)}}function g(a){while(f.length>0){var b=f[0],c=b[0],d=b[1];if(c.url===a.url&&c.sync===a.sync){f.shift(),a.messages=a.messages.concat(c.messages),this._debug("Coalesced",c.messages.length,"messages from request",d.id);continue}break}}var a=new org.cometd.Transport,b=org.cometd.Transport.derive(a),c=0,d=null,e=[],f=[];b.complete=function(a,b,c){c?j.call(this,a):k.call(this,a,b)},b.transportSend=function(a,b){throw"Abstract"},b.transportSuccess=function(a,b,c){b.expired||(clearTimeout(b.timeout),this.complete(b,!0,b.metaConnect),c&&c.length>0?a.onSuccess(c):a.onFailure(b,"Empty HTTP response"))},b.transportFailure=function(a,b,c,d){b.expired||(clearTimeout(b.timeout),this.complete(b,!1,b.metaConnect),a.onFailure(b.xhr,c,d))},b.send=function(a,b){b?l.call(this,a):i.call(this,a)},b.abort=function(){a.abort();for(var b=0;b<e.length;++b){var c=e[b];this._debug("Aborting request",c),c.xhr&&c.xhr.abort()}d&&(this._debug("Aborting metaConnect request",d),d.xhr&&d.xhr.abort()),this.reset()},b.reset=function(){a.reset(),d=null,e=[],f=[]};return b},org.cometd.LongPollingTransport=function(){var a=new org.cometd.RequestTransport,b=org.cometd.Transport.derive(a),c=!0;b.accept=function(a,b,d){return c||!b},b.xhrSend=function(a){throw"Abstract"},b.transportSend=function(a,b){var d=this;try{var e=!0;b.xhr=this.xhrSend({transport:this,url:a.url,sync:a.sync,headers:this.getConfiguration().requestHeaders,body:org.cometd.JSON.toJSON(a.messages),onSuccess:function(e){d._debug("Transport",d,"received response",e);var f=!1;try{var g=d.convertToMessages(e);g.length===0?(c=!1,d.transportFailure(a,b,"no response",null)):(f=!0,d.transportSuccess(a,b,g))}catch(h){d._debug(h),f||(c=!1,d.transportFailure(a,b,"bad response",h))}},onError:function(f,g){c=!1,e?d.setTimeout(function(){d.transportFailure(a,b,f,g)},0):d.transportFailure(a,b,f,g)}}),e=!1}catch(f){c=!1,this.setTimeout(function(){d.transportFailure(a,b,"error",f)},0)}},b.reset=function(){a.reset(),c=!0};return b},org.cometd.CallbackPollingTransport=function(){var a=new org.cometd.RequestTransport,b=org.cometd.Transport.derive(a),c=2e3;b.accept=function(a,b,c){return!0},b.jsonpSend=function(a){throw"Abstract"},b.transportSend=function(a,b){var d=org.cometd.JSON.toJSON(a.messages),e=a.url.length+encodeURI(d).length,f=this;if(e>c){var g=a.messages.length>1?"Too many bayeux messages in the same batch resulting in message too big ("+e+" bytes, max is "+c+") for transport "+this.getType():"Bayeux message too big ("+e+" bytes, max is "+c+") for transport "+this.getType();this.setTimeout(function(){f.transportFailure(a,b,"error",g)},0)}else try{var h=!0;this.jsonpSend({transport:this,url:a.url,sync:a.sync,headers:this.getConfiguration().requestHeaders,body:d,onSuccess:function(c){var d=!1;try{var e=f.convertToMessages(c);e.length===0?f.transportFailure(a,b,"no response",null):(d=!0,f.transportSuccess(a,b,e))}catch(g){f._debug(g),d||f.transportFailure(a,b,"bad response",g)}},onError:function(c,d){h?f.setTimeout(function(){f.transportFailure(a,b,c,d)},0):f.transportFailure(a,b,c,d)}}),h=!1}catch(i){this.setTimeout(function(){f.transportFailure(a,b,"error",i)},0)}};return b},org.cometd.WebSocketTransport=function(){function m(a,b){try{var c=org.cometd.JSON.toJSON(a.messages);k.send(c),this._debug("Transport",this,"sent",a,"metaConnect =",b);var d=this.getConfiguration().maxNetworkDelay,e=d;b&&(e+=this.getAdvice().timeout);var f=[];for(var g=0;g<a.messages.length;++g){var h=a.messages[g];if(h.id){f.push(h.id);var l=this;i[h.id]=this.setTimeout(function(){var b="Message "+h.id+" of transport "+l.getType()+" exceeded "+e+" ms max network delay";l._debug(b),delete i[h.id];for(var c in j)if(j[c]===a){delete j[c];break}a.onFailure(k,"timeout",b)},e)}}this._debug("Transport",this,"waiting at most",e," ms for messages",f,"maxNetworkDelay =",d,", timeouts:",org.cometd.JSON.toJSON(i))}catch(m){this.setTimeout(function(){a.onFailure(k,"error",m)},0)}}var a=1,b=2,c=new org.cometd.Transport,d=org.cometd.Transport.derive(c),e,f=!0,g=!1,h=b,i={},j={},k,l;d.registered=function(a,b){c.registered(a,b),e=b},d.accept=function(a,b,c){return f&&!!window.WebSocket&&e.websocketEnabled===!0},d.onMessage=function(b){this._debug("Transport",this,"received websocket message",b);if(h===a){var c=this.convertToMessages(b.data),d=[];for(var e=0;e<c.length;++e){var f=c[e];if(/^\/meta\//.test(f.channel)||f.data===undefined)if(f.id){d.push(f.id);var g=i[f.id];g&&(clearTimeout(g),delete i[f.id],this._debug("Transport",this,"removed timeout for message",f.id,", timeouts:",org.cometd.JSON.toJSON(i)))}"/meta/disconnect"===f.channel&&f.successful&&k.close()}var m=!1;for(var n=0;n<d.length;++n){var o=d[n];for(var p in j){var q=p.split(","),r=org.cometd.Utils.inArray(o,q);if(r>=0){m=!0,q.splice(r,1);var s=j[p];delete j[p],q.length>0&&(j[q.join(",")]=s);break}}}m&&this._debug("Transport",this,"removed envelope, envelopes:",org.cometd.JSON.toJSON(j)),l.call(this,c)}},d.onClose=function(){this._debug("Transport",this,"closed",k),f=g;for(var a in i)clearTimeout(i[a]),delete i[a];for(var c in j)j[c].onFailure(k,"closed"),delete j[c];h=b},d.send=function(b,c){this._debug("Transport",this,"sending",b,"metaConnect =",c);var d=[];for(var e=0;e<b.messages.length;++e){var f=b.messages[e];f.id&&d.push(f.id)}j[d.join(",")]=b,this._debug("Transport",this,"stored envelope, envelopes:",org.cometd.JSON.toJSON(j));if(h===a)m.call(this,b,c);else{var i=b.url.replace(/^http/,"ws");this._debug("Transport",this,"connecting to URL",i),k=new window.WebSocket(i);var n=this;k.onopen=function(){n._debug("WebSocket opened",k),g=!0,h=a,l=b.onSuccess,m.call(n,b,c)},k.onclose=function(){n.onClose()},k.onmessage=function(a){n.onMessage(a)}}},d.reset=function(){c.reset(),k&&k.close(),f=!0,g=!1,h=b,i={},j={},k=null,l=null};return d},org.cometd.Cometd=function(a){function bx(a){var b=m[a[0]];b&&(delete b[a[1]],B("Removed listener",a))}function bw(a,b,c,d){var e=bv(b,c);B("Adding listener on",a,"with scope",e.scope,"and callback",e.method);var f={channel:a,scope:e.scope,callback:e.method,listener:d},g=m[a];g||(g=[],m[a]=g);var h=g.push(f)-1;f.id=h,f.handle=[a,h],B("Added listener",f,"for channel",a,"having id =",h);return f.handle}function bv(a,b){var c={scope:a,method:b};if(x(a))c.scope=undefined,c.method=a;else if(w(b)){if(!a)throw"Invalid scope "+a;c.method=a[b];if(!x(c.method))throw"Invalid callback "+b+" for scope "+a}else if(!x(b))throw"Invalid callback "+b;return c}function bu(a){var b=m[a];if(b)for(var c=0;c<b.length;++c)if(b[c])return!0;return!1}function bt(a){a=I(a);if(a!==undefined&&a!==null){Z(a.advice);var b=a.channel;switch(b){case"/meta/handshake":bb(a);break;case"/meta/connect":be(a);break;case"/meta/disconnect":bi(a);break;case"/meta/subscribe":bl(a);break;case"/meta/unsubscribe":bo(a);break;default:br(a)}}}function bs(a,b){bq({successful:!1,failure:!0,channel:b.channel,request:b,xhr:a,advice:{reconnect:"none",interval:0}})}function br(a){a.successful===undefined?a.data?L(a.channel,a):B("Unknown message",a):a.successful?L("/meta/publish",a):bq(a)}function bq(a){L("/meta/publish",a),L("/meta/unsuccessful",a)}function bp(a,b){bn({successful:!1,failure:!0,channel:"/meta/unsubscribe",request:b,xhr:a,advice:{reconnect:"none",interval:0}})}function bo(a){a.successful?L("/meta/unsubscribe",a):bn(a)}function bn(a){L("/meta/unsubscribe",a),L("/meta/unsuccessful",a)}function bm(a,b){bk({successful:!1,failure:!0,channel:"/meta/subscribe",request:b,xhr:a,advice:{reconnect:"none",interval:0}})}function bl(a){a.successful?L("/meta/subscribe",a):bk(a)}function bk(a){L("/meta/subscribe",a),L("/meta/unsuccessful",a)}function bj(a,b){bh({successful:!1,failure:!0,channel:"/meta/disconnect",request:b,xhr:a,advice:{reconnect:"none",interval:0}})}function bi(a){a.successful?(bg(!1),L("/meta/disconnect",a)):bh(a)}function bh(a){bg(!0),L("/meta/disconnect",a),L("/meta/unsuccessful",a)}function bg(a){M(),a&&f.abort(),i=null,E("disconnected"),j=0,k=[],S()}function bf(a,b){t=!1,bd({successful:!1,failure:!0,channel:"/meta/connect",request:b,xhr:a,advice:{reconnect:"retry",interval:n}})}function be(a){t=a.successful;if(t){L("/meta/connect",a);var b=F()?"none":q.reconnect;switch(b){case"retry":S(),Y();break;case"none":S(),E("disconnected");break;default:throw"Unrecognized advice action "+b}}else bd(a)}function bd(a){L("/meta/connect",a),L("/meta/unsuccessful",a);var b=F()?"none":q.reconnect;switch(b){case"retry":T(),Y();break;case"handshake":S(),_();break;case"none":S(),E("disconnected");break;default:throw"Unrecognized advice action"+b}}function bc(a,b){ba({successful:!1,failure:!0,channel:"/meta/handshake",request:b,xhr:a,advice:{reconnect:"retry",interval:n}})}function bb(a){if(a.successful){i=a.clientId;var b=e.negotiateTransport(a.supportedConnectionTypes,a.version,d,u.url);if(b===null)throw"Could not negotiate transport with server; client "+e.findTransportTypes(a.version,d,u.url)+", server "+a.supportedConnectionTypes;f!=b&&(B("Transport",f,"->",b),f=b),l=!1,V(),a.reestablish=s,s=!0,L("/meta/handshake",a);var c=F()?"none":q.reconnect;switch(c){case"retry":S(),Y();break;case"none":S(),E("disconnected");break;default:throw"Unrecognized advice action "+c}}else ba(a)}function ba(a){L("/meta/handshake",a),L("/meta/unsuccessful",a);var b=!F()&&q.reconnect!="none";b?(T(),_()):(S(),E("disconnected"))}function _(){E("handshaking"),l=!0,N(function(){$(r)})}function $(a){i=null,D(),F()&&e.reset(),F()?Z(u.advice):Z(v(!1,q,{reconnect:"retry"})),j=0,l=!0,r=a;var b="1.0",c=e.findTransportTypes(b,d,u.url),g={version:b,minimumVersion:"0.9",channel:"/meta/handshake",supportedConnectionTypes:c,advice:{timeout:q.timeout,interval:q.interval}},h=v(!1,{},r,g);f=e.negotiateTransport(c,b,d,u.url),B("Initial transport is",f.getType(),f),E("handshaking"),B("Handshake sent",h),Q(!1,[h],!1,"handshake")}function Z(a){a&&(q=v(!1,{},u.advice,a),B("New advice",q,org.cometd.JSON.toJSON(q)))}function Y(){E("connecting"),N(function(){X()})}function X(){if(!F()){var a={channel:"/meta/connect",connectionType:f.getType()};t||(a.advice={timeout:0}),E("connecting"),B("Connect sent",a,org.cometd.JSON.toJSON(a)),Q(!1,[a],!0,"connect"),E("connected")}}function W(){--j;if(j<0)throw"Calls to startBatch() and endBatch() are not paired";j===0&&!F()&&!l&&V()}function V(){var a=k;k=[],a.length>0&&Q(!1,a,!1)}function U(){++j}function T(){n<u.maxBackoff&&(n+=u.backoffIncrement)}function S(){n=0}function R(a){j>0||l===!0?k.push(a):Q(!1,[a],!1)}function Q(a,c,d,e){for(var g=0;g<c.length;++g){var h=c[g];h.id=""+G(),i&&(h.clientId=i),h=J(h),h!==undefined&&h!==null?c[g]=h:c.splice(g--,1)}if(c.length!==0){var j=u.url;u.appendMessageTypeToURL&&(j.match(/\/$/)||(j=j+"/"),e&&(j=j+e));var k={url:j,sync:a,messages:c,onSuccess:function(a){try{O.call(b,a)}catch(c){B("Exception during handling of messages",c)}},onFailure:function(a,d,e){try{P.call(b,a,c,d,e)}catch(f){B("Exception during handling of failure",f)}}};B("Send, sync =",a,k),f.send(k,d)}}function N(a){M();var c=q.interval+n;B("Function scheduled in",c,"ms, interval =",q.interval,"backoff =",n,a),o=org.cometd.Utils.setTimeout(b,a,c)}function M(){o!==null&&clearTimeout(o),o=null}function L(a,b){K(a,b);var c=a.split("/"),d=c.length-1;for(var e=d;e>0;--e){var f=c.slice(0,e).join("/")+"/*";e==d&&K(f,b),f+="*",K(f,b)}}function K(a,c){var d=m[a];if(d&&d.length>0)for(var e=0;e<d.length;++e){var f=d[e];if(f)try{f.callback.call(f.scope,c)}catch(g){B("Exception during notification",f,c,g);var h=b.onListenerException;if(x(h)){B("Invoking listener exception callback",f,g);try{h.call(b,g,f.handle,f.listener,c)}catch(i){A("Exception during execution of listener callback",f,i)}}}}}function J(a){for(var b=0;b<p.length;++b){if(a===undefined||a===null)break;var c=p[b],d=c.extension.outgoing;if(x(d)){var e=H(c.extension,d,c.name,a,!0);a=e===undefined?a:e}}return a}function I(a){for(var b=0;b<p.length;++b){if(a===undefined||a===null)break;var c=u.reverseIncomingExtensions?p.length-1-b:b,d=p[c],e=d.extension.incoming;if(x(e)){var f=H(d.extension,e,d.name,a,!1);a=f===undefined?a:f}}return a}function H(a,c,d,e,f){try{return c.call(a,e)}catch(g){B("Exception during execution of extension",d,g);var h=b.onExtensionException;if(x(h)){B("Invoking extension exception callback",d,g);try{h.call(b,g,d,f,e)}catch(i){A("Exception during execution of exception callback in extension",d,i)}}return e}}function G(){return++h}function F(){return g=="disconnecting"||g=="disconnected"}function E(a){g!=a&&(B("Status",g,"->",a),g=a)}function D(){for(var a in m){var b=m[a];for(var c=0;c<b.length;++c){var d=b[c];d&&!d.listener&&(delete b[c],B("Removed subscription",d,"for channel",a))}}}function C(a){B("Configuring cometd object with",a),w(a)&&(a={url:a}),a||(a={}),u=v(!1,u,a);if(!u.url)throw"Missing required configuration parameter 'url' specifying the Bayeux server URL";var b=/(^https?:)?(\/\/(([^:\/\?#]+)(:(\d+))?))?([^\?#]*)(.*)?/.exec(u.url);d=b[3]&&b[3]!=window.location.host;if(u.appendMessageTypeToURL)if(b[8]!==undefined&&b[8].length>0)A("Appending message type to URI "+b[7]+b[8]+" is not supported, disabling 'appendMessageTypeToURL' configuration"),u.appendMessageTypeToURL=!1;else{var c=b[7].split("/"),e=c.length-1;b[7].match(/\/$/)&&(e-=1),c[e].indexOf(".")>=0&&(A("Appending message type to URI "+b[7]+" is not supported, disabling 'appendMessageTypeToURL' configuration"),u.appendMessageTypeToURL=!1)}}function B(){u.logLevel=="debug"&&y("debug",arguments)}function A(){u.logLevel!="warn"&&y("info",arguments)}function z(){y("warn",arguments)}function y(a,b){if(window.console){var c=window.console[a];x(c)&&c.apply(window.console,b)}}function x(a){if(a===undefined||a===null)return!1;return typeof a==="function"}function w(a){return org.cometd.Utils.isString(a)}function v(a,b,c){var d=b||{};for(var e=2;e<arguments.length;++e){var f=arguments[e];if(f===undefined||f===null)continue;for(var g in f){var h=f[g];if(h===b)continue;if(h===undefined)continue;a&&typeof h==="object"&&h!==null?h instanceof Array?d[g]=v(a,[],h):d[g]=v(a,{},h):d[g]=h}}return d}var b=this,c=a||"default",d=!1,e=new org.cometd.TransportRegistry,f,g="disconnected",h=0,i=null,j=0,k=[],l=!1,m={},n=0,o=null,p=[],q={},r,s=!1,t=!1,u={maxConnections:2,backoffIncrement:1e3,maxBackoff:6e4,logLevel:"info",reverseIncomingExtensions:!0,maxNetworkDelay:1e4,requestHeaders:{},appendMessageTypeToURL:!0,autoBatch:!1,advice:{timeout:6e4,interval:0,reconnect:"retry"}};this._mixin=v,this._warn=z,this._info=A,this._debug=B;var O,P;this.send=R,this.receive=bt,O=function O(a){B("Received",a,org.cometd.JSON.toJSON(a));for(var b=0;b<a.length;++b){var c=a[b];bt(c)}},P=function P(a,b,c,d){B("handleFailure",a,b,c,d);for(var e=0;e<b.length;++e){var f=b[e],g=f.channel;switch(g){case"/meta/handshake":bc(a,f);break;case"/meta/connect":bf(a,f);break;case"/meta/disconnect":bj(a,f);break;case"/meta/subscribe":bm(a,f);break;case"/meta/unsubscribe":bp(a,f);break;default:bs(a,f)}}},this.registerTransport=function(a,b,c){var d=e.add(a,b,c);d&&(B("Registered transport",a),x(b.registered)&&b.registered(a,this));return d},this.getTransportTypes=function(){return e.getTransportTypes()},this.unregisterTransport=function(a){var b=e.remove(a);b!==null&&(B("Unregistered transport",a),x(b.unregistered)&&b.unregistered());return b},this.findTransport=function(a){return e.find(a)},this.configure=function(a){C.call(this,a)},this.init=function(a,b){this.configure(a),this.handshake(b)},this.handshake=function(a){E("disconnected"),s=!1,$(a)},this.disconnect=function(a,b){if(!F()){b===undefined&&(typeof a!=="boolean"&&(b=a,a=!1));var c={channel:"/meta/disconnect"},d=v(!1,{},b,c);E("disconnecting"),Q(a===!0,[d],!1,"disconnect")}},this.startBatch=function(){U()},this.endBatch=function(){W()},this.batch=function(a,b){var c=bv(a,b);this.startBatch();try{c.method.call(c.scope),this.endBatch()}catch(d){B("Exception during execution of batch",d),this.endBatch();throw d}},this.addListener=function(a,b,c){if(arguments.length<2)throw"Illegal arguments number: required 2, got "+arguments.length;if(!w(a))throw"Illegal argument type: channel must be a string";return bw(a,b,c,!0)},this.removeListener=function(a){if(!org.cometd.Utils.isArray(a))throw"Invalid argument: expected subscription, not "+a;bx(a)},this.clearListeners=function(){m={}},this.subscribe=function(a,b,c,d){if(arguments.length<2)throw"Illegal arguments number: required 2, got "+arguments.length;if(!w(a))throw"Illegal argument type: channel must be a string";if(F())throw"Illegal state: already disconnected";x(b)&&(d=c,c=b,b=undefined);var e=!bu(a),f=bw(a,b,c,!1);if(e){var g={channel:"/meta/subscribe",subscription:a},h=v(!1,{},d,g);R(h)}return f},this.unsubscribe=function(a,b){if(arguments.length<1)throw"Illegal arguments number: required 1, got "+arguments.length;if(F())throw"Illegal state: already disconnected";this.removeListener(a);var c=a[0];if(!bu(c)){var d={channel:"/meta/unsubscribe",subscription:c},e=v(!1,{},b,d);R(e)}},this.clearSubscriptions=function(){D()},this.publish=function(a,b,c){if(arguments.length<1)throw"Illegal arguments number: required 1, got "+arguments.length;if(!w(a))throw"Illegal argument type: channel must be a string";if(F())throw"Illegal state: already disconnected";var d={channel:a,data:b},e=v(!1,{},c,d);R(e)},this.getStatus=function(){return g},this.isDisconnected=F,this.setBackoffIncrement=function(a){u.backoffIncrement=a},this.getBackoffIncrement=function(){return u.backoffIncrement},this.getBackoffPeriod=function(){return n},this.setLogLevel=function(a){u.logLevel=a},this.registerExtension=function(a,b){if(arguments.length<2)throw"Illegal arguments number: required 2, got "+arguments.length;if(!w(a))throw"Illegal argument type: extension name must be a string";var c=!1;for(var d=0;d<p.length;++d){var e=p[d];if(e.name==a){c=!0;break}}if(c){A("Could not register extension with name",a,"since another extension with the same name already exists");return!1}p.push({name:a,extension:b}),B("Registered extension",a),x(b.registered)&&b.registered(a,this);return!0},this.unregisterExtension=function(a){if(!w(a))throw"Illegal argument type: extension name must be a string";var b=!1;for(var c=0;c<p.length;++c){var d=p[c];if(d.name==a){p.splice(c,1),b=!0,B("Unregistered extension",a);var e=d.extension;x(e.unregistered)&&e.unregistered();break}}return b},this.getExtension=function(a){for(var b=0;b<p.length;++b){var c=p[b];if(c.name==a)return c.extension}return null},this.getName=function(){return c},this.getClientId=function(){return i},this.getURL=function(){return u.url},this.getTransport=function(){return f},this.getConfiguration=function(){return v(!0,{},u)},this.getAdvice=function(){return v(!0,{},q)}},typeof dojo!="undefined"&&dojo.provide("org.cometd.AckExtension"),org.cometd.AckExtension=function(){function d(b,c){a._debug(b,c)}var a,b=!1,c=-1;this.registered=function(b,c){a=c,d("AckExtension: executing registration callback")},this.unregistered=function(){d("AckExtension: executing unregistration callback"),a=null},this.incoming=function(a){var e=a.channel;if(e=="/meta/handshake")b=a.ext&&a.ext.ack,d("AckExtension: server supports acks",b);else if(b&&e=="/meta/connect"&&a.successful){var f=a.ext;f&&typeof f.ack==="number"&&(c=f.ack,d("AckExtension: server sent ack id",c))}return a},this.outgoing=function(e){var f=e.channel;f=="/meta/handshake"?(e.ext||(e.ext={}),e.ext.ack=a&&a.ackEnabled!==!1,c=-1):b&&f=="/meta/connect"&&(e.ext||(e.ext={}),e.ext.ack=c,d("AckExtension: client sending ack id",c));return e}};return org.cometd})