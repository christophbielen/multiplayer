var socket = io();

//login

var loginButton = document.getElementById("loginButton");
var signupButton = document.getElementById("signupButton");
var usernameInput = document.getElementById("usernameInput");
var passwordInput = document.getElementById("passwordInput");
var loginDiv = document.getElementById("loginDiv");

loginButton.onclick = function(){
	socket.emit('login', {username:usernameInput.value, password:passwordInput.value});
}

socket.on('loginResponse', function(data){
	if(data.success){
		loginDiv.style.display = "none";
	} else {
		alert("Login failed");
	}
});

//game
var welcomeDiv = document.getElementById("welcomeDiv");
var loginForm = document.getElementById("loginForm");
var usernameInput = document.getElementById("usernameInput");
var passwordInput = document.getElementById("passwordInput");
var chatText = document.getElementById("chatText");
var chatForm = document.getElementById("chatForm");
var chatInput = document.getElementById("chatInput");

socket.on('addToChat', function(data) {
	chatText.innerHTML += ("<div class='name'>"+data.name+"</div><div class='chatmsg'>"+data.msg+"</div>");
	chatText.scrollTop = chatText.scrollHeight;
});

chatForm.onsubmit = function(e){
	e.preventDefault();
	socket.emit('chatMsg', chatInput.value);
	chatInput.value ="";
}

socket.on('changeName', function(data){
	welcomeDiv.innerHTML = "<p class='title'>Welcome "+data+"</p>";
});

loginForm.onsubmit = function(e){
	e.preventDefault();
	

};