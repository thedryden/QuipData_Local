/*	Undo: Handles Undo and Reversing Transactions */
function Undo(){
	//Do Nothing
}

Undo.prototype = {
	undoLog : [],
	redoLog : []
}

Undo.prototype.addToUndo = function( _masterTransaction ){
	this.undoLog[ this.undoLog.length ] = _masterTransaction;
	this.redoLog.length = 0;
	console.log( "add: " + this.undoLog.length );
}

Undo.prototype.checkRemoteTransactionAgainstUndo = function( _masterTransaction, _i ){
	if( _i == undefined ){
		_i = 0;
	} else if ( _i > 15 ){
		console.log( 'Undo was checkRemoteTransactionAgainstUndo because a model transaction or VisualModelTransaction took longer than 1.5 seconds to arrive after the original master transcation pair arrived' );
		return;
	}
	
	var maxUndoConflict
		
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
		
		for( var i = this.undoLog.length-1; i >= 0; i-- ){
			if( this.undoLog[i].ModelTransaction != undefined ){
				if( this.transactionObjectInCommon( this.undoLog[i].ModelTransaction.Actions, ModelTransaction.Actions ) ){
					maxUndoConflict = 1;
					break;
				} 	
			}
		}
	}
	
	if( action.ModelTransaction != undefined ){
		var VisualModelTransaction = getObjPointer( master.model, action.VisualModelTransaction );
		if( VisualModelTransaction == undefined ){
			_i++
			setTimeout( function( _masterTransaction, _i ){ master.undo.checkRemoteTransactionAgainstUndo( _masterTransaction, 100 ) } )
		}
		
		//If the person who create this transaction is the local use do nothing.
		if( VisualModelTransaction.modifiedBy === master.userID ){
			return;
		}
		
		for( var i = this.undoLog.length-1; i >= 0; i-- ){
			if( this.undoLog[i].VisualModelTransaction != undefined ){
				if( this.transactionObjectInCommon( this.undoLog[i].VisualModelTransaction.Actions, VisualModelTransaction.Actions ) ){
					maxUndoConflict = 1;
					break;
				} 	
			}
		}
	}
		
	this.undoLog.splice( 0, maxUndoConflict );
	console.log( "outside check: " + this.undoLog.length );
}

Undo.prototype.undoTransactionLog = function(){
	for( var ref in master.model.TransactionLog ){
		console.log( ref + ': ' + master.model.TransactionLog[ref] );
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
	for( var ref1 in _actions1 ){
		for( var ref2 in _actions2 ){
			if( _actions1.objectID === _action2.objectID )
				return true;
		}
	}
	
	return false;
}
