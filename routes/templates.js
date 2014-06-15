var url = require('url');
var bowser = require('bowser');

exports.index = function(req, res){
	res.locals.path = req.path;
	//res.locals.isChrome = bowser.chrome;
	//res.locals.isChrome = req.headers['user-agent']
	//res.locals.isChrome = /Chrome/.test( req.headers['user-agent'] );
    res.render('index');
};
exports.room = function(req, res){
	res.locals.path = req.path;
    res.render('room', {roomName: req.params.roomName,  domain: req.get('host')});
};

exports.setRoomName = function(req, res, next){
    var roomName = req.body.roomName;
	res.redirect('/room/'+roomName);
};