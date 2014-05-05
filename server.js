var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var server = app.listen(process.env.PORT || 5000);
var io = require('socket.io').listen(server);
var index = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//router
/*
app.get('/:roomName', function(req, res){
  app.locals.roomName = req.params.roomName;
});


router.use(function(req, res, next) {
	app.locals.roomName = req.params.roomName;
	//res.send('bar');
	next();
});
router.use(express.static(__dirname + '/public'));

app.use('/bar', router);
*/

app.use(express.static(__dirname + '/public'));

//routes
app.get('/', index);
app.get('/:roomName', index);

io.sockets.on('connection', function (socket){
  // convenience function to log server messages on the client
	function log(){
		var array = [">>> Message from server: "];
	  for (var i = 0; i < arguments.length; i++) {
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message:', message);
    // for a real app, would be room only (not broadcast)
		socket.broadcast.emit('message', message);
	});

	socket.on('create or join', function (room) {
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room ' + room);

		if (numClients === 0){
			socket.join(room);
			socket.emit('created', room);
		} else if (numClients === 1) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		} else { // max two clients
			socket.emit('full', room);
		}
		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	});

});