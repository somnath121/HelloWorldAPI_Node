//Dependencies

var http = require('http');
var url = require('url');
var decoder = require('string_decoder').StringDecoder;
var https = require('https');
var config = require('./config');
var fs = require('fs');
//Instantiate http server
var httpserver = http.createServer((req,res)=>{
  unifiedServer(req,res);

});

//Start the http server
httpserver.listen(config.httpPort,()=>{
  console.log("The server is listening on port : " + config.httpPort + " on the environment : " + config.envName);
});

//Instantiate https server
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
}
var httpsServer = https.createServer(httpsServerOptions,(req,res)=>{
  unifiedServer(req,res);
});

//Start the https server
httpsServer.listen(config.httpsPort,()=>{
  console.log("The server is listening on port : " + config.httpsPort + " on the environment : " + config.envName);
});


//Define handlers
var handlers = {};

//Sample handler
handlers.hello = (data,callback)=>{
  //Callback an http status code and a paylaod object
  console.log('200');
  callback(200,{'msg':'Hello! Welcome to my world.'});
};
//Ping handler
handlers.ping = (data,callback)=>{
  callback(200);
}
//Not found handler
handlers.notFound = (data,callback)=>{
  callback(404);
};
//Define a request router
var router = {
  'hello' : handlers.hello,
  'ping' : handlers.ping
};


//All the server logic for both http and https server
var unifiedServer = (req,res)=>{
  //Get the url and parse it
  var parsedUrl = url.parse(req.url,true);

  //Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');

  //Get the query string as an object
  var queryString = parsedUrl.query;

  //Get the http method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  //Get the payload if any
  var strDecoder = new decoder('utf-8');
  var buffer = '';
  req.on('data',(data)=>{
    buffer += strDecoder.write(data);
  })

  req.on('end',()=>{
    buffer += strDecoder.end();
    //Choose the handler based on request,if not found send to notFound handler
    console.log(router[trimmedPath]);
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined'? router[trimmedPath] : handlers.notFound;
    //Construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryString' : queryString,
      'headers' : headers,
      'method' : method,
      'payload' : buffer
    };
    //Route the request to the handler to the specified router
    chosenHandler(data,(statusCode,payload)=>{
      //Use the status code sent by the callback or default to the statuscode here
        statusCode = typeof(statusCode)=='number' ? statusCode : 200;

      //Use the payload sent by the handler of send an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      //Convert the payload to a string
      var payloadString = JSON.stringify(payload);
      //Return the response
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('Returning the response: ',statusCode,payloadString);

    });
    // //Send the response
    // res.end('Hello World!\n');
    //Log the request path
    console.log('Request is received in path : '+ trimmedPath + ' with method: '+ method + ' with the query string parameters: ' + JSON.stringify(queryString, null, 4) + ' with headers: ' + JSON.stringify(headers, null, 4) + ' with payload: *************    ' + buffer);
  });
};
