function Rule(){
	$( document ).ready(function(){
		for( var ref in master.rule.typeToIcon ){
			master.rule.typeToIcon[ ref ] = $('#' + master.rule.typeToIcon[ ref ] ); 
		} 
		
		var aTrue = true;
	});
	
	for( var ref in this.uniqueTypes ){
		this.ruleTypes[ ref ] = this.uniqueTypes[ ref ];
	}
	
	if( typeof Object.freeze === 'function' ){
		Object.freeze( this.ruleTempalte );
		Object.freeze( this.ruleConditionTempalte );
		Object.freeze( this.ruleTypes );
		Object.freeze( this.uniqueTypes );
	}
}

Rule.prototype = {
	active : false
	, type : null
	, typeToIcon : {
		"required" : "icons_required",
		"unique" : "icons_unique",
		"primary unique" : "icons_primary"
	}
	, ruleIDRegEx : /Model\/Model\/ModelRules/
	, ruleTypes : { "required" : true }//at start up everything from uniqueTypes will be added
	, uniqueTypes : { "primary unique" : true, "unique" : true, "primary unique many-to-many" : true, "unique many-to-many" : true }
	, ruleTempalte : {	
		"objectID" : "Model/Model/ModelRules/UUID",
		"commandType" : "insert",
		"value" : {
			"id" : "Model/Model/ModelRules/UUID",
			"type" : "",
			"ModelRuleConditions" : { "empty" : "" }
		}
	}
	
	, ruleConditionTempalte : {
		"id" : "Model/Model/ModelRules/parentUUID/ModelRuleConditions/UUID",
		"parentID" : "Model/Model/ModelRules/parentUUID",
		"ModelRelationshipConnectorID" : "Model/Model/ModelRelationships/parentUUID/ModelRelationshipConnectors/UUID"
	}
	, modelRuleID : null
}

Rule.prototype.createRule = function( _modelID1, _modelID2 ){
	if( this.type == undefined ){
		throwError( 'rule.js', 'createRule', 'No type is set. Unable to create a rule without a type' );
	}
	
	var model1 = getObjPointer( master.model, _modelID1 );
	if( model1 == undefined ){
		throwError( 'rule.js', 'createRule', 'The passed model ID, ' + _modelID1 + ', does not exist in the model' );
	}
	
	var model2 = getObjPointer( master.model, _modelID2 );
	if( model1 == undefined ){
		throwError( 'rule.js', 'createRule', 'The passed model ID, ' + _modelID2 + ', does not exist in the model' );
	}
	
	if( model1.parentID === model2.parentID ){
		alert( 'You cannot select the same predicate twice' );
		return;
	}
	
	var actions = [];
	
	if( model1.id.match( this.ruleIDRegEx ) != null && model2.id.match( this.ruleIDRegEx ) != null ){
		//Can't connect two rules
		alert( 'You cannot build a rule between two rules, at least one side must be a role.' );
		return;
	} else if ( model1.id.match( master.line.relationshipIDRegEx ) != null && model2.id.match( master.line.relationshipIDRegEx ) != null ){
	//Create new rules
		var modelRelationshipCon1 = cloneJSON( model1 );
		var modelRelationshipCon2 = cloneJSON( model2 ); 
	
		var modelRuleUUID = uuid.v4();
		var modelRule = cloneJSON( this.ruleTempalte );
		modelRule.objectID = modelRule.objectID.replace( 'UUID', modelRuleUUID );
		modelRule.value.id = modelRule.objectID;
		modelRule.value.type = this.type;
		
		var modelRuleCon1UUID = uuid.v4();
		var modelRuleCon1 = cloneJSON( this.ruleConditionTempalte );
		modelRuleCon1.id = modelRule.objectID + '/ModelRuleConditions/' + modelRuleCon1UUID;
		modelRuleCon1.parentID = modelRule.objectID;
		modelRuleCon1.ModelRelationshipConnectorID = modelRelationshipCon1.id;
		
		modelRule.value.ModelRuleConditions[ modelRuleCon1UUID ] = modelRuleCon1;
		
		var modelRuleCon2UUID = uuid.v4();
		var modelRuleCon2 = cloneJSON( this.ruleConditionTempalte );
		modelRuleCon2.id = modelRule.objectID + '/ModelRuleConditions/' + modelRuleCon2UUID;
		modelRuleCon2.parentID = modelRule.objectID;
		modelRuleCon2.ModelRelationshipConnectorID = modelRelationshipCon2.id;
		
		modelRule.value.ModelRuleConditions[ modelRuleCon2UUID ] = modelRuleCon2;
		
		actions[ actions.length ] = modelRule;
		
		var modelRelationship1 = getObjPointer( master.model, modelRelationshipCon1.parentID );
		if( modelRelationship1 == undefined ){
			throwError( 'rule.js', 'createRule', 'The parentID, ' + modelRelationshipCon1.parentID + ', does not exist in the model' );
		}
		modelRelationship1 = cloneJSON( modelRelationship1 );
		
		modelRelationship1.ModelRelationshipConnectors[ getPointerUUID( modelRelationshipCon1.id ) ].modelRuleConditions[ modelRuleCon1UUID ] = modelRuleCon1.id;
		
		actions[ actions.length ] = {	
			"objectID" : modelRelationship1.id,
			"commandType" : "update",
			"value" : modelRelationship1
		}
		
		var modelRelationship2 = getObjPointer( master.model, modelRelationshipCon2.parentID );
		if( modelRelationship2 == undefined ){
			throwError( 'rule.js', 'createRule', 'The parentID, ' + modelRelationshipCon2.parentID + ', does not exist in the model' );
		}
		modelRelationship1 = cloneJSON( modelRelationship2 );
		
		modelRelationship1.ModelRelationshipConnectors[ getPointerUUID( modelRelationshipCon2.id ) ].modelRuleConditions[ modelRuleCon2UUID ] = modelRuleCon2.id;
		
		actions[ actions.length ] = {	
			"objectID" : modelRelationship1.id,
			"commandType" : "update",
			"value" : modelRelationship1
		};
		
		try{
			var trans = master.transaction.createTransaction( "Model", actions );
			
			var visualActions = master.canvas.rule.createRule( modelRule.value );
			
			var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
			
			master.transaction.processTransactions( trans );
		}catch(err){
			throwError( 'line.js', 'createLine', err.message, false );
			return;
		}
		
		return;
	} else if( model1.id.match( this.ruleIDRegEx ) != null ){
		var modelRule = cloneJSON( model1 );
		var modelRelationshipConnector = cloneJSON( model2 );
	} else if ( model2.id.match( this.ruleIDRegEx ) != null ){
		var modelRule = cloneJSON( model2 );
		var modelRelationshipConnector = cloneJSON( model1 );
	}
	
	var exists = false;
	for( var existsRef in modelRule.ModelRuleConditions ){
	if( existsRef !== 'empty' ){
		var aModelRuleCon = modelRule.ModelRuleConditions[ existsRef ];
		
		if( aModelRuleCon.ModelRelationshipConnectorID === modelRelationshipConnector.id ){
			exists = true;
			break;
		}
	}
	}
	
	var visualActions = [];
	if( exists === true ){
		if( getPropertyCount( modelRule.ModelRuleConditions, true ) === 0 ){
			actions = this.deleteRule( modelRule );
			
			var visualRule = master.canvas.rule.findRuleByModelID( modelRule.id );
			if( visualRule != undefined ){
				visualActions = master.canvas.ormObj.deleteObj( visualRule.id );	
			}
		} else {
			delete modelRule.ModelRuleConditions[ existsRef ];
			
			actions[ actions.length ] = {	
				"objectID" : modelRule.id,
				"commandType" : "update",
				"value" : modelRule
			}; 
			
			var modelRelationship = getObjPointer( master.model, modelRelationshipConnector.parentID );
			if( modelRelationship == undefined ){
				throwError( 'rule.js', 'createRule', 'The parentID, ' + modelRelationshipConnector.parentID + ', does not exist in the model' );
			}
			modelRelationship = cloneJSON( modelRelationship );
			
			delete modelRelationship.ModelRelationshipConnectors[ getPointerUUID( modelRelationshipConnector.id ) ].modelRuleConditions[ existsRef ];
			
			actions[ actions.length ] = {	
				"objectID" : modelRelationship.id,
				"commandType" : "update",
				"value" : modelRelationship
			}; 
			
			visualActions = master.canvas.rule.deleteModelRuleConndition( aModelRuleCon );
		}
	} else {
		var modelRuleConUUID = uuid.v4();
		var modelRuleCon = cloneJSON( this.ruleConditionTempalte );
		modelRuleCon.id = modelRule.id + '/ModelRuleConditions/' + modelRuleConUUID;
		modelRuleCon.parentID = modelRule.id;
		modelRuleCon.ModelRelationshipConnectorID = modelRelationshipConnector.id;
		
		modelRule.ModelRuleConditions[ modelRuleConUUID ] = modelRuleCon;
		
		actions[ actions.length ] = actions[ actions.length ] = {	
			"objectID" : modelRule.id,
			"commandType" : "update",
			"value" : modelRule
		}; ;
		
		var modelRelationship = getObjPointer( master.model, modelRelationshipConnector.parentID );
		if( modelRelationship == undefined ){
			throwError( 'rule.js', 'createRule', 'The parentID, ' + modelRelationshipConnector.parentID + ', does not exist in the model' );
		}
		modelRelationship = cloneJSON( modelRelationship );
		
		modelRelationship.ModelRelationshipConnectors[ getPointerUUID( modelRelationshipConnector.id ) ].modelRuleConditions[ modelRuleConUUID ] = modelRuleCon.id;
		
		actions[ actions.length ] = {	
			"objectID" : modelRelationship.id,
			"commandType" : "update",
			"value" : modelRelationship
		}
		
		visualActions = master.canvas.rule.insertModelRuleConndition( modelRuleCon );
	}
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'line.js', 'createLine', err.message, false );
		return;
	}
}

Rule.prototype.updateRule = function( _type ){
	var modelRule = getObjPointer( master.model, this.modelRuleID );
	if( modelRule == undefined ){
		throwError( 'rule.js', 'updateRule', 'The passed model ID, ' + _modelID + ', does not exist in the model' );
	}
	modelRule = cloneJSON( modelRule );
	
	if( modelRule.type === _type )
		return;//Do Nothing
	
	modelRule.type = _type
	
	actions = [ {	
		"objectID" : modelRule.id,
		"commandType" : "update",
		"value" : modelRule
	} ];
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var visualActions = master.canvas.rule.updateRule( modelRule );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'rule.js', 'updateRule', err.message, false );
		return;
	}
}

Rule.prototype.openChangeSymbol = function( _id ){
	var visualRule = getObjPointer( master.model, _id );
	if( visualRule == undefined ){
		throwError( 'rule.js', 'updateRule', 'The passed visual ID, ' + _id + ', does not exist in the model' );
	}

	this.modelRuleID = visualRule.modelID;
	$('#wander_rule_select').show();
}

Rule.prototype.closeChangeSymbol = function( _id ){
	this.modelRuleID = null;
	$('#wander_rule_select').hide();
} 

/*	deleteRule: takes an _id to a rule and  creates the nessisary action to 
 * 	delete it and any connections to it in model relationships. You may
 * 	optionally a collection of objects (_integrateWith) that you are already
 * 	working with so that any changes to these objects are made to the copy
 * 	you are already working with.
 * 
 * 	Params:
 * 	_id(string) : id of the rule you wish to delete.
 * 	_integrateWith(object) : collection of objects you are already working with.
 * 	ALL of these objects must be clones so that we don't modify the model directly.
 * 	Format for the collection is for the ID to be the object's ID and the value to
 * 	be the object.
 * 
 * 	Returns:
 * 	Transaction actions.
 */
Rule.prototype.deleteRule = function( _id, _integrateWith ){
	var aModelRule = getObjPointer( master.model, _id );	
	if( aModelRule == undefined ){
		throwError( 'line.js', 'deleteRule', 'The passed _id, ' + _id + ', does not exist in the model' );
	}
	
	if( typeof _integrateWith !== 'object' ){
		_integrateWith = {};
	}
	
	var touched = {};
	
	var actions = [];
	
	actions[ actions.length ] = { "objectID" : aModelRule.id,
		"commandType" : "delete",
		"value": null
	}
	
	for( var ref in aModelRule.ModelRuleConditions ){
	if( ref !== 'empty' ){
		var aModelRuleCond = aModelRule.ModelRuleConditions[ ref ];
	
		var aModelRelationshipCon = getObjPointer( master.model, aModelRuleCond.ModelRelationshipConnectorID );	
		if( aModelRelationshipCon == undefined ){
			throwError( 'line.js', 'deleteRule', 'The passed a model Relationship Connector ID, ' + aModelRuleCond.ModelRelationshipConnectorID + ', does not exist in the model' );
		}
		
		if( typeof _integrateWith[ aModelRelationshipCon.parentID ] === 'undefined' ){
			var aModelRelationship = getObjPointer( master.model, aModelRelationshipCon.parentID );	
			if( aModelRelationship == undefined ){
				throwError( 'line.js', 'deleteRule', 'The passed a model Parent ID, ' + aModelObjectCon.parentID + ', does not exist in the model' );
			}
			var aModelRelationship = cloneJSON( aModelRelationship );
			
			_integrateWith[ aModelRelationship.id ] = aModelRelationship;
		} else{
			var aModelRelationship = _integrateWith[ aModelRelationshipCon.parentID ]
		}
		
		var aModelRelationshipConUUID = getPointerUUID( aModelRelationshipCon.id );
		
		delete aModelRelationship.ModelRelationshipConnectors[ aModelRelationshipConUUID ].modelRuleConditions[ ref ]
		touched[ aModelRelationship.id ] = aModelRelationship;
	}
	}
	
	for( var ref in touched ){
		var aObj = touched[ ref ]; 
		
		actions[ actions.length ] = {
			"objectID" : aObj.id,
			"commandType" : "update",
			"value" : aObj
		}
	}
	
	return actions;
}

Rule.prototype.toggle = function( _type ){
	if( this.active === true ){
		this.close( _type );
	} else {
		this.open( _type );
	}
}

Rule.prototype.open = function( _type ){
	if( this.active === false ){
		this.active = true;
		this.type = _type;
		
		this.typeToIcon[ _type ].removeClass('icon')
			.addClass('icon_selected');
		
		master.canvas.rule.toggleCreateListener( _type );
	}
}

Rule.prototype.close = function( _type ){
	if( this.active === true && this.type === _type ){
		this.active = false;
		this.type = null;
		
		this.typeToIcon[ _type ].removeClass('icon_selected')
			.addClass('icon');
		
		master.canvas.rule.toggleCreateListener( _type );
	}
}
