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
## How does it works?

Multi Process Request initially spawn 2 * CPU core count of the host. For each API invocation, parameters that passed to API will be sent to a child process based on round-robin technique. Multi Process Request support request.js parameter, but still untested for file handling.


