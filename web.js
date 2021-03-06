var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

// Read the content from the file
var readContent = fs.readFileSync('index.html');

// Convert the buffer into a string
var readStr = readContent.toString('utf-8');

app.get('/', function(request, response) {
  response.send(readStr);
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
