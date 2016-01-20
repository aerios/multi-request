var ThrottleEngine = require("throttle-exec");
var underscore = require("underscore")
var MyProcess = require('mprocess');
var Promise = require("bluebird")
var uuidLength = 10;
var maxProcessCount = require("os").cpus().length;
var uuidSeed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
var Engine = {};
var Mailbox = {};
var ProcessList = [];
var currentProcess = 0;
var activeProcess = 0;
var cpuLoad = 2;
var processCount = 0;

// mailbox functionality

function upProcess(){
	activeProcess += 1
}

function downProcess(){
	activeProcess -= 1
}

function generateUUID(){
	var str = "";
	for(var i = 0;i<uuidLength;i++){
		str += uuidSeed.charAt(Math.random() * (uuidSeed.length-1));
	}
	return str;
}


function createMessage(data){
	return {
		id:generateUUID(),
		message:data
	}
}

function putMailbox(promise,resolver,rejecter,letter){
	var id = letter.id;
	Mailbox[id] = {
		promise:promise,
		resolver:resolver,
		rejecter:rejecter,
		letter:letter
	}
}

function processReply(err,letter){
	var id = letter.id;
	var data = letter.message;
	var isError = letter.is_error;
	var record = Mailbox[id];	
	if(Mailbox[id]){
		if(!err && !isError){
			record.resolver(data)	
		}else{
			record.rejecter(err || new Error(data));
		}		
		Mailbox[id] = null;
		record = null;
	}
	downProcess();
}

// end mailbox functionality


function createProcess(procIndex){
	var proc = new MyProcess("node",[__dirname+"/Worker.js"],MyProcess.FORK);	
	proc.run();
	proc.getProcess().on("message",function(letter){
		processReply(null,letter);
	})
	ProcessList[procIndex] = proc;
	proc.done(function(){
		createProcess(procIndex);
	})
	return proc;
}

function sendLetter(letter){	
	var proc = ProcessList[currentProcess];
	proc.getProcess().send(letter);
	currentProcess += 1;
	if(currentProcess >= ProcessList.length){
		currentProcess = 0;
	}
}

function init(){
	for(var i = 0;i< maxProcessCount * cpuLoad;i++){
		(function(procIndex){
			var proc = createProcess(procIndex);			
		})(i)		
	}
}

function spawn(){
	createProcess(processCount);
	processCount += 1;
}

function throttledSpawn(){
	console.log(activeProcess,processCount,cpuLoad,maxProcessCount)
	if(activeProcess >= (processCount) && processCount < maxProcessCount){
		spawn();
	}
}

function doRequest(){
	upProcess();
	var rawData = underscore.toArray(arguments);
	//strip any function from data
	data = underscore.filter(rawData,function(i){
		return typeof i != "function";
	})
	var baseFunc = underscore.filter(rawData,function(i){
		return typeof i == "function"
	})[0]
	var letter = createMessage(data);
	var id = letter.id;
	var pr = new Promise(function(resolve,reject){
		putMailbox(pr,resolve,reject,letter);
		sendLetter(letter);
	})
	var idTimeout = setTimeout(function(){
		processReply(new Error("Timeout detected"),letter);
	},120000)
	if(baseFunc){
		pr.then(function(r){
			baseFunc(null,r.response,r.body)
			return r;
		}).catch(function(reason){
			baseFunc(reason);
		})
	}
	throttledSpawn()
	return pr
}

function getProcessCount(){
	return ProcessList.length;
}

Engine = doRequest
Engine.getWorkerCount = getProcessCount;
init()
module.exports = Engine;