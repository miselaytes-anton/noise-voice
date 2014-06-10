var url = require('url');
exports.index = function(req, res){
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

exports.about = function(req, res, next){
    res.render('about');
};