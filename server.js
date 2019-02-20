var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client') );

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";
	
app.listen(port, ip);

var SOCKET_LIST = {};

var USERS = {
	//"username":"password"
	"Admin":"adminpas",

};

var isValidPassword = function(data){
	return USERS[data.username] === data.password;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	var self = socket;
	socket.id = Math.random();
	socket.name = "Guest";
	
	SOCKET_LIST[socket.id] = socket;
	
	socket.emit('changeName', socket.name);
	
	socket.on('chatMsg', function(data){
		var playerName = socket.name;
		data = data.replace(/<(?:.|\n)*?>/gm, ''); 
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat', {name:playerName, msg:data,});
		}
	});
	
	socket.on('login', function(data){
		data.username = data.username.replace(/<(?:.|\n)*?>/gm, '');
		data.password = data.password.replace(/<(?:.|\n)*?>/gm, '');
		if(isValidPassword(data)){
			socket.name = data.username;
			socket.emit('changeName', socket.name);
			socket.emit('loginResponse', {success:true});
		}else{
			socket.emit('loginResponse', {success:false});
		}
	});
	
	
});