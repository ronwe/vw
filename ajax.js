( function(window , undefined){
	var jsonp_callId = new Date

	var cache = (function (){
		var storage = window.localStorage
			,session = window.sessionStorage
			,setTimeout = window.setTimeout
			,clearTimeout = window.clearTimeout
		var delay_ttl = 1000
			,domStoreId = 'cache'

		var _local = {}
			,_session = {}
			,_cache = {}
		
		;(function (){
			var local = storage.getItem(domStoreId)
			if (local) _local =  JSON.parse(local) 
			var sess = session.getItem(domStoreId)
			if (sess) _session =  JSON.parse(sess) 
			}) 

		var delay_store
		return {
			/*
			type : persist | session | page,default is persist
			*/
			set : function(name , value , type){
				var domStore = ({'persist' : storage , 'session' : session ,'page': 'none'})[type] || storage	
					,domCache = ({'persist' : _local , 'session' : _session , 'page' : _cache })[type] || _local	

				domCache[name] = value
				if ('none' != domStore) {
					
					if (delay_store) clearTimeout(delay_store) 
					delay_store = setTimeout(function(){
						domStore.setItem(domStoreId , JSON.stringify(domCache)) 
						delay_store = null	
						} , delay_ttl)
					
					}
				}
			,get : function(name){
				return  _cache[name] || _session[name] || _local[name]
				}
			}
	})()


	function newXHR(){
			return new window.XMLHttpRequest()
			}
	function http_build_query(params){
			var qs = [];
			for (var k in params)
				qs.push(encodeURIComponent(k) + '=' + encodeURIComponent( params[k] ));
			return qs.join('&')
			}
	/*
	*url string
	*data object  optional
	*callback function
	*method string get|post|jsonp
	*data_type string text|json|head
	*options object timeout|nocache
	*/
	function ajax(options){
		var method = (options.method || 'GET').toUpperCase(),
			async = (undefined == typeof options.async) ? true : options.async,
			onError = options.onerror,
			callBack = options.callback,
			data_type = (options.data_type || 'text').toUpperCase(),
			headers = options.headers || [],
			data = options.data || null

		function _appendUrl(url , append){
			return (url.indexOf('?')<0? '?':'&') + append
			}	
		if (data) {
			data = http_build_query(data)
			if ('POST' != method ) options.url += _appendUrl(options.url , data)
			}

		if (options.cacheAble && 'POST' != method && cache.get(options.url) ){
			callBack(cache.get(options.url) )
			callBack = function(ret){
				cache.set(options.url , ret , options.cacheAble)
				}

			}

		if ('JSONP' == method || 'SCRIPT' == method){
			var l = document.createElement('script')
			l.type = 'text/javascript'
			l.onerror = l.onload = l.onreadystatechange = function() {
					var state = this.readyState
					if (!state || 'loaded' == state || 'complete' == state) 
						head.removeChild(l)
				}
			if (callBack) {
				var callBackId = '_' + jsonp_callId++

				options.url += _appendUrl(options.url , '_callback='+callBackId)
				
				window[callBackId] = function(){
					callBack.apply(null ,arguments);
					//delete window[callBackId]
					}
				}

			var head = document.head  || document.getElementsByTagName('head')[0] || document.documentElement
			l.src = options.url
			head.appendChild(l)
			return
			}

		var xhr = new newXHR
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200) {
				if (callBack) {
					if ('HEAD' == data_type) {
						var headers = xhr.getAllResponseHeaders().split("\n")
						var result = {}
						var i = 0;
						headers.forEach(function(head){
							head = head.split(':')
							var h_k = head[0].trim() ,
								h_v = head[1]; 
							if (! h_k ) return
							result[h_k] = h_v.trim()
							})
					}else {
						var result = xhr.responseText
						if ('JSON' == data_type) result = JSON.parse(result)
					}
					callBack(result)
				}
			}else if(onError)
				onError(res);
				
			}  
		
		if ('POST' == method ) 
			headers["Content-Type"] = "application/x-www-form-urlencoded"
		else
			data = null

		xhr.open(method, options.url, async)  
		options.headers && option.headers.forEach( function(head_content , head_key){
				 xhr.setRequestHeader(head_key , head_content)   
				})
		xhr.send(data)  

		if (options.timeout) {
			window.setTimeout(function(){
				xhr.abort()
				onError && onError(false)
				} , options.timeout)
			}
		}	
		

	function wrapAjax(method , args){
		var args = Array.prototype.slice.call( args , 0)
				
		if ('function' == typeof args[1]) args.splice(1 , 0 , null)

		ajax({ 'url' : args[0] ,
			   'data' :  args[1] ,
			   'callback' : args[2] ,
			   'method' : method , 
			   'cacheAble' : args[4] || true ,
			   'data_type' : args[3]})	
		
		}
	ajax.post = function(url , data ,callback ,response_type){
		wrapAjax('post' , arguments)
		}
	ajax.get = function(){
		wrapAjax('get' , arguments)
		}
	ajax.jsonp = function(){
		wrapAjax('jsonp' , arguments)
		}
	ajax.script = function(){
		wrapAjax('script' , arguments)
		}

	window.ajax =  ajax
	
	})(this )
