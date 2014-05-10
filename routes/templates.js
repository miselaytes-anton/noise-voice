exports.index = function(req, res){
    res.render('index');
};
exports.room = function(req, res){
    res.render('room', {roomName: req.params.roomName });
};

exports.setRoomName = function(req, res, next){
    var roomName = req.body.roomName;
	res.redirect('/'+roomName);
};