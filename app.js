var mongojs = require("mongojs");
var db = mongojs('localhost:27017/multiplayer', ['accounts']);

const bcrypt = require('bcrypt');

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log('Server started');

var SOCKET_LIST = {};

// functions

// login functions
var isValidPassword = function(data, cb){
	db.accounts.findOne({login:data.username}, function(err, res){
		if(res!=null){
			if (res){
				bcrypt.compare(data.password, res.password, function(err, result) {
					if(result){
						cb({success:true, reason:"success"});
					}else {
						cb({success:false, reason:"Not a valid password."});
					}
				});
			}else {
				cb({success:false, reason:"User does not exist"});
			}
		}else {
			cb({success:false, reason:"User does not exist"});
		}
	});
}

//signup functions
var isUsernameTaken = function(data, cb){
	db.accounts.find({login:data.username}, function(err, res){
		if(res.length > 0){
			cb(true);
		}else {
			cb(false);
		}
	});
}

var addUser = function(data, cb){
	
	bcrypt.hash(data.password, 10, function(err, hash) {
		// Store hash in database
		db.accounts.insert({login:data.username, password:hash}, function(err){
			cb();
		});
	});
}	
		


//IO
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = (new Date().valueOf()*10000) + Math.round(Math.random()*10000);
	
	SOCKET_LIST[socket.id] = socket;
		
	
	// Login attempt
	socket.on('signIn', function(data){
		var t = true;
		for (var i in SOCKET_LIST){
			var socket = SOCKET_LIST[i];
			if (socket.name == data.username){
				t=false;
			}
		}
		if (t){
			isValidPassword(data, function(res){
				if(res.success){
					socket.emit('signInResponse', {success:true, username:data.username});
					socket.name = data.username;
				}else{
					socket.emit('signInResponse', {success:false, reason:res.reason});
				}
			});	
		} else {
			socket.emit('signInResponse', {success:false, reason:"User is already logged in"});
		}
	});
	
	//Signup attempt
	socket.on('signUp', function(data){
		isUsernameTaken(data, function(res){	
			if(res){
				socket.emit('signUpResponse', {success:false});
			}else{
				addUser(data, function(){
					socket.emit('signUpResponse', {success:true});
				});
			}
		});
		
	});
	
	
	//chat
	socket.on('chatMsg',function(data){
		var chattext = data.chattext;
		var textToSend = "";
		
		if(chattext.indexOf(this.name + ": ")==0){
			textToSend = chattext.slice(this.name.length+2);
		} else {
			textToSend = chattext;
		}
		
		for (var i in SOCKET_LIST){
			var socketsend = SOCKET_LIST[i];
			socketsend.emit('chatMsg', {sendname:this.name, chattext:textToSend, socketname: socketsend.name});
		}
	});
	
	//disconnect
	socket.on('disconnect', function () {
		delete SOCKET_LIST[socket.id];
    });
	
});