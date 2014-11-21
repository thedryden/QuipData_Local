/*	Chat: this object controls the chat client. 
 * 	The client is currently run using Firebase to provide
 * 	the comunication between all users.
 * 
 * 	Params: 
 * 	_fbModelRef: the Firebase model link that is currently being edited.
 * 	_fbToken: a Firebase token for the current user. This is used for authentication
 * 	_userName: user name to be displayed in the chat client
 */
function Chat( _fbModelRef, _fbToken, _userName ){
	//Store username
	this.userName = _userName;
	/*	Convert the referance to the model for this file, to a referance
	 * 	to the chat client and store it
	 */
	this.fbChatRef = _fbModelRef.replace( '/files/', '/chat/' );
	
	//Start the chat client
	this.fbChat = new Firebase( this.fbChatRef );
	
	//Configuration value so that first message posted does not begin with a return
	this.firstChat = true;
	
	//Authenticate the user
	this.fbChat.auth(_fbToken, function(error, result) {
		if(error) {
			openBlockingAlert( 'Could not authenicate you. Please try again latter.' );
			throwError( 'index', 'Start Up', 'Firebase chat failed to start', true );
		}
	});
	
	//Test to ensure the data can be accessed with out an error.
	this.fbChat.once('value', function(data) {
		master.chat.startChat();
	}, function(err){
		openBlockingAlert( 'Could not start the application. Please try again latter.' );
		throwError( 'index', 'Start Up', 'Firebase chat failed to start', true );
	});
}

/*	startChat: inializes the chat interface. This is run only after
 * 	it has been confirmed that the connection to Firebase is working 
 */
Chat.prototype.startChat = function(){
	//Set up lisener for new messages
	this.fbChat.on('child_added', function(snapshot) {
		var message = snapshot.val();
		master.chat.displayMessage(message.name, message.text);
	});
	
	//Set up lisener that will turn enter key press in sending a chat
	$('#txt_message').keypress(function (e) {
		if (e.which == 13) {
			master.chat.send();
			$('#txt_message').val('');
		}
	});
}

/*	send: sends a chat message to Firebase. This message wont
 * 	be displayed in the chat window until it make a round trip
 * 	back from Firebase.
 */
Chat.prototype.send = function(){
	//Get message from text box
	var text = $('#txt_message').val();
	//Push the message to Firebase
	this.fbChat.push({name: this.userName, text: text});
	//Clear the message box
	$('#txt_message').val('');
}

/*	displayMessage:	this is the function to be called when Firebase
 * 	sends a message to the client. It will display the message in 
 * 	the message window
 * 
 * 	Params:
 * 	name: user name of person sending the message.
 * 	text: the message being sent.
 */
Chat.prototype.displayMessage = function(name, text) {
	//Assemble message into the conntents that will be displayed
	var msg = name + ": " + text;
	
	//If this is not the first message add a <br /> before the message
	if( typeof this.firstChat === 'boolean' && this.firstChat ){
		this.firstChat = false;
	} else {
		msg = "<br />" + msg;
	}
	
	//Append the message to the window
	$('#chat_window').append( msg );
	
	//Scroll the window down so the message is visable
	$('#chat_window')[0].scrollTop = $('#chat_window')[0].scrollHeight;
};

//	toggle: toggles opening and closing the chat window
Chat.prototype.toggle = function(){
	//if the chat window is not vissable then call open otherwise close
	if( $('#wandering_chat').css( 'display' ) == 'none' ){
		this.open();
	} else {
		this.close();
	}
}

//	open: opens the chat window
Chat.prototype.open = function(){
	//Toggle the chat icon to show that the chat window is open
	$('#ribbon_chat').removeClass('icon')
		.addClass('icon_selected');
		
	//Make the chat window visable
	$('#wandering_chat').show();
	//Change the scroll height so that the last message is visable
	$('#chat_window')[0].scrollTop = $('#chat_window')[0].scrollHeight;
}

//	close: closes the chat window
Chat.prototype.close = function(){
	//Changes the chat icon in the ribbon to unselected
	$('#ribbon_chat').removeClass('icon_selected')
		.addClass('icon');
		
	//hides the chat window
	$('#wandering_chat').hide();
}
