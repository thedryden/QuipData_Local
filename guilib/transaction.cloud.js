/*	Transaction: This a object is designed to manipulate the local and cloud JSON
 * 	stores, and monitor the cloud for changes that need to be made locally. Changes 
 * 	to the JSON data should ONLY be made through this object. This object also sends
 * 	alerts to the Canvas object as nessisary to inform it to update the UI.
 * 
 * 	Note: this file only contains the code to maintain the cloud representation of 
 * 	the model. see transaction.js for the all local work.
 */

/*	cloudInit: creates and ininalizes the cloud parts of the transaction object.
 * 	Params: 
 * 	_fbModelRef: the Firebase model link that is currently being edited.
 * 	_fbToken: a Firebase token for the current user. This is used for authentication
 */
Transaction.prototype.cloudInit = function(  _fbModelRef, _fbToken  ){
	Transaction.prototype.fbModelRef = _fbModelRef;
	Transaction.prototype.fbModel = new Firebase( this.fbModelRef );
	
	this.fbModel.auth(_fbToken, function(error, result) {
		if(error) {
			openBlockingAlert( 'Could not start the application. Please try again latter.' );
			throwError( 'index', 'Start Up', 'Firebase failed to start', true );
		}
	});
	
	this.fbModel.on('value', function(data) {
		master.model = data.val();
		if( master.model != null && master.model != undefined && typeof master.model['loaded'] == 'boolean' ){
			data.ref().off( 'value' );
			master.transaction.setListeners();
		}
	}, function(err){
		openBlockingAlert( 'Could not start the application. Please try again latter.' );
		throwError( 'index', 'Start Up', 'Firebase failed to start', true );
	});
}

/*	pointerToRelativePath: removes # and/or / at the begining of the 
 * 	passed string - converting a absolute path to a relative one.
 * 
 * 	Params:
 * 	_pointer: a string that represent a path
 */
function pointerToRelativePath( _pointer ){
	if( typeof _pointer != 'string' )
		throwError( 'transactoin.cloud.js', 'pointerToRelativePath', '_pointer is not a string' );
		
	if( _pointer.substring( 0, 1) == '#' ) _pointer = _pointer.substring( 1 );
	if( _pointer.substring( 0, 1) == '/' ) _pointer = _pointer.substring( 1 );
	
	return _pointer;
}

/* 	processTransactionsCloudHelper: helper function for processTransactions (on transactions.js).
 * 	This controls processing the action and storing the transactions in the cloud.
 *
 * 	Params: 
 * 	_name: the name of the transaction, should be a UUID
 * 	_transaction: a single transaction as created by createTransaction
 */
Transaction.prototype.processTransactionsCloudHelper = function(  _name, _transaction ){
	this.validateTransaction( _transaction, true );
	
	//Stores the transaction in the cloud
	this.storeTransaction( _name, _transaction );
	
	//Loop through every actions
	var actions = _transaction.Actions;
	
	var action = {};
	var actionID = ""
		
	for( actionID in actions ){
		action = actions[actionID];
	
		//Makes the changes to the obejct log
		this.storeObjectLog( action, _transaction.transactionType );
		
		//Performs the action in the cloud
		this.executeActionsCloud( action );
	}	
}

/*	executeActionsCloud: set position in the cloud that matches
 * 	the object ID to the value of the passed action
 * 	
 * 	Params:
 * 	_action: action to be performed
 */
Transaction.prototype.executeActionsCloud = function( _action ){
	this.validateAction( _action, true )
	
	var path = pointerToRelativePath( _action.objectID );
	var child = this.fbModel.child( path );
	
	if( _action.commandType == 'delete' ){
		child.remove();
	} else {
		child.set( _action.value );
	}
}

/*	storeTransaction: stores the transaction in the cloud. Also pushes a
 * 	pointer to the transaction into the transactionLog.
 *
 * 	Params: 
 * 	_name: the name of the transaction, should be a UUID
 * 	_transaction: a single transaction as created by createTransaction
 */
Transaction.prototype.storeTransaction = function( _name, _transaction ){
	this.validateTransaction( _transaction, true );
	
	/*	Get the correct path to the transaction and transaction log
	 * based upon the transactionType 
	 */
	if( _transaction.transactionType == 'Model' ){
		var transPath = 'Model/Model/TransactionLog/Transactions';
		var transLogPath = 'Model/Model/TransactionLog/TransactionLog';
	} else if ( _transaction.transactionType == 'VisualModel' ){
		var transPath = 'VisualModel/TransactionLog/Transactions';
		var transLogPath = 'VisualModel/TransactionLog/TransactionLog';
	}
	transPath += '/' + _name;
	
	var transChild = this.fbModel.child( transPath );
	transChild.set( _transaction );	
	
	var transLogChild = this.fbModel.child( transLogPath );
	transLogChild.push( _transaction.id );
}

/*	storeObjectLog: replaces the entire contents of the objectLog in
 * 	the cloud with the local copy.
 * 
 * 	Params:
 * 	_action: the action to be added to the object log
 * 	_transactionType: if this is a Model or VisualModel action
 */
Transaction.prototype.storeObjectLog = function( _action, _transactionType ){
	//Validate parameters
	this.validateAction( _action, true );
	
	if( _transactionType != 'Model' && _transactionType != 'VisualModel' )
		throwError( 'transaction.js', 'getReverseAction', '_transactionType are not valid' );
	
	//Get correct paths to storage point in the cloud
	if( _transactionType == 'Model' ){
		var objectLogRoot = master.model.Model.Model.TransactionLog.ObjectLogs;
		var path = 'Model/Model/TransactionLog/ObjectLogs';
	} else {
		var objectLogRoot = master.model.VisualModel.TransactionLog.ObjectLogs;
		var path = 'VisualModel/TransactionLog/ObjectLogs';
	}
	
	//Get local copy
	var objectLogID = getPointerUUID( _action.objectID )
	var objectLog = objectLogRoot[ objectLogID ];
	
	if( objectLog == undefined ){
		errors[errors.length] = [ 'transaction.cloud.js', 'storeObjectLog', 'objectID not found' ]; 
		return;
	}
	
	//store local copy in the cloud
	path += '/' + objectLogID;
	
	var child = this.fbModel.child( path );
	child.set( objectLog );
}

/*	storeFullModelTrans: takes pointers to one or more transactions and
 * 	stores in the in cloud so they can be unwound together
 */
Transaction.prototype.storeFullModelTrans = function( _fullModelTrans ){
	var child = this.fbModel.child( "TransactionLog" );
	child.push( _fullModelTrans )
}

/*	Must implement setListeners in Transaction. Set liseners must open up UI once loaded == true
 */

Transaction.prototype.setListeners = function(){
	
	/*	*** _____________________ *** _____________________ ***
	 * 	Model/Model (LogicalModel) liseners
	 */
	//Model/Model/metadata
	var modelObjects = this.fbModel.child( 'Model/Model/metadata' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.metadata, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.metadata, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.metadata, childSnapshot, false );
	});
	
	//Model/Model/ModelObjects
	var modelObjects = this.fbModel.child( 'Model/Model/ModelObjects' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.Model.Model.ModelObjects, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.Model.Model.ModelObjects, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.Model.Model.ModelObjects, childSnapshot, false );
	});
	
	//Model/Model/ModelObjects
	var modelObjects = this.fbModel.child( 'Model/Model/ModelRelationships' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	
	//Model/Model/ModelRules
	var modelObjects = this.fbModel.child( 'Model/Model/ModelRules' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.Model.Model.ModelRules, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.Model.Model.ModelRules, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.Model.Model.ModelRules, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/Transactions
	var modelObjects = this.fbModel.child( 'Model/Model/TransactionLog/Transactions' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/ObjectLogs
	var modelObjects = this.fbModel.child( 'Model/Model/TransactionLog/ObjectLogs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/TransactionLog
	var modelObjects = this.fbModel.child( 'Model/Model/TransactionLog/TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	
	//Model/Model/ModelRefs
	var modelObjects = this.fbModel.child( 'Model/Model/ModelRefs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.ModelRefs, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.ModelRefs, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.ModelRefs, childSnapshot, false );
	});
	
	/*	*** _____________________ *** _____________________ ***
	 * 	VisualModel liseners
	 */
	//VisualModel/metadata
	var modelObjects = this.fbModel.child( 'VisualModel/metadata' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.VisualModel.metadata, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.VisualModel.metadata, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.VisualModel.metadata, childSnapshot, true );
	});	
	 
	//VisualModel/groups
	var modelObjects = this.fbModel.child( 'VisualModel/groups' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.VisualModel.groups, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.VisualModel.groups, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.VisualModel.groups, childSnapshot, true );
	});
	
	//VisualModel/links
	var modelObjects = this.fbModel.child( 'VisualModel/links' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.VisualModel.links, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.VisualModel.links, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.VisualModel.links, childSnapshot, true );
	});
	
	//VisualModel/comments
	var modelObjects = this.fbModel.child( 'VisualModel/comments' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.VisualModel.comments, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.VisualModel.comments, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.VisualModel.comments, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/Transactions
	var modelObjects = this.fbModel.child( 'VisualModel/TransactionLog/Transactions' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/ObjectLogs
	var modelObjects = this.fbModel.child( 'VisualModel/TransactionLog/ObjectLogs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/TransactionLog
	var modelObjects = this.fbModel.child( 'VisualModel/TransactionLog/TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	
	/*	*** _____________________ *** _____________________ ***
	 * 	Other liseners
	 */	
	//TransactionLog
	var modelObjects = this.fbModel.child( 'TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.TransactionLog, childSnapshot, false );
		var value = childSnapshot.val();
		master.undo.checkRemoteTransactionAgainstUndo( value );
		
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.TransactionLog, childSnapshot, false );
	});
		
	//loaded
	var modelObjects = this.fbModel.child( 'loaded' );
	modelObjects.on( 'value', function( data ){
		cloudUpdateNoVersion( master.model, data, false );
		if( data.val() === true ){
			//Add startUID
			data.ref().child( 'loaded' );
			modelObjects.off( 'value' );
			
			var uiOpen = function(){
				if( master.canvas == undefined ){
					setTimeout( uiOpen, 500 );
				} else {
					master.canvas.reset( function(){
						closeBlockingAlert();	
					});
				}
			}
			
			uiOpen();
		}
	});
}

function cloudInsert( _container, _value, _updateUI ){
	if( _value.name() != 'empty' ){
		if( _container[_value.name()] == undefined 
		|| _value.val().version > _container[_value.name()].version ){
			_container[_value.name()] = _value.val();
			
			if( _updateUI ){
				master.canvas.processModelUI( _value.val().id, 'insert' )
			}	
		}	
	}
}

function cloudUpdate( _container, _value, _updateUI ){
	if( _value.name() != 'empty' ){
		if( _container[_value.name()] == undefined 
		|| _value.val().version > _container[_value.name()].version ){
			_container[_value.name()] = _value.val();
			
			if( _updateUI ){
				master.canvas.processModelUI( _value.val().id, 'update' )	
			}	
		}	
	}
}

function cloudDelete( _container, _value, _updateUI ){
	if( _value.name() != 'empty' ){
		delete _container[_value.name()] ;
	
		if( _updateUI ){
			master.canvas.processModelUI( _value.val().id, 'delete' )
		}		
	}
}

function cloudInsertNoVersion( _container, _value ){
	if( _value.name() != 'empty' )
		_container[_value.name()] = _value.val();
}

function cloudUpdateNoVersion( _container, _value ){
	if( _value.name() != 'empty' )
		_container[_value.name()] = _value.val();
}

function cloudDeleteNoVersion( _container, _value ){
	if( _value.name() != 'empty' )
		delete _container[_value.name()] ;
}
