var ThrottleEngine = require("throttle-exec")
var Promise = require("bluebird")
var Request = require("request")
var underscore = require("underscore")

var ThrottleInstance = new ThrottleEngine(4)
var Engine = function(param){
	return ThrottleInstance.registerAction("request",[param])
}

function createRequest(){
	var baseArgs = underscore.toArray(arguments)
	return new Promise(function(resolve,reject){		
		var args = baseArgs.concat(function(err,response,body){
			if(!err){
				resolve({
					response:response,
					body:body
				})
			}else{
				reject(new Error(err))
			}
		})
		Request.apply(null,args)
	})
}
ThrottleInstance.registerFunction("request",createRequest)
module.exports = Engine;

process.on("message",function(letter){
	var id = letter.id;
	var data = letter.message;
	try{
		createRequest.apply(null,data).then(function(result){
			process.send({
				id:id,
				message:result
			})
		}).catch(function(err){
			if(err.message == "channel closed"){
				process.exit();
			}else{
				process.send({
					id:id,
					message:err.toString(),
					is_error:true
				})	
			}
			
		})	
	}catch(e){
		process.exit();
	}
	
})