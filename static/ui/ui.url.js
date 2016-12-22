

(function(ui){
	
	ui.url = {
			
		url : function(uri) {
			
			var url = window.location.href;
			
			var i = url.indexOf("://");
			
			if(i >=0) {
				
				var ii = url.indexOf("/",i + 3);
				
				if(ii >=0){
					return url.substr(0,ii) + uri;
				}
				
				return url + uri;
			}
			
			return uri;
		} ,
		
		query : function(url) {
			
			if(url === undefined){
				url = window.location.href;
			}
			
			var i = url.indexOf("?");
			
			if(i >=0) {
				var v = url.substr(i + 1);
				i = v.indexOf("#");
				if(i >= 0) {
					return v.substr(0,i);
				}
				return v;
			}
			
			return "";
		} ,
		
		queryValue : function(key,url) {
			
			if(url === undefined){
				url = window.location.href;
			}
			
			var query = ui.url.query(url);
			
			var k = key + "=";
			
			var i = query.indexOf(k);
			
			if(i >=0) {
				
				var ei = query.indexOf("&",i + k.length);
				
				if(ei >= 0){
					return decodeURIComponent(query.substr(i + k.length, ei - i - k.length));
				}
				else {
					return decodeURIComponent(query.substr(i + k.length));
				}
			}
		
		} ,
		
		queryObject : function(url) {
			var object = {};
			var query = ui.url.query(url);
			if(query) {
				var items = query.split("&");
				for(var i in items) {
					var item = items[i];
					var vs = item.split("=");
					object[vs[0]] = vs.length > 1 ? decodeURIComponent(vs[1]) : "";
				}
			}
 			return object;
		} ,
		
		queryString : function(object) {
			
			var v = [];
			
			for(var key in object) {
				
				var vv = object[key];
				
				if(vv) {
					v.push(key + "=" + encodeURIComponent(vv));
				}
				
				
			}
			
			return v.join('&');
			
		}
			
	};
	
	
})(ui);
