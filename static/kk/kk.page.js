


(function(kk){

	kk.Page = function(){};

	kk.Page.prototype = new kk.Object();

	kk.Page.prototype.init = function() {
		this.routes = [];
		this.changes = [];
		return this;
	};

	kk.Page.prototype.onchange = function(pattern,fn) {
		this.changes.push({ pattern : pattern, fn : fn });
	};

	kk.Page.prototype.on = function(pattern,fn) {
		this.routes.push({ pattern : pattern, fn : fn });
	};

	kk.Page.prototype.onview = function(pattern,options) {
			
		var view;

		this.on(pattern,function(){

			var page = this;
			var container = options.container || document.body;
			
			$(container).load(options.url,function(){

				view = kk.view(this);

				if( typeof options.onload == 'function') {
					options.onload.call(page,view,options)
				}

			});

		});

	};

	kk.Page.prototype.hashchange = function(hash) {

		var page = this;

		page.path = "/";
		page.query = "";
		page.queryValue = {};

		hash.replace(/#(\/[^?]*)(.*)/i,function(text,path,query){
			page.path = path;
			page.query = query;
			query.replace(/([^=&?]*)=([^=&?]*)/i,function(text,key,value){
				page.queryValue[key] = unescape(value);
			});
		});

		for( var i in page.changes ) {
			var v = page.changes[i];
			if(v.pattern === undefined 
				|| (v.pattern instanceof RegExp && v.pattern.test(page.path)) 
				|| (typeof v.pattern == "string" && page.path.startsWith(v.pattern))) {
				v.fn.apply(page)
			}
		}

		for( var i in page.routes ) {
			var v = page.routes[i];
			if(v.pattern === undefined 
				|| (v.pattern instanceof RegExp && v.pattern.test(page.path)) 
				|| (typeof v.pattern == "string" && page.path.startsWith(v.pattern))) {
				v.fn.apply(page)
				break
			}
		}

	};

	kk.Page.queryString = function(queryValue) {

		var query = [];

		if(typeof queryValue == "object") {
			for(var key in queryValue) {
				query.push(key + "=" + escape(queryValue[key]));
			}
		}

		if(query.length > 0) {
			return "?" + query.join("&");
		}

		return "";
	};

	var page

	kk.page = function() {

		if( page === undefined ) {

			page = (new kk.Page()).init()

			var hashchange = function(){
				page.hashchange(window.location.hash);
			};

			$(window).on("hashchange",hashchange);

			$(hashchange)
		}

		return page;
	};

})(kk);

