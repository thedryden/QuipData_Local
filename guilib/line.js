function Line(){
	$( document ).ready(function(){
		for( var ref in master.line.typeToIcon ){
			master.line.typeToIcon[ ref ] = $('#' + master.line.typeToIcon[ ref ] ); 
		} 
		
		var aTrue = true;
	});
}

Line.prototype = {
	active : false
	, type : null
	, relationshipTemplate : {	
		"objectID" : "Model/Model/ModelRelationships/UUID",
		"commandType" : "insert",
		"value" : {		
			"id" : "Model/Model/ModelRelationships/UUID",
			"name" : "",
			"type" : "predicate",
			"Role" : "has a",
			"InverseRole" : "is a",
			"ModelRelationshipConnectors" : { "empty" : "" }
		}
	}
	, groupConnectorTemplate : {	
		"objectID" : "Model/Model/ModelObjects/UUID",
		"commandType" : "update",
		"value" : null
	}
	, connectorTemplate : {
		"id" : "Model/Model/ModelRelationships/parentUUID/ModelRelationshipConnectors/UUID",
		"parentID" : "Model/Model/ModelRelationships/parentUUID",
		"objectID" : "Model/Model/ModelObjects/UUID",
		"modelRuleConditions" : { "empty" : "" }
	}
	, relationshipIDRegEx : /Model\/Model\/ModelRelationships/
	, typeToIcon : {
		"line" : "icons_line",
		"unary" : "icons_unary",
		"inheritance" : "icons_inheritance"
	}	
}

Line.prototype.createLine = function( _modelID1, _modelID2 ){
	var action = cloneJSON( this.relationshipTemplate );
	var modelValue = action.value;

	var model1 = getObjPointer( master.model, _modelID1 );
	if( model1 == undefined ){
		throwError( 'line.js', 'createLine', 'The passed model ID, ' + _modelID1 + ', does not exist in the model' );
	}
	
	var model2 = getObjPointer( master.model, _modelID2 );
	if( model1 == undefined ){
		throwError( 'line.js', 'createLine', 'The passed model ID, ' + _modelID2 + ', does not exist in the model' );
	}
	
	if( model1.id.match( this.relationshipIDRegEx ) != null && model2.id.match( this.relationshipIDRegEx ) != null ){
		//Create an ouside model rule
	} else if( model1.id.match( this.relationshipIDRegEx ) != null ){ 
		var modelRelationship = getObjPointer( master.model, model1.parentID );
		if( modelRelationship == undefined ){
			throwError( 'line.js', 'createLine', 'The parent id for the model relationship connector' + model1.id + ' did not corispond to a model relationship' );
		}
		modelRelationship = cloneJSON( modelRelationship );
		modelConnector = model1;
		newModelObject = model2;
	} else if ( model2.id.match( this.relationshipIDRegEx ) != null ){
		var modelRelationship = getObjPointer( master.model, model2.parentID );
		if( modelRelationship == undefined ){
			throwError( 'line.js', 'createLine', 'The parent id for the model relationship connector' + model1.id + ' did not corispond to a model relationship' );
		}
		modelRelationship = cloneJSON( modelRelationship );
		modelConnector = model2;
		newModelObject = model1;
	} else {
		var newRelationshipID = uuid.v4();
		action.objectID = action.objectID.replace( 'UUID', newRelationshipID );
		modelValue.id = action.objectID;
		
		var modelConn1ID = uuid.v4();
		var modelConn1 = cloneJSON( this.connectorTemplate );
		modelConn1.id = modelValue.id + '/ModelRelationshipConnectors/' + modelConn1ID; 
		modelConn1.parentID = modelValue.id;
		modelConn1.objectID = _modelID1;
		
		var modelObjectAction1 = cloneJSON( this.groupConnectorTemplate );
		modelObjectAction1.objectID = model1.id;
		modelObjectAction1.value = model1;
		modelObjectAction1.value.ModelRelationshipConnectors[ getPointerUUID( modelConn1.id ) ] = modelConn1.id;
		
		var modelConn2ID = uuid.v4();
		var modelConn2 = cloneJSON( this.connectorTemplate );
		modelConn2.id = modelValue.id + '/ModelRelationshipConnectors/' + modelConn2ID; 
		modelConn2.parentID = modelValue.id;
		modelConn2.objectID = _modelID2;
		
		var modelObjectAction2 = cloneJSON( this.groupConnectorTemplate );
		modelObjectAction2.objectID = model2.id;
		modelObjectAction2.value = model2;
		modelObjectAction2.value.ModelRelationshipConnectors[ getPointerUUID( modelConn2.id ) ] = modelConn2.id;
		
		modelValue.ModelRelationshipConnectors[ modelConn1ID ] = modelConn1;
		modelValue.ModelRelationshipConnectors[ modelConn2ID ] = modelConn2;
		
		var actions = [ action, modelObjectAction1, modelObjectAction2 ];
		
		try{
			var trans = master.transaction.createTransaction( "Model", actions );
			
			var visualActions = master.canvas.line.syncPredicate( modelValue );
			
			var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
			
			master.transaction.processTransactions( trans );
		}catch(err){
			throwError( 'line.js', 'createLine', err.message, false );
			return;
		}
		return;
	}
	
	var actions = [];
	
	action.commandType = 'update'
	action.objectID = modelRelationship.id;
	action.value = modelRelationship;
	
	var modelConnectorUUID = getPointerUUID( modelConnector.id );
	
	if( modelConnector.objectID !== "" ){
		var oldModelObject = getObjPointer( master.model, modelConnector.objectID );
		if( oldModelObject == undefined ){
			throwError( 'line.js', 'createLine', 'The passed object ID, ' + modelConnector.objectID + ', in the passed model ID, ' + modelConnector.id + ', does not exist in the model' );
		}
		
		var oldModelAction = cloneJSON( this.groupConnectorTemplate );
		oldModelAction.objectID = oldModelObject.id;
		oldModelAction.value = oldModelObject;
		delete oldModelAction.value.ModelRelationshipConnectors[ modelConnectorUUID ];
		
		actions[ actions.length ] = oldModelAction; 	
	}
	
	var newModelAction = cloneJSON( this.groupConnectorTemplate );
	newModelAction.objectID = newModelObject.id;
	newModelAction.value = newModelObject;
	newModelAction.value.ModelRelationshipConnectors[ modelConnectorUUID ] = modelConnector.id;
	
	actions[ actions.length ] = newModelAction;
	actions[ actions.length ] = action;
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var visualActions = master.canvas.line.updateLink( modelConnector.id, newModelObject.id );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'line.js', 'createLine', err.message, false );
		return;
	}
}

Line.prototype.createUnary = function( _id ){
	var action = cloneJSON( this.relationshipTemplate );
	var modelValue = action.value;

	var model = getObjPointer( master.model, _id );
	if( model == undefined ){
		throwError( 'line.js', 'createLine', 'The passed model ID, ' + _id + ', does not exist in the model' );
	}
	
	var newRelationshipID = uuid.v4();
	action.objectID = action.objectID.replace( 'UUID', newRelationshipID );
	modelValue.id = action.objectID;
	
	var modelConnID = uuid.v4();
	var modelConn = cloneJSON( this.connectorTemplate );
	modelConn.id = modelValue.id + '/ModelRelationshipConnectors/' + modelConnID; 
	modelConn.parentID = modelValue.id;
	modelConn.objectID = _id;
	
	var modelObjectAction = cloneJSON( this.groupConnectorTemplate );
	modelObjectAction.objectID = model.id;
	modelObjectAction.value = model;
	modelObjectAction.value.ModelRelationshipConnectors[ getPointerUUID( modelConn.id ) ] = modelConn.id;

	modelValue.ModelRelationshipConnectors[ modelConnID ] = modelConn;
	
	var actions = [ action, modelObjectAction ];
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var visualActions = master.canvas.line.syncPredicate( modelValue );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'line.js', 'createLine', err.message, false );
		return;
	}
}

Line.prototype.createInheritance = function( _modelIDA, _modelIDZ ){
	var modelObjectA = getObjPointer( master.model, _modelIDA );
	if( modelObjectA == undefined ){
		throwError( 'line.js', 'createLine', 'The passed model ID, ' + _modelIDA + ', does not exist in the model' );
	}
	modelObjectA = cloneJSON( modelObjectA );
	
	var modelObjectZ = getObjPointer( master.model, _modelIDZ );
	if( modelObjectZ == undefined ){
		throwError( 'line.js', 'createLine', 'The passed model ID, ' + _modelIDZ + ', does not exist in the model' );
	}
	modelObjectZ = cloneJSON( modelObjectZ );
	
	var action = cloneJSON( this.relationshipTemplate );
	var modelRelationship = action.value;
	
	var newRelationshipID = uuid.v4();
	action.objectID = action.objectID.replace( 'UUID', newRelationshipID );
	modelRelationship.id = action.objectID;
	modelRelationship.type = "inheritance";
	
	var modelConnAID = uuid.v4();
	var modelConnA = cloneJSON( this.connectorTemplate );
	modelConnA.id = modelRelationship.id + '/ModelRelationshipConnectors/' + modelConnAID; 
	modelConnA.parentID = modelRelationship.id;
	modelConnA.objectID = modelObjectA.id;
	modelConnA.inheritance = "child";
	
	modelRelationship.ModelRelationshipConnectors[ modelConnAID ] = modelConnA;
	
	var modelObjectAAction = cloneJSON( this.groupConnectorTemplate );
	modelObjectAAction.objectID = modelObjectA.id;
	modelObjectAAction.value = modelObjectA;
	modelObjectAAction.value.ModelRelationshipConnectors[ getPointerUUID( modelConnA.id ) ] = modelConnA.id;
	
	var modelConnZID = uuid.v4();
	var modelConnZ = cloneJSON( this.connectorTemplate );
	modelConnZ.id = modelRelationship.id + '/ModelRelationshipConnectors/' + modelConnZID; 
	modelConnZ.parentID = modelRelationship.id;
	modelConnZ.objectID = modelObjectZ.id;
	modelConnZ.inheritance = "parent";
	
	modelRelationship.ModelRelationshipConnectors[ modelConnZID ] = modelConnZ;
	
	var modelObjectZAction = cloneJSON( this.groupConnectorTemplate );
	modelObjectZAction.objectID = modelObjectZ.id;
	modelObjectZAction.value = modelObjectZ;
	modelObjectZAction.value.ModelRelationshipConnectors[ getPointerUUID( modelConnZ.id ) ] = modelConnZ.id;
	
	var actions = [ action, modelObjectAAction, modelObjectZAction ];
	
	//try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var visualActions = master.canvas.line.createInheritance( modelRelationship );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
	/*}catch(err){
		throwError( 'line.js', 'createLine', err.message, false );
		return;
	}*/
}

//Called on keypress in certain fields, if enter was pressed run saveProperties
Line.prototype.saveEditPredicateOnEnter = function( e ){
	if( e.which == 13 || e.which == 10 ){
		master.line.saveEditPredicate( true );
	}
}

/*	saveEditPredicate: reads out the data stored in master.canvas.line
 * 	from using the eddit a predicate window and processes it to update
 * 	the predicate object, insert new rules and delete rules that no longer
 * 	apply.
 */
Line.prototype.saveEditPredicate = function( _closeOnFinish ){
	//Get data from master.canvas.line
	var data = master.canvas.line.activePred;
	var uniques = master.canvas.line.uniques;
	//Get the entire rules container
	var modelRules = master.model.Model.Model.ModelRules;
	
	//Get the parent of the first rule in data. This is the entire predicate
	var fullPred = getObjPointer( master.model, data[0].obj.modelID );
	var fullPred = getObjPointer( master.model, fullPred.parentID );
	var fullPred = cloneJSON( fullPred );
	
	fullPred.Role = $('#role_label').val();
	fullPred.InverseRole = $('#inverse_label').val();
	
	var integrate = {};
	integrate[ fullPred.id ] = fullPred;
	
	var fullPredUUID = getPointerUUID( fullPred.id );
	var inFullPredRegEx = new RegExp( fullPred.id );
	
	var actions = [];
	
	//First create or remove model relationship connectors (roles) from the model relationship (predicate)
	for( var i = 0; i < data.length; i++ ){
		//Delete roles that are no longer active
		if( data[i].active === false && data[i].newObj === false ){
			var aModelRelationshipConnector = getObjPointer( master.model, data[i].obj.modelID );
			
			//clear out all associated rules
			for( var conRef in aModelRelationshipConnector.modelRuleConditions ){
			if( conRef !== 'empty' ){
				var aModelRuleConditions = getObjPointer( master.model, aModelRelationshipConnector.modelRuleConditions[ conRef ] );
				var aModelRule = getObjPointerWithIntegrate( master.model, aModelRuleConditions.parentID, integrate );
				
				//If all rules are assoicated with this pred only delete them
				var inside = this.ruleInsidePred( aModelRule, fullPred );
				
				if( inside === true ){
					var tempActions = master.rule.deleteRule( aModelRule.id, integrate );
					
					for( var ai = 0; ai < tempActions.length; ai++ ){
						if( tempActions[ ai ].objectID === aModelRule.id ){
							actions[ actions.length ] = tempActions[ ai ]; 
						} else if ( typeof integrate[ tempActions[ ai ].objectID ] === 'undefined' ){
							integrate[ tempActions[ ai ].objectID ] = tempActions[ ai ].value;
						}
					}
				} else {
					aModelRule = cloneJSON( aModelRule );
					integrate[ aModelRule.id ] = aModelRule;
					
					delete aModelRule.ModelRuleConditions[ getPointerUUID( aModelRuleConditions ) ];
				}
			}
			}
			
			var modelRelationshipConnectorUUID = getPointerUUID( data[i].obj.modelID );
			delete fullPred.ModelRelationshipConnectors[ modelRelationshipConnectorUUID ];
		} else if ( data[i].newObj === true && data[i].active === true ){
			var tempID = uuid.v4();
			
			var tempModelRelationshipConnector = cloneJSON( this.connectorTemplate );
			tempModelRelationshipConnector.id = tempModelRelationshipConnector.id.replace( 'parentUUID', fullPredUUID );
			tempModelRelationshipConnector.id = tempModelRelationshipConnector.id.replace( 'UUID', tempID );
			tempModelRelationshipConnector.parentID = fullPred.id;
			tempModelRelationshipConnector.objectID = "";
			
			fullPred.ModelRelationshipConnectors[ tempID ] = tempModelRelationshipConnector;
			
			data[i].obj.modelID = tempModelRelationshipConnector.id;
		}
	}
	
	//Loop through all rules associated with this predicate, looking for uniques that exist, but are not in uniques
	var searched = [];
	for( var relRef in fullPred.ModelRelationshipConnectors ){
	if( relRef !== 'empty' ){
		aModelRelationship = fullPred.ModelRelationshipConnectors[ relRef ];
		
		for( var ruleRef in aModelRelationship.modelRuleConditions ){
		if( ruleRef !== 'empty' ){
			var aRuleRef = aModelRelationship.modelRuleConditions[ ruleRef ]
			
			var aModelRule = getObjPointer( master.model, aRuleRef );
			aModelRule = getObjPointer( master.model, aModelRule.parentID );
			
			if( searched.indexOf( aModelRule.id ) === -1 ){
				searched[ searched.length ] = aModelRule.id;
				
				//If the type is for a kind of unique
				if( master.rule.uniqueTypes[ aModelRule.type ] === true ){	
					var found = false;
					for( var ref in uniques ){
						if( this.uniqueRuleAndUniqueEqual( aModelRule, uniques[ ref ].uniques, data ) ){
							found = true;
							break;
						}
					}
					
					if( found === false ){
						var inside = this.ruleInsidePred( aModelRule, fullPred );
						
						if( inside === true ){
							var tempActions = master.rule.deleteRule( aModelRule.id, integrate );
					
							for( var ai = 0; ai < tempActions.length; ai++ ){
								if( tempActions[ ai ].objectID === aModelRule.id ){
									actions[ actions.length ] = tempActions[ ai ]; 
								} else if ( typeof integrate[ tempActions[ ai ].objectID ] === 'undefined' ){
									integrate[ tempActions[ ai ].objectID ] = tempActions[ ai ].value;
								}
							}
						}
					}
				}
			}
		}
		} 
	}
	}
	
	//Deal with Required only
	//Loop over each role in the predicate
	for( var i = 0; i < data.length; i++ ){
		var dataRole = data[i];
		
		//Can't use pointer since the model relationship connector may be new and not yet in the model
		var modelRelationship = undefined;
		for( var ref in fullPred.ModelRelationshipConnectors ){
		if( ref !== 'empty' ){
			if( fullPred.ModelRelationshipConnectors[ ref ].id === dataRole.obj.modelID ){
				modelRelationship = fullPred.ModelRelationshipConnectors[ ref ];
				break; 
			}
		}
		}
		
		//Get the Model Relationship associated with the role and its UUID
		if( modelRelationship == undefined ){
			throwError( 'line.js', 'saveEditPredicate', 'model relationship linked to a roles was not found' );
		}
		var modelRelationshipUUID = getPointerUUID( modelRelationship.id );
		
		//If the role is marked as required
		if( dataRole.required === true ){
			//Search for the role in the existing model rules
			var exists = false;
			
			for( var ref in modelRelationship.modelRuleConditions ){
			if( ref !== 'empty' ){
				var aRuleRef = modelRelationship.modelRuleConditions[ ref ];
				
				//Get the full pointer to the Model Rule Condition and then get a pointer to the Model Rule
				var aModelRuleCondition = getObjPointer( master.model, aRuleRef );
				aModelRule = getObjPointer( master.model, aModelRuleCondition.parentID );
				
				//If rule is required
				if( aModelRule.type === 'required' ){
					//	Make sure the rule is only for this role
					var found = true
					for( var ref in aModelRule.modelRuleConditions ){
					if( ref !== 'empty' ){
						var aModelRuleConditionLink = aModelRule.modelRuleConditions[ ref ];
						
						/*	If the role is linked to this modelRelationship then set found to true
						 * 	but contiue search to make sure there are not conditions linked to other
						 * 	objects
						 */
						if( aModelRuleConditionLink.ModelRelationshipConnectorID !== modelRelationship.id ) {
							found = false;
							break;
						}
					}
					}
					
					if( found === true ){
						exists = true;
						break;
					}	
				}
			}
			}
			//If rule does not exist create it
			if( exists === false ){
				var parentID = uuid.v4();
				var childID = uuid.v4();
				
				var modelRule = cloneJSON( master.rule.ruleTempalte );
				modelRule.objectID = modelRule.objectID.replace( 'UUID', parentID );
				modelRule.value.id = modelRule.objectID;
				modelRule.value.type ='required';
				
				var modelRuleCondition = cloneJSON( master.rule.ruleConditionTempalte );
				modelRuleCondition.parentID = modelRule.value.id;
				modelRuleCondition.id = modelRuleCondition.id.replace( 'parentUUID', parentID );
				modelRuleCondition.id = modelRuleCondition.id.replace( 'UUID', childID );
				modelRuleCondition.ModelRelationshipConnectorID = dataRole.obj.modelID;
				
				modelRule.value.ModelRuleConditions[ childID ] = modelRuleCondition;
				
				fullPred.ModelRelationshipConnectors[ modelRelationshipUUID ].modelRuleConditions[ childID ] = modelRuleCondition.id;
				
				actions[ actions.length ] = modelRule;
			}
		//If not required
		} else {
			for( var ref in modelRelationship.modelRuleConditions ){
			if( ref !== 'empty' ){
				var aRuleRef = modelRelationship.modelRuleConditions[ ref ];
				
				var aModelRule = getObjPointer( master.model, aRuleRef );
				aModelRule =getObjPointer( master.model, aModelRule.parentID );
				
				if( aModelRule.type === 'required' ){
					//	Make sure the rule is only for this role, rather than an external rule linking multiple roles
					var inside = true
					for( var ref in aModelRule.ModelRuleConditions ){
					if( ref !== 'empty' ){
						var aModelRuleConditionLink = aModelRule.ModelRuleConditions[ ref ];
						
						//	If at least one Model Rule Condition isn't linked to this model relationship then don't delete
						if( aModelRuleConditionLink.ModelRelationshipConnectorID !== modelRelationship.id ) {
							inside = false;
							break;	
						}
					}
					}
					
					//If found equal true then delete
					if( inside === true ){
						var tempActions = master.rule.deleteRule( aModelRule.id, integrate );
					
						for( var ai = 0; ai < tempActions.length; ai++ ){
							if( tempActions[ ai ].objectID === aModelRule.id ){
								actions[ actions.length ] = tempActions[ ai ]; 
							} else if ( typeof integrate[ tempActions[ ai ].objectID ] === 'undefined' ){
								integrate[ tempActions[ ai ].objectID ] = tempActions[ ai ].value;
							}
						}
					}
				}
			}
			}
		}
	}
	
	//Loop through all uniques, determine if they exist, if not create them
	for( var uniqRef in uniques ){
		var aUnique = uniques[ uniqRef ];	
		
		var exists = false;
		
		//Loop through all rules looking to see if this rule exists
		for( var ref in modelRules ){
		if( ref !== 'empty' ){
			var aModelRule = modelRules[ ref ];
			
			if( this.uniqueRuleAndUniqueEqual( aModelRule, aUnique.uniques, data ) ){
				exists = true;
				break;
			}
		}
		}
		
		if( exists === false ){
			var parentID = uuid.v4();
			
			modelRule = cloneJSON( master.rule.ruleTempalte );
			modelRule.objectID = modelRule.objectID.replace( 'UUID', parentID );
			modelRule.value.id = modelRule.objectID;
			var tempType = ( aUnique.primary === true ) ? "primary " : "";
			tempType += ( aUnique.uniques.length === 1 ) ? 'unique' : 'unique many-to-many';
			modelRule.value.type = tempType;
			
			for( var i = 0; i < aUnique.uniques.length; i++ ){
				var childID = uuid.v4();
				
				var modelRuleCondition = cloneJSON( master.rule.ruleConditionTempalte );
				modelRuleCondition.parentID = modelRule.value.id;
				modelRuleCondition.id = modelRuleCondition.id.replace( 'parentUUID', parentID );
				modelRuleCondition.id = modelRuleCondition.id.replace( 'UUID', childID );
				modelRuleCondition.ModelRelationshipConnectorID = data[ aUnique.uniques[i] ].obj.modelID;
				
				modelRule.value.ModelRuleConditions[ childID ] = modelRuleCondition;
				
				var modelRelationshipUUID = getPointerUUID( data[ aUnique.uniques[i] ].obj.modelID );
				fullPred.ModelRelationshipConnectors[ modelRelationshipUUID ].modelRuleConditions[ childID ] = modelRuleCondition.id;
			}
			
			actions[ actions.length ] = modelRule;
		}
	}
	
	delete integrate[ fullPred.id ];
	for( var ref in integrate ){
		var found = false;
		for( var i = 0; i < actions.length; i++ ){
			if( actions[i].objectID === ref && actions[i].commandType === 'delete' ){
				found = true;
			} else if ( actions[i].objectID === ref ) {
				actions.splice( i, 1 );
			}
		}
		
		actions[ actions.length ] = {	
			"objectID" : fullPred.id,
			"commandType" : "update",
			"value" : fullPred
		}
	}
	
	actions[ actions.length ] = {	
		"objectID" : fullPred.id,
		"commandType" : "update",
		"value" : fullPred
	}
	
	var modelRules = {};
	for( i = 0; i < actions.length; i++ ){
		if( actions[i].objectID.match( master.rule.ruleIDRegEx ) != null ){
			modelRules[ actions[i].objectID ] = ( actions[i].commandType === 'delete' ) ? false : actions[i].value;	
		}
	}
		
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var visualActions = master.canvas.line.syncPredicate( fullPred, modelRules );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
		
		if( _closeOnFinish === true ){
			master.canvas.line.closeEditPred();
		} else {
			master.canvas.line.editPredicate( master.canvas.line.activePredID );
		}
	}catch(err){
		throwError( 'line.js', 'createLine', err.message, false );
		return;
	}
}

Line.prototype.uniqueRuleAndUniqueEqual = function( _aRule, _aUnique, _data ){
	if( master.rule.uniqueTypes[ _aRule.type ] === true ){
		//Loop though each connector in the rule
		var found = false;
		var ruleLength = 0;
		for( var ref in _aRule.ModelRuleConditions ){
		if( ref !== 'empty' ){
			var aModelRuleConnector = _aRule.ModelRuleConditions[ ref ];
			
			//Loop throuh each item in the unique to see if there is a match
			found = false;
			for( var i = 0; i < _aUnique.length; i++ ){
				if( aModelRuleConnector.ModelRelationshipConnectorID === _data[ _aUnique[i] ].obj.modelID ){
					found = true;
					break; 
				}
			}
			if( found === false )
				return false;
				
			ruleLength++;
		}
		}
		if( found === true && ruleLength === _aUnique.length )
			return true;
	}
	
	return false;
}

Line.prototype.deleteRelationship = function( _id, _integrateWith ){
	var aModelRelationship = getObjPointer( master.model, _id );	
	if( aModelRelationship == undefined ){
		throwError( 'line.js', 'deleteRelationship', 'The passed _id, ' + _id + ', does not exist in the model' );
	}
	
	if( typeof _integrateWith !== 'object' ){
		_integrateWith = {};
	}
	var touched = {};
	
	var actions = [];
	
	actions[ actions.length ] = { 
		"objectID" : aModelRelationship.id,
		"commandType" : "delete",
		"value": null
	}
	
	for( var ref in aModelRelationship.ModelRelationshipConnectors ){
	if( ref !== 'empty' ){
		var ModelRelationshipConnectors = aModelRelationship.ModelRelationshipConnectors[ ref ];
	
		for( var ruleConRef in ModelRelationshipConnectors.modelRuleConditions ){
		if( ruleConRef !== 'empty' ){
			var aModelRuleCon = getObjPointer( master.model, ModelRelationshipConnectors.modelRuleConditions[ ruleConRef ] );
			if( aModelRuleCon == undefined ){
				throwError( 'line.js', 'deleteRelationship', 'The model relationship model rule condition id, ' + ModelRelationshipConnectors.modelRuleConditions[ ruleConRef ] + ', does not exist in the model' );
			}
			
			if( typeof _integrateWith[ aModelRuleCon.parentID ] === 'undefined' ){
				var aModelRule = getObjPointer( master.model, aModelRuleCon.parentID );	
				if( aModelRule == undefined ){
					throwError( 'line.js', 'deleteRelationship', 'The parent id, ' + aModelRuleCon.parentID + ', does not exist in the model' );
				}
				var aModelRule = cloneJSON( aModelRule );
				
				_integrateWith[ aModelRule.id ] = aModelRule;
			} else {
				var aModelRule = _integrateWith[ aModelRuleCon.parentID ];
			}
			
			if( this.ruleInsidePred( aModelRule, aModelRelationship ) ){
				actions[ actions.length ] = {
					"objectID" : aModelRule.id,
					"commandType" : "delete",
					"value" : null
				}
			} else {
				delete aModelRule.ModelRuleConditions[ ruleConRef ];
				touched[ aModelRule.id ] = aModelRule;
			}
		}
		}
	
		if( ModelRelationshipConnectors.objectID !== '' ){
			if( typeof _integrateWith[ ModelRelationshipConnectors.objectID ] === 'undefined' ){
				var aModelObject = getObjPointer( master.model, ModelRelationshipConnectors.objectID );	
				if( aModelObject == undefined ){
					throwError( 'line.js', 'deleteRelationship', 'The passed a model Object ID, ' + ModelRelationshipConnectors.objectID + ', does not exist in the model' );
				}
				var aModelObject = cloneJSON( aModelObject );
				
				_integrateWith[ aModelObject.id ] = aModelObject;
			} else {
				var aModelObject = _integrateWith[ ModelRelationshipConnectors.objectID ];
			}
			
			var aModelObjectUUID = getPointerUUID( ModelRelationshipConnectors.id );
			
			delete aModelObject.ModelRelationshipConnectors[ aModelObjectUUID ];
			touched[ aModelObject.id ] = aModelObject;
		}
	}
	}
	
	for( var ref in touched ){
		var aObj = touched[ ref ];
		
		var deleted = false;
		for( var i = 0; i < actions.length; i++ ){
			if( actions[i].objectID === aObj.id && actions[i].commandType === 'delete' ){
				deleted = true;
				break;
			}
		}
		
		if( deleted === false ){
			actions[ actions.length ] = {
				"objectID" : aObj.id,
				"commandType" : "update",
				"value" : aObj
			}	
		}	
	}
	
	return actions;
}

Line.prototype.ruleInsidePred = function( _aModelRule, _aModelPred ){
	var predRegExp = new RegExp( _aModelPred.id );
	var predRegExp = new RegExp( _aModelPred.id );
	
	for( var ref in _aModelRule.ModelRuleConditions ){
	if( ref !== 'empty' ){
		var aModelRuleConditionLink = _aModelRule.ModelRuleConditions[ ref ];
		
		//	If at least one Model Rule Condition isn't linked to this model relationship then don't delete
		if( aModelRuleConditionLink.ModelRelationshipConnectorID.match( predRegExp ) == null ) {
			return false;
		}
	}
	}
	
	return true; 
}

Line.prototype.toggle = function( _type ){
	if( this.active === true ){
		this.close( _type );
	} else {
		this.open( _type );
	}
}

Line.prototype.open = function( _type ){
	if( this.active === false ){
		this.active = true;
		this.type = _type;
		
		
		this.typeToIcon[ _type ].removeClass('icon')
			.addClass('icon_selected');
		
		master.canvas.line.toggleCreateListener( _type );
	}
}

Line.prototype.close = function( _type ){
	if( this.active === true && this.type === _type ){
		this.active = false;
		this.type = null;
		
		this.typeToIcon[ _type ].removeClass('icon_selected')
			.addClass('icon');
		
		master.canvas.line.toggleCreateListener( _type );
	}
}
