/*	Undo: Handles Undo and Reversing Transactions */
function Undo(){
	//Do Nothing
}

Undo.prototype = {
	undoLog : [],
	undoneLog : {},
	redoLog : []
}

Undo.prototype.addToUndo = function( _masterTransaction ){
	var undone = false;
	for( var ref in _masterTransaction ){
		var aTransactionID = _masterTransaction[ ref ];
		
		if( this.undoneLog[ aTransactionID ] === true ){
			delete this.undoneLog[ aTransactionID ];
			undone = true;
		}
	}
	
	if( undone === false ){
		_masterTransaction = cloneJSON( _masterTransaction );
		
		for( var ref in _masterTransaction ){
			aTransaction = getObjPointer( master.model, _masterTransaction[ ref ] );
			
			_masterTransaction[ ref ] = aTransaction; 
		}
	
		this.undoLog[ this.undoLog.length ] = _masterTransaction;
		this.redoLog.length = 0;	
	}
}

Undo.prototype.checkRemoteTransactionAgainstUndo = function( _masterTransaction, _i ){
	if( this.undoLog.length === 0 )
		return;
	
	if( _i == undefined ){
		_i = 0;
	} else if ( _i > 15 ){
		console.log( 'Undo was checkRemoteTransactionAgainstUndo because a model transaction or VisualModelTransaction took longer than 1.5 seconds to arrive after the original master transcation pair arrived' );
		return;
	}
	
	var minUndoConflict = -1;
		
	if( _masterTransaction.ModelTransaction != undefined ){
		var ModelTransaction = getObjPointer( master.model, _masterTransaction.ModelTransaction );
		if( ModelTransaction == undefined ){
			_i++
			setTimeout( function( _masterTransaction, _i ){ master.undo.checkRemoteTransactionAgainstUndo( _masterTransaction, 100 ) } )
		}
		
		//If the person who create this transaction is the local use do nothing.
		if( ModelTransaction.modifiedBy === master.userID ){
			return;
		}
		
		for( var i = 0; i < this.undoLog.length; i++ ){
			if( this.undoLog[i].ModelTransaction != undefined ){
				if( this.transactionObjectInCommon( this.undoLog[i].ModelTransaction.Actions, ModelTransaction.Actions ) ){
					minUndoConflict = i;
					break;
				} 	
			}
		}
	}
	
	if( _masterTransaction.VisualModelTransaction != undefined ){
		var VisualModelTransaction = getObjPointer( master.model, _masterTransaction.VisualModelTransaction );
		if( VisualModelTransaction == undefined ){
			_i++
			setTimeout( function( _masterTransaction, _i ){ master.undo.checkRemoteTransactionAgainstUndo( _masterTransaction, 100 ) } )
		}
		
		//If the person who create this transaction is the local use do nothing.
		if( VisualModelTransaction.modifiedBy === master.userID ){
			return;
		}
		
		for( var i = 0; i < this.undoLog.length; i++ ){
			if( this.undoLog[i].VisualModelTransaction != undefined ){
				if( this.transactionObjectInCommon( this.undoLog[i].VisualModelTransaction.Actions, VisualModelTransaction.Actions ) ){
					if( minUndoConflict === -1 || minUndoConflict > i )
						minUndoConflict = i;
					break;
				} 	
			}
		}
	}
	
	if( minUndoConflict > -1 )
		this.undoLog.splice( minUndoConflict, this.undoLog.length );
}

Undo.prototype.undo = function(){
	if( this.undoLog.length === 0 )
		return;
	
	var modelActions = [];
	var visualActions = [];
	
	var masterTransaction = this.undoLog.pop();
 	this.redoLog[ this.redoLog.length ] = masterTransaction; 
	
	if( masterTransaction.ModelTransaction != undefined ){
		for( var ref in masterTransaction.ModelTransaction.Actions ){
			var aAction = masterTransaction.ModelTransaction.Actions[ ref ];
			
			modelActions[ modelActions.length ] = this.reverseAction( aAction );
		}
	}
	
	if( masterTransaction.VisualModelTransaction != undefined ){
		for( var ref in masterTransaction.VisualModelTransaction.Actions ){
			var aAction = masterTransaction.VisualModelTransaction.Actions[ ref ];
			
			visualActions[ visualActions.length ] = this.reverseAction( aAction );
		}
	}
	
	try{
		if( masterTransaction.ModelTransaction != undefined )
			var trans = master.transaction.createTransaction( "Model", modelActions );
		
		if( masterTransaction.VisualModelTransaction != undefined && masterTransaction.ModelTransaction != undefined ){
			var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		} else if( masterTransaction.VisualModelTransaction != undefined ){
			var trans = master.transaction.createTransaction( "VisualModel", visualActions );
		}
		
		for( var ref in trans ){
			var aTransaction = trans[ ref ];
			this.undoneLog[ aTransaction.id ] = true;
		}
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'orm_obj.js', 'deleteObj', err.message, false );
		return;
	}
}

Undo.prototype.redo = function(){
	if( this.redoLog.length === 0 )
		return;
	
	var modelActions = [];
	var visualActions = [];
	
	var masterTransaction = this.redoLog.pop(); 
	
	if( masterTransaction.ModelTransaction != undefined ){
		for( var ref in masterTransaction.ModelTransaction.Actions ){
			var aAction = masterTransaction.ModelTransaction.Actions[ ref ];
			
			modelActions[ modelActions.length ] = this.tranActionToAction( aAction );
		}
	}
	
	if( masterTransaction.VisualModelTransaction != undefined ){
		for( var ref in masterTransaction.VisualModelTransaction.Actions ){
			var aAction = masterTransaction.VisualModelTransaction.Actions[ ref ];
			
			visualActions[ visualActions.length ] = this.tranActionToAction( aAction );
		}
	}
	
	try{
		if( masterTransaction.ModelTransaction != undefined )
			var trans = master.transaction.createTransaction( "Model", modelActions );
		
		if( masterTransaction.VisualModelTransaction != undefined && masterTransaction.ModelTransaction != undefined ){
			var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		} else if( masterTransaction.VisualModelTransaction != undefined ){
			var trans = master.transaction.createTransaction( "VisualModel", visualActions );
		}
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'orm_obj.js', 'deleteObj', err.message, false );
		return;
	}
}

Undo.prototype.undoTransactionLog = function(){
	for( var ref in master.model.TransactionLog ){
		console.log( ref + ': ' + master.model.TransactionLog[ref] );
	}
}

Undo.prototype.reverseAction = function( _tranAction ){
	return { 
		"objectID" : _tranAction.objectID,
		"commandType" : _tranAction.reverseAction.commandType,
		"value": ( _tranAction.reverseAction.commandType === 'delete' ) ? null : _tranAction.reverseAction.value
	}
}

Undo.prototype.tranActionToAction = function( _tranAction ){
	return { 
		"objectID" : _tranAction.objectID,
		"commandType" : _tranAction.commandType,
		"value": ( _tranAction.commandType === 'delete' ) ? null : _tranAction.value
	}
}

/*	transactionObjectInCommon: determines if any actions in _action1 affect
 * 	have the same objectID as an action in _action2
 * 	
 * 	Params:
 * 	_action1: an object containing actions. Processed transaction format (not array).
 * 	_action2: an object containing actions. Processed transaction format (not array).
 */
Undo.prototype.transactionObjectInCommon = function( _actions1, _actions2 ){
	if( typeof _actions1 !== 'object' && _actions2 !== 'object' )
		return false;
	
	for( var ref1 in _actions1 ){
		for( var ref2 in _actions2 ){
			if( _actions1[ ref1 ].objectID === _actions2[ ref2 ].objectID )
				return true;
		}
	}
	
	return false;
}
