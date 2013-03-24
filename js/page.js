/*jslint white: true */
/*
	StatefulResolver and ApplicationConfig
*/
!function() {

	var essential = Resolver("essential",{}),
		console = essential("console"),
		DOMTokenList = essential("DOMTokenList"),
		MutableEvent = essential("MutableEvent"),
		arrayContains = essential("arrayContains"),
		escapeJs = essential("escapeJs"),
		HTMLElement = essential("HTMLElement"),
		HTMLScriptElement = essential("HTMLScriptElement"),
		enhancedElements = essential("enhancedElements"),
		enhancedWindows = essential("enhancedWindows");

	function createHTMLDocument(head,body) {
		if (typeof head == "object" && typeof head.length == "number") {
			head = head.join("");
		}
		if (typeof body == "object" && typeof body.length == "number") {
			body = body.join("");
		}

		// var doc = document.implementation.createDocument('','',
		// 	document.implementation.createDocumentType('body','',''));
		var doc;
		if (document.implementation && document.implementation.createHTMLDocument) {
			doc = document.implementation.createHTMLDocument("");
			doc.documentElement.innerHTML = '<html><head>' + head + '</head><body>' + body + '</body>';

		} else  if (window.ActiveXObject) {
			doc = new ActiveXObject("htmlfile");
			doc.appendChild(doc.createElement("html"));
			var _head = doc.createElement("head");
			var _body = doc.createElement("body");
			doc.documentElement.appendChild(_head);
			doc.documentElement.appendChild(_body);
	debugger;
			_body.innerHTML = body;
			if (head != "") _head.innerHTML = head;

		} else {
			return document.createElement("DIV");// dummy default
		}

		return doc;
	}

	var COPY_ATTRS = ["rel","href","media","type","src","lang","defer","async","name","content","http-equiv","charset"];
	var EMPTY_TAGS = { "link":true, "meta":true, "base":true, "img":true, "br":true, "hr":true, "input":true, "param":true }
	
	function outerHtml(e) {
		var attrs = [e.tagName.toLowerCase()];
		for(var i=0,n; n = COPY_ATTRS[i]; ++i) {
			var a = e[n] || e.getAttribute(n) || null; // tries property first to get absolute urls
			if (a != null) attrs.push(n+'="'+a+'"');
		}
		var tail = "";
		if (! EMPTY_TAGS[attrs[0]]) {
			tail = (e.text || e.innerHTML) + "</" + attrs[0] + ">";
		}

		return "<" + attrs.join(" ") + ">" + tail;
	}


	/* Container for laid out elements */
	function _Layouter(key,el,conf) {

	}
	var Layouter = essential.declare("Layouter",Generator(_Layouter));

	/* Laid out element within a container */
	function _Laidout(key,el,conf) {

	}
	var Laidout = essential.declare("Laidout",Generator(_Laidout));

	var nativeClassList = !!document.documentElement.classList;

	function readElementState(el,state) {
		state.disabled = el.disabled || false; // undefined before attach
		state.readOnly = el.readOnly || false;
		state.hidden = el.getAttribute("hidden") != null;
		state.required = el.getAttribute("required") != null;
	}

	function reflectProperty(el,key,value) {
		el[key] = !!value;
	}

	/*
		Reflect on the property if present otherwise the attribute. 
	*/
	function reflectAttribute(el,key,value) {
		if (typeof el[key] == "boolean") {
			el[key] = !!value;
			return;
		}
		if (value) {
			el.setAttribute(key,key);
		} else {
			el.removeAttribute(key);
		}
	}

	/*
		Reflect only aria property 
	*/
	function reflectAria(el,key,value) {
		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	/*
		Reflect on property or attribute and aria equivalent. 
	*/
	function reflectAttributeAria(el,key,value) {
		if (typeof el[key] == "boolean") {
			el[key] = !!value;
		} else {
			if (value) {
				el.setAttribute(key,key);
			} else {
				el.removeAttribute(key);
			}
		}
		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	function reflectAriaProp(el,key,value) {
		el[this.property] = value;
	}

	var state_treatment = {
		disabled: { index: 0, reflect: reflectAria, property:"ariaDisabled" }, // IE hardcodes a disabled text shadow for buttons and anchors
		readOnly: { index: 1, reflect: reflectProperty },
		hidden: { index: 2, reflect: reflectAttribute }, // Aria all elements
		required: { index: 3, reflect: reflectAttributeAria, property:"ariaRequired" }, //TODO ariaRequired
		expanded: { index: 4, reflect: reflectAttributeAria, property:"ariaExpanded" } //TODO ariaExpanded
		//TODO draggable
		//TODO contenteditable
		//TODO checked ariaChecked
		//TODO tooltip
		//TODO hover
		//TODO down ariaPressed
		//TODO ariaHidden
		//TODO ariaDisabled
		//TODO ariaSelected

		//TODO aria-hidden all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-hidden
		//TODO aria-invalid all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-invalid

		/*TODO IE aria props
			string:
			ariaPressed ariaSelected ariaSecret ariaRequired ariaRelevant ariaReadonly ariaLive
			ariaInvalid ariaHidden ariaBusy ariaActivedescendant ariaFlowto ariaDisabled


		*/

		//TODO restricted/forbidden tie in with session specific permissions

		//TODO focus for elements with focus
	};

	var DOMTokenList_eitherClass = essential("DOMTokenList.eitherClass");
	var DOMTokenList_mixin = essential("DOMTokenList.mixin");

	function reflectElementState(event) {
		var el = event.data;
		var treatment = state_treatment[event.symbol];
		if (treatment) {
			// known props
			treatment.reflect(el,event.symbol,event.value);
		} else {
			// extra state
		}

		var mapClass = el.stateful("map.class","undefined");
		if (mapClass) {
			DOMTokenList_eitherClass(el,mapClass.state[event.symbol],mapClass.notstate[event.symbol],event.value);
		} 
	}

	/*
		class = <prefix classes> <model classes> <state classes>
	*/
	function reflectElementClass(event) {
		// state-hover state-active state-disabled
		var stateClasses = [];
		stateClasses[0] = state.disabled? "state-disabled" : "";
	}

	function ClassForState() {

	}
	ClassForState.prototype.disabled = "state-disabled";
	ClassForState.prototype.readOnly = "state-readOnly";
	ClassForState.prototype.hidden = "state-hidden";
	ClassForState.prototype.required = "state-required";
	ClassForState.prototype.expanded = "state-expanded";

	function ClassForNotState() {

	}
	ClassForNotState.prototype.disabled = "";
	ClassForNotState.prototype.readOnly = "";
	ClassForNotState.prototype.hidden = "";
	ClassForNotState.prototype.required = "";
	ClassForNotState.prototype.expanded = "";

	function make_Stateful_fireAction(el) {
		return function() {
			var ev = MutableEvent({
				"target":el
			}).withActionInfo(); 
			fireAction(ev);
		};
	}

	function Stateful_reflectStateOn(el,useAsSource) {
		var stateful = el.stateful = this;
		if (el._cleaners == undefined) el._cleaners = [];
		//TODO consider when to clean body element
		if (!arrayContains(el._cleaners,statefulCleaner)) el._cleaners.push(statefulCleaner); 
		if (useAsSource != false) readElementState(el,stateful("state"));
		stateful.on("change","state",el,reflectElementState); //TODO "livechange", queues up calls while not live
		if (!nativeClassList) {
			el.classList = DOMTokenList();
			DOMTokenList_mixin(el.classList,el.className);
		}
		var mapClass = el.stateful("map.class","undefined");
		if (mapClass) StatefulResolver.updateClass(stateful,el); //TODO move 
	}
 
	// all stateful elements whether field or not get a cleaner
	function statefulCleaner() {
		if (this.stateful) {
			this.stateful.destroy();
			if (this.stateful.discard) this.stateful.discard();
			this.stateful.fireAction = undefined;
			this.stateful = undefined;
		}
	}
	essential.declare("statefulCleaner",statefulCleaner);

	/*
	  StatefulResolver()
	  StatefulResolver(el)
	  StatefulResolver(el,true)
	*/
	function StatefulResolver(el,mapClassForState) {
		if (el && el.stateful) return el.stateful;

		var resolverOptions = {};
		if (typeof mapClassForState == "object") {
			resolverOptions = mapClassForState;
			mapClassForState = mapClassForState.mapClassForState;//TODO consider different name 
		}
		var stateful = Resolver({ state: {} },resolverOptions);
		if (mapClassForState) {
			stateful.set("map.class.state", new ClassForState());
			stateful.set("map.class.notstate", new ClassForNotState());
		}
		stateful.fireAction = make_Stateful_fireAction(el);
		stateful.reflectStateOn = Stateful_reflectStateOn;

		if (el) stateful.reflectStateOn(el);
		
		return stateful;
	}
	essential.declare("StatefulResolver",StatefulResolver);

	var pageResolver = StatefulResolver(null,{ name:"page", mapClassForState:true });
	pageResolver.declare("config",{});
	pageResolver.reference("state").mixin({
		"livepage": false,
		"authenticated": true,
		"authorised": true,
		"connected": true,
		"online": true, //TODO update
		"preloading": false,
		"loading": true,
		"loadingConfig": false,
		"loadingScripts": false,
		"configured": true,
		"fullscreen": false,
		"launching": false, 
		"launched": false,

		"lang": document.documentElement.lang || "en",

		"loadingScriptsUrl": {},
		"loadingConfigUrl": {}
		});
	pageResolver.reference("connection").mixin({
		"loadingProgress": "",
		"status": "connected",
		"detail": "",
		"userName": "",
		"logStatus": false
	});

	pageResolver.reference("map.class.state").mixin({
		authenticated: "authenticated",
		loading: "loading",
		//login-error
		launched: "launched",
		launching: "launching",
		livepage: "livepage"
	});

	pageResolver.reference("map.class.notstate").mixin({
		authenticated: "login"
	});

	StatefulResolver.updateClass = function(stateful,el) {
		var triggers = {};
		for(var n in state_treatment) triggers[n] = true;
		for(var n in stateful("map.class.state")) triggers[n] = true;
		for(var n in stateful("map.class.notstate")) triggers[n] = true;
		for(var n in triggers) {
			stateful.reference("state."+n,"null").trigger("change");
		}
	};

	var _activeAreaName,_liveAreas=false, stages = [];
	essential.set("stages",stages);

	function activateArea(areaName) {
		if (! _liveAreas) {
			_activeAreaName = areaName;
			return;
		}
		
		for(var i=0,s; s = stages[i]; ++i) {
			s.updateActiveArea(areaName);
		}
		_activeAreaName = areaName;
		// only use DocumentRoles layout if DOM is ready
		if (document.body) {
			var dr = essential("DocumentRoles")();
			dr._layout_descs(); //TODO could this be done somewhere else?	
		} 
	}
	essential.set("activateArea",activateArea);
	
	function getActiveArea() {
		return _activeAreaName;
	}
	essential.set("getActiveArea",getActiveArea);

	function bringLive() {
		var ap = ApplicationConfig(); //TODO factor this and possibly _liveAreas out

		for(var i=0,w; w = enhancedWindows[i]; ++i) if (w.openWhenReady) {
			w.openNow();
			delete w.openWhenReady;
		}
		EnhancedWindow.prototype.open = EnhancedWindow.prototype.openNow;

		//TODO if waiting for initial page src postpone this

		// Allow the browser to render the page, preventing initial transitions
		_liveAreas = true;
		ap.state.set("livepage",true);

	}

	function onPageLoad(ev) {
		var ap = ApplicationConfig();
		_liveAreas = true;
		ap.state.set("livepage",true);
	}

	if (window.addEventListener) window.addEventListener("load",onPageLoad,false);
	else if (window.attachEvent) window.attachEvent("onload",onPageLoad);

	Resolver("page").declare("pages",{});

	function _SubPage(appConfig) {
		if (appConfig) this.appConfig = appConfig;
		this.body = document.createElement("DIV");
	}
	var SubPage = Generator(_SubPage);

	SubPage.prototype.headPrefix = ['<head>'];
	var metas = (document.head || document.documentElement.firstChild).getElementsByTagName("meta");
	for(var i=0,e; e = metas[i]; ++i) {
		SubPage.prototype.headPrefix.push(outerHtml(e));
	}

	SubPage.prototype.fetch = function() {

		var XMLHttpRequest = essential("XMLHttpRequest");
	    var xhr = XMLHttpRequest();

	    if (typeof(xhr.overrideMimeType) === 'function') {
	        xhr.overrideMimeType('text/html');
	    }
	    xhr.open('GET', this.url, /* async */true);
	    //TODO utf-8
	    xhr.setRequestHeader('Accept', 'text/html; q=0.9, */*; q=0.5');
	    try {
		    xhr.send(null);

		    if (essential("isFileProtocol")) {
		        if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
		            this.loadedPageDone(xhr.responseText);
		        } else {
		            this.loadedPageError(xhr.status);
		        }
		    } else {
		        xhr.onreadystatechange = function () {
		            if (xhr.readyState == 4) {
		                handleResponse(xhr, this, this.loadedPageDone, this.loadedPageError);
		            }
		        };
		    } 
	    }
	    catch(ex) {
	    	this.loadedPageError(null,ex); //TODO no net for instance
	    }
	};

    function handleResponse(xhr, instance, callback, errback) {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback.call(instance,xhr.responseText,
                     xhr.getResponseHeader("Last-Modified"));
        } else if (typeof(errback) === 'function') {
            errback.call(instance,xhr.status);
        }
    }

	SubPage.prototype.loadedPageDone = function(text,lastModified) {
		var doc = createHTMLDocument(text);
	};

	SubPage.prototype.loadedPageError = function(status) {

	};

	SubPage.prototype.parseHTML = function(text) {
		var doc;
		if (document.implementation && document.implementation.createHTMLDocument) {
			doc = document.implementation.createHTMLDocument("");
			doc.documentElement.innerHTML = text;
			this.head = document.importNode(doc.head);
			this.body = document.importNode(doc.body);

		} else  if (window.ActiveXObject) {
			text = text.replace("<html",'<div id="esp-html"').replace("</html>","</div>");
			text = text.replace("<HTML",'<div id="esp-html"').replace("</HTML>","</div>");
			text = text.replace("<head",'<washead').replace("</head>","</washead>");
			text = text.replace("<HEAD",'<washead').replace("</HEAD>","</washead>");
			text = text.replace("<body",'<wasbody').replace("</body>","</wasbody>");
			text = text.replace("<BODY",'<wasbody').replace("</BODY>","</wasbody>");
			var div = document.createElement("DIV");
			div.innerHTML = text;
			this.head = div.getElementsByTagName("washead");
			this.body = div.getElementsByTagName("wasbody") || div;
			//TODO offline htmlfile object?
		}
	};

	SubPage.prototype.applyBody = function() {
		var e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild,
			db = document.body,
			fc = db.firstElementChild!==undefined? db.firstElementChild : db.firstChild;
		while(e) {
			// insert before the first permanent, or at the end
			if (fc == null) {
				db.appendChild(e);
			} else {
				db.insertBefore(e,fc);
			}
			e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild;
		}
	};

	SubPage.prototype.unapplyBody = function() {
		var db = document.body, 
			pc = null,
			e = db.lastElementChild!==undefined? db.lastElementChild : db.lastChild;

		while(e) {
			if (e.permanent) {
				// not part of subpage
				e = e.previousElementSibling || e.previousSibling;
			} else {
				if (pc == null) {
					this.body.appendChild(e);
				} else {
					this.body.insertBefore(e,pc)
				}
				pc = e;
			}
			e = db.lastElementChild!==undefined? db.lastElementChild : db.lastChild;
		}
	};

	SubPage.prototype.doesElementApply = function(el) {
		if (el.attrs) {
			return el.attrs["subpage"] == false? false : true;
		}
		if (el.getAttribute("subpage") == "false") return false;
		if (el.getAttribute("data-subpage") == "false") return false;
		return true;
	};

	SubPage.prototype.getHeadHtml = function() {
		var resources = ApplicationConfig().resources(),
			loadingScriptsUrl = ApplicationConfig().resolver("state.loadingScriptsUrl"),
			p = [],
			base = "";

		for(var i=0,r; r = resources[i]; ++i) {
			if (this.doesElementApply(r)) p.push( outerHtml(r) );
		}
		for(var u in loadingScriptsUrl) {
			var link = loadingScriptsUrl[u];
			base = link.attrs.base;
			if (this.doesElementApply(link)) p.push( outerHtml(link) );
		}
		if (base) base = '<base href="'+base+'">';
		p.push('</head>');
		return escapeJs(this.headPrefix.join("") + base + p.join(""));

	};

	SubPage.prototype.getBodyHtml = function() {
		var p = [
			'<body>',
			this.body.innerHTML,
			'</body>'
		];
		return p.join("");
		
	};

	SubPage.prototype.getInlineUrl = function() {
		var p = [
			'javascript:document.write("',
			'<html><!-- From Main Window -->',
			this.getHeadHtml(),
			this.getBodyHtml(),
			'</html>',
			'");'
		];

		return p.join("");
	};



	function _ApplicationConfig() {
		this.resolver = pageResolver;

		// copy state presets for backwards compatibility
		var state = this.resolver.reference("state","undefined");
		for(var n in this.state) state.set(n,this.state[n]);
		this.state = state;
		document.documentElement.lang = this.state("lang");
		state.on("change",this,this.onStateChange);
		this.resolver.on("change","state.loadingScriptsUrl",this,this.onLoadingScripts);
		this.resolver.on("change","state.loadingConfigUrl",this,this.onLoadingConfig);

		this.config = this.resolver.reference("config","undefined");
		this.pages = this.resolver.reference("pages",{ generator:SubPage});
		SubPage.prototype.appConfig = this;
		this.resolver.declare("resources",[]);
		this.resources = this.resolver.reference("resources");
		this.resolver.declare("inits",[]);
		this.inits = this.resolver.reference("inits");

		this._gather();
		this._apply();

		var bodySrc = document.body.getAttribute("src");
		if (bodySrc) {
			this.loadPage(bodySrc)
			//TODO queue loading this as the initial body content added before the first body child
		}

		this.modules = { "domReady":true };

		setTimeout(bringLive,60); 
	}

	var ApplicationConfig = Generator(_ApplicationConfig);
	essential.set("ApplicationConfig",ApplicationConfig).restrict({ "singleton":true, "lifecycle":"page" });
	
	// preset on instance (old api)
	ApplicationConfig.presets.declare("state", { });

	function enhanceUnhandledElements() {
		var statefuls = ApplicationConfig(); // Ensure that config is present
		//var handlers = DocumentRoles.presets("handlers");
		//TODO listener to presets -> Doc Roles additional handlers
		var dr = essential("DocumentRoles")()
		dr._enhance_descs(enhancedElements);
		//TODO time to default_enhance yet?
	}

	ApplicationConfig.prototype.onStateChange = function(ev) {
		switch(ev.symbol) {
			case "livepage":
				pageResolver.reflectStateOn(document.body,false);
				var ap = ev.data;
				//if (ev.value == true) ap.reflectState();
				ev.data.doInitScripts();
				if (_activeAreaName) {
					activateArea(_activeAreaName);
				} else {
					for(var i=0,s; s = stages[i]; ++i) {
						if (ev.base.authenticated) activateArea(s.getAuthenticatedArea());
						else activateArea(s.getIntroductionArea());
					}
				}
				break;
			case "loadingScripts":
			case "loadingConfig":
				//console.log("loading",this("state.loading"),this("state.loadingScripts"),this("state.loadingConfig"))
				--ev.inTrigger;
				this.set("state.loading",ev.base.loadingScripts || ev.base.loadingConfig);
				++ev.inTrigger;
				break;

			case "preloading":
				if (! ev.value) {
					for(var n in ev.base.loadingScriptsUrl) {
						var link = ev.base.loadingScriptsUrl[n];
						if (link.rel == "pastload" && !link.added) {
							var langOk = true;
							if (link.lang) langOk = (link.lang == pageResolver("state.lang"));
							if (langOk) document.body.appendChild(HTMLScriptElement(link.attrs));
							link.added = langOk;
						}
					}
				}
				break;

			case "loading":
				if (ev.value == false) {
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
					if (ev.base.configured == true && ev.base.authenticated == true 
						&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
						this.set("state.launching",true);
						// do the below as recursion is prohibited
						if (document.body) essential("instantiatePageSingletons")();
						enhanceUnhandledElements();
					}
				} 
				break;
			case "authenticated":
				for(var i=0,s; s = stages[i]; ++i) activateArea(ev.base.authenticated? s.getAuthenticatedArea():s.getIntroductionArea());
				// no break
			case "authorised":
			case "configured":
				if (ev.base.loading == false && ev.base.configured == true && ev.base.authenticated == true 
					&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
					this.set("state.launching",true);
					// do the below as recursion is prohibited
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
				}
				break;			
			case "launching":
			case "launched":
				if (ev.value == true) {
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
					if (ev.symbol == "launched") this.set("state.launching",false);
				}
				break;

			case "lang":
				document.documentElement.lang = ev.value;
				break;
			
			default:
				if (ev.base.loading==false && ev.base.launching==false && ev.base.launched==false) {
					if (document.body) essential("instantiatePageSingletons")();
				}
		}
	};

	ApplicationConfig.prototype.onLoadingScripts = function(ev) {
		var loadingScriptsUrl = this("state.loadingScriptsUrl");
			
		var loadingScripts = false;
		var preloading = false;
		for(var url in loadingScriptsUrl) {
			var link = loadingScriptsUrl[url];
			if (link.rel == "preload") preloading = true;
			if (link) loadingScripts = true;
		}
		this.set("state.loadingScripts",loadingScripts);
		this.set("state.preloading",preloading);
		if (ev.value==false) {
			// finished loading a script
			if (document.body) essential("instantiatePageSingletons")();
		}
	};

	ApplicationConfig.prototype.onLoadingConfig = function(ev) {
		var loadingConfigUrl = this("state.loadingConfigUrl");
			
		var loadingConfig = false;
		for(var url in loadingConfigUrl) {
			if (loadingConfigUrl[url]) loadingConfig = true;
		}
		this.set("state.loadingConfig",loadingConfig);
		if (ev.value==false) {
			// finished loading a config
			if (document.body) essential("instantiatePageSingletons")();
		}
	};

	ApplicationConfig.prototype.isPageState = function(whichState) {
		return this.resolver("state."+whichState);
	};
	ApplicationConfig.prototype.setPageState = function(whichState,v) {
		this.resolver.set(["state",whichState],v);
	};

	ApplicationConfig.prototype.declare = function(key,value) {
		this.config.declare(key,value);
	};

	ApplicationConfig.prototype.page = function(url,options,content) {
		//this.pages.declare(key,value);
		var page = this.pages()[url]; //TODO options in reference onundefined:generator & generate
		if (page == undefined) {
			page = this.pages()[url] = SubPage();
		}
		if (!page.loaded) {
			page.url = url;
			page.options = options;
			page.parseHTML(content);
		}
	};

	ApplicationConfig.prototype._apply = function() {
		for(var k in this.config()) {
			var el = this.getElement(k);
			var conf = el? this._getElementRoleConfig(el,k) : this.config()[k];

			if (conf.layouter && el) {
				el.layouter = Layouter.variant(conf.layouter)(k,el,conf);
			}
			if (conf.laidout && el) {
				el.laidout = Laidout.variant(conf.laidout)(k,el,conf);
			}
		}
	};

	var _singleQuotesRe = new RegExp("'","g");

	ApplicationConfig.prototype._getElementRoleConfig = function(element,key) {
		//TODO cache the config on element.stateful

		var config = {};

		// mixin the declared config
		if (key) {
			var declared = this.config(key);
			if (declared) {
				for(var n in declared) config[n] = declared[n];
			}
		}

		// mixin the data-role
		var dataRole = element.getAttribute("data-role");
		if (dataRole) try {
			var map = JSON.parse("{" + dataRole.replace(_singleQuotesRe,'"') + "}");
			for(var n in map) config[n] = map[n];
		} catch(ex) {
			console.debug("Invalid config: ",dataRole,ex);
			config["invalid-config"] = dataRole;
		}

		return config;
	};

	ApplicationConfig.prototype.getConfig = function(element) {
		if (element.id) {
			return this._getElementRoleConfig(element,element.id);
		}
		var name = element.getAttribute("name");
		if (name) {
			var p = element.parentNode;
			while(p && p.tagName) {
				if (p.id) {
					return this._getElementRoleConfig(element,p.id + "." + name);
				} 
				p = p.parentNode;
			} 
		}
		return this._getElementRoleConfig(element);
	};

	ApplicationConfig.prototype.getElement = function(key) {
		var keys = key.split(".");
		var el = document.getElementById(keys[0]);
		if (keys.length > 1) el = el.getElementByName(keys[1]);
		return el;
	};

	ApplicationConfig.prototype.loadPage = function(url) {
		var page = this.pages()[url]; //TODO options in reference onundefined:generator & generate
		if (page == undefined) {
			page = this.pages()[url] = SubPage();
		}
		if (!page.loaded) {
			page.url = url;
			page.fetch();
		}
	};

	ApplicationConfig.prototype.doInitScripts = function() {
		var inits = this.inits();
		for(var i=0,s; s = inits[i]; ++i) if (s.parentNode && !s.done) {
			// this.currently = s
			try {
				this.context["element"] = s;
				this.context["parentElement"] = s.parentElement || s.parentNode;
				with(this.context) eval(s.text);
				s.done = true;
			} catch(ex) {
				debugger;
			} //TODO only ignore ex.ignore
		}
		this.context["this"] = undefined;
	};

	ApplicationConfig.prototype.context = {
		"require": function(path) {
			var ac = ApplicationConfig.info.existing[0];
			if (ac == undefined || ac.modules[path] == undefined) {
				var ex = new Error("Missing module '" + path + "'");
				ex.ignore = true;
				throw ex;	
			} 
		}
	};

	function onmessage(ev) {
		var data = JSON.parse(ev.data);
		if (data && data.enhanced && data.enhanced.main.width && data.enhanced.main.height) {
			placement.setOptions(data.enhanced.options);
			placement.setMain(data.enhanced.main);
			placement.track();
		}
	} 

	var placement = {
		x: undefined, y: undefined,
		width: undefined, height: undefined,

		options: {},
		main: {},
		
		notifyNeeded: false,

		setOptions: function(options) {
			this.options = options;
		},

		setMain: function(main) {
			this.main = main;
		},

		// measure this window flagging if it notifyNeeded since last time
		measure: function() {
			var	x= window.screenX, y= window.screenY, width= window.outerWidth, height= window.outerHeight;
			this.notifyNeeded = (this.notifyNeeded || x != this.x || y != this.y || width != this.width || height != this.height);
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

			this.data = JSON.stringify({
				x:x, y:y, width:width, height:height
			});
		},

		// track main window
		track: function() {
			var x=this.x, y=this.y, width=this.width, height=this.height;

			if (this.options.glueHeight) {
				y = this.main.y;
				height = this.main.height;
			}
			if (this.options.glueWidth) {
				x = this.main.x;
				width = this.main.width;
			}
			if (this.options.glueLeft) {
				x = this.main.x - this.options.width;
			} else if (this.options.glueRight) {
				x = this.main.x + this.main.width;
			}
			if (this.options.glueTop) {
				y = this.main.y - this.options.height;
			} else if (this.options.glueBottom) {
				y = this.main.y + this.main.height;
			}
			if (x != this.x || y != this.y) {
				var maxX = screen.width - this.width,maxY = screen.height - this.height;
				x = x === undefined? 0 : Math.min(Math.max(0,x),maxX);
				y = y === undefined? 0 : Math.min(Math.max(0,y),maxY);
			}

			if (x != this.x || y != this.y) {
				if (window.moveTo) window.moveTo(x - screen.availLeft,y - screen.availTop);
			}

			if (width != this.width || height != this.height) {
				if (window.resizeTo) window.resizeTo(width,height);
			}

			this.notifyNeeded = (this.notifyNeeded || x != this.x || y != this.y || width != this.width || height != this.height);
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
	};
	placement.measure();
	placement.notifyNeeded = false;
	essential.declare("placement",placement);

	placement.broadcaster = setInterval(function() {
		placement.measure();
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify();
		}
		if (placement.notifyNeeded) ;//TODO hide elements if zero, show if pack from zero
		placement.notifyNeeded = false;
	},250);


	function trackMainWindow() {
		placement.track();
	}

	// tracking main window
	if (window.opener) {

		// TODO might not be needed
		setInterval(trackMainWindow,250);

		if (window.postMessage) {
			if (window.addEventListener) {
				window.addEventListener("message",onmessage,false);

			} else if (window.attachEvent) {
				window.attachEvent("onmessage",onmessage);

			}
			//TODO removeEvent
		}


	}

	function EnhancedWindow(url,name,options,index) {
		this.name = name;
		this.url = url;
		this.options = options || {};
		this.notifyNeeded = true;
		this.index = index;
		this.width = this.options.width || 100;
		this.height = this.options.height || 500;
	}

	EnhancedWindow.prototype.override = function(url,options) {
		this.url = url;
		this.options = options;
		this.notifyNeeded = true;
	};

	EnhancedWindow.prototype.content = function() {
		// get subpage
		// html, head, body
	};

	EnhancedWindow.prototype.close = function() {
		if (this.window) this.window.close();
		this.window = null;
	};

	EnhancedWindow.prototype.open = function() {
		this.openWhenReady = true;
	};

	EnhancedWindow.prototype.openNow = function() {
		this.close();
		var features = "menubar=no,width="+(this.width)+",height="+(this.height)+",status=no,location=no,toolbar=no";

		var page = ApplicationConfig().pages()[this.url];
		var url = page? page.getInlineUrl() : this.url;
		this.window = window.open(url,this.name,features);

		var that = this;
		// do this to fix Chrome 20
		setTimeout(function() {
			that.notify({});
		},50);
	};

	EnhancedWindow.prototype.anchor = function(html,opts) {
		var attrs = { href: 'javascript:void(0);' }, that = this;
		if (this.name) attrs.target = this.name;
		attrs.onclick = function(ev) {
			that.open();
			if (ev && ev.preventDefault) ev.preventDefault();
			return false;
		};
		if (opts["class"]) attrs["class"] = opts["class"];
		return HTMLElement("a",attrs,html);
	};

	EnhancedWindow.prototype.notify = function(ev) {
		if (this.window && this.window.postMessage && (this.notifyNeeded || placement.notifyNeeded)) {
			var options = JSON.stringify(this.options);
			this.window.postMessage('{"enhanced":{'+'"options":' + options + ', "main":' + placement.data + '}}',"*");
		} 
		this.notifyNeeded = false;
	};

	EnhancedWindow.prototype.reposition = function(ev) {
		//TODO

		if (this.options.focus && this.window.focus) this.window.focus();
	};

	function defineWindow(url,name,options) {
		if (name) for(var i=0,w; w = enhancedWindows[i]; ++i) {
			if (name == w.name) {
				w.override(url,options);
				w.open();
				return;
			}
		}
		var win = new EnhancedWindow(url,name,options,enhancedWindows.length);
		enhancedWindows.push(win);
		return win;
	}
	essential.declare("defineWindow",defineWindow);


	function openSidebar(url, options) {
		var nav = HTMLElement("nav");
		var subPage = getSubPage(url);
		subPage.fetch();
		nav.innerHTML = subPage.body.content;
		document.body.appendChild(nav);
	}
	essential.declare("openSidebar",openSidebar);

	function openWindow(url, name, options) {
		//TODO support proxied essential?
		var w = defineWindow(url, name, options);
		w.open();
		return w;
		//TODO position width 0 width tracking left/right
	}
	essential.declare("openWindow",openWindow);

}();

// need with context not supported in strict mode
Resolver("essential")("ApplicationConfig").prototype._gather = function() {
	var resources = this.resources();
	var inits = this.inits();

	var scripts = document.getElementsByTagName("script");
	for(var i=0,s; s = scripts[i]; ++i) {
		switch(s.getAttribute("type")) {
			case "application/config":
				try {
					with(this) eval(s.text);
				} catch(ex) {
					Resolver("essential")("console").error("Failed to parse application/config",s.text);
				}
				break;
			case "application/init": 
				inits.push(s);
				break;
			default:
				var name = s.getAttribute("name");
				if (name && s.getAttribute("src") == null) this.modules[name] = true; 
				//TODO onload if src to flag that module is loaded
				if (s.parentNode == document.head) {
					resources.push(s);
				}
				break;
		}
	}
};
