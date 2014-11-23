/*	Transaction: This a object is designed to manipulate the local and cloud JSON
 * 	stores, and monitor the cloud for changes that need to be made locally. Changes 
 * 	to the JSON data should ONLY be made through this object. This object also sends
 * 	alerts to the Canvas object as nessisary to inform it to update the UI.
 * 
 * 	Note: all code related to the cloud is maintained in transaction.cloud.js. This
 * 	is to make it as easy as possible to change the cloud provider.
 */
function Transaction(){
	//Do Nothing
}

/*	reset: Resets the active file back to an empty model with loaded set to true.
 * 	This function is only for development, and be removed before moving to production.
 */
Transaction.prototype.reset = function(){
	var emptyModel = {"Model":{"Model":{"metadata":{"id":"","name":"","type":"","creator":"","createdOn":"","editors":"","modifiedDate":""},"ModelObjects":{"empty":""},"ModelRelationships":{"empty":""},"ModelRules":{"empty":""},"TransactionLog":{"Transactions":{"empty":""},"ObjectLogs":{"empty":""},"TransactionLog":{"empty":""}}},"ModelRefs":{"empty":""}},"VisualModel":{"metadata":{"id":"","name":"","type":""},"groups":{"empty":""},"links":{"empty":""},"comments":{"empty":""},"TransactionLog":{"Transactions":{"empty":""},"ObjectLogs":{"empty":""},"TransactionLog":{"empty":""}}},"TransactionLog":{"empty":""},"loaded":true}
	
	this.fbModel.set( emptyModel );
}

/*	createTransaction: helper function used to package transactions.
 * 	this function can only package 1 transaction, either a Model or
 * 	VisualModel. A single transaction can of course affect any number
 * 	of objects in either the Model or VisualModel using multiple actions.
 * 	If both the Model and VisualModel were affected you should use this function
 * 	to create two transactions (one for both model types), passing the first
 * 	transaction into _masterTran when you create the second. This will 
 * 	package both transactions into a single master transaction so that both
 * 	will be rolled back at the sametime. 
 * 
 * 	Params: 
 * 	_transacationType: the type of transaction to be created.
 * 	valid values: [ "Model", "VisualModel" ].
 * 	_actionsParam: array of objects. Each object should be as follows:
 * 	{
 * 		"objectID" : { "type" : "string" },
 * 		"commandType" : { "type" : "string", "enum" : [ "insert", "update", "delete" ] },
 * 		"value" : { "type" : "object" }
 * 	}
 * 	_masterTran (optional) : if provided the transaction created by this function 
 * 	will be appended to this object.
 */
Transaction.prototype.createTransaction = function( _transactionType, _actionsParams, _masterTran ){
	if( _transactionType == undefined || ( _transactionType != 'Model' && _transactionType != 'VisualModel' ) )
		throwError( 'transactoin.js', 'createTransaction', '_transactionType not provided or not a valid value' );
	if( _actionsParams == undefined ) 
		throwError( 'transactoin.js', 'createTransaction', '_actionParams not provided' );
	
	var trans = {};	//Object to be returned
	
	//UUID for the transaction.
	var transID = uuid.v4();
	
	/*	Based upon kind of transaction to be created, specifies path where 
	 * 	this transaction will be stored. Also sets the changeUI and changeRemote
	 * 	values for the actions.
	 */
	if( _transactionType == 'Model' ){
		var transPointer = "Model/Model/TransactionLog/Transactions/" + transID;
		var _changeUI = false;
		var _changeRemote = true;
	} else if ( _transactionType == 'VisualModel' ){
		var transPointer = "VisualModel/TransactionLog/Transactions/" + transID;
		var _changeUI = true;
		var _changeRemote = true;
	}
	
	//Get current date as a string in ISO 8601 standard
	var modifiedOn = new Date();
	modifiedOn = modifiedOn.toISOString();
	
	//Build transaction without actions
	trans[transID] = {
	    "id": transPointer,
	    "transactionType" : _transactionType,
		"modifiedBy": master.userID,
		"modifiedOn": modifiedOn,
		"Actions": {}
	}
	
	//Loop over each action and add it to the transaction
	for( var i = 0; i < _actionsParams.length; i++ ){
		//UUID for this action
		var actionID = uuid.v4();
		
		if( _actionsParams[i].objectID == undefined ) 
			throwError( 'transactoin.js', 'createTransaction', 'objectID provided for at leaset one actionParam' );
		if(  _actionsParams[i].commandType == undefined 
		|| ( _actionsParams[i].commandType != 'insert' && _actionsParams[i].commandType != 'update' && _actionsParams[i].commandType != 'delete' ) ){
			throwError( 'transactoin.js', 'createTransaction', 'commandType not provided or invalid for at leaset one actionParam' );		
		}
	
		trans[transID]["Actions"][actionID] = {
			"id": transPointer + "/Actions/" + actionID,
			"objectID": _actionsParams[i].objectID,
			"changeUI": _changeUI,
			"changeRemote": _changeRemote,
			"commandType": _actionsParams[i].commandType,
	        "value": _actionsParams[i].value
		}
	}	
	
	//if _masterTran is populated add trans to it
	if( _masterTran != undefined && typeof _masterTran == 'object' ){
		var temp = trans;
		var trans = _masterTran;
		
		var id = "";
		for( id in temp ){
			trans[id] = temp[id];
		}
	}
	
	//Final validation check to make sure everything was passed in correctly
	var tranName = "";
	var aTran = {};
	for( tranName in trans ){
		aTran = trans[ tranName ];
		this.validateTransaction( aTran );
	}
	
	return trans;
}

/*	validateTransaction: validates that a transaction is propertly formated.
 * 	this function validates SINGLE transaction not the master transactions that
 * 	are returned by createTransaction.
 * 
 * 	Params:
 * 	_transaction: the transaction to validate
 * 	_actionProcessed: is passed to validateAction
 */
Transaction.prototype.validateTransaction = function( _transaction, _actionProcessed ){
	if( _transaction == undefined )
		throwError( 'transaction.js', 'validateTransaction', 'passed _transaction was undefined' );
		
	if( _transaction.id == undefined || typeof _transaction.id != 'string' )
		throwError( 'transaction.js', 'validateTransaction', 'id is not valid' );
		
	if( _transaction.transactionType == undefined || typeof _transaction.transactionType != 'string'
	|| ( _transaction.transactionType != 'Model' && _transaction.transactionType != 'VisualModel' ) )
		throwError( 'transaction.js', 'validateTransaction', 'transactionType is not valid' );
		
	if( _transaction.modifiedBy == undefined || typeof _transaction.modifiedBy != 'string' )
		throwError( 'transaction.js', 'validateTransaction', 'modifiedBy not valid' );
		
	if( _transaction.modifiedOn == undefined || typeof _transaction.modifiedOn != 'string' )
		throwError( 'transaction.js', 'validateTransaction', 'modifiedOn not valid' );
		
	if( _transaction.Actions == undefined || typeof _transaction.Actions != 'object' )
		throwError( 'transaction.js', 'validateTransaction', 'Action is undefined or not an object' );
		
	for( var actionName in _transaction.Actions ){
		var action = _transaction.Actions[ actionName ]; 
		
		this.validateAction( action, _actionProcessed );  
	} 
} 

/*	validateAction: validates the passed action.
 * 
 * 	Params: 
 * 	_action: action to validate
 * 	_actionProcessed (optional): if this is parameter is defined checks that rely on the transaction
 * 	not having been processed yet will be bypassed
 */
Transaction.prototype.validateAction = function( _action, _actionProcessed ){
	if( _action == undefined )
		throwError( 'transaction.js', 'validateAction', 'passed _action was undefined' );
	
	if( _action.id == undefined || typeof _action.id != 'string' )
		throwError( 'transaction.js', 'validateAction', 'id is not valid' ); 
	
	if( _action.objectID == undefined || typeof _action.objectID != 'string' )
		throwError( 'transaction.js', 'validateAction', 'objectID is not valid' );
		
	if( _action.changeUI == undefined || typeof _action.changeUI != 'boolean' )
		throwError( 'transaction.js', 'validateAction', 'changeUI is not valid' );
		
	if( _action.changeRemote == undefined || typeof _action.changeRemote != 'boolean' )
		throwError( 'transaction.js', 'validateAction', 'changeRemote is not valid' );
		
	if( _action.commandType == undefined || typeof _action.commandType != 'string'
	||	(  _action.commandType != 'insert' && _action.commandType != 'update' && _action.commandType != 'delete' ) )
		throwError( 'transaction.js', 'validateAction', 'commandType is not valid' );
		
	if( _action.commandType != 'insert' && _actionProcessed == undefined ){
		var obj = getObjPointer( master.model, _action.objectID )
		if( obj == undefined || typeof obj != 'object' )
			throwError( 'transaction.js', 'validateAction', 'commandType is not insert and the objectID is not found' );
	}
	
	if ( _action.commandType == 'delete' && typeof _action.value != 'object' && _action.value != null )
		throwError( 'transaction.js', 'validateAction', 'value is not valid' );
	
	if( _action.commandType != 'delete' && typeof _action.value != 'object' )
		throwError( 'transaction.js', 'validateAction', 'value is not valid' );
		
}


Transaction.prototype.changeMade = function( _transaction ){
	for( var actionName in _transaction.Actions ){
		var action = _transaction.Actions[ actionName ]; 
		
		if( action.commandType === 'insert' || action.commandType === 'delete' ){
			return true;
		}
	}
	
	for( var actionName in _transaction.Actions ){
		var action = _transaction.Actions[ actionName ]; 
		
		var obj = getObjPointer( master.model, action.objectID );
		
		if( JSONEquals( action.value, obj ) === false ){
			return true;
		}
	}
	
	return false;
}

/*	processTransactions: takes a transaction as returned by createTransaction
 * 	and changes the underlying JSON model(s) per the actions within the
 * 	transaction. 
 * 
 * 	While processing the actions this will also append the informaiton nessisary 
 * 	to reverse the transaction, and stores all of the information nessisary to 
 * 	do so. Finally it takes care of storing the data in the cloud so it can be 
 * 	synced with any other users.
 *  
 * 	Params: 
 * 	_transaction: a transaction as returned by createTransaction
 */
Transaction.prototype.processTransactions = function( _transaction ){
	/*	A container used to create a super transaction stored above 
	 * 	the model and visualModel transactions so that changes that 
	 * 	affect both objects can be reversed at the same time.
	 */ 
	var fullModelTrans = {};
	
	//Validate parameters
	var changeMade = false;
	for( var name in _transaction ){
		var newTransaction = _transaction[name];
		
		try{
			this.validateTransaction( newTransaction );
			if( changeMade === false )
				changeMade = this.changeMade( newTransaction );
		}catch(err){
			criticalError();
			throwError( 'transaction.js', 'processTransactions', 'passed parameter was not valid' );
			return;
		}
	}
	
	//If none of the action actually change anything, then don't run the transaction
	if( changeMade === false ){
		return;
	}
	
	//Loop through every transaction in the passed transaction
	name = ""
	newTransaction = {};
	for( name in _transaction ){
		newTransaction = _transaction[name];
		
		//Stores transaction in approprate place in fullModelTrans
		if( newTransaction.transactionType == 'Model' ){
			fullModelTrans['ModelTransaction'] = newTransaction.id; 
		} else {
			fullModelTrans['VisualModelTransaction'] = newTransaction.id;			
		}
		
		//Process transaction locally
		try{
			this.processTransactionsHelper( name, newTransaction );	
		}catch(err){
			criticalError();
			throwError( 'transaction.js', 'processTransactionsHelper', err.message );
			return;
		}
		
		//Process transaction in the cloud (function is on transaction.cloud.js)
		try{
			this.processTransactionsCloudHelper( name, newTransaction );
		}catch(err){
			criticalError();
			throwError( 'transaction.js', 'processTransactionsCloudHelper', err.message );
		}
	}
	
	//Store fullModelTrans in the undo log
	master.undo.addToUndo( fullModelTrans );
	
	/*	Store the fullModelTrans in the cloud, the cloud will send it
	 * 	back for local storage (function is on transaction.cloud.js)
	 */
	try{
		this.storeFullModelTrans( fullModelTrans );
	}catch(err){
		criticalError();
		throwError( 'transaction.js', 'storeFullModelTrans', err.message );
	}
	
	//Make changes locally on Canvas after all data is saved
	for( name in _transaction ){
		newTransaction = _transaction[name];
		
		if( newTransaction.transactionType === 'VisualModel' ){
			for( actionID in newTransaction.Actions ){
				action = newTransaction.Actions[actionID];
				
				if( action.objectID.substring( 0, 17 ) !== 'VisualModel/links' )
					master.canvas.processModelUI( action.objectID, action.commandType );	
			}
			
			for( actionID in newTransaction.Actions ){
				action = newTransaction.Actions[actionID];
				
				if( action.objectID.substring( 0, 17 ) === 'VisualModel/links' )
					master.canvas.processModelUI( action.objectID, action.commandType );	
			}
		}
	}
}

/*	processTransactionsHelper: helper function that processes 1 transaction
 * 	at at time. See processTransactions for more information on exsactly
 * 	what is done.
 *
 * 	Params: 
 * 	_name: the name of the transaction, should be a UUID
 * 	_transaction: a single transaction as created by createTransaction  
 */
Transaction.prototype.processTransactionsHelper = function( _name, _transaction ){
	this.validateTransaction( _transaction );
	
	// extracts actions from the passed transaction
	var actions = _transaction.Actions;
	
	// loop through every action in the passed transaction
	var action = {};
	var actionID = ""
	for( actionID in actions ){
		action = actions[actionID];
		
		//Get the reverse action from the object log
		var reverseAction = this.getReverseAction( action, _transaction.transactionType );
		//Store returned reverseAction
		action.reverseAction = reverseAction; 
	}
	
	//Get path to the transaction container
	var transactions = {}
	var transactionsPath = "" 
	if( _transaction.transactionType == 'Model' ){
		transactions = master.model.Model.Model.TransactionLog.Transactions;
	} else if( _transaction.transactionType == 'VisualModel' ) {
		transactions = master.model.VisualModel.TransactionLog.Transactions;
	}
	
	//Store the transaction
	transactions[_name] = _transaction;
	
	//loop over actions in the transaction
	for( actionID in actions ){
		action = actions[actionID];
		
		//Add this new action to the action log
		this.updateObjectLog( action, _transaction.transactionType );
	}
	
	//Loop over actions
	for( actionID in actions ){
		action = actions[actionID];
		
		//Load up local storage container for the action's value
		var localObject = getObjPointer( master.model, action.objectID );
		
		
		if( action.value != undefined ){
			//Set version for the action.	
			if( localObject == undefined || localObject.version == undefined ){
				action.value['version'] = 0;
			} else {
				action.value['version'] =  ( localObject.version + 1 ); 
			}
		}
		
		//Perfomr the action
		this.executeActions( action );
		
		
	}
}

/*	getReverseAction: extracts the last action performed from the object log
 * 	for each action. The last action performed is extracted from the object log
 * 	because value in the local model may have already changed (this is particularly)
 * 	true in the VisualModel. If a insert action is being performed also create a stub
 * 	in the objectLog table.
 * 
 * 	returns: the last action performed on this object, if insert a delete action will be
 * 	returned 
 * 
 * 	Params:
 * 	_action: the action for which to extract the last action performed
 * 	_transactionType: if this is a Model or VisualModel action
 */
Transaction.prototype.getReverseAction = function( _action, _transactionType ){
	this.validateAction( _action );
	
	if( _transactionType != 'Model' && _transactionType != 'VisualModel' )
		throwError( 'transaction.js', 'getReverseAction', '_transactionType are not valid' );
	
	//Get correct objectLog
	if( _transactionType == 'Model' ){
		var objectLogRoot = master.model.Model.Model.TransactionLog.ObjectLogs;
	} else if( _transactionType == 'VisualModel' )  {
		var objectLogRoot = master.model.VisualModel.TransactionLog.ObjectLogs;
	}
	
	var objID = getPointerUUID( _action.objectID )
	var objectLog = objectLogRoot[ objID ];
	
	if( objectLog != undefined ){
		//Get get current action from the head
		var headPair = getObjPointer( master.model, objectLog.head );
		var lastAction = getObjPointer( master.model, headPair.currentAction );
		
		//Get previous Action
		/*	If insert and previous action was delete then store a delete command as the reverse.
		 * 	this is nessisary because objectLogs are never deleted so its possible to find an objectLog
		 * 	for something you are inserting due to a undo command.
		 */
		if( _action.commandType == 'insert' ){
			if( lastAction.commandType == 'delete' ){
				return  {
					"changeUI" : _action.changeUI,
					"changeRemote" : _action.changeRemote,
					"commandType" : "delete",
					"value" : null	
				}	
			} else {
				throwError(  'transaction.js', 'getReverseAction', 'new action is insert and previous is not delete or not found' );
			}
		//If update and last action was not delete extract the last action
		} else if ( _action.commandType == 'update' ){
			if( lastAction.commandType == 'insert' || lastAction.commandType == 'update' ){
				return  {
					"changeUI" : _action.changeUI,
					"changeRemote" : _action.changeRemote,
					"commandType" : "update",
					"value" : lastAction.value
				}
			} else {
				throwError( 'transaction.js', 'getReverseAction', 'new action is update and previous is delete' );
			}
		//If delete and last action was not delete extract the last action
		} else if ( _action.commandType == 'delete' ){
			if( lastAction.commandType == 'insert' || lastAction.commandType == 'update' ){
				return  {
					"changeUI" : _action.changeUI,
					"changeRemote" : _action.changeRemote,
					"commandType" : "insert",
					"value" : lastAction.value
				}
			} else {
				throwError( 'transaction.js', 'getReverseAction', 'new action is delete and previous is delete' );
			}
		}
		//If somehow you got to the end of the above without returning something or throwing an error, throw an error.
		throwError( 'transaction.js', 'getReverseAction', 'bad data passed in action' );
	} else {
		/*	IF the objectLog did not already exists, and the commandType is insert, create a stub
		 * 	and return a new delete action
		 */
		if( _action.commandType == "insert" ){
			var objID = getPointerUUID( _action.objectID );
			
			if( _transactionType == 'Model' ){
				var id = "Model/Model/TransactionLog/ObjectLogs/" + objID;
				var pairID = id + "/" + uuid.v4();
			} else {
				var id = "VisualModel/TransactionLog/ObjectLogs/" + objID;
				var pairID = id + "/" + uuid.v4();
			}
			
			objectLogRoot[ objID ] = {
				"id" : id,
				"objectID" : _action.objectID,
				"head" : null,
				"ActionPairs": { "empty": "" }
			}
			
			return {
				"changeUI" : _action.changeUI,
				"changeRemote" : _action.changeRemote,
				"commandType" : "delete",
				"value" : null	
			}
		}
		
		throwError( 'transaction.js', 'getReverseAction', 'objectID not found in object log and new action is not insert' );
	}
}

/*	updateObjectLog: adds passed action to the top of the objectLog stack
 * 	and manages head of the stack.
 * 
 * 	Params:
 * 	_action: the action to be added to the object log
 * 	_transactionType: if this is a Model or VisualModel action 
 */
Transaction.prototype.updateObjectLog = function( _action, _transactionType ){
	this.validateAction( _action );
	
	if( _transactionType != 'Model' && _transactionType != 'VisualModel' )
		throwError( 'transaction.js', 'getReverseAction', '_transactionType are not valid' );
	
	//Get correct objectLog
	if( _transactionType == 'Model' ){
		var objectLogRoot = master.model.Model.Model.TransactionLog.ObjectLogs;
	} else {
		var objectLogRoot = master.model.VisualModel.TransactionLog.ObjectLogs;
	}
	
	var objID = getPointerUUID( _action.objectID )
	var objectLog = objectLogRoot[ objID ];
	
	if( objectLog == undefined ){
		throwError( 'transaction.js', 'updateObjectLog', 'objectID not found in objectLog' );
	}
	
	//Set the UUID for pointer pair and create the pair
	var actionPairID = uuid.v4()
	
	var actionPair = {
		"currentAction" : _action.id,
		"PreviousPair" : objectLog.head 
	}
	
	//Add action pair and point head to the new pair
	objectLog.ActionPairs[actionPairID] = actionPair;
	objectLog.head = objectLog.id + '/ActionPairs/' + actionPairID;
}

/*	executeActions: performs the action on the local storage version
 * 	of the model.
 * 
 * 	Parmas: 
 * 	_action: action to be performed
 */
Transaction.prototype.executeActions = function( _action ){
	this.validateAction( _action );
	
	//switch statement for each kind of commandType
	switch( _action.commandType ){
		case 'insert':
		//add the obejct at the objectID location
			var container = getObjPointerParent( master.model, _action.objectID );
			var id = getPointerUUID( _action.objectID );

			if( id != undefined )
				container[id] = _action.value;
			break;
		case 'update':
		//overwrite the object at the objectID with the passed object
			var container = getObjPointerParent( master.model, _action.objectID );
			var id = getPointerUUID( _action.objectID );			
			
			if( id != undefined )
				container[id] = _action.value;
			break;
		case 'delete':
		//delete the obejct at objectID
			var container = getObjPointerParent( master.model, _action.objectID );
			var id = getPointerUUID( _action.objectID );			
			
			if( id != undefined )
				delete container[id];
			break;
	}
}
