function throwError( _source, _function, _message, _throw ){
	master.errors[master.errors.length] = [ _source, _function, _message ];
	console.log( "Error on file '" + _source + "' in function '" + _function + "' : '" + _message + "'" );
	if( _throw == undefined || _throw )
		throw new Error(_message);
}

function criticalError(){
	openBlockingAlert('There has been a critical error. Please wait while we restore the program!');
	
	master.transaction.fbModel.once('value', function(data) {
		master.model = data.val();
		master.canvas.reset();
		setTimeout( closeBlockingAlert(), 1000 );		
	});
}
