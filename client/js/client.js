var socket = io();
var myUsername = "";

// LOGIN 
//Login Div variables
var signContainerDiv = $('#signContainerDiv');
var signDiv = $('#signDiv');
var signDivUsername = $('#signDivUsername');
var signDivPassword = $('#signDivPassword');
var signDivSignInButton = $('#signDivSignInButton');
var signDivSignUpButton = $('#signDivSignUpButton');

// Chat Divs
var chatDiv = $('#chatDiv');
var chatTextDiv = $('#chatTextDiv');
var chatInputDiv = $('#chatInputDiv');
var chatInput = $('#chatInput');

chatDiv.hide();

//Game div
var gameContainer = $('#game-container');


//Login attempt 
signDivUsername.on('keypress', function (e) {
         if(e.which === 13){

            //Disable textbox to prevent multiple submit
            $(this).attr("disabled", "disabled");

            signDivPassword.focus();
			
            //Enable the textbox again if needed.
            $(this).removeAttr("disabled");
         }
   });
 
signDivPassword.on('keypress', function (e) {
         if(e.which === 13){

            //Disable textbox to prevent multiple submit
            $(this).attr("disabled", "disabled");

            signDivSignInButton.click();
			
            //Enable the textbox again if needed.
            $(this).removeAttr("disabled");
         }
}); 
   
signDivSignInButton.click(function(){
	socket.emit('signIn', {username:signDivUsername.val(), password:signDivPassword.val()});
});

//Login response
socket.on('signInResponse', function(data){
	if(data.success){
		signContainerDiv.hide();
		signDiv.fadeOut();
		chatDiv.css("visibility","visible");
		chatDiv.fadeIn();
		chatInput.val(data.username + ": ");
		chatInput.focus();
		chatInput.attr('maxlength',data.username.length + 82);
		chatTextDiv.append("Welcome to CBQuest!</br>");
		gameContainer.fadeIn();
	}else{
		alert("Sign In Failed: " + data.reason);
	}
});

//Signup attempt
signDivSignUpButton.click(function(){
	socket.emit('signUp', {username:signDivUsername.val(), password:signDivPassword.val()});
});

//Signup response
socket.on('signUpResponse', function(data){
	if(data.success){
		alert("Sign Up successful, you can sign in now.");
	}else{
		alert("Sign Up Failed. Username exists already.");
	}
});


//CHAT
chatInput.on('keypress', function (e) {
         if(e.which === 13){

            //Disable textbox to prevent multiple submit
            $(this).attr("disabled", "disabled");

            socket.emit('chatMsg', {chattext:chatInput.val()});

            //Enable the textbox again if needed.
            $(this).removeAttr("disabled");
         }
   });


socket.on('chatMsg', function(data){
	chatInput.val(data.socketname+ ": ");
	
	chatTextDiv.append("<b>"+data.sendname+":</b> <font color='blue'>"+data.chattext +"</font></br>");
	chatTextDiv.animate({
        scrollTop: chatTextDiv.get(0).scrollHeight
    }, 2000);
	chatInput.focus();
});






// PHASER

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#222222",
  parent: "game-container",
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  // "this" === Phaser.Scene
  this.load.image("repeating-background", "https://www.mikewesthad.com/phaser-3-tilemap-blog-posts/post-1/assets/images/escheresque_dark.png");
}

function create() {
  // You can access the game's config to read the width & height
  const { width, height } = this.sys.game.config;

  // Creating a repeating background sprite
  const bg = this.add.tileSprite(0, 0, width, height, "repeating-background");
  bg.setOrigin(0, 0);

  // In v3, you can chain many methods, so you can create text and configure it in one "line"
  this.add
    .text(width / 2, height / 2, "hello\nphaser 3\ntemplate", {
      font: "100px monospace",
      color: "white"
    })
    .setOrigin(0.5, 0.5)
    .setShadow(5, 5, "#5588EE", 0, true, true);
}

function update(time, delta) {
  // We aren't using this in the current example, but here is where you can run logic that you need
  // to check over time, e.g. updating a player sprite's position based on keyboard input
}

gameContainer.hide();

window.addEventListener('resize', () => {
    game.resize(window.innerWidth, window.innerHeight);
});