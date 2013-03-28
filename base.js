var AP = Array.prototype

function $(path){
	return  AP.slice.call(document.querySelectorAll(path) )
	}


(function(window , undefined){
	var evtStack = {}
		,uuid = 0

	function judgeRule(rule , element ){
        if (!element) return false
        var secs = rule.replace(/([\#\.\[])/g , '|$1').split('|')
        var ret = true
        secs.forEach(function(sec){
            if ('' == sec) return
            switch (sec.charAt(0)){
                case '#':
                    if (element.id != sec.substr(1) ) return ret = false
                    break
                case '.':
                    if (-1 == element.className.indexOf(sec.substr(1))) return ret = false
                    break
                case '[':
                    sec = sec.substr(1, sec.length-2).split('=')
                    var attr = element.getAttribute(sec[0])
                    if (null == attr) return ret = false
                    if (sec[1] && attr!= sec[1]) return ret = false
                    break
                default:
                    if (element.tagName != sec.toUpperCase()) return ret = false
                }

            })

        return ret
    }

	function vw(containerId , tplId , data){
		this.container = document.getElementById(containerId)
		this.tpl = tplId
		this.data = null

		this.orginContent = this.container.innerHTML
		this.container.uuid = uuid++

		data && this.setData(data)
		}	
	vw.prototype = {
		constructor : vw
		,setData : function(data){
			this.data = data
			this.update()
			return this
		}
		,update :function(){
			this.container.innerHTML = etic(this.tpl , this.data)  
			return this
		}
		,reset : function(){
			this.container.innerHTML = this.orginContent
			return this
			}
		,getEle :function(){
			return this.container
			}
		,disable : function(idle){
			this.container.idle = idle 
			
			return this
			}
		,off: function (type , elemExp ,cbk){
			var uuid = this.container.uuid
			try{
				if (cbk){ 
					var fn = evtStack[uuid][type][elemExp][cbk]
					this.container.removeEventListener(type , fn , false)
				}else{
					if (!type)
						delete evtStack[uuid]
					else if (!elemExp)
						delete evtStack[uuid][type]
					else
						delete evtStack[uuid][type][elemExp]
				}
			}catch(e){}
			return this
			} 
		,on : function(type , elemExp  ,   cbk){
			var uuid = this.container.uuid
			var stack = evtStack[uuid]
			if (!stack) stack = evtStack[uuid] = {}
			if (!stack[type]) stack = stack[type] = {}
			if (!stack[elemExp]) stack = stack[elemExp] = {} 
			if (!stack[cbk]) stack = stack[cbk] = function(e){
				if (this.idle) return
				if (! (evtStack[uuid] && evtStack[uuid][type] && evtStack[uuid][type][elemExp]) )  return
				if (judgeRule(elemExp , e.target) )
					cbk.call(e.target , e)
				}

			this.container.addEventListener(type , stack, false)
			return this
			}
		}
	window.vw = function(containerId , tplId , data){
		return  new vw(containerId , tplId , data)

		}

})(this)
