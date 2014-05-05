module.exports = function(req, res){
    res.render('index', {roomName: req.params.roomName });
};