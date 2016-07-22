var ThrottleEngine = require("throttle-exec");
var underscore = require("underscore")
var MyProcess = require('mprocess');
var Promise = require("when/es6-shim/Promise")
var uuidLength = 10;
var MaxProcessCount = require("os").cpus().length * 2;
var uuidSeed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
var Engine = {};
var MailboxCount = {};
var ProcessList = [];
var currentProcess = 0;
var outstandingRequest = 0

function getSmallestMailboxCount(){
	var sorted = underscore.sortBy(MailboxCount,function(val){
		return val.count
	})
	return sorted[0].id;
}

function upMailBoxCount(id){
	MailboxCount[id].count = MailboxCount[id].count + 1
	outstandingRequest += 1
}

function downMailboxCount(id){
	if(MailboxCount[id]){
		MailboxCount[id].count = MailboxCount[id].count - 1
		outstandingRequest -= 1
	}
}

function createProcess(procIndex){
	MailboxCount[procIndex] = {id:procIndex,count:0};
	var proc = new MyProcess("node",[__dirname+"/Worker.js"],MyProcess.FORK);	
	proc.run();	
	proc.done(function(){
		createProcess(procIndex);
	})
	ProcessList[procIndex] = proc
	return proc;
}

function init(){
	for(var i = 0;i< MailboxCount;i++){
		(function(procIndex){			
			var proc = createProcess(procIndex);			
		})(i)		
	}
}

function tryToSpawnWorker(){
	if(getProcessCount() < MaxProcessCount && outstandingRequest >= underscore.size(MailboxCount)){
		createProcess(underscore.size(MailboxCount))
	}
}

function doRequest(){		
	tryToSpawnWorker()
	var currentProcess = getSmallestMailboxCount()
	upMailBoxCount(currentProcess)
	var proc = ProcessList[currentProcess];
	var data = underscore.toArray(arguments);	
	// console.log("Worker no",currentProcess,"is selected!")
	var pr = proc.send(data).then(function(result){
		downMailboxCount(currentProcess)
		return result;
	}).catch(function(reason){
		downMailboxCount(currentProcess)
		return reason;
	})
	return pr
}

function getProcessCount(){
	return ProcessList.length;
}
Engine = doRequest
Engine.getWorkerCount = getProcessCount;
module.exports = Engine;