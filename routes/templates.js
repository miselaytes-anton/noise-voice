exports.index = function(req, res){
    res.render('index');
};
exports.room = function(req, res){
    res.render('room', {roomName: req.params.roomName,  domain: req.get('host')});
};

exports.setRoomName = function(req, res, next){
    var roomName = req.body.roomName;
	res.redirect('/'+roomName);
};