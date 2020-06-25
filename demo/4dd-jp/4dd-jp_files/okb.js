/*

 last update : 2012/08/16

*/




var _ctrl;

var okb = okb || {};



var trace = function(a) {
	try {
		console.log(a);
	} catch(e) {}
};



if(!Array.indexOf){
	Array.prototype.indexOf = function(object){
		for(var i = 0; i < this.length; i++){
			if(this[i] == object){return i;break;}
		}
		return -1;
	};
}





okb.EventDispatcher = Class.extend({

	__construct:function(){
		var me = this;
		me.listeners = {};
	},

	destroy:function(){
		var me = this;
		delete me.listeners;
	},

	bind:function(type, callback, args) {
		var me = this;
		if(!me.listeners[type]) me.listeners[type] = [];
		me.listeners[type].push({callback:callback, args:args});
	},
	unbind:function(type, callback) {
		var me = this;
		if(!me.listeners[type]) return;
		var i,len = me.listeners[type].length;
		var newArray = [];
		for(i=0; i<len; i++) {
			var listener = me.listeners[type][i];
			if(listener.callback == callback) {
			} else {
				newArray.push(listener);
			}
		}
		this.listeners[type] = newArray;
	},
	trigger:function(type, args) {
		var me = this;
		var i,len;
		var event = {
			type:type,
			target:me
		};
		args = args || [];
		args = [event].concat(args);
		if(!me.listeners[type]) return;
		len = me.listeners[type].length;
		for(i=0; i<len; i++) {
			var listener = this.listeners[type][i];
			if(listener && listener.callback) {
				listener.args = args.concat(listener.args);
				listener.callback.apply(null, listener.args);
			}
		}
	}
});



okb.Ctrl = okb.EventDispatcher.extend({

	EV_DOMREADY:"evDomReady",
	EV_WINDOW_LOADED:"evWindowLoaded",
	EV_RESIZE:"evResize",
	EV_SCROLL:"evScroll",
	EV_HASHCHANGE:"evHashChanged",

	__construct:function(){
		this.__super.__construct.apply(this, arguments)
		var me = this;


		//ユーザーエージェントを取得
		var ua = navigator.userAgent;
		if(ua.indexOf("iPhone")>=0 ||
			ua.indexOf("iPad")>=0 ||
			ua.indexOf("iPod")>=0 ||
			ua.indexOf("Android")>=0 ||
			ua.indexOf("BlackBerry")>=0 ||
			ua.indexOf("IEMobile")>=0) {
			me.sp = true;
		}
		me.touchDevice = (document.ontouchstart !== undefined);
		if(ua.indexOf("Safari")>=0) me.safari = true;
		if(ua.indexOf("Chrome")>=0) me.chrome = true;
		if(ua.indexOf("Firefox")>=0) me.ff = true;
		if(ua.indexOf("Opera")>=0) me.opera = true;
		if(ua.indexOf("MSIE")>=0) me.ie = true;
		if(ua.indexOf("MSIE 6")>=0) me.ie6 = true;
		if(ua.indexOf("MSIE 7")>=0) me.ie7 = true;
		if(ua.indexOf("MSIE 8")>=0) me.ie8 = true;
		if(ua.indexOf("MSIE 9")>=0) me.ie9 = true;
		if(ua.indexOf("iPhone")>=0) me.iPhone = true;
		if(ua.indexOf("iPhone OS 4")) me.iPhone4 = true;
		if(ua.indexOf("iPhone OS 5")) me.iPhone5 = true;
		if(ua.indexOf("iPhone OS 6")) me.iPhone6 = true;
		if(ua.indexOf("iPad")>=0) me.iPad = true;
		if(ua.indexOf("Android")>=0) me.android = true;
		if(me.ie6 || me.ie7 || me.ie8) me.ie678 = true;
		if(me.ie6 || me.touchDevice) me.noFixed = true;
		if(me.iPhone5 || me.iPhone6) me.noFixed = false;
		if(me.iPhone && me.iPad && (ua.indexOf("OS 5")>=0 || ua.indexOf("OS 6")>=0)) {
			me.ios5 = true;
			me.noFixed = false;
		}

	},

	domReady:function(){
		var me = this;

		//cast
		me.window = window;
		me.document = document;
		me.location = location;
		me.$window = $(window);
		me.$document = $(document);
//		me.$html_body = $($.browser.opera ? document.compatMode == 'BackCompat' ? 'body' : 'html' :'html,body');
		me.$html_body = $("html,body");
		me.$body = $("body");
		me.$html = $("html");


		//htmlにクラスを追加
		if (me.ie) me.$html.addClass("ie")
		if (!me.ie) me.$html.addClass("notIE")
		if (me.ie678) me.$html.addClass("ie678")
		if (!me.chrome) me.$html.addClass("notChrome")
		if (me.noFixed) me.$html.addClass("noFixed")
		if (me.ff) me.$html.addClass("ff")

		if(_ctrl.touchDevice) $('html').addClass('touchDevice');
		else $('html').addClass('notTouchDevice');


		//スクロールイベント
		me.scrollTop = 0;
		me.scrolled = function (e) {
			me.preScrollTop = me.scrollTop;
			me.scrollTop = me.$window.scrollTop();
			me._getSize();
			me.trigger(me.EV_SCROLL);
		}
		me.$window.bind("scroll", me.scrolled);


		//ブラウザのリサイズイベント
		me.innerWidth = 0;
		me.innerHeight = 0;
		me._getSize = function(){
			me.windowW = me.$window.width();
			me.windowH = me.$window.height();
			me.bodyW = me.$body.width();
			me.bodyH = me.$body.height();
			me.scrollW = document.documentElement.scrollWidth || document.body.scrollWidth;
			me.scrollH = document.documentElement.scrollHeight || document.body.scrollHeight;
			me.clientW = document.documentElement.clientWidth || document.body.clientWidth;
			me.clientH = document.documentElement.clientHeight || document.body.clientHeight;
			var innerWidth = window.innerWidth || me.windowW;
			var innerHeight = window.innerHeight || me.windowH;
			me.stageW = Math.max(me.clientW, me.scrollW);
			me.stageH = Math.max(me.clientH, me.scrollH);

			//スマホではヘッダーもinnerHeightに含まれちゃうので、innerHeightを変動させないように
			me.pre_ration = me.ratio;
			me.ratio = innerWidth/innerHeight;
			var changeRotate = ( me.pre_ration<1&&me.ratio>1 || me.pre_ration>1&&me.ratio<1 );
			if(changeRotate) {
				me.innerWidth = 0;
				me.innerHeight = 0;
			}
			if(me.touchDevice) {
				me.innerWidth = Math.max( me.innerWidth, innerWidth );
				me.innerHeight = Math.max( me.innerHeight, innerHeight );
			} else {
				me.innerWidth = innerWidth;
				me.innerHeight = innerHeight;
			}
		}
		me.resized = function (e) {
			me._getSize();
			me.trigger(me.EV_RESIZE);

			me.scrolled(null);
		}
		me.$window.bind("resize", me.resized);
		me.$window.trigger("resize");

		//ドキュメント要素のサイズ変更を検出（ブラウザサイズの変更でなく）
		me.preScrollW = 0;
		me.preScrollH = 0;
		me.resizeWatch = function(){
			var scrollW = document.documentElement.scrollWidth || document.body.scrollWidth;
			var scrollH = document.documentElement.scrollHeight || document.body.scrollHeight;
			if(scrollW != me.preScrollW || scrollH != me.preScrollH) {
				me.resized(null)
			}
			me.preScrollW = scrollW;
			me.preScrollH = scrollH;
			setTimeout(me.resizeWatch, 500)
		}
		me.resizeWatch();



		//ハッシュの変更イベント
		me.hashChanged = function(e){
			var hash = me.location.hash || "";
			if(hash.indexOf("#/")>=0) hash = hash.substr(2);
			if(hash.indexOf("#")>=0) hash = hash.substr(1);
			me.hash = hash;

			//shadowbox
			if(me.shadowboxEnabledDeepLink) me._switchShadowbox();

			me.trigger(me.EV_HASHCHANGE);
		}
		me.$window.hashchange(me.hashChanged)
		me.hashChanged(null);


		//
		me.trigger(me.EV_DOMREADY);
	},
	windowLoaded:function(){
		var me = this;

		//ステージサイズの再取得
		me.resized(null);

		//
		me.trigger(me.EV_WINDOW_LOADED);
	},

	/*
	locationの変更
	 */
	changeLoc:function(href){
		var me = this;
		me.location.href = href;
	},
	replaceLoc:function(href){
		var me = this;
		me.location.replace(href);
	},



	/*
	クッキー操作 getter/setter
	 */
	cookie: function(cookieName, value, expires){
		var me = this;
		if(value===undefined || value===null)  return $.cookie(cookieName);
		if(expires===undefined) expires = 14;
		var option = { expires: expires, path: '/' };
		if(expires==0 || expires==null) delete option["expires"];
		$.cookie(cookieName, value, option);
	},


	/*
	shadowboxの初期化
	 */
	setUpShadowbox:function(){
		var me = this;
		me.shadowboxReady = true;

		me.shadowbox = new okb.ui.Shadowbox();
		$("a.okb-shadowbox").each(function(index){
			var $btn = $(this);
			var href = $btn.attr("href");
			var rel = $btn.attr("rel");
			$btn.click(function(e){
				e.preventDefault();
				if(href.substr(0,1)=="#") me.changeLoc(href);
				else _ctrl.shadowbox.open( href, rel );
			})
		})
	},
	/*
	hashIdxを渡すとディープリンクが有効化される
	@hashIdx => {href:"URL", rel:"オプション"}
	 */
	enableShadowBoxDeepLink:function(hashIdx) {
		var me = this;

		me.shadowboxEnabledDeepLink = true;
		me.shadowboxHashIdx = hashIdx;

		me.shadowbox.bind(me.shadowbox.EV_CLOSE, function(){
			me.changeLoc("#/");
		})

		setTimeout(function(){
			me._switchShadowbox();
		}, 0)
	},
	updateShadowBoxDeepLink:function(hashIdx) {
		var me = this;
		me.shadowboxHashIdx = hashIdx;
	},
	_switchShadowbox:function(){
		var me = this;
		var hash = me.hash;
		if(hash.substr(-1)=="/") hash = hash.substr(0, hash.length-1);//最後がスラッシュでもOKなように
		var obj = me.shadowboxHashIdx[hash];
		//close
		if(!obj) {
			me.shadowbox.close();
		}
		//open
		else {
			me.shadowbox.open(obj.href, obj.rel)
		}
	}

});





okb.Comm = Class.extend({

	__construct:function(){
		var me = this;
	},

	load:function(apiObj, postData, successFunc, errorFunc) {
		var me = this;

		//cencel
		if(me._$currentXHR) me.cancel();


		//送るデータを整形
		if(!postData || postData == "") postData = {};
		if(typeof postData == "string") {
			var str = postData;
			postData = {};
			var strArr = str.split("&");
			var i, len = strArr.length;
			for(i=0; i<len; i++) {
				var combiArr = strArr[i].split("=");
				postData[combiArr[0]] = combiArr[1];
			}
		}


		//load
		me._$currentXHR = $.ajax({
			type: apiObj.method,
			dataType: "text",
			cache: false,
			url: apiObj.path,
			data: postData,
			success:function(data) {
				try {
					me.data = $.evalJSON(data);
				} catch(e) {
					trace("api parse error ::: "+apiObj.path)
					trace(e)
					trace("data:"+data)
					me.data = {};
					if(errorFunc) errorFunc();
					return;
				}
				if(successFunc) successFunc();
			},
			error:function(XMLHttpRequest, textStatus, errorThrown) {
				if(errorFunc) errorFunc();
			}
		});

	},

	cancel:function() {
		var me = this;
		if(me._$currentXHR) {
			me._$currentXHR.abort();
			me._$currentXHR = null;
			me.data = null;
		}
	}
});





_ctrl = new okb.Ctrl();
$(function(){
	_ctrl.domReady();
})
$(window).load(function(){
	_ctrl.windowLoaded();
})

okb.command = {};





/* ------------------------------------------------------------------------------------------
 Stack
 コマンドを管理、順番に処理していく
 ------------------------------------------------------------------------------------------ */


okb.command.Stack = okb.EventDispatcher.extend({

	EV_STACK_COMPLETE:"evStackComplete",

	__construct:function(){
		this.__super.__construct.apply(this, arguments)
		var me = this;

		me.commandThread = [];

		me.onProgress = false;

		me.currentCommandSet = [];
		me.processingAmount = 0;


		me._collection = function(e){
			if(e && e.target) e.target.unbind(e.type, me._collection);
			if (--me.processingAmount == 0) {
				me.currentCommandSet.splice(0, me.currentCommandSet.length);
				me._process();
			}
		}
	},

	push:function(){
		var me = this;
		var i,len = arguments.length;
		for(i=0; i<len; i++){
			if(arguments[i].length>0) me.commandThread.push( arguments[i] )
			else me.commandThread.push( [ arguments[i] ] )
		}
	},

	run:function(){
		var me = this;
		if(me.onProgress) return false;
		me.onProgress = true;
		me._process();
	},

	_process:function(){
		var me = this;
		if(me.commandThread.length>0) {
			me.currentCommandSet = me.commandThread.shift();
			me.processingAmount = me.currentCommandSet.length;
			var i,len = me.processingAmount;
			for(i=0; i<len; i++){
				me.currentCommandSet[i].bind( me.currentCommandSet[i].EV_COMPLETE, me._collection )
				me.currentCommandSet[i].extcute();
			}
		} else {
			me.onProgress = false;
			me.trigger(me.EV_STACK_COMPLETE)
		}
	},


	stop:function(){
		var me = this;
		me._stop();
	},
	clear:function(){
		var me = this;
		me.stop();
		me.commandThread.splice(0, me.commandThread.length);
	},


	_stop:function(){
		var me = this;
		if(me.onProgress) {
			while (me.currentCommandSet.length > 0) {
				me.currentCommandSet[0].cancel();
				me.currentCommandSet[0].unbind(me.currentCommandSet[0].EV_COMPLETE, me._collection);
				me.currentCommandSet.shift();
			}
		}
		me.onProgress = false;
	}


});







/* ------------------------------------------------------------------------------------------
 Command
 基本コマンド
 ------------------------------------------------------------------------------------------ */


okb.command.Command = okb.EventDispatcher.extend({

	EV_COMPLETE:"evComplete",

	__construct:function(target, method, args){
		this.__super.__construct.apply(this, arguments)
		var me = this;

		me.target = target || me;
		me.method = method;
		me.args = args || [];
	},

	extcute:function(){
		var me = this;
		me.method.apply(me.target, me.args);
		me.dispatchComplete();
	},

	cancel:function(){
		var me = this;
	},

	dispatchComplete:function(e){
		var me = this;
		if(e && e.target) e.target.unbind(e.type, me.dispatchComplete);
		me.trigger(me.EV_COMPLETE);

		me.target = null;
		me.method = null;
		me.args = null;
	}

});





/* ------------------------------------------------------------------------------------------
 WaiCommand
 指定秒数待つコマンド
 ------------------------------------------------------------------------------------------ */


okb.command.WaiCommand = okb.command.Command.extend({

	__construct:function(sec){
		this.__super.__construct.apply(this, arguments)
		var me = this;

		me.sec = sec;
	},

	extcute:function(){
		var me = this;
		me.delayID = setTimeout(function(){
			me.dispatchComplete()
		}, me.sec*1000)
	},

	cancel:function(){
		var me = this;
		if(me.delayID) clearTimeout(me.delayID);
	}

});







/* ------------------------------------------------------------------------------------------
 AsyncCommand
 非同期処理を行うコマンド
 ------------------------------------------------------------------------------------------ */


okb.command.AsyncCommand = okb.command.Command.extend({

	EV_COMPLETE:"evComplete",

	__construct:function(target, method, args, completeEventDispatcher, completeEvent){
		this.__super.__construct.apply(this, arguments)
		var me = this;

		me.completeEventDispatcher = completeEventDispatcher || me;
		me.completeEvent = completeEvent || me.EV_COMPLETE;
	},

	extcute:function(){
		var me = this;
		me.completeEventDispatcher.bind(me.completeEvent, me.dispatchComplete)
		me.method.apply(me.target, me.args);
	},

	cancel:function(){
		var me = this;
		me.completeEventDispatcher.unbind(me.completeEvent, me.dispatchComplete)
	}

});





/*


＊使用例

 var me = {};
 var stack = new okb.command.Stack();
 stack.push(
 new okb.command.AsyncCommand(null, function(){
 var com = this;
 trace("first command!")
 setTimeout(function(){
 com.trigger(com.EV_COMPLETE)
 }, 1000)
 }),
 new okb.command.Command(null, function(){
 trace("second command!")
 }),
 [
 new okb.command.WaiCommand(1),
 new okb.command.WaiCommand(5)
 ],
 new okb.command.Command(me, function(){
 trace("third command!")
 })
 );
 stack.run();




	*/

okb.ui = {};


okb.ui.Cast = okb.EventDispatcher.extend({
	__construct: function ($me, option) {
		this.__super.__construct.apply(this, arguments)
		var me = this;
		me.$ = $me;
		me.$opa = $(".opa", me.$);
		me.$opa = (me.$opa.size() > 0) ? me.$opa : me.$;

		me.option = option || {};
		me.defaultDisplay = me.option.defaultDisplay || "block";
		me.useVisibility = me.option.useVisibility || false;

		me.isCastShow = true;
		me.isCastDisplay = true;
	},

	destroy: function () {
		this.__super.__construct.destroy(this, arguments)
		var me = this;
		me.$.unbind().remove();
		delete me.$opa;
		delete me.$;
	},

	castShow: function (duration, delay, callback) {
		var me = this;

		if (me.isCastShow) return;
		me.isCastShow = true;

		if (!duration && duration != 0) duration = 0;
		if (!delay && delay != 0) delay = 0;

		if (me.delayID) clearTimeout(me.delayID);
		if (delay == 0) me._castShow(duration, callback);
		else {
			me.delayID = setTimeout(function () {
				me._castShow(duration, callback);
			}, delay);
		}
	},
	_castShow: function (duration, callback) {
		var me = this;
		me.isCastDisplay = true;
		if (me.useVisibility) me.$.css("visibility", "visible");
		else me.$.css("display", me.defaultDisplay);
		me.$opa.stop().animate({"opacity": 1}, duration, "easeInOutQuad");
		if (duration == 0) me._castShowComp(callback);
		else {
			me.delayID = setTimeout(function () {
				me._castShowComp(callback);
			}, duration + 1);
		}
	},
	_castShowComp: function (callback) {
		var me = this;
		me.$opa.stop().css("opacity", 1).css("filter", "none");
		me.delayID = setTimeout(function () {
			me.$opa.stop().css("opacity", 1).css("filter", "none");
		}, 10);
		if (callback) callback();
	},

	castHide: function (duration, delay, callback) {
		var me = this;

		if (!me.isCastShow) return;
		me.isCastShow = false;

		if (!duration && duration != 0) duration = 0;
		if (!delay && delay != 0) delay = 0;

		if (me.delayID) clearTimeout(me.delayID);
		if (delay == 0) me._castHide(duration, callback);
		else {
			me.delayID = setTimeout(function () {
				me._castHide(duration, callback);
			}, delay);
		}
	},
	_castHide: function (duration, callback) {
		var me = this;

		me.$opa.stop().animate({"opacity": 0}, duration, "easeInOutQuad");
		if (duration == 0) me._castHideComp(callback);
		else {
			me.delayID = setTimeout(function () {
				me._castHideComp(callback);
			}, duration + 1);
		}
	},
	_castHideComp: function (callback) {
		var me = this;
		me.isCastDisplay = false;
		if (me.useVisibility) me.$.css("visibility", "hidden");
		else me.$.css("display", "none");
		if (callback) callback();
	}
});


okb.ui.Btn = okb.ui.Cast.extend({
	__construct:function($me, option){
		this.__super.__construct.apply(this, arguments);
		var me = this;

		me.option = option || {};
		me.toggle = me.option.toggle;
		me.noHover = me.option.noHover;
		me.dontPreventClick = me.option.dontPreventClick || false;

		me.isSelect = false;

		if(!_ctrl.touchDevice && !me.noHover && !_ctrl.ie6) {
			me.$.mouseover(function(e){
				if(me.isSelect && !me.toggle) return;
				me._over();
			})
			me.$.mouseout(function(e){
				if(me.isSelect && !me.toggle) return;
				me._out();
			})
		}
	},

	setClickFunc:function(func, scp, args){
		var me = this;
		args = args || [];
		me.$.click(function(e){
			if(me.isSelect && !me.toggle && !me.dontPreventClick) return false;
			func.apply(scp, args);
			if(!me.dontPreventClick) return false;
		})
	},

	selection:function(isSelect){
		var me = this;
		if(isSelect===undefined) return me.isSelect;
		if(me.isSelect == isSelect) return;
		if(isSelect) me._select();
		me.isSelect = isSelect;
		if(!isSelect) me._unselect();
	},

	_select:function(){
		var me = this;
		me._over();
	},
	_unselect:function(){
		var me = this;
		me._out();
	},

	_over:function(){
		var me = this;
	},
	_out:function(){
		var me = this;
	}
});


okb.ui.AlphaBtn = okb.ui.Btn.extend({
	__construct:function($me, option){
		this.__super.__construct.apply(this, arguments);
		var me = this;
		me.option = option || {};
		me.ta = me.option.ta || 0.5;
		me.inTime = me.option.inTime || 200;
		me.outTime = me.option.outTime || 300;
	},
	_over:function(){
		var me = this;
		if(_ctrl.ie678) return;
		me.$.stop().fadeTo(me.inTime, me.ta);
	},
	_out:function(){
		var me = this;
		if(_ctrl.ie678) return;
		me.$.stop().fadeTo(me.outTime, 1);
	}
});


okb.ui.ColorBtn = okb.ui.Btn.extend({
	__construct:function($me, option){
		this.__super.__construct.apply(this, arguments);
		var me = this;
		me.option = option || {};
		me.dfClr = me.option.dfClr;
		me.ovClr = me.option.ovClr;
		me.$.css(me.dfClr);
	},
	_over:function(){
		var me = this;
		me.$.stop().animate(me.ovClr, "200", "easeOutQuad");
	},
	_out:function(){
		var me = this;
		me.$.stop().animate(me.dfClr, "200", "easeOutQuad");
	}
});


okb.ui.ImgBtn = okb.ui.Btn.extend({
	__construct:function($me, option){
		this.__super.__construct.apply(this, arguments);
		var me = this;

		me.option = option || {};
		me.hasAc = me.option.hasAc;
		me.toggle = me.option.toggle;
		me.dontPreventClick = me.option.dontPreventClick;
		me.dontPreventOver = me.option.dontPreventOver;
		me.isRev = me.option.isRev;
		me.bothOv = me.option.bothOv;

		me.$ = $me;
		me.$ov = $(".ov", me.$);
		me.$target = me.$ov.size()>0? me.$ov: me.$;
		me.$img = $("img", me.$target);

		if(!me.$.hasClass("imgBtn")) me.$.addClass("imgBtn_added");

		if(me.$img.size()==0) return;

		me.$.data("enhanced", me);
		me.$[0].imgBtn = me;

		var imgSrc = me.$img.attr("src");
		me.imgSrcDf = imgSrc;
		me.imgSrcOv = imgSrc.substr(0, imgSrc.length-4) + "-ov" + imgSrc.substr(imgSrc.length-4);
		me.imgSrcAc = imgSrc.substr(0, imgSrc.length-4) + "-ac" + imgSrc.substr(imgSrc.length-4);
		me.imgSrcToggleDf = imgSrc.substr(0, imgSrc.length-4) + "-f" + imgSrc.substr(imgSrc.length-4);
		me.imgSrcToggleOv = imgSrc.substr(0, imgSrc.length-4) + "-f-ov" + imgSrc.substr(imgSrc.length-4);


		me.$target.css({
			"background-color": "transparent",
			"background-image": "url(" + me.imgSrcOv + ")",
			"background-repeat": "no-repeat",
			"background-position": "left top"
		})
		me.$img.fadeTo(0, 1);

		if(me.isRev) {
			me.$target.css({
				"background-image": "url(" + me.imgSrcDf + ")"
			})
			me.$img.attr("src", me.imgSrcOv)
			me.$img.stop().fadeTo(0, 0);
		}
		if(me.bothOv) {
			me.imgSrcDf = me.imgSrcOv;
			me.$img.attr("src", me.imgSrcOv)
		}

		var w = parseInt( me.$img.attr("width"), 10 );
		var h = parseInt( me.$img.attr("height"), 10 );
		if(w) me.$target.css("width", w);
		if(h) me.$target.css("height", h);
	},
	_select:function(){
		var me = this;
		if(me.hasAc) me.$target.css({ "background": "url(" + me.imgSrcAc + ")" });
		if(me.toggle) {
			me.$target.css({ "background": "url(" + me.imgSrcToggleOv + ")" });
			me.$img.attr("src", me.imgSrcToggleDf);
		}
		me._over();
		if(me.toggle) me._out();
	},
	_unselect:function(){
		var me = this;
		if(me.hasAc) me.$target.css({ "background": "url(" + (me.isRev? me.imgSrcDf: me.imgSrcOv) + ")" });
		if(me.toggle) {
			me.$target.css({ "background": "url(" + me.imgSrcOv + ")" });
			me.$img.attr("src", me.imgSrcDf);
		}
		me._out();
	},
	_over:function(){
		var me = this;
		me.$img.stop().fadeTo((!_ctrl.ie678? 200: 0), (me.isRev? 1: 0));
	},
	_out:function(){
		var me = this;
		me.$img.stop().fadeTo((!_ctrl.ie678? 300: 0), (me.isRev? 0: 1));
	}
});




okb.ui.ImgReplaceBtn = okb.ui.Btn.extend({
	__construct:function($me){
		this.__super.__construct.apply(this, arguments);
		var me = this;

		me.$ = $me;
		me.$img = $("img", me.$);

		if(me.$img.size()==0) return;

		var imgSrc = me.$img.attr("src");
		me.imgSrcDf = imgSrc;
		me.imgSrcOv = imgSrc.substr(0, imgSrc.length-4) + "-ov" + imgSrc.substr(imgSrc.length-4);

		//preload
		var preImg = new Image();
		preImg.src = me.imgSrcOv
	},
	_select:function(){
		var me = this;
		me._over();
	},
	_unselect:function(){
		var me = this;
		me._out();
	},
	_over:function(){
		var me = this;
		me.$img.attr("src", me.imgSrcOv)
	},
	_out:function(){
		var me = this;
		me.$img.attr("src", me.imgSrcDf)
	}
});




okb.ui.AddClassBtn = okb.ui.Btn.extend({
	__construct:function($me, option){
		this.__super.__construct.apply(this, arguments);
		var me = this;

		me.$ = $me;
		me.addClass = me.option["addClass"] || "on"
	},
	_select:function(){
		var me = this;
		me._over();
		me.$.addClass(me.addClass);
	},
	_unselect:function(){
		var me = this;
		me._out();
		me.$.removeClass(me.addClass);
	},
	_over:function(){
		var me = this;
	},
	_out:function(){
		var me = this;
	}
});


okb.ui.ToNav = okb.EventDispatcher.extend({
	EV_CHANGE:"evChange",

	__construct:function($list, btnClass, btnOption){
		this.__super.__construct.apply(this, arguments);
		var me = this;

		me.currentNum = -1;

		me.btnArr = [];
		me.hrefArr = [];
		me.hashArr = [];
		$list.each(function(index){
			var btn = new btnClass( $(this), btnOption );
			btn.setClickFunc(function(num){
				me.selection(num, true);
			}, this, [index]);
			me.btnArr.push(btn);
			var href = btn.$.attr("href") || "";
			me.hrefArr.push(href);
			me.hashArr.push( (href.substr(1)||"") );
		})

		me.noSelect = false;
	},

	setChangeFunc:function(thisObj, callback){
		var me = this;
		me.thisObj = thisObj;
		me.callback = callback;
	},

	kill:function(){
		var me = this;
		me.killed = true;
	},

	selection:function(num, withEvent){
		var me = this;
		if(me.currentNum==num) return;
		if(me.killed) return;
		me.currentNum = num;

		if(me.currentBtn && !me.noSelect) me.currentBtn.selection(false);
		me.currentBtn = me.btnArr[num];
		if(me.currentBtn && !me.noSelect) me.currentBtn.selection(true);

		if(withEvent) {
			me.trigger(me.EV_CHANGE);
			if(me.callback) me.callback.call(me.thisObj, num);
		}
	}
});


okb.ui.Switcher = okb.EventDispatcher.extend({
	EV_SWITCH: "evSwitch",

	__construct: function ($pics, $nav, option, btnClass, btnOption) {
		this.__super.__construct.apply(this, arguments);
		var me = this;

		me.option = option || {};
		me.time = me.option["time"] || 900;
		me.auto = me.option["auto"];
		me.autoTime = me.option["autoTime"] || 5000;
		btnClass = btnClass || okb.ui.Btn;

		me.$tpl_nav = $nav.find("li").remove();
		me.picArr = [];
		$pics.find("li").each(function(index){
			var c_pic = new okb.ui.Cast($(this));
			c_pic.castHide();
			me.picArr.push(c_pic);
			me.$tpl_nav.clone().appendTo($nav);
		})

		me.nav = new okb.ui.ToNav( $nav.find("li a"), btnClass, btnOption );
		me.nav.setChangeFunc(this, function(num){
			me.switchPic(num);
		})

		me.currentNum = -1;
	},


	init:function(isDirect){
		var me = this;
		me.switchPic(0, true);
	},

	addNextback:function($nextBtn, $backBtn){
		var me = this;
		if($nextBtn) {
			$nextBtn.click(function(e){
				e.preventDefault();
				me.goNext();
			})
			$backBtn.click(function(e){
				e.preventDefault();
				me.goBack();
			})
		}
	},

	switchPic: function (num, isDirect) {
		var me = this;

		if(num==me.currentNum) return;
		var dir = (num-me.currentNum > 0)? 1: -1;
		me.currentNum = num;

		var time = isDirect? 0: me.time;

		//hide
		if(me.currentPic) {
			me.currentPic.castHide( (dir>0? 0: time), (dir>0? time: 0) );
		}

		//show
		me.currentPic = me.picArr[num];
		if(me.currentPic) {
			me.currentPic.castShow( (dir>0? time: 0), 0 );
		}

		//nav
		me.nav.selection(num);

		//auto
		if(me.auto) me.startAuto();

		//event
		if(!isDirect) {
			me.trigger(me.EV_SWITCH);
		}
	},

	goNext:function(){
		var me = this;
		var num = me.currentNum + 1;
		if(num > me.picArr.length-1) num = 0;
		me.switchPic(num);
	},
	goBack:function(){
		var me = this;
		var num = me.currentNum - 1;
		if(num < 0) num = me.picArr.length-1;
		me.switchPic(num);
	},

	startAuto:function(){
		var me = this;
		me.stopAuto();
		me.autoID = setTimeout(function(){
			me.goNext();
		}, me.autoTime)
	},
	stopAuto:function(){
		var me = this;
		if(me.autoID) clearTimeout(me.autoID);
	}

});



okb.ui.Shadowbox = okb.EventDispatcher.extend({
	EV_OPEN:"evOpen",
	EV_CLOSE:"evClose",
	EV_SHOW_NEXT:"evShowNext",

	__construct:function(){
		this.__super.__construct.apply(this, arguments);
		var me = this;

		//const
		me.TYPE_IMAGE = "image";
		me.TYPE_SWF = "swf";
		me.TYPE_IFRAME = "iframe";
		me.DEF_PADDING = 10;
		me.DEF_STAGE_PADDING = 20;

		//cast
		me.$ = $('<div id="okb-shadowbox-wrapper">'+
				'   <div class="bg"></div>'+
				'	<div class="base"><div class="baseInner"><div class="baseInner2"></div></div></div>'+
				'	<div class="container">'+
				'		<div class="holder">'+
				'			<div class="inner">inner</div>'+
				'		</div>'+
				'		<div class="cover"></div>'+
				'		<a href="#" class="close">close</a>'+
				'       <p class="loading"></p>'+
				'	</div>'+
				'</div>',+
				'').appendTo(_ctrl.$body);

		me.$bg = $(".bg", me.$);
		me.$base = $(".base", me.$);
		me.$baseInner = $(".baseInner", me.$);
		me.$container = $(".container", me.$);
		me.$holder = $(".holder", me.$);
		me.$inner = $(".inner", me.$);
		me.$cover = $(".cover", me.$);
		me.$close = $(".close", me.$);
		me.$loading = $(".loading", me.$);

		//png


		//base
		me.c_base = new okb.ui.Cast( me.$base );
		me.c_base.castHide();

		//holder
		me.$holder.css("visibility", "hidden");

		//inner
		me.$inner.html("");

		//cover
		me.c_cover = new okb.ui.Cast( me.$cover );
		me.c_cover.castHide();

		//bg
		me.c_bg = new okb.ui.Cast( me.$bg );
		me.c_bg.castHide();

		//close
		me.c_close = new okb.ui.Cast( me.$close );
		me.c_close.castHide();
		me.c_close.$.click(function(){
			me.close();
			return false;
		})

		//loading
		me.c_loading = new okb.ui.Cast( me.$loading );
		me.c_loading.castHide();


		//resize
		_ctrl.bind(_ctrl.EV_RESIZE, function(e){
			me._resized.apply(me);
		});
		me._resized();


		//クリックで閉じる
		me.$close.remove();
		me.$.click(function(e){
			e.preventDefault();
			me.close();
		})


		//
		me.option = {};
		me.padding = me.DEF_PADDING;
		me.marginTop = 0;
	},

	domReady:function(){
		var me = this;
		me._resized();
	},

	_getSizeObj:function(){
		var me = this;

		var sizeObj = {
			"width": 0+"px",
			"height": 0+"px",
			"margin-left": 0+"px",
			"margin-top": 0+"px"
		}
		if(me.isOpen) {
			me.padding = Number( me.option["padding"] || me.DEF_PADDING );
			me.contentW = me.scaledW = Number(me.option["width"]);
			me.contentH = me.scaledH = Number(me.option["height"]);
			me.marginTop = Number( me.option["margin-top"] || 0 );
			var w = me.contentW + me.padding*2;
			var h = me.contentH + me.padding*2;
			var sw = _ctrl.clientW-me.DEF_STAGE_PADDING*2;
			var sh = _ctrl.clientH-me.DEF_STAGE_PADDING*2;
			if(me.currentType == me.TYPE_IMAGE){
				var scale = (w>sw | h>sh )? Math.min(sw/w, sh/h): 1;
				w = Math.round(w*scale);
				h = Math.round(h*scale);
				me.scaledW = w-me.padding*2;
				me.scaledH = h-me.padding*2;
			}
			var w2 = Math.round(w*0.5);
			var h2 = Math.round(h*0.5);
			sizeObj = {
				"width": w+"px",
				"height": h+"px",
				"margin-left": -w2+"px",
				"margin-top": (-h2-Math.round(me.marginTop*0.5))+"px"
			}
		}
		return sizeObj;
	},


	_resized:function(withBaseAnime){
		var me = this;

		if(me.isOpen){
			var sizeObj = me._getSizeObj();

			//container
			me.$container.css(sizeObj)

			//base
			if(withBaseAnime) {
				sizeObj.avoidTransforms = true;
				me.$baseInner.stop().animate(sizeObj, 400, "easeInOutQuart");
			} else {
				me.$baseInner.stop().css(sizeObj, 400);
			}

			//image
			if(me.currentType == me.TYPE_IMAGE) {
				me.$img.css({
					"width": me.scaledW+"px",
					"height":me.scaledH+"px"
				})
			}
			else if(me.currentType == me.TYPE_IFRAME) {
				me.$iframe.css({
					"width": me.contentW+"px",
					"height": (me.contentH-me.marginTop)+"px"
				})
			}

			//holder
			me.marginTop = Number( me.option["margin-top"] || 0 );
			me.$holder.css({
				"left": me.padding+"px",
				"top": (me.padding+me.marginTop)+"px"
			})
		}

		var p = $("#page")[0];
		var pageH = _ctrl.stageH;
		if(p) pageH = Math.max( p.scrollHeight, pageH );

		//bg
		me.$bg.css("height", pageH+"px");

		//this
		me.$.css("height", pageH+"px");
	},


	openSerial:function(contentArr, serialCompCallback){
		var me = this;

		me.serialCompCallback = serialCompCallback;

		if(me.hashNextSerial) {
			me.contentArr = me.contentArr.concat(contentArr);
		}

		me.contentArr = contentArr;

		if(!me.serialReady) {
			me.serialReady = true;
			me.bind(me.EV_SHOW_NEXT, function(){
				me._serialLoop();
			})
		}


		me._serialLoop();
	},

	_serialLoop:function(){
		var me = this;

		var contentObj = me.contentArr.shift();
		if(me.contentArr.length>0) me.hashNextSerial = true;
		else me.hashNextSerial = false;

		me.open( contentObj.href, contentObj.rel, callback );
	},


	open:function(contentStr, rel, callback){
		var me = this;

		me.callback = callback;

		//resize
		me._resized();

		if(me.isOpen) {
			me._removeContent();
//			return;
		}
		me.isOpen = true;
		me.trigger(me.EV_OPEN);

		if(me.delayID) clearTimeout(me.delayID);

		//loading
		me.c_loading.castShow(100, 33);

		//this
		me.$.css("visibility", "visible");

		//bg
		me.c_bg.castShow( (!_ctrl.ie6? 100: 0) );
		if(_ctrl.ie6) me.$bg.fixPng();

		//fixed効かない場合の位置取り
		if(_ctrl.noFixed){
			var ty = Math.round( _ctrl.scrollTop + (_ctrl.clientH*0.5) );
			me.$base.css("top", ty+"px");
			me.$container.css("top", ty+"px");
		}

		//
		me.currentType = "";


		//option
		me.option = {};
		rel = rel || "";
		rel = rel.split(" ").join("");
		var relArr = rel.split(",");
		var i,len = relArr.length;
		for(i=0; i<len; i++){
			var opArr = relArr[i].split(":");
			me.option[opArr[0]] = opArr[1];
		}

		//クラス
		if(me.option["class"]) me.$.addClass(me.option["class"]);
		else me.$.removeAttr("class");


		if(me.delayID) clearTimeout(me.delayID);
		me.delayID = setTimeout(function(){

			me._addContent(contentStr);

		}, 100)

	},

	_addContent:function(contentStr){
		var me = this;

		if(contentStr.match(/.jpg|.gif|.png/i)) me.currentType = me.TYPE_IMAGE;
		else if(contentStr.match(/.swf/)) me.currentType = me.TYPE_SWF;
		else me.currentType = me.TYPE_IFRAME;

		if(me.option["type"]) me.currentType = me.option["type"];

		//image
		if(me.currentType == me.TYPE_IMAGE) {
			me.img = new Image();
			me.img.src = contentStr;
			me.$img = $(me.img).appendTo(me.$inner);
			me.imgLoaded = false;
			if(me.delayID) clearTimeout(me.delayID);
			me.delayID = setTimeout(function(){
				me.$img.trigger("imgLoad")
			}, 10000)
			me.$img.bind("imgLoad", function(){
				if(me.imgLoaded) return;
				me.imgLoaded = true;
				me.$img.unbind();

				var imgSize = okb.util.getImageSize(me.img);
				me.option["width"] = imgSize["width"];
				me.option["height"] = imgSize["height"];
				me._getSizeObj();
				me._resized(true);

				me._open(contentStr);
			})
		}
		//swf
		else if(me.currentType == me.TYPE_SWF) {
			me._open(contentStr);
		}
		//iframe
		else {
			me.$iframe = $('<iframe src="javascript:false;" width="800" height="800" frameborder="0" scrolling="no" allowtransparency="true"></iframe>').appendTo(me.$inner);
			me.$iframe.load(function(){
				me.$iframe.unbind();
				if(me.option["bodyStyle"]) me.$iframe.contents().find("body").attr("style", me.option["bodyStyle"])
				me._open(contentStr);
			});
			me.$iframe[0].contentWindow.location.replace(contentStr);
		}
	},

	_open:function(contentStr){
		var me = this;

		//loading
		me.c_loading.castHide(100, 0);

		if(me.delayID) clearTimeout(me.delayID);
		me.delayID = setTimeout(function(){

			//resize
			me._resized(true);

			//base
			var time = _ctrl.ie678? 0: 400;
			me.c_base.castShow(time, 0)

			//base表示後に
			if(me.delayID) clearTimeout(me.delayID);
			me.delayID = setTimeout(function(){

				//content
				me.$holder.css("visibility", "visible");

				//SWF
				if(me.currentType == me.TYPE_SWF) {
					me.$inner.html('<div id="ex_flash_okb"></div>')
					var flashvars = {
					};
					var params = {
						menu: "false",
						allowscriptaccess: "always",
						wmode: (_ctrl.os == "Windows XP")? null: "transparent",
						base:"."
					};
					var attributes = {
						id: "ex_flash_okb",
						name: "ex_flash_okb"
					};
					swfobject.embedSWF(contentStr, "ex_flash_okb", me.contentW, (me.contentH-me.marginTop), "10.0.0", "/common/js_libs/expressInstall.swf", flashvars, params, attributes);
				}


				//cover
				if(me.currentType != me.TYPE_SWF) {
					me.$inner.stop().fadeTo(0,1).css("filter", "none");
					me.c_cover.castShow();
					me.c_cover.castHide(  me.option["fade"]=="none"? 0: 300 );
				} else {
//					me.$inner.fadeTo(0,0).stop().fadeTo(500, 1);
//					me.delayID = setTimeout(function(){
						me.$inner.stop().fadeTo(0,1).css("filter", "none");
//					}, 500);
				}

				//close
				if(!me.option["noClose"]) {
					me.c_close.castShow( 300, 300 );
				}


				//念のためbg表示
				if(!_ctrl.ie678) {
					if(me.delayID) clearTimeout(me.delayID);
					me.delayID = setTimeout(function(){
						me.$bg.stop().fadeTo(0,1);
					}, 100);
				}

			}, 300);

		}, 0)
	},


	close:function(){
		var me = this;

		if(!me.isOpen) return;
		me.isOpen = false;
		me.trigger(me.EV_CLOSE);

		//close
		me.c_close.castHide(50, 0);

		//cover
		if(me.marginTop==0) {
			me.c_cover.castShow(100, 0);
		} else {
			me.$inner.stop().fadeTo(100,0);
		}

		if(me.delayID) clearTimeout(me.delayID);
		me.delayID = setTimeout(function(){
			me.c_cover.castHide();

			//content (remove)
			me._removeContent();

			//base
			var time = _ctrl.ie678? 0: 100;
			me.c_base.castHide(time);
			me.$baseInner.stop().animate({
				"width": 0+"px",
				"height": 0+"px",
				"margin-left": 0+"px",
				"margin-top": 0+"px",
				avoidTransforms: true
			}, 100, "easeOutQuart");

			if(me.hashNextSerial) {
				setTimeout(function(){
					me.trigger(me.EV_SHOW_NEXT);
				}, 100)
			} else {
				//bg
				me.c_bg.castHide( (!_ctrl.ie6? 100: 0), 100);

				//this
				if(me.delayID) clearTimeout(me.delayID);
				me.delayID = setTimeout(function(){
					me.$.css("visibility", "hidden");

					//callback
					if(me.callback) {
						me.callback();
						me.callback = null;
					}
					if(me.serialCompCallback) {
						me.serialCompCallback();
						me.serialCompCallback = null;
					}
				}, 200)
			}
		}, 100)
	},

	_removeContent:function(){
		var me = this;

		me.$inner.html("");
		me.$holder.css("visibility", "hidden");
		//image
		if(me.currentType == me.TYPE_IMAGE) {
			me.$img.unbind().remove();
			me.$img = me.img = null;
		}
		//SWF
		if(me.currentType == me.TYPE_SWF) {
			swfobject.removeSWF("ex_flash_okb");
		}
		//iframe
		if(me.currentType == me.TYPE_IFRAME) {
			me.$iframe.unbind().remove();
			me.$iframe = null;
		}
	}

});


_ctrl.bind(_ctrl.EV_DOMREADY, function(e){

	var isSupportPlaceHolder = ("placeholder" in document.createElement('input') );

	$(".imgBtn").each(function(index){
		var $this = $(this);

		new okb.ui.ImgBtn( $this, {
			isRev: $this.hasClass("rev")
		} );
	});
	$(".alpBtn").each(function(index){
		new okb.ui.AlphaBtn( $(this) );
	});

	//scrollTopBtn
	$(".scrollTopBtn").each(function(index){
		var $this = $(this);
		$this.click(function(e){
			if($this.attr("href") == "#") e.preventDefault();

//			_ctrl.$html_body.scrollTop(0)
			_ctrl.$html_body.stop().animate({
				"scrollTop":0,
				avoidTransforms: true
			}, 500)
		})
	})

})

okb.util = {


	get3CommaStr:function(str){
		var num = new String(str).replace(/,/g, "");
		while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
		return num;
	},

	replacePngToGif:function($img) {
		$img.attr("src", $img.attr("src").split(".png").join(".gif") )
	},



	/*
		画像本来の大きさを取得
		@image (jqueryでなくDOMオブジェクトを渡す！)
	*/
	getImageSize:function(image) {
		var w = image.width;
		var h = image.height;

		if ( typeof image.naturalWidth !== 'undefined' ) {  // for Firefox, Safari, Chrome
			w = image.naturalWidth;
			h = image.naturalHeight;

		} else if ( typeof image.runtimeStyle !== 'undefined' ) {    // for IE
			var run = image.runtimeStyle;
			var mem = { w: run.width, h: run.height };  // keep runtimeStyle
			run.width  = "auto";
			run.height = "auto";
			w = image.width;
			h = image.height;
			run.width  = mem.w;
			run.height = mem.h;

		} else {         // for Opera
			var mem = { w: image.width, h: image.height };  // keep original style
			image.removeAttribute("width");
			image.removeAttribute("height");
			w = image.width;
			h = image.height;
			image.width  = mem.w;
			image.height = mem.h;
		}

		return {width:w, height:h};
	},



	getExcerptStr:function(text, length){
		if(text.length > length) text = text.substr(0, length) + "…";
		return text;
	},


	roundNumber: function(number, decimal) {
		decimal = decimal || 2;
		return Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal);
	},



	getUrlQuery: function(urlStr){
		var q = urlStr.split("?")[1] ||"";
		var qArr = q.split("&");
		var i, len = qArr.length;
		var queryIdx = {};
		for (i = 0; i < len; i++) {
			var keyAndValue = qArr[i].split("=");
			queryIdx[keyAndValue[0]] = keyAndValue[1];
		}
		return queryIdx;
	}

};

okb.form = {};

okb.form.EMPTY_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';


okb.form.TextFld = Class.extend({

	__construct: function ($me, isSupportPlaceHolder) {
		var me = this;

		me.$ = $me;
		me.$input = $("input, textarea", me.$);
//		me.$bgL_ac = $('<div class="bgL ac"></div>').prependTo(me.$);
//		me.$bgL_ov = $('<div class="bgL ov"></div>').prependTo(me.$);
//		me.$bgL = $('<div class="bgL"></div>').prependTo(me.$);
//		me.$bgR_ac = $('<div class="bgR ac"></div>').prependTo(me.$);
//		me.$bgR_ov = $('<div class="bgR ov"></div>').prependTo(me.$);
//		me.$bgR = $('<div class="bgR"></div>').prependTo(me.$);
//		me.$bg_ov = $(".ov", me.$);
//		me.$bg_ac = $(".ac", me.$);
//
//
//		//ie6
//		if(navigator.userAgent.indexOf("MSIE")>=0) {
//			me.$bgR.css( "width", (me.$.width()-5)+"px" );
//			me.$bg_ov.remove();
//			me.$bg_ac.remove();
//			me.$bg_ov = null;
//			me.$bg_ac = null;
//		} else {
//			me.$bg_ov.fadeTo(0,0);
//			me.$bg_ac.fadeTo(0,0);
//			me.$.mouseover(function(e){
//				me.$bg_ov.stop().fadeTo(100, 1);
//			})
//			me.$.mouseout(function(e){
//				me.$bg_ov.stop().fadeTo(200, 0);
//			})
//			me.$input.focus(function () {
//				if(me.$bg_ac) me.$bg_ac.stop().fadeTo(100, 1);
//				if(me.$.hasClass("error")) me.$.removeClass("error");
//			})
//			me.$input.blur(function () {
//				if(me.$bg_ac) me.$bg_ac.stop().fadeTo(200, 0);
//			});
//		}

		//tabindexを引き継ぐ
		me.$input.attr("tabindex", me.$.attr("tabindex"));
		me.$.removeAttr("tabindex");

		if (!isSupportPlaceHolder) {
			var placeholderText = me.$input.attr('placeholder');
			if (!placeholderText || placeholderText == "") return;
			var placeholderColor = 'GrayText';
			var defaultColor = me.$input.css('color');
			me.$input.focus(function () {
				if (me.$input.val() === placeholderText) {
					me.$input.val('').css('color', defaultColor);
				}
			})
			me.$input.blur(function () {
				if (me.$input.val() === '') {
					me.$input.val(placeholderText).css('color', placeholderColor);
				} else if (me.$input.val() === placeholderText) {
					me.$input.css('color', placeholderColor);
				} else {
				}
			});
			me.$input.blur();
			me.$input.parents('form').submit(function () {
				if (me.$input.val() === placeholderText) {
					me.$input.val('');
				}
			});
		}
	}
});


okb.form.CheckRadioBase = okb.EventDispatcher.extend({

	EV_CHANGE: "evChange",

	__construct: function ($me) {
		this.__super.__construct.apply(this, arguments);
		var me = this;

		me.$ = $me;
		me.$doc = $(document);
		me.$input = $("input", me.$);
		me.$img = $('<img src="' + okb.form.EMPTY_SRC + '" class="space" />');
		me.$df = $('<span class="df"></span>')
		me.$ov = $('<span class="ov"></span>')
		me.$down = $('<span class="down"></span>')
		me.$label = $("p", me.$);


		me.name = me.$input.attr("name");

		me.$.prepend(me.$img)
		me.$.append(me.$df)
		me.$.append(me.$ov)
		me.$.append(me.$down)

		me.$ov.fadeTo(0, 0);
		me.$down.fadeTo(0, 0);

		me.$input.data("enhanced", me);
		me.$.data("enhanced", me);

		//イベントハンドラ
		me.keyUpHdl = function (e) {
			if (e.keyCode == 32) {
				e.preventDefault();
				me._toggleCheck();
			}
		}
		me.keyDownHdl = function (e) {
			if (e.keyCode == 32) {
				e.preventDefault();
			}
		}
		me.doOver = function () {
			me.$ov.stop().fadeTo(200, 1);
		}
		me.doOut = function () {
			me.$ov.stop().fadeTo(200, 0);
		}
		me.$.click(function (e) {
			me._toggleCheck();
		})
		me.$.focus(function (e) {
			me.isFocus = true;
			me.$doc.keyup(me.keyUpHdl).keydown(me.keyDownHdl);
			me.doOver();
		})
		me.$.blur(function (e) {
			me.isFocus = false;
			me.$doc.unbind("keyup", me.keyUpHdl).unbind("keydown", me.keyDownHdl);
			me.doOut();
		})
		me.$.mouseover(function () {
			if (me.isFocus) return;
			me.doOver();
		})
		me.$.mouseout(function () {
			if (me.isFocus) return;
			me.doOut();
		})

		//ラベルにaタグが入っていた場合はチェックしない
		$("a", me.$label).click(function (e) {
			e.stopPropagation();
		})

		//
		me.ckeckStatus();
	},

	checked: function (isCheck) {
		var me = this;
		if (isCheck == undefined) return me.$.hasClass("on");
		me.$input.prop("checked", isCheck);
		me.ckeckStatus();
	},

	_toggleCheck: function () {
		var me = this;

		//checkedの切り替え（継承先クラスで！）

		me.$down.stop().fadeTo(0, 1).fadeTo(200, 0);
		me.ckeckStatus();

		me.trigger(me.EV_CHANGE);///////
	},

	ckeckStatus: function () {
		var me = this;
		if (me.$input.prop("checked")) me.$.addClass("on");
		else me.$.removeClass("on");
	}

});


okb.form.CheckBox = okb.form.CheckRadioBase.extend({

	__construct: function ($me, option) {
		this.__super.__construct.apply(this, arguments);
	},

	_toggleCheck: function () {
		var me = this;

		me.$input.prop("checked", !(me.$input.prop("checked") == true));

		this.__super._toggleCheck.apply(this, arguments);
	}
});


okb.form.Radio = okb.form.CheckRadioBase.extend({

	__construct: function ($me, option) {
		this.__super.__construct.apply(this, arguments);
	},

	_toggleCheck: function () {
		var me = this;
		me.$input.prop("checked", true);

		$("input[name=" + me.name + "]").each(function () {
			var c = $(this).data("enhanced");
			if (c) c.ckeckStatus();
		})

		this.__super._toggleCheck.apply(this, arguments);
	}
});


okb.form.SelectBox_PADDING_X = 20;
okb.form.SelectBox_FONT_SCALE = 1.05;
okb.form.SelectBox = Class.extend({

	__construct: function ($me) {
		var me = this;

		me.$ = $me;
		me.$select = $("select", me.$);
		me.$select.wrap('<div class="selectBoxInner"></div>');
		me.$wrapper = $(".selectBoxInner", me.$);
		me.$cur = $('<p class="cur"></p>').prependTo(me.$wrapper);
		me.$bgR = $('<p class="bgR"></p>').prependTo(me.$wrapper);
		me.$bgL = $('<p class="bgL"></p>').prependTo(me.$wrapper);

		me.$doc = $(document);

		//tabindexを引き継ぐ
		me.$select.attr("tabindex", me.$.attr("tabindex"));
		me.$.removeAttr("tabindex");

		//ie6
		if (navigator.userAgent.indexOf("MSIE") >= 0) me.ie = true;

		//width
		if (!me.$.hasClass("noResize")) {
			me.w = me.$select.width();
			var w = me.w * okb.form.SelectBox_FONT_SCALE + okb.form.SelectBox_PADDING_X;
			me.$.css("width", w + "px")
			me.$select.css("width", w + "px")
		}


		//フォーカスでクラスいじるとieだとだめなので・・
		if (me.ie) {
			me.$.addClass("ie")
		} else {
			me.$select.bind("focus", function (e) {
				me.$.addClass("focus").removeClass("blur");
			})
			me.$select.bind("blur", function (e) {
				me.$.addClass("blur").removeClass("focus");
			})
		}

		//change
		me.$select.bind("change", function () {
//			me.$cur.text(me.$select.val())
			me.$cur.text(me.$select[0].options[me.$select[0].options.selectedIndex].text)
		})

		me.$select.trigger("blur").trigger("change")

	}
});


okb.form.FormButton = Class.extend({

	__construct: function ($me) {
		var me = this;

		me.$ = $me;
		me.$input = $("input", me.$);

		//tabindexを引き継ぐ
		me.$input.attr("tabindex", me.$.attr("tabindex"));
		me.$.removeAttr("tabindex");
	}

});


okb.form.Label = Class.extend({

	__construct: function ($me) {
		var me = this;

		me.$ = $me;
		me.$input = $("input", me.$);

		me.$.click(function (e) {
			me.$input.prop("checked", !me.$input.prop("checked"))
		})
		me.$input.click(function (e) {
			e.stopPropagation();
		})
	}

});


okb.form.initForms = function ($area) {

	var isSupportPlaceHolder = ("placeholder" in document.createElement('input') );

	$area.find("input[type=button], input[type=submit], input[type=image], input[type=checkbox], input[type=radio], input[type=text], input[type=password], textarea, select").each(function (index) {
		var $el = $(this);

		//div.okb-formで包む（labelで包まれている場合はラベルを削除）
		if ($el.parent()[0].tagName.toLowerCase() == "label") {
			$el.parent().wrap('<div class="okb-form"></div>');
			$el.unwrap();
		} else {
			$el.wrap('<div class="okb-form"></div>');
		}
		var $par = $el.parent();
		if($par.find("input").length>0) {
			$input = $par.find("input").remove();
			$par.contents().wrapAll('<span class="label"></span>');
			$par.prepend($input);
		}

		//tabIndex
		$el.parent().attr("tabindex", index + 1);

		var tagName = $el[0].tagName.toLowerCase();

		//button
		if ($("input[type=button], input[type=submit]", $par).size() > 0) {
			$par.addClass("formButton");
			new okb.form.FormButton($par);
		}

		//button ( image )
		else if ($("input[type=image]", $par).size() > 0) {
			$par.addClass("formImgButton");
		}

		//checkbox
		else if ($("input[type=checkbox]", $par).size() > 0) {
			$par.addClass("checkBox");
			new okb.form.CheckBox($par);
		}

		//radio
		else if ($("input[type=radio]", $par).size() > 0) {
			$par.addClass("radio");
			new okb.form.Radio($par);
		}

		//input text
		else if ($("input[type=text], input[type=password]", $par).size() > 0) {
			$par.addClass("textField");
			new okb.form.TextFld($par, isSupportPlaceHolder);
		}

		//textarea
		else if ($("textarea", $par).size() > 0) {
			$par.addClass("textArea");
			new okb.form.TextFld($par, isSupportPlaceHolder);
		}

		//select
		else if ($("select", $par).size() > 0) {
			if (!_ctrl.ie6 && $el.attr("multiple")!="multiple") {
				$par.addClass("selectBox");
				new okb.form.SelectBox($par);
			} else {
				$par.css("display", "inline")
			}
		}

	});
}



okb.Snd = okb.EventDispatcher.extend({

	EV_ALL_LOADED:"evAllLoaded",

	__construct:function(){
		this.__super.__construct.apply(this, arguments)
		var me = this;

		me.labelArr = [];
		me.audioIdx = {};
	},

	loadStart:function(list){
		var me = this;

		$("audio").each(function(index){
			me.labelArr.push( $(this).attr("id") );
		})

		var loadedCnt = 0;
		function sndLoadedCntUp(){
			if(_ctrl.touchDevice) return;
			loadedCnt++;
			var per = loadedCnt/me.labelArr.length;
			if(per>=1) {
				//COMPLETE!
				me.trigger(me.EV_ALL_LOADED);
			}
		}
		me.audioArr = audiojs.createAll({
			css:false,
			loadProgress: function(p) {
				if(p>=1) sndLoadedCntUp();
			}
        });

		var i, len = me.audioArr.length;
		for(i=0; i<len; i++){
			me.audioIdx[ me.labelArr[i] ] = me.audioArr[i];
		}


		//スマホ・タブレットではユーザーアクションでないとロードされないので完了イベント！
		if(_ctrl.touchDevice) me.trigger(me.EV_ALL_LOADED);
	},

	play:function(label){
		var me = this;
		if(me.audioIdx[label]) me.audioIdx[label].play();
	},

	stop:function(label){
		var me = this;
		if(me.audioIdx[label]) me.audioIdx[label].pause();
	},

	stopAll:function(){
		var me = this;
		var i,len = me.labelArr.length;
		for(i=0; i<len; i++){
			me.stop( me.labelArr[i] );
		}
	}


});
