function ORMOBJ(){
	this.active = null;
	
	//objectID and value.id must both be changed to the SAME value
	this.entityTemplate = {	
		"objectID" : "Model/Model/ModelObjects/UUID",
		"commandType" : "insert",
		"value" : {
		    "id": "Model/Model/ModelObjects/UUID",
		    "name": "",
		    "type": "entity",
		    "notes": "",
		    "ModelRelationshipConnectors": { "empty":"" }
		}
	}
	
	//objectID and value.id must both be changed to the SAME value
	this.valueTemplate = {	
		"objectID" : "Model/Model/ModelObjects/UUID",
		"commandType" : "insert",
		"value" : {
		    "id": "Model/Model/ModelObjects/UUID",
		    "name": "",
		    "type": "value",
		    "notes": "",
		    "ModelRelationshipConnectors": { "empty":"" }
		}
	}
	
	this.modelObject = null;
	this.visualGroup = null;
	
	this.massAddObjectCount = 0;
	this.massAddOneForm = '<fieldset><legend>Object ###</legend>';
	this.massAddOneForm += '<label for="mass_add_name_###">Name:</label><input name="mass_add_name_###" id="mass_add_name_###" value=""/>';
	this.massAddOneForm += '<label for="mass_add_type_###">Type:</label><select name="mass_add_type_###" id="mass_add_type_###"><option value="entity">Entity</option><option value="value">Value</option></select></fieldset>';
	
	this.objectIDRegEx = /Model\/Model\/ModelObjects/;
}

ORMOBJ.prototype.addObj = function( _type ){
	var newModelID = uuid.v4();

	if( _type === 'entity' ){
		var aAction = cloneJSON( this.entityTemplate );	
	} else if( _type === 'value' ) {
		var aAction = cloneJSON( this.valueTemplate );
	}
	
	if( !aAction ){
		throwError( 'orm_obj.js', 'addObj', 'Passed type of "' + ( !_type ) ? '' : _type + '" is not valid', false );
		return;
	}
	
	aAction.objectID = "Model/Model/ModelObjects/" + newModelID;
	aAction.value.id = "Model/Model/ModelObjects/" + newModelID;
	
	var actions = [ aAction ];
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
	
		var visualActions = master.canvas.ormObj.addObj( _type, newModelID );
		master.canvas.ormObj.openEditName( visualActions.value );
		
		var trans = master.transaction.createTransaction( "VisualModel", [ visualActions ], trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'orm_obj.js', 'addObj', err.message, false );
		return;
	}
}

ORMOBJ.prototype.deleteAObj = function( _id, _integrateWith ){
	var aModelObject = getObjPointer( master.model, _id );
	if( aModelObject == undefined ){
		throwError( 'orm_obj.js', 'deleteAObj', 'Object to be deleted does not exist in the model' );
	}
	
	if( typeof _integrateWith !== 'object' ){
		_integrateWith = {};
	}
	
	var touched = {};
	var actions = [];
	
	actions[ actions.length ] = { 
		"objectID" : _id,
		"commandType" : "delete",
		"value": null
	}
	
	for( var ref in aModelObject.ModelRelationshipConnectors ){
	if( ref !== 'empty' ){
		var aModelRelationshipConn = getObjPointer( master.model, aModelObject.ModelRelationshipConnectors[ ref ] );
		if( aModelRelationshipConn == undefined ){
			throwError( 'orm_obj.js', 'deleteObj', 'The model relationship connector, ' + aModelObject.ModelRelationshipConnectors[ ref ] + ', in the object, ' + aModelObject.id + ' does not exist on the model.' );
		}
		
		if( typeof _integrateWith[ aModelRelationshipConn.parentID ] === 'undefined' ){
			var aModelRelationship = getObjPointer( master.model, aModelRelationshipConn.parentID );
			if( aModelRelationship == undefined ){
				throwError( 'orm_obj.js', 'deleteObj', 'Parent ID, ' + aModelRelationshipConn.parentID + ', does not exist on the model.' );
			}
			aModelRelationship = cloneJSON( aModelRelationship );
			_integrateWith[ aModelRelationship.id ] = aModelRelationship;
		} else {
			aModelRelationship = _integrateWith[ aModelRelationshipConn.parentID ];
		}
		
		aModelRelationship.ModelRelationshipConnectors[ ref ].objectID = "";
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

ORMOBJ.prototype.deleteObj = function( _ids ){
	var modelActions = [];
	var tempActions = [];
	var visualActions = [];
	var integrated = {};
	
	for( var i = 0; i < _ids.length; i++ ){
		if( _ids[i].match( this.objectIDRegEx ) != null ){
			var tempActions = this.deleteAObj( _ids[i], integrated  );
		} else if ( _ids[i].match( master.line.relationshipIDRegEx ) != null ){
			var tempActions = master.line.deleteRelationship( _ids[i], integrated  );
		} else if ( _ids[i].match( master.rule.ruleIDRegEx ) != null ){
			var tempActions = master.rule.deleteRule( _ids[i], integrated  );
		}
		
		for( var j = 0; j < tempActions.length; j++ ){
			var insert = true;
			
			for( var k = 0; k < modelActions.length; k++ ){
				if( tempActions[j].objectID === modelActions[k].objectID ){
					if( modelActions[k].commandType === 'delete' ){
						tempActions.splice( j, 1 );
						j--;
						var insert = false;
						break;
					} else {
						modelActions.splice( k, 1 );
						break;
					}
				}
			}
			
			if( insert === true )
				modelActions[ modelActions.length ] = tempActions[j];
		}
		
		var aVisualGroup = master.canvas.ormObj.findGroupByModelID( _ids[ i ] );
		var aVisualLink = master.canvas.line.findLinkByModelID( _ids[ i ] );
		if( aVisualGroup != undefined ){
			tempActions = master.canvas.ormObj.deleteObj( aVisualGroup.id, integrated );
			
			for( var j = 0; j < tempActions.length; j++ ){
				var insert = true;
				 
				for( var k = 0; k < visualActions.length; k++ ){
					if( tempActions[j].objectID === visualActions[k].objectID ){
						if( visualActions[k].commandType === 'delete' ){
							tempActions.splice( j, 1 );
							insert = false;
							break;
						} else {
							visualActions.splice( k, 1 );
							break;
						}
					}
				}
				
				if( insert === true )
					visualActions[ visualActions.length ] = tempActions[j];
			}
		} else if( aVisualLink != undefined ){
			tempActions = master.canvas.line.deleteLink( aVisualLink.id, integrated );
			
			for( var j = 0; j < tempActions.length; j++ ){
				var insert = true;
				 
				for( var k = 0; k < visualActions.length; k++ ){
					if( tempActions[j].objectID === visualActions[k].objectID ){
						if( visualActions[k].commandType === 'delete' ){
							tempActions.splice( j, 1 );
							insert = false;
							break;
						} else {
							visualActions.splice( k, 1 );
							break;
						}
					}
				}
				
				if( insert === true )
					visualActions[ visualActions.length ] = tempActions[j];
			}
		}
	}
	
	
	try{
		var trans = master.transaction.createTransaction( "Model", modelActions );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'orm_obj.js', 'deleteObj', err.message, false );
		return;
	}
}

ORMOBJ.prototype.editName = function( _id, _value ){
	if( cleanObjPointer( _id ).substring( 0, 24 ) !== 'Model/Model/ModelObjects' ){
		throwError( 'orm_obj.js', 'editName', 'Passed ID was not to an object in Model.Model.ModelObjects' );
	}
	
	var modelGroup = getObjPointer( master.model, _id );
	
	if( modelGroup == undefined ){
		throwError( 'orm_obj.js', 'editName', 'Passed ID was not found in the model' );
	}
	
	modelGroup.name = _value;
	
	var newAction = cloneJSON( this.entityTemplate );
	newAction.commandType = 'update';
	newAction.objectID = _id;
	newAction.value = modelGroup;
	newAction = [ newAction ];
	
	try{
		var trans = master.transaction.createTransaction( "Model", newAction );
		
		var visualGroup = master.canvas.ormObj.findGroupByModelID( _id );
		
		if( visualGroup != undefined ){
			var visualActions = master.canvas.ormObj.editName( visualGroup.id, _value );
			
			var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		}
		
		master.transaction.processTransactions( trans );
	} catch( err ){
		throwError( 'orm_obj.js', 'editName', err.message, false );
		return;
	}
}

ORMOBJ.prototype.openProperties = function( _id ){
	this.closeProperties();
	
	var visualObject = getObjPointer( master.model, _id );
	if( visualObject == undefined ){
		throwError( 'orm_obj.js', 'openProperties', 'Passed id, ' + _id + ', does not exist in the model' );
	}
	
	var modelObject = getObjPointer( master.model, visualObject.modelID );
	if( modelObject == undefined ){
		throwError( 'orm_obj.js', 'openProperties', 'Model ID, ' + visualObject.modelID + ', does not exist in the model' );
	}
	
	this.modelObject = modelObject;
	this.visualGroup = visualObject;
	
	$('#obj_name').val( modelObject.name );
	$('#obj_type').val( modelObject.type );
	this.changeTypeProperties();
	
	var visualPK = null;
	for( var ref in this.visualGroup.objects ){
	if( ref !== 'empty' ){
		visualPK = this.visualGroup.objects[ ref ];
		
		if( visualPK.type === 'pk' )
			break;
	}
	}
	
	if( visualPK.type === 'pk' ){
		var pkText = visualPK.attr.text.substring( 1 );
		pkText = pkText.substring( 0, visualPK.attr.text.length - 2 );
		$('#obj_pk').val( pkText );
	}
	
	$('#wander_obj_prop').show();
	$('#obj_name').focus();
}

ORMOBJ.prototype.closeProperties = function(){
	this.modelObject = null;
	this.visualGroup = null;
	$('#obj_name').val('');
	$('#obj_pk').val('');
	$('#obj_type').val( 'entity' );
	$('#wander_obj_prop').hide();
}

ORMOBJ.prototype.changeTypeProperties = function(){
	var type = $('#obj_type').val();
	
	if( type === 'entity' ){
		$('#p_obj_type').show();
	} else {
		$('#obj_pk').val('')
		$('#p_obj_type').hide();
	}
	
}

//Called on keypress in certain fields, if enter was press run saveProperties
ORMOBJ.prototype.savePropertiesOnEnter = function( e ){
	if( e.which == 13 || e.which == 10 ){
		master.ormObj.saveProperties( true );
	}
}

ORMOBJ.prototype.saveProperties = function( _closeOnFinish ){
	var pkName = $('#obj_pk').val();
	
	var modelGroup = cloneJSON( this.modelObject );
	
	modelGroup.name = $('#obj_name').val();
	modelGroup.type = $('#obj_type').val();
	
	var actions = [];
	
	var visualPK = null;
	for( var ref in this.visualGroup.objects ){
	if( ref !== 'empty' ){
		visualPK = this.visualGroup.objects[ ref ];
		
		if( visualPK.type === 'pk' )
			break;
	}
	}
	
	if( visualPK.type !== 'pk' )
		visualPK = undefined;
	
	var modelPKID = null;
	
	if( visualPK == undefined || visualPK === '' ){
		var modelGroup = {
			"objectID" : modelGroup.id,
			"commandType" : "update",
			"value" : modelGroup
		}
		
		actions[ actions.length ] = modelGroup;
		
		//Create new model Object for the PK Values
		var modelGroupPKUUID = uuid.v4();
		
		var modelGroupPK = cloneJSON( this.valueTemplate );
		modelGroupPK.objectID = modelGroupPK.objectID.replace( 'UUID', modelGroupPKUUID ) 
		modelGroupPK.value.id = modelGroupPK.objectID;
		modelGroupPK.value.name = pkName;
		
		actions[ actions.length ] = modelGroupPK;
		
		modelPKID = modelGroupPK.objectID;
		
		//Create new Model Relationship to link PK value with existing object
		var modelRelationshipUUID = uuid.v4();
		var modelRelationship = cloneJSON( master.line.relationshipTemplate );
		modelRelationship.objectID = modelRelationship.objectID.replace( 'UUID', modelRelationshipUUID );
		modelRelationship.value.id = modelRelationship.objectID;
		modelRelationship.value.Role = 'primary key';
		modelRelationship.value.InverseRole = 'identifies'
		
		//Link to Object
		var modelRelationshipConObjUUID = uuid.v4()
		var modelRelationshipConObj = cloneJSON( master.line.connectorTemplate );
		modelRelationshipConObj.id = modelRelationship.objectID + '/ModelRelationshipConnectors/' + modelRelationshipConObjUUID;
		modelRelationshipConObj.parentID = modelRelationship.objectID;
		modelRelationshipConObj.objectID = modelGroup.value.id;
		
		modelRelationship.value.ModelRelationshipConnectors[ modelRelationshipConObjUUID ] = modelRelationshipConObj;
		
		modelGroup.value.ModelRelationshipConnectors[ modelRelationshipConObjUUID ] = modelRelationshipConObj.id;
		
		//Link to PK
		var modelRelationshipConPKUUID = uuid.v4()
		var modelRelationshipConPK = cloneJSON( master.line.connectorTemplate );
		modelRelationshipConPK.id = modelRelationship.objectID + '/ModelRelationshipConnectors/' + modelRelationshipConPKUUID;
		modelRelationshipConPK.parentID = modelRelationship.objectID;
		modelRelationshipConPK.objectID = modelGroupPK.value.id;
		
		modelRelationship.value.ModelRelationshipConnectors[ modelRelationshipConPKUUID ] = modelRelationshipConPK;
		
		modelGroupPK.value.ModelRelationshipConnectors[ modelRelationshipConPKUUID ] = modelRelationshipConPK.id;
		
		actions[ actions.length ] = modelRelationship;
		
		//Primary Unique rule on object side
		var modelRuleUniObjUUID = uuid.v4();
		var modelRuleUniObj = cloneJSON( master.rule.ruleTempalte );
		modelRuleUniObj.objectID = modelRuleUniObj.objectID.replace( 'UUID', modelRuleUniObjUUID );
		modelRuleUniObj.value.id = modelRuleUniObj.objectID;
		modelRuleUniObj.value.type = 'primary unique';
		
		//Rule connection to object
		var modelRuleConUniObjUUID = uuid.v4();
		var modelRuleConUniObj = cloneJSON( master.rule.ruleConditionTempalte );
		modelRuleConUniObj.id = modelRuleUniObj.objectID + '/ModelRuleConditions/' + modelRuleConUniObjUUID;
		modelRuleConUniObj.parentID = modelRuleUniObj.value.id;
		modelRuleConUniObj.ModelRelationshipConnectorID = modelRelationshipConObj.id;
		
		modelRuleUniObj.value.ModelRuleConditions[ modelRuleConUniObjUUID ] = modelRuleConUniObj;
		
		modelRelationshipConObj.modelRuleConditions[ modelRuleConUniObjUUID ] = modelRuleConUniObj.id;
		
		actions[ actions.length ] = modelRuleUniObj;
		
		//Required Rule on Object Side
		var modelRuleReqObjUUID = uuid.v4();
		var modelRuleReqObj = cloneJSON( master.rule.ruleTempalte );
		modelRuleReqObj.objectID = modelRuleReqObj.objectID.replace( 'UUID', modelRuleReqObjUUID );
		modelRuleReqObj.value.id = modelRuleReqObj.objectID;
		modelRuleReqObj.value.type = 'required';
		
		//Rule connection to Object
		var modelRuleConReqObjUUID = uuid.v4();
		var modelRuleConReqObj = cloneJSON( master.rule.ruleConditionTempalte );
		modelRuleConReqObj.id = modelRuleReqObj.objectID + '/ModelRuleConditions/' + modelRuleConReqObjUUID;
		modelRuleConReqObj.parentID = modelRuleReqObj.value.id;
		modelRuleConReqObj.ModelRelationshipConnectorID = modelRelationshipConObj.id;
		
		modelRuleReqObj.value.ModelRuleConditions[ modelRuleConReqObjUUID ] = modelRuleConReqObj;
		
		modelRelationshipConObj.modelRuleConditions[ modelRuleConReqObjUUID ] = modelRuleConReqObj.id;
		
		actions[ actions.length ] = modelRuleReqObj;
		
		//Primary Unique on PK Side
		var modelRuleUniPKUUID = uuid.v4();
		var modelRuleUniPK = cloneJSON( master.rule.ruleTempalte );
		modelRuleUniPK.objectID = modelRuleUniPK.objectID.replace( 'UUID', modelRuleUniPKUUID );
		modelRuleUniPK.value.id = modelRuleUniPK.objectID;
		modelRuleUniPK.value.type = 'primary unique';
		
		//Rule connection to PK
		var modelRuleConUniPKUUID = uuid.v4();
		var modelRuleConUniPK = cloneJSON( master.rule.ruleConditionTempalte );
		modelRuleConUniPK.id = modelRuleUniPK.objectID + '/ModelRuleConditions/' + modelRuleConUniPKUUID;
		modelRuleConUniPK.parentID = modelRuleUniPK.value.id;
		modelRuleConUniPK.ModelRelationshipConnectorID = modelRelationshipConPK.id;
		
		modelRuleUniPK.value.ModelRuleConditions[ modelRuleConUniPKUUID ] = modelRuleConUniPK;
		
		modelRelationshipConPK.modelRuleConditions[ modelRuleConUniPKUUID ] = modelRuleConUniPK.id;
		
		actions[ actions.length ] = modelRuleUniPK;
		
	} else if ( visualPK != undefined && pkName === '' ) {
		var modelObjectPK = getObjPointer( master.model, visualPK.modelID );
		if( modelObjectPK == undefined ){
			throwError( 'orm_obj.js', 'saveProperties', 'Model ID, ' + visualPK.modelID + ', does not exist on the model.' );
		}
		modelObjectPK = cloneJSON( modelObjectPK );
		
		//If PK is linked to more than 1 relationship, don't delete
		if( getPropertyCount( modelObjectPK.ModelRelationshipConnectors, true === 1 ) )	{
			var found = false;
			var modelRelationship = null;
			//Find the connector associated with modelObjectPK that connects to modelGroup and only modelGroup
			for( var conRef in modelObjectPK.ModelRelationshipConnectors ){
			if( conRef !== 'empty' ){
			//Loop through each connector and get parent
				var modelRelationshipPKCon = getObjPointer( master.model, modelObjectPK.ModelRelationshipConnectors[ conRef ] );
				if( modelRelationshipPKCon == undefined ){
					throwError( 'orm_obj.js', 'saveProperties', 'Model ID, ' + modelObjectPK.ModelRelationshipConnectors[ conRef ] + ', does not exist on the model.' );
				}
				
				modelRelationship = getObjPointer( master.model, modelRelationshipPKCon.parentID );
				if( modelRelationship == undefined ){
					throwError( 'orm_obj.js', 'saveProperties', 'ParentID, ' + modelRelationshipCon.parentID + ', does not exist on the model.' );
				}
				modelRelationship = cloneJSON( modelRelationship );
				
				//Loop through other connectors, if a connector is found that is not linked to modelGroup set correct to false
				var correct = true;
				for( var objConRef in modelRelationship.ModelRelationshipConnectors ){
				if( objConRef !== 'empty' && objConRef !== conRef ){
					var modelRelationshipObjCon = modelRelationship.ModelRelationshipConnectors[ objConRef ];
					if( modelRelationshipObjCon.objectID !== modelGroup.id ){
						correct = false;
						break;
					}
				}
				}
				
				//If correct is still true than we've found the right relationship, set found to true and break
				if( correct === true ){
					found = true;
					break;
				}
			}
			}
			
			//If relationship not found do nothing
			if( found === true ){
				var integate = {};
				integate[ modelGroup.id ] = modelGroup; 
				
				var deleteActions = master.line.deleteRelationship( modelRelationship.id, integate );
				var deleteActions2 = this.deleteAObj( modelObjectPK.id, integate );
				
				for( var i = 0; i < deleteActions.length; i++ ){
					var found = false;
					for( var j = 0; j < deleteActions2.length; j++ ){
						//If delete actions 1 is delete then use it, otherwise use delete action 2 because it's "newer"
						if( deleteActions[ i ].objectID === deleteActions2[ j ].objectID ){
							if( deleteActions[ i ].commandType === 'delete' ){
								actions[ actions.length ] = deleteActions[ i ];
								deleteActions2.splice( j, 1 );
							} else {
								deleteActions.splice( i, 1 );
								i--;
							}
							found = true;
							break;
						}
					}
					if( found === false )
						actions[ actions.length ] = deleteActions[ i ];
				}
				
				for( var i = 0; i < deleteActions2.length; i++  ){
					actions[ actions.length ] = deleteActions2[ i ];
				}
			}
		}
	} else if ( visualPK != undefined && visualPK !== pkName ){
		var modelObjectPK = getObjPointer( master.model, visualPK.modelID );
		if( modelObjectPK == undefined ){
			throwError( 'orm_obj.js', 'saveProperties', 'Model ID, ' + visualPK.modelID + ', does not exist on the model.' );
		}
		modelObjectPK = cloneJSON( modelObjectPK );
		
		modelObjectPK.name = pkName;
		
		actions[ actions.length ] = {	
			"objectID" : modelObjectPK.id,
			"commandType" : "update",
			"value" : modelObjectPK
		};
		
		modelPKID = modelObjectPK.id;
	}
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var visualActions = master.canvas.ormObj.saveProperties( modelPKID );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
		
		if( _closeOnFinish === true ){
			this.closeProperties();
		} else {
			this.openProperties( this.visualGroup.id );
		}
	}catch(err){
		throwError( 'orm_obj.js', 'addObj', err.message, false );
		return;
	}	
}

ORMOBJ.prototype.toggle = function( _icon ){
	if( this.active === _icon ){
		this.close( _icon );
	} else {
		this.open( _icon );
	}
}

ORMOBJ.prototype.open = function( _icon ){
	if( this.active === null ){
		var id = ""
		
		switch( _icon ){
			case 'entity':
				id = "icons_entity";
				break;
			case 'value':
				id = "icons_value";		
				break;
		}
		
		$('#' + id).removeClass('icon')
			.addClass('icon_selected');
			
		this.active = _icon;
		
		master.canvas.ormObj.toggleCreateListener( _icon );	
	}
}

ORMOBJ.prototype.close = function( _icon ){
	if( this.active === _icon ){
		var id = ""
		switch( _icon ){
			case 'entity':
				id = "icons_entity";
				break;
			case 'value':
				id = "icons_value";		
				break;
		}
		
		$('#' + id).removeClass('icon_selected')
			.addClass('icon');
		
		this.active = null;
		
		master.canvas.ormObj.toggleCreateListener( _icon );	
	}
}


ORMOBJ.prototype.toggleMassAdd = function(){
	if( $('#wandering_mass_add').is(':visible') ){
		this.closeMassAdd();
	} else {
		this.openMassAdd();
	}
}

ORMOBJ.prototype.openMassAdd = function(){
	$('#icons_mass_add').removeClass('icon')
		.addClass('icon_selected');
	
	$('#wandering_mass_add').show();
	$('#wandering_mass_add').css({'top' : '102px', 'left' : '140px'});
		
	$('#wandering_mass_add_content').html('');
	this.massAddObjectCount = 0;
		
	for( var i = 0; i < 5; i++ ){
		this.addOneForm();
	}
	
	setTimeout(function(){
		$('#mass_add_name_1').focus();
	}, 0);
	
	$('#wandering_mass_add').show();
	
	$('#wandering_mass_add').on( 'keydown.massAdd', function( e ){
		if( !e.shiftKey && e.which === 9 ){
			if( document.activeElement.id === ( 'mass_add_type_' + master.ormObj.massAddObjectCount ) ){
				master.ormObj.addOneForm();
			}
		} else if ( e.which === 13 ){
			master.ormObj.massAdd();
		}
	});
	
}

ORMOBJ.prototype.addOneForm = function(){
	this.massAddObjectCount++;
	
	$('#wandering_mass_add_content').append(
		this.massAddOneForm.replace( /###/g, this.massAddObjectCount )
	);
	
	setTimeout(function(){
		$('#mass_add_name_' + master.ormObj.massAddObjectCount).focus();
	}, 0);
}

ORMOBJ.prototype.closeMassAdd = function(){
	$('#icons_mass_add').removeClass('icon_selected')
		.addClass('icon');
	
	$('#wandering_mass_add').hide();
	$('#wandering_mass_add').off( 'keydown.massAdd' );
}

//This contains visualAction but not kinetic text, visual action code should probally be moved to canvas.orm_obj.js
ORMOBJ.prototype.massAdd = function(){
	var actions = [];
	var visualActions = [];
	
	var totalXY = {
		"y" : 10,
		"x" : 10
	}
	
	for( var i = 1; i <= this.massAddObjectCount; i++ ){
		var newModelID = uuid.v4();
	
		var name = $('#mass_add_name_' + i).val();
		var type = $('#mass_add_type_' + i).val();
		
		if( typeof name === 'string' && name !== '' ){
	
			if( type === 'entity' ){
				var aAction = cloneJSON( this.entityTemplate );
			} else if( type === 'value' ) {
				var aAction = cloneJSON( this.valueTemplate );
			}
			
			if( !aAction ){
				throwError( 'orm_obj.js', 'massAdd', 'Passed type of "' + ( type ) ? '' : type + '" is not valid', false );
				return;
			}
			
			aAction.objectID = "Model/Model/ModelObjects/" + newModelID;
			aAction.value.id = "Model/Model/ModelObjects/" + newModelID;
			aAction.value.name = name;
			
			
			var aVisualAction = master.canvas.ormObj.massAddOneObject( type, name, newModelID, totalXY )
			
			actions[ actions.length ] = aAction;
			visualActions[ visualActions.length ] = aVisualAction;
		}
	}
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
		
		this.closeMassAdd();
	}catch(err){
		throwError( 'orm_obj.js', 'addObj', err.message, false );
		return;
	}
}
