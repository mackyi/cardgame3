var http = require('http'), url = require('url'), fs = require('fs'); path = require('path');

// setup the static files that you serve
var index = fs.readFileSync('index.html', 'utf-8');
var css = fs.readFileSync('bootstrap/css/bootstrap.min.css', 'utf-8');



// the setup for the app
var app = http.createServer();

app.on('request', function (request, response) {
	var parsedRequest = {
		method: request.method,
		url: url.parse(request.url, true)
	};
	console.log(parsedRequest.url);
	if (routes[parsedRequest.method][parsedRequest.url.pathname]) {
		routes[parsedRequest.method][parsedRequest.url.pathname](parsedRequest, response);
	} 
	
	// dynamic 

	var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';
   	var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
		response.statusCode = 404;

		response.writeHead({
			"Content-Type": "text/plain"
		});
		response.end("page not found");
	    }
    });
	}
);

// the routes of the app
var routes = {
	GET: {
		'/': function(request, response) {
			response.statusCode = 200;
			response.writeHead({
				"Content-Type": "text/html"
			});

			response.end(index);
		},
		'/bootstrap/css/bootstrap.min.css': function(request, response) {
			response.statusCode = 200;
			response.writeHead({
				"Content-Type": "text/css"
			});

			response.end(css);
		},
		'/user': function(request, response) {
			response.statusCode = 200;
			response.writeHead({
				"Content-Type": "application/json"
			});

			response.end(JSON.stringify({
				name: 'Kirill Klimuk',
				birthday: new Date("1991-05-24")
			}));
		}
	}
};

app.listen(1337);


// WEBSOCKET

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;

/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: app
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
                console.log((new Date()) + ' User is known as: ' + userName
                            + ' with ' + userColor + ' color.');

            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);
                
                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(message.utf8Data),
                    author: userName,
                    color: userColor
                };
                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type:'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});