var Request = require("../index.js")
var expect = require("chai").expect;
var assert = require('assert')
var sinon = require('sinon');
var Promise = require("bluebird")

describe("Request",function(){
	var cpuCount = require("os").cpus().length
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
})