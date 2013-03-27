/*tpl engine*/
(function(window , undefined){
    var cache = {};
    var etic = window.etic = function (str, data){
		str = str.trim()
        if (!cache[str] ){
			var template = document.getElementById(str)
			if (!template) throw 'tpl:' + str + ' is not load' 
            var tpl = template.innerHTML
			template.parentNode.removeChild(template)
	
			var fCon = 'var p = [];function __require(id){ \
					return function(data){ return etic(id).apply(data,arguments);} \
				};function __append(h){return p.push(h)}'	
		
			while (true){		
				var pst = tpl.indexOf('<?')
				if (pst < 0) {
					fCon += "p.push('"+ tpl.replace(/[\r\t\n]/g, " ") +"');return p.join('');"
					break
					}
					var pend = tpl.indexOf('?>' ,pst)
					var preHtml = tpl.substr(0,pst)
									.replace(/[\r\t\n]/g, " ")
					var scCon = tpl.substring(pst+2 , pend)
					tpl = tpl.substr(pend+2)
					if (scCon.length){
						var symbol = scCon.charAt(0)
						scCon = scCon.substr(1)
								     .replace(/\n/g,';')
						switch (symbol){ 
							case '=':
								scCon = ";p.push("+ scCon +");"
								break
							case '#':
								scCon = ";__append(etic('"+ scCon  +"').apply(this));"
								break
							case '*':
								scCon = ''
								break
						}
					}

					fCon += "p.push('"+ preHtml +"');" + scCon
					}
			cache[str] =  new Function('',fCon)
        }
    return data ?  cache[str].apply(data) : cache[str] 
 }
})(this)

