var AP = Array.prototype

function $(path){
	return  AP.slice.call(document.querySelectorAll(path) )
	}


(function(window , undefined){


	function vw(containerId , tplId , data){
		this.container = document.getElementById(containerId)
		this.tpl = tplId
		this.data = null
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
		,bind :function(elemExp , type ,   cbk){

			
			
			}
		}
	window.vw = function(containerId , tplId , data){
		return  new vw(containerId , tplId , data)

		}

})(this)
