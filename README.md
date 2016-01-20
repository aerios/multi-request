# Multi Process Request

A request.js (https://www.npmjs.com/package/request) wrapper that support multi process request.

## Installation

`$ npm install multi-request`

## Usage

Just `require` the module like this:
`var MRequest = require("multi-request")`

### Callback style
```javascript
MRequest("http://google.com",function(err,response,body){
	// do something
})
```
### Promise style
```javascript
MRequest("http://google.com").then(function(result){
	var response = result.response;
	var body = result.body;
}).catch(console.error)
```

## Manage Worker usage

By default, `multi-request` will spawn maximum `cpuLoad` * `cpuCount`. You can change `cpuLoad` by calling `.changeCpuLoad(num)`. For example :

```javascript
MRequest.changeCpuLoad(3)
```

will set maximum Worker count to `3` * `cpuCount`. Please be alerted that currently `multi-request` only support expanding maximum worker count. If you try to call `changeCpuLoad` with parameter less than any subsequent call, it will not resulted in decreased running Worker. This feature is planned for future release.

## How does it works?

`multi-request` initially spawn 1 Worker. As the request grows, multi-request will try `spawn` new Worker until maximum worker count is reached.
For each API invocation, parameters that passed to API will be sent to a child process based on round-robin technique. Multi Process Request support request.js parameter, but still untested for file handling.

## GitHub

https://github.com/aerios/multi-request
