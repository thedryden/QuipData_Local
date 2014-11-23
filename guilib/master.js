/*	Master: this object is designed primarily to put all of objects need
 * 	for this application into a single single functin that can be referanced
 * 	from anywhere. In order for this application to work the object must be
 * 	defined in Global as master. i.e. master = new Master( params... ).
 * 
 * 	All start up data must be passed as parameters this means even code
 * 	that has been segregated for lose copuling (canvas and transaction.cloud)
 * 	may have parameters in the parameter list.
 * 
 * 	Params:
 * 	_fbModelRef: the Firebase model link that is currently being edited.
 * 	_fbToken: a Firebase token for the current user. This is used for authentication
 * 	_userID: UUID that unquiely identifies the users.
 * 	_unitTest (optional): this is a function that should be run once start up is 
 * 	complete, typically unit test.
 */
function Master( _fbModelRef, _fbToken, _userID, _userName, _unitTest ){
	this.userID = _userID
	this.userName = _userName;
	
	//UUID of the file being edited.
	this.fileUUID = getPointerUUID( _fbModelRef );
	
	/*	This is the JSON representation of the model and the visual model.
	 * 	It will be filled out by transactions
	 */
	this.model = {};
	
	/*	This records errors as they are made. These error should be uploaded
	 * 	to a central repository periodicly (not yet coded)
	 */
	this.errors = [];
	
	//Creates the transaction object
	this.transaction = new Transaction();
	//Starts cloud connections piece of Transactions	
	this.transaction.cloudInit( _fbModelRef, _fbToken );
	//Create local only undo log
	this.undo = new Undo();
	
	//Starts the chat client
	this.chat = new Chat( _fbModelRef, _fbToken, this.userName );
	
	/*	Creates a spot master for the canvas object. This will be set
	 * 	once the full document has been loaded.
	 */
	this.canvas;
	
	//	Create the ormObj: manages model objects
	this.ormObj = new ORMOBJ();
	
	//	Create line: manages lines and predicates
	this.line = new Line();
	
	//	Create rule: manages external rules
	this.rule = new Rule();
	
	//Condition UI
	$( document ).ready(function(){
		//Set up layout
		//Make the view ribbon active
		selectRibbon( 'ribbon_view' );
		
		//Make the font style wandering div draggable
		$( "#wandering_font_style" ).draggable({ handle : "#div_font_style_bar" });
		
		//Make the chat box dragable and resizable
		$( "#wandering_chat" ).draggable({ handle : "#div_chat_bar" })
			.resizable({ 
				alsoResize : "#wandering_chat_main #wandering_chat_main_two"
				, minHeight: 260
			});
		
		//Make the mass add tool dragable
		$( "#wandering_mass_add" ).draggable({ handle : "#wander_mass_add_bar" });
		
		//Make the object proprty wandering div draggable
		$( "#wander_obj_prop" ).draggable({ handle : "#wander_obj_prop_bar" });
		
		//Make the line property wandering div draggable
		$( "#wander_line_prop" ).draggable({ handle : "#wander_line_prop_bar" });
			
		/*	Put up a blocking div over the UI until the loaded parameter in the model is set to true
		 * 	This div will be removed by transaction.cloud.
		 */
		if( this.model == null || this.model == undefined || this.model.loaded == undefined || typeof this.model.loaded != 'boolean' || !this.model.loaded ){			
			openBlockingAlert( 'Loading please wait...' );	
		}
		
		//Initiate the canvas object
		master.canvas = new Canvas();
		
		//Start unit tests, if any, after inital data load.
		if( typeof _unitTest === 'function' ){
			_unitTest();
		}
	});
}
