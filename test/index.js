var Request = require("../index.js")
var expect = require("chai").expect;
var assert = require('assert')
var sinon = require('sinon');
var Promise = require("bluebird")

describe("Request",function(){
	var cpuCount = require("os").cpus().length;
	var cpuLoad = 1;
	it("should be able to change cpuLoad to 1",function(){
		Request.changeCpuLoad(1);
		expect(Request.getCpuLoad()).to.be.equal(cpuLoad)
	})

	it("should be able to retrieve google.com",function(done){
		Request("http://google.com").then(function(result){
			var response = result.response;
			var body = result.body;
			expect(body).to.be.ok
			done()
		}).catch(done)
	})
	it("should be able to retrieve google.com, callback style",function(done){
		Request("http://google.com",function(err,response,body){
			expect(err).to.be.not.ok
			expect(body).to.be.ok
			done()
		})
	})



	it("should able to control Worker count",function(){
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		expect(Request.getWorkerCount()).to.be.below((cpuCount * cpuLoad)+1);
	})

	it("Worker count should not exceed 8",function(){
		cpuLoad = 2
		Request.changeCpuLoad(cpuLoad);
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		Request("http://google.com")
		expect(Request.getWorkerCount()).to.be.below(cpuCount * cpuLoad);
		expect(Request.getWorkerCount()).to.be.at.least(cpuCount + 1);
	})
})