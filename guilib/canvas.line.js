/*	CanvasLine: this is the canvas pair of line. This object
 * 	contains all of the code nessisary to alter the canvas. It is
 * 	a child of the Canvas object.
 */
function CanvasLine(){
	//Makes the following templates read only
	if( typeof Object.freeze === 'function' ){
		Object.freeze( this.predicateTemplate );
		Object.freeze( this.roleTemplate );
		Object.freeze( this.roleLabelTemplate );
		Object.freeze( this.lineTemplate );
		Object.freeze( this.uniquenessTemplate );
		Object.freeze( this.requiredTemplate );
		Object.freeze( this.editRoleTemplate );
		Object.freeze( this.editUniquenessTemplate );
		Object.freeze( this.editRequiredTemplate );
	}
	
	this.height = stripChar( $('#wander_line_prop_canvas').css( 'height' ) );
	this.width = stripChar( $('#wander_line_prop_canvas').css( 'width' ) );
	
	//Sets up Kinetic stage to be used only to configure lines
	this.editStage = new Kinetic.Stage({
		container: 'wander_line_prop_canvas',
		width: this.width,
		height: this.height
	});

	//Creates main layer, for objects
	this.editLayer = new Kinetic.Layer();
	/*	Creates the layer for lines. They are on they're own
	 * 	layer so that they are always behind any object
	 */ 
	this.editLineLayer = new Kinetic.Layer();
	
	this.editY = this.height - ( ( this.roleTemplate.height + this.roleTemplate.y ) * 6 );
	this.editYRow2 = this.editY + 75;
	
	this.editStage.add( this.editLineLayer );
	this.editStage.add( this.editLayer );
	this.editLayer.draw();
};

//Prototype object that defines a CanvasLine
CanvasLine.prototype = {
	//todo: set id
	predicateTemplate : {
		id: 'UUID',
		x: 10,
		y: 10,
		draggable: true
	}
	/*	todo: set id and joinableSides.
	 * 	joinableSides determine which sides can be joined to
	 * 	the array is top, left, bottom right.
	 */
	, roleTemplate : {
		id: 'UUID',
		x: 0,
		y: 0,
		width: 20,
		height: 20,
		stroke: 'black',
		fill: 'white',
		strokeWidth: 1,
		joinableSides: [ true, true, true, true ]
	}
	/*	todo: set id and joinableSides.
	 * 	joinableSides determine which sides can be joined to
	 * 	the array is top, left, bottom right.
	 */
	, roleLabelTemplate : {
	    "id": "UUID",
	    "modelID": "UUID",
	    "parentID" : "UUID",
	    "type" : "roleText",
	    "className": "Text",
	    "attr": {
			"x": 0,
			"y": 0,
			"fontSize": '10pt',
			"fontFamily": 'Calibri',
			"fill": 'black',
			"text": 'REPLACE_ME',
			"id": 'UUID',
			"name" : 'UUID'
		},
	    "outside" : true,
	    "functions": { "attachTo" : { "functionName" : "attachTo", "params" : [ "_obj", "bottom", "_toAttach" ] } },
	    "links": { "empty":""}
	}
	/*	todo: aSide, zSide. The anchors are optional.
	 * 	aSide and zSide if set should be the ID
	 * 	aSideAnchor and zSideAnchor if set should be the ID
	 * 	of an object in a group in the visual object.
	 */
	, lineTemplate : {
		"id" : "UUID",
		"modelID" : "UUID",
		"aSide" : "UUID",
		"zSide" : "UUID",
		"aSideAnchor" : "",
		"zSideAnchor" : "",
		"otherPoints" : [],
		"attr" : {
	  		"points" : [0,0,0,0],
	  		"stroke" : 'black',
	  		"strokeWidth" : 1,
	  		"id" : "UUID"
	  	}
	}
	/*	todo: set id, set points
	 * 	points: set position 0 to start of role and position 3 to end of role
	 */
	, uniquenessTemplate :{
		id: 'UUID',
		points: [ 2, 0, 18, 0 ],
		stroke: 'black',
		strokeWidth: 1
	}/*	todo: set id, set points
	 * 	points: set position 0 to start of role and position 3 to end of role
	 */
	, uniquenessSpannerTemplate :{
		id: 'UUID',
		points: [ 2, 0, 18, 0 ],
		stroke: 'black',
		strokeWidth: 1,
		dash: [4, 1]
	}
	/*	todo: set id
	 */
	, requiredTemplate : {
	    "id": "VisualModel/links/UUID/SIDE",
	    "modelID": "Model/Model/ModelRules/UUID",
	    "type" : "required",
	    "className": "Circle",
	    "attr": {
			id: 'UUID',
	  		x: 0,
	  		y: 0,
	  		radius: 4,
			fill: '#BF5FFF'
	  	}
	}
	/*	todo: set id.
	 */
	, editRoleTemplate : {
		vri: 0,
		x: 0,
		y: 12,
		width: 30,
		height: 30,
		stroke: 'black',
		fill: 'white',
		strokeWidth: 1
	}
	/*	todo: set id, set width to width for a role
	 */
	, editUniquenessTemplate :{
		vri: 0,
		x: 0,
		y: 0,
		width: 26,
		height: 8,
		stroke: 'black',
		strokeWidth: 1,
		dash: [4, 1]
	}
	/*	todo: set id
	 */
	, editRequiredTemplate : {
		vri: 0,
  		x: 0,
  		y: 0,
  		radius: 6,
  		stroke: 'black',
  		fill: 'white',
  		dash:[ 4, 1 ] 
  	}
  	/*	todo: aSide, zSide. The anchors are optional.
	 * 	aSide and zSide if set should be the ID
	 * 	aSideAnchor and zSideAnchor if set should be the ID
	 * 	of an object in a group in the visual object.
	 */
	, inheritanceTemplate : {
		"id" : "UUID",
		"modelID" : "UUID",
		"aSide" : "UUID",
		"zSide" : "UUID",
		"aSideAnchor" : "",
		"zSideAnchor" : "",
		"otherPoints" : [],
		"attr" : {
	  		"points" : [0,0,0,0],
	  		"stroke" : '#BF5FFF',
  			"strokeWidth" : 4,
	  		"id" : "UUID"
	  	}
	}
	//When marking sides for line, this stores the first side selected
	, aSideID : null
	, aSideVisualID : null
	/*	Stores properties need to restore object to their previous state
	 * 	after they have been selected.
	 */
	, backupStroke : {}
	, backupStrokeWidth : {}
	//When creating a new line, this is the obejct that the mouse is over
	, mouseOverID : null
	, mouseVisualOverID : null
	//Kinetic objects for setting line properties
	, editStage : null
	, editLayer : null
	, editLineLayer : null
	, width : null
	, height : null
	, activePredID : ""
	, activePred : []
	, canvasPredGroup : null
	, mmCanvasUniqueTarget : null
	, mmCanvasUniqueTargetTarget : null
	, mmCanvasUnique : null
	, primary : false
	, primaryGroup : null
	, uniques : {}
	, uniqueDistanceFromRole : 7
	, primarySpace : 4
	, editY : 0
	, editYRow2 : 0
	, shift : false
	, ctrl : false
}

/*	syncPredicate: creates or edits a predicate to be in sync with
 * 	passed _modelID. A predicate is made up of 1 group that contains
 * 	one or more role (rect). Each rect will normall have 1 and only 1
 * 	line comming off of it. This line will be attached on the far end
 * 	to another rect within a group on the visual model.
 * 
 * 	Param:
 * 	_modelID: either a string ID to an object on the model, or a model
 * 	object (if not yet added to the model).
 * 
 * 	Returns:
 * 	actions to add/modify formated to be added to a transaction action
 */
CanvasLine.prototype.syncPredicate = function( _modelID, _newRules ){
	//Ouput
	var actions =[];
	
	//If string is passed look up the object, otherwise set modelObj to _modelID
	var modelObj;
	if( typeof _modelID === 'string' ){
		modelObj = getObjPointer( master.model, _modelID );
	} else if ( typeof _modelID === 'object' ) {
		modelObj = _modelID;
	}
	
	//If neither string or object, or string didn't return an object, throw error
	if( modelObj == undefined ){
		throwError( 'canvas.line.js', 'syncPredicate', 'Passed ID must exsist in the Model' );
	}
	
	//Get the visual model object by looking it up by the modelID
	var visualModel = this.findPredicateByModelID( _modelID.id );

	/*	If the object is not yet defined in the visual model (new object). 
	 * 	New objects are assumed to have no rules, those will be added via an edit
	 */ 
	if( visualModel == undefined ){
		//Assign a new UUID for the predicate
		var newPredID = uuid.v4();
		
		//Create the group id for the predicate
		var groupAttr = cloneJSON( this.predicateTemplate );
		groupAttr.id = "VisualModel/groups/" + newPredID
		
		//Create base for the predicate (group), not lines
		var visPredAction = {	
			"objectID" : "VisualModel/groups/" + newPredID,
			"commandType" : "insert",
			"value" : {
			    "type": "predicate",
			    "id": "VisualModel/groups/" + newPredID,
			    "modelID": _modelID.id,
			    "selectedBy": "default",
			    "attr": groupAttr,
				"functions": { "makeInteractive" : { "functionName" : "makeInteractive", "params" : [ "VisualModel/groups/"  + newPredID, "predicate" ] } },
			    "objects": {},
			    "horizontal" : true
			}
		}
		
		//Stores colective width and height of the predicate
		var visualPredWidth = 0;
		var visualPredHeight = 0;
		
		//Loop over eachconnector in the model predicate to order them
		var modelRelationships = [];
		for( var ref in modelObj.ModelRelationshipConnectors ){
			//Ignore any objects called empty
			if( ref !== 'empty' ){
				var aModelRelationship = modelObj.ModelRelationshipConnectors[ ref ];
				
				//lookup zSide, throw error if not found
				var aZSideVisGroup = master.canvas.ormObj.findGroupByModelID( aModelRelationship.objectID );				
				if( aZSideVisGroup == undefined ){
					throwError( 'canvas.line.js', 'syncPredicate', 'z-side model group id ' + aModelRelationship.id + ' is not represented in the visual model.' );
				}
		
				if( modelRelationships.length === 0 ){
					modelRelationships[ 0 ] = {
						"modelRelationship" : aModelRelationship,
						"zSideVisGroup": aZSideVisGroup
					}
				} else {
					var inserted = false;
					for( var i = 0; i < modelRelationships.length; i++ ){
						if( ( modelRelationships[ i ].zSideVisGroup.attr.x + modelRelationships[ i ].zSideVisGroup.attr.y ) > ( aZSideVisGroup.attr.x + aZSideVisGroup.attr.y ) ){
							var data = {
								"modelRelationship" : aModelRelationship,
								"zSideVisGroup": aZSideVisGroup
							}
							
							inserted = true;
							modelRelationships.splice( i, 0, data );
							break;
						}
					}
					if( inserted === false ){
						modelRelationships[ modelRelationships.length ] = {
							"modelRelationship" : aModelRelationship,
							"zSideVisGroup": aZSideVisGroup
						}
					}
				}
			}
		}
		
		//Used to calculate and average x and y to be used as the location of the predicate.
		var aX = [];
		var aY = [];
		
		//Loop over each connector in the in the model predicate
		for( var i = 0; i < modelRelationships.length; i++ ){
			var modelRelationship = modelRelationships[ i ].modelRelationship;
			
			//Store new UUIDs
			var newLinkID = uuid.v4();
			var objID = uuid.v4();
			
			//Create new role based upon the template
			var role = cloneJSON( this.roleTemplate );
			role.id = visPredAction.value.id + "/objects/" + objID;
			role.x = role.width * i;
			visualPredWidth += role.width;
			visualPredHeight = role.height;
			
			if( i === 0 && modelRelationships.length > 1 ){
				role.joinableSides = [ true, false, true, true ]
			} else if( i === 0 ){
				role.joinableSides = [ true, true, true, true ];
			} else if ( i === ( modelRelationships.length - 1 ) ) {
				role.joinableSides = [ true, true, true, false ];
			} else {
				role.joinableSides = [ true, false, true, false ];
			}
			
			//And add the role to the predicate group
			visPredAction['value']['objects'][objID] = {
			    "id": visPredAction.value.id + "/objects/" + objID,
			    "modelID": modelRelationship.id,
			    "parentID" : visPredAction.value.id,
			    "type" : "roleRect",
			    "className": "Rect",
			    "attr": role,
			    "functions": {},
			    "links": { "empty":""}
			}
			
			//Start creating the link between this role and another group object
			var linkAttr = cloneJSON( this.lineTemplate );
			linkAttr.id = "VisualModel/links/" + newLinkID;
			linkAttr.aSide = visPredAction.value.id + "/objects/" + objID;
			linkAttr.modelID = modelRelationship.id;
			linkAttr.attr.id = linkAttr.id; 
			
			//Add a pointer to the link to the predicate for better graph search
			visPredAction['value']['objects'][objID].links[ newLinkID ] = linkAttr.id;
			
			//lookup zSide
			var zSideVisGroup = modelRelationships[ i ].zSideVisGroup;
			
			//Grab the first Rect in the zSide group
			var rect = null;
			var groupRef = null;
			for( groupRef in zSideVisGroup.objects ){
				var aObj = zSideVisGroup.objects[ groupRef ];
				if( aObj.className === 'Rect' ){
					rect = aObj;
					break;
				}
			}
			
			//If not rect foud throw error
			if( rect === null ){
				throwError( 'canvas.line.js', 'syncPredicate', 'A rect was not found in the visual model.' );
			} else {
			//Store the ID and start position to center so that an average position can be calculated
				linkAttr.zSide = rect.id;
				aX[ aX.length ] = zSideVisGroup.attr.x + ( rect.attr.width / 2 );
				aY[ aY.length ] = zSideVisGroup.attr.y + ( rect.attr.height / 2);
				
				//Add link to zSide objects ref as well for better graph search
				zSideVisGroup.objects[ groupRef ].links[ newLinkID ] = "VisualModel/links/" + newLinkID;
			}
			
			//Add link to master actions
			actions[ actions.length ] = {	
				"objectID" : "VisualModel/links/" + newLinkID,
				"commandType" : "insert",
				"value" : linkAttr
			};
			
			//Add zSide to master action (so the referance to the link will be stored)
			actions[ actions.length ] = {	
				"objectID" : zSideVisGroup.id,
				"commandType" : "update",
				"value" : cloneJSON( zSideVisGroup )
			};
		}
		
		if( ( typeof modelObj.Role !== 'undefined' && modelObj.Role !== '' ) ){
			var text =  modelObj.Role;
			if( ( typeof modelObj.InverseRole !== 'undefined' && modelObj.InverseRole !== '' ) ){
				text += ' / ' + modelObj.InverseRole;
			}
			
			var objID = uuid.v4();
			
			var aRoleRect = null;
			for( var ref in visPredAction.value.objects ){
			if( ref !== 'empty' ){
				if(  visPredAction.value.objects[ ref ].type === 'roleRect' ){
					aRoleRect = visPredAction.value.objects[ ref ];
					break;
				}	
			}
			}
			
			if( aRoleRect == null ){
				throwError( 'canvas.line.js', 'syncPredicate', 'Assembled visual model for the predicate contains no roles' );
			}
			
			var visualText = cloneJSON( this.roleLabelTemplate );
			visualText.id = visPredAction.value.id + "/objects/" + objID;
			visualText.modelID = modelObj.id + '/Role';
			visualText.parentID = visPredAction.value.id;
			visualText.attr.id = visualText.id;
			visualText.attr.name = visualText.parentID;
			visualText.attr.text = text;
			visualText.functions.attachTo.params = [ visPredAction.value.id, "bottom", visualText.id  ];
			
			//And add the role to the predicate group
			visPredAction.value.objects[objID] = visualText
		}
		
		//Calculate position of predicate as average of all other center positions
		var x = 0
		for( var i = 0; i < aX.length; i++ ){
			x += aX[i]; 
		}
		x /= aX.length;
		
		var y = 0
		for( var i = 0; i < aX.length; i++ ){
			y += aY[i]; 
		}
		y /= aY.length;
		
		visPredAction.value.attr.x = x - ( visualPredWidth / 2 );
		visPredAction.value.attr.y = y - ( visualPredHeight / 2 );
		
		if( modelRelationships.length === 1 ){
			visPredAction.value.attr.x += 60;
		}
		
		//Store predicate in output
		actions[ actions.length ] = visPredAction; 
	} else {
		visualModel = cloneJSON( visualModel );
		var roleAdded = false;
		
		//First create ordered array of roles, and delete roles that no longer exists
		var modelRelationships = [];
		for( var visModelRef in visualModel.objects ){
		//Ignore any objects called empty
		if( visModelRef !== 'empty' ){
			var aVisualObject = visualModel.objects[ visModelRef ];
			var aModelRelationshipUUID = getPointerUUID( aVisualObject.modelID );
			
			if( aVisualObject.type === 'roleRect' ){
				var aModelRelationship = modelObj.ModelRelationshipConnectors[ aModelRelationshipUUID ];
				if( aModelRelationship == undefined ){
					//lookup zSide, throw error if not found
					var aZSideVisGroup = master.canvas.ormObj.findGroupByModelID( aModelRelationship.objectID );				
					if( aZSideVisGroup != undefined ){
						actions[ actions.length ] = {	
							"objectID" : aZSideVisGroup.id,
							"commandType" : "delete",
							"value" : null
						}
					}
					
					delete visualModel.objects[ ref ];
				} else {
					if( modelRelationships.length === 0 ){
						modelRelationships[ 0 ] = {
							"modelRelationship" : aModelRelationship,
							"visualObject": aVisualObject
						}
					} else {
						var inserted = false;
						for( var i = 0; i < modelRelationships.length; i++ ){
							if( ( modelRelationships[ i ].visualObject.attr.x + modelRelationships[ i ].visualObject.attr.y ) > ( aVisualObject.attr.x + aVisualObject.attr.y ) ){
								var data = {
									"modelRelationship" : aModelRelationship,
									"visualObject": aVisualObject
								}
								
								inserted = true;
								modelRelationships.splice( i, 0, data );
								break;
							}
						}
						if( inserted === false ){
							modelRelationships[ modelRelationships.length ] = {
								"modelRelationship" : aModelRelationship,
								"visualObject": aVisualObject
							}
						}
					}
					
					for( var linkRef in aVisualObject.links ){
					if( linkRef !== 'empty' ){
						var link = getObjPointer( master.model, aVisualObject.links[ linkRef ] ); 
						
						if( typeof link.aSideAnchor === 'object' && link.aSideAnchor.type === 'required' ){
							var aRule = this.syncPredicateHelperGetRule( link.aSideAnchor.modelID, _newRules );
							var found = typeof this.syncPredicateHelperGetRule( link.aSideAnchor.modelID, _newRules ) !== 'undefined';
						
							if( found === false ){
								var link = cloneJSON( link );
								link.aSideAnchor = "";
								
								actions[ actions.length ] = actions[ actions.length ] = {	
									"objectID" : link.id,
									"commandType" : "update",
									"value" : link
								};
							}						
						}
						
						break;
					}
					}
				}
			//If type is not roleRect
			} else {
				//If the visual's modelID is for a rule
				if( aVisualObject.modelID.match( master.rule.ruleIDRegEx ) != null ){
					var found = typeof this.syncPredicateHelperGetRule( aVisualObject.modelID, _newRules ) !== 'undefined';
					
					if( found === false ){
						delete visualModel.objects[ visModelRef ];
						
						//Also delete all other objects with the same model ID
						for( var visModelRefTemp in visualModel.objects ){
						//Ignore any objects called empty
						if( visModelRefTemp !== 'empty' ){
							var aVisualObjectTemp = visualModel.objects[ visModelRefTemp ];
							
							if( aVisualObject.modelID === aVisualObjectTemp.modelID )
								delete visualModel.objects[ visModelRefTemp ];
						}
						}
						
						if( master.rule.uniqueTypes[ aVisualObject.type ] === true ){
							//Determine if there is another unique object with this 
							//x/y, don't move other obejcts if true
							var moveOthers = true;
							for( var ref in visualModel.objects ){
							if( ref !== 'empty' ){
								var tempVisualModel = visualModel.objects[ ref ];
								
								if( visualModel.horizontal === true ){
									if( aVisualObject.attr.y === tempVisualModel.attr.y ){
										moveOthers = false;
										break;
									}
								} else {
									if( aVisualObject.attr.x === tempVisualModel.attr.x ){
										moveOthers = false;
										break;
									}
								}
							}
							}
							
							if( moveOthers === true ){
								for( var visObjRef in visualModel.objects ){
								if( visObjRef !== 'empty' ){
									var aVisualObject = visualModel.objects[ visObjRef ];
									if( aVisualObject.className !== 'Line' ){
										if( visualModel.horizontal === true ){
											aVisualObject.attr.y -= this.uniqueDistanceFromRole;
										} else {
											aVisualObject.attr.x -= this.uniqueDistanceFromRole;
										}	
									} else {
										if( visualModel.horizontal === true ){
											for( var i = 1; i < aVisualObject.attr.points.length; i += 2 ){
												aVisualObject.attr.points[i] -= this.uniqueDistanceFromRole;
											}
										} else {
											for( var i = 0; i < aVisualObject.attr.points.length; i += 2 ){
												aVisualObject.attr.points[i] -= this.uniqueDistanceFromRole;
											}
										}
										
									}
								}
								}
							
								if( visualModel.horizontal === true ){
									visualModel.attr.y -= this.uniqueDistanceFromRole;
								} else {
									visualModel.attr.x -= this.uniqueDistanceFromRole;
								}
							}
						}
					}
				}	
			}
		}
		}
				
		//Now create new visualRoles as nessisary
		for( var ref in modelObj.ModelRelationshipConnectors ){
		if( ref !== 'empty' ){
			var aModelRelationshipConnector = modelObj.ModelRelationshipConnectors[ ref ];
			
			var found = false;
			for( var i = 0; i < modelRelationships.length; i++ ){
				if( modelRelationships[i].modelRelationship.id === aModelRelationshipConnector.id ){
					found = true;
					break;
				}
			}
			
			if( found === false ){
				var tempID = uuid.v4();
				
				var aVisualObjectAttr = cloneJSON( this.roleTemplate );
				aVisualObjectAttr.id = visualModel.id + '/objects/' + tempID;
				aVisualObjectAttr.height = modelRelationships[0].visualObject.attr.height;
				aVisualObjectAttr.width = modelRelationships[0].visualObject.attr.width;
				
				if( visualModel.horizontal === true ){
					aVisualObjectAttr.x = aVisualObjectAttr.width;
				} else {
					aVisualObjectAttr.y = aVisualObjectAttr.height;
				}
				
				for( var i = 1; i < modelRelationships.length; i++ ){
					if( visualModel.horizontal === true ){
						modelRelationships[i].visualObject.attr.x += aVisualObjectAttr.width;
					} else {
						modelRelationships[i].visualObject.attr.y += aVisualObjectAttr.height;
					}
				}
				
				aVisualObject = {
				    "id": aVisualObjectAttr.id,
				    "modelID": aModelRelationshipConnector.id,
				    "type" : "roleRect",
				    "className": "Rect",
				    "attr": aVisualObjectAttr,
				    "functions": {},
				    "links": { "empty":""}
				};
				
				var data = {
					"modelRelationship" : aModelRelationshipConnector,
					"visualObject": aVisualObject
				}
				
				modelRelationships.splice( 1, 0, data );
				
				visualModel.objects[ tempID ] = aVisualObject;
				
				var newLinkID = uuid.v4();
				
				//Start creating the link between this role and another group object
				var linkAttr = cloneJSON( this.lineTemplate );
				linkAttr.id = "VisualModel/links/" + newLinkID;
				linkAttr.aSide = aVisualObject.id;
				linkAttr.zSide = "";
				linkAttr.modelID = aVisualObject.modelID;
				
				//Add a pointer to the link to the predicate for better graph search
				aVisualObject.links[ newLinkID ] = linkAttr.id;
				
				//Add link to master actions
				actions[ actions.length ] = {	
					"objectID" : linkAttr.id ,
					"commandType" : "insert",
					"value" : linkAttr
				};
			}
		}
		}
		
		//Now interpret rules
		for( var mri = 0; mri < modelRelationships.length; mri++ ){
			var pair = modelRelationships[ mri ];
			//Now add rules
			for( var rulesRef in pair.modelRelationship.modelRuleConditions ){
			if( rulesRef !== 'empty' ){
				var aModelRule = this.syncPredicateHelperGetRule( pair.modelRelationship.modelRuleConditions[ rulesRef ], _newRules );
				
				if( aModelRule == undefined ){
					throwError( 'Canvas.Line', 'syncPredicate', 'The passed predicate contained a rule that could not be found in local storage or the passed set of new rules.' );
				}
				
				if( master.rule.uniqueTypes[ aModelRule.type ] === true ){
					//Determine if it alread exists
					var found = false;
					for( var visObjRef in visualModel.objects ){
					if( visObjRef !== 'empty' ){
						var aVisualObject = visualModel.objects[ visObjRef ];
						
						if( aModelRule.id === aVisualObject.modelID ){
							found = true;
							break;
						}
					}
					}
					
					//If the rules was not found proceed.
					//Logic Note: Unique rules are not altered they are deleted and remade.
					if( found === false && master.line.ruleInsidePred( aModelRule, modelObj ) === true ){
						//Create an ordered unique array for eaiser processing
						var aUnique = [];
						for( var ref in aModelRule.ModelRuleConditions ){
						if( ref !== 'empty' ){
							var aModelRuleCondition = aModelRule.ModelRuleConditions[ ref ];
							
							for( var i = 0 ; i < modelRelationships.length; i++ ){
								if( modelRelationships[ i ].modelRelationship.id === aModelRuleCondition.ModelRelationshipConnectorID ){
									aUnique[ aUnique.length ] = i;
									break;
								}
							}
						}
						}
						
						//Get an order list of uniques so we can determine where to place the unique						
						//First insert all data while conditioning for primaries
						var allVisualUniques = [];
						for( var visObjRef in visualModel.objects ){
						if( visObjRef !== 'empty' ){
							var aVisualObject = visualModel.objects[ visObjRef ];
							
							if( master.rule.uniqueTypes[ aVisualObject.type ] === true ){
								if( aVisualObject.type.substring( 0, 7 ) === 'primary' ){
									var found = false
									for( var i = 0; i < allVisualUniques.length; i++ ){
										if( allVisualUniques[i].modelID === aVisualObject.modelID ){
											found = true;
											break;
										}
									}
									
									if( found === false ){
										for( var visObjRef2 in visualModel.objects ){
										if( visObjRef2 !== 'empty' ){
											var aVisualObject2 = visualModel.objects[ visObjRef2 ];
											
											if( aVisualObject.modelID === aVisualObject2.modelID ){
												if( ( aVisualObject.attr.points[0] + aVisualObject.attr.points[1] ) > ( aVisualObject2.attr.points[0] + aVisualObject2.attr.points[1] ) ){
													allVisualUniques[ allVisualUniques.length ] = aVisualObject;
												} else {
													allVisualUniques[ allVisualUniques.length ] = aVisualObject2;
												}
												break;
											}
										}
										}	
									}
								} else {
									allVisualUniques[ allVisualUniques.length ] = aVisualObject;
								}
							}
						}
						}
						
						var visualUniques = [];
						for( var voi = 0; voi < allVisualUniques.length; voi++ ){
							var aVisualObject = allVisualUniques[ voi ];
							
							var inserted = false;
							if( master.rule.uniqueTypes[ aVisualObject.type ] === true ){
								if( visualUniques.length === 0 ){
									visualUniques[0] = aVisualObject;
									inserted = true; 
								} else {
									for( var i = 0; i < visualUniques.length; i++ ){
										if( ( visualModel.horizontal === true && visualUniques[i].attr.points[1] === aVisualObject.attr.points[1] )
										|| ( visualModel.horizontal === false && visualUniques[i].attr.points[0] === aVisualObject.attr.points[0] ) ){
											inserted = true;
											break;
										} else if( ( visualUniques[i].attr.points[0] + visualUniques[i].attr.points[1] ) > ( aVisualObject.attr.points[0] + aVisualObject.attr.points[1] ) ){
											modelRelationships.splice( i, 0, aVisualObject );
											inserted = true;
											break;
										}
									}
								}
								if( inserted === false ){
									visualUniques[ visualUniques.length ] = aVisualObject;
								}
							}
						}
						
						/*	If the bottom unique is not many to many and the unique your inserted is also 
						 *	not manu to manythan you don't need to move anything 
						 */
						var lastI = visualUniques.length - 1;
						if( lastI === -1 || !( aUnique.length === 1 && ( visualUniques[ lastI ].type === 'unique' || visualUniques[ lastI ].type === 'primary unique' ) ) ){
							for( var visObjRef in visualModel.objects ){
							if( visObjRef !== 'empty' ){
								var aVisualObject = visualModel.objects[ visObjRef ];
								//If the unique being inserted is not many to many then don't move any existing uniques
								//so the new unique can be placed at the bottom
								if( aUnique.length !== 1 || !master.rule.uniqueTypes[ aVisualObject.type ] ){
									if( aVisualObject.className !== 'Line' ){
										if( visualModel.horizontal === true ){
											aVisualObject.attr.y += this.uniqueDistanceFromRole;
										} else {
											aVisualObject.attr.x += this.uniqueDistanceFromRole;
										}
									} else {
										if( visualModel.horizontal === true ){
											for( var i = 1; i < aVisualObject.attr.points.length; i += 2 ){
												aVisualObject.attr.points[i] += this.uniqueDistanceFromRole;
											}
										} else {
											for( var i = 0; i < aVisualObject.attr.points.length; i += 2 ){
												aVisualObject.attr.points[i] += this.uniqueDistanceFromRole;
											}
										}
										
									}
								}
							}
							}
							
							if( visualModel.horizontal === true ){
								visualModel.attr.y -= ( this.uniqueDistanceFromRole / 2 );
							} else {
								visualModel.attr.x -= ( this.uniqueDistanceFromRole / 2 );
							}
						}
						
						if( aUnique.length === 1 ){
							var tempID = uuid.v4();
							
							var uniqueAttr = cloneJSON( this.uniquenessTemplate );
							uniqueAttr.id = visualModel.id + '/objects/' + tempID;
							
							if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
								var primaryTempID = uuid.v4();
									
								var uniquePrimaryAttr = cloneJSON( this.uniquenessTemplate );
								uniquePrimaryAttr.id = visualModel.id + '/objects/' + primaryTempID;
							}
							if( visualModel.horizontal === true ){
								if( lastI > -1 && ( visualUniques[ lastI ].type === 'unique' || visualUniques[ lastI ].type === 'primary unique' ) ){ 
									var y = visualUniques[ lastI ].attr.points[1];
								} else if ( lastI > -1 ) {
									var y = visualUniques[ lastI ].attr.points[1] + this.uniqueDistanceFromRole  
								} else {
									var y = 0;
								}
								
								uniqueAttr.points[0] = modelRelationships[ aUnique[0] ].visualObject.attr.x + 2
								uniqueAttr.points[1] = y;
								uniqueAttr.points[2] = modelRelationships[ aUnique[0] ].visualObject.attr.x + modelRelationships[ aUnique[0] ].visualObject.attr.width - 2;
								uniqueAttr.points[3] = y;
								if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
									uniquePrimaryAttr.points[0] = modelRelationships[ aUnique[0] ].visualObject.attr.x + 2
									uniquePrimaryAttr.points[1] = y + this.primarySpace;
									uniquePrimaryAttr.points[2] = modelRelationships[ aUnique[0] ].visualObject.attr.x + modelRelationships[ aUnique[0] ].visualObject.attr.width - 2;
									uniquePrimaryAttr.points[3] = y + this.primarySpace;	
								}
							} else {
								if( lastI > -1 && aUnique.length === 1 && ( visualUniques[ lastI ].type === 'unique' || visualUniques[ lastI ].type === 'primary unique' ) ){ 
									var x = visualUniques[ lastI ].attr.points[0];
								} else if ( lastI > -1 && aUnique.length === 1 ) {
									var x = visualUniques[ lastI ].attr.points[0] + this.uniqueDistanceFromRole  
								} else {
									var x = 0;
								}
								
								uniqueAttr.points[0] = x;
								uniqueAttr.points[1] = modelRelationships[ aUnique[0] ].visualObject.attr.y + 2;
								uniqueAttr.points[2] = x;
								uniqueAttr.points[3] = modelRelationships[ aUnique[0] ].visualObject.attr.y + modelRelationships[ aUnique[0] ].visualObject.attr.height - 2;;
								if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
									uniquePrimaryAttr.points[0] = x + this.primarySpace;
									uniquePrimaryAttr.points[1] = modelRelationships[ aUnique[0] ].visualObject.attr.y + 2;
									uniquePrimaryAttr.points[2] = x + this.primarySpace;
									uniquePrimaryAttr.points[3] = modelRelationships[ aUnique[0] ].visualObject.attr.y + modelRelationships[ aUnique[0] ].visualObject.attr.height - 2;;
								}
							}
							
							var aVisualObject = {
							    "id": uniqueAttr.id,
							    "modelID": aModelRule.id,
							    "type" : aModelRule.type,
							    "className": "Line",
							    "attr": uniqueAttr,
							    "functions": {},
							    "links": { "empty":""}
							};
							
							visualModel.objects[ tempID ] = aVisualObject;
							
							if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
								var aVisualObject = {
								    "id": uniquePrimaryAttr.id,
								    "modelID": aModelRule.id,
								    "type" : aModelRule.type,
								    "className": "Line",
								    "attr": uniquePrimaryAttr,
								    "functions": {},
								    "links": { "empty":""}
								};
								
								visualModel.objects[ primaryTempID ] = aVisualObject;
							}
						} else {
							for( var i = 0; i < aUnique.length; ){
								var span = 1;
								for( var j = i + 1; j < aUnique.length; j++ ){
									if( aUnique[ j - 1 ] + 1 === aUnique[j] ){
										span++;
									} else {
										break;
									}
								}
								
								var tempID = uuid.v4();
								
								var uniqueAttr = cloneJSON( this.uniquenessTemplate );
								uniqueAttr.id = visualModel.id + '/objects/' + tempID;
								
								if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
									var primaryTempID = uuid.v4();
									
									var uniquePrimaryAttr = cloneJSON( this.uniquenessTemplate );
									uniquePrimaryAttr.id = visualModel.id + '/objects/' + primaryTempID;
								}
								if( visualModel.horizontal === true ){
									uniqueAttr.points[0] = modelRelationships[ aUnique[i] ].visualObject.attr.x + 2;
									uniqueAttr.points[1] = 0;
									uniqueAttr.points[2] = modelRelationships[ aUnique[i] ].visualObject.attr.x + ( modelRelationships[ aUnique[i] ].visualObject.attr.width * span ) - 2;
									uniqueAttr.points[3] = 0;
									if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
										uniquePrimaryAttr.points[0] = modelRelationships[ aUnique[i] ].visualObject.attr.x + 2;
										uniquePrimaryAttr.points[1] = this.primarySpace;
										uniquePrimaryAttr.points[2] = modelRelationships[ aUnique[i] ].visualObject.attr.x + ( modelRelationships[ aUnique[i] ].visualObject.attr.width * span ) - 2;
										uniquePrimaryAttr.points[3] = this.primarySpace;
									}
								} else {
									uniqueAttr.points[0] = 0;
									uniqueAttr.points[1] = modelRelationships[ aUnique[i] ].visualObject.attr.y + 2;
									uniqueAttr.points[2] = 0;
									uniqueAttr.points[3] = modelRelationships[ aUnique[i] ].visualObject.attr.y + ( modelRelationships[ aUnique[i] ].visualObject.attr.height * span ) - 2;
									if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
										uniquePrimaryAttr.points[0] = this.primarySpace;
										uniquePrimaryAttr.points[1] = modelRelationships[ aUnique[i] ].visualObject.attr.y + 2;
										uniquePrimaryAttr.points[2] = this.primarySpace;
										uniquePrimaryAttr.points[3] = modelRelationships[ aUnique[i] ].visualObject.attr.y + ( modelRelationships[ aUnique[i] ].visualObject.attr.height * span ) - 2;
									}
								}
								
								var aVisualObject = {
								    "id": uniqueAttr.id,
								    "modelID": aModelRule.id,
								    "type" : aModelRule.type,
								    "className": "Line",
								    "attr": uniqueAttr,
								    "functions": {},
								    "links": { "empty":""}
								};
								
								visualModel.objects[ tempID ] = aVisualObject;
								
								if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
									var aVisualObject = {
									    "id": uniquePrimaryAttr.id,
									    "modelID": aModelRule.id,
									    "type" : aModelRule.type,
									    "className": "Line",
									    "attr": uniquePrimaryAttr,
									    "functions": {},
									    "links": { "empty":""}
									};
									
									visualModel.objects[ primaryTempID ] = aVisualObject;
								}
								
								i += span;
							}
							
							for( var i = aUnique[0] + 1; i < modelRelationships.length && i < aUnique[ aUnique.length - 1 ]; i++ ){
								if( aUnique.indexOf( i ) === -1 ){
									var tempID = uuid.v4();
									
									var uniqueAttr = cloneJSON( this.uniquenessSpannerTemplate );
									uniqueAttr.id = visualModel.id + '/objects/' + tempID;
								
									if( visualModel.horizontal === true ){
										uniqueAttr.points[0] = modelRelationships[ i ].visualObject.attr.x + 2;
										uniqueAttr.points[1] = 0;
										uniqueAttr.points[2] = modelRelationships[ i ].visualObject.attr.x + modelRelationships[ i ].visualObject.attr.width - 2;
										uniqueAttr.points[3] = 0;
									} else {
										uniqueAttr.points[0] = 0;
										uniqueAttr.points[1] = modelRelationships[ i ].visualObject.attr.y + 2;
										uniqueAttr.points[2] = 0;
										uniqueAttr.points[3] = modelRelationships[ i ].visualObject.attr.y + modelRelationships[ i ].visualObject.attr.height - 2;
									}
									
									aVisualObject = {
									    "id": uniqueAttr.id,
									    "modelID": aModelRule.id,
									    "type" : aModelRule.type,
									    "className": "Line",
									    "attr": uniqueAttr,
									    "functions": {},
									    "links": { "empty":""}
									};
									
									visualModel.objects[ tempID ] = aVisualObject;
								}
							}
						}
					}
				} else if ( aModelRule.type === 'required' ){
					var inside = master.line.ruleInsidePred( aModelRule, modelObj );
					
					if( inside === true ){
						for( var linkRef in pair.visualObject.links ){
						if( linkRef !== 'empty' ){
							var link = getObjPointer( master.model, pair.visualObject.links[ linkRef ] );
							
							if( link != undefined ){
								if( link.modelID === pair.visualObject.modelID ){
									if( typeof link.aSideAnchor !== 'object' && link.aSideAnchor.modelID !== aModelRule.id ){
										var link = cloneJSON( link );
										var required = cloneJSON( this.requiredTemplate );
										required.id = link.id + '/aSideAnchor';
										required.attr.id = required.id;
										required.modelID = aModelRule.id; 
										
										link.aSideAnchor = required;
										
										actions[ actions.length ] = actions[ actions.length ] = {	
											"objectID" : link.id,
											"commandType" : "update",
											"value" : link
										};	
									}
									break;
								}
							//If this is a new link it may exist solely in actions	
							} else {
								var i = 0
								for( ; i < actions.length; i++ ){
									if( actions[i].objectID === pair.visualObject.links[ linkRef ] ){
										var link = actions[i].value;
										break; 
									}
								}
							}
							
							if( link == undefined ){
								throwError( 'Canvas.Line', 'syncPredicate', 'One of the link referances in the object, ' + pair.visualObject + ', does no exist in the model or as a new action.' );	
							}
							
							var link = cloneJSON( link );
							var required = cloneJSON( this.requiredTemplate );
							required.id = link.id + '/aSideAnchor';
							required.attr.id = required.id;
							required.modelID = aModelRule.id; 
							
							link.aSideAnchor = required;
							
							actions[i].value = link;
						}
						}	
					}
				}
			}
			}
			
			/*	Delete Required
			 * 	Determine if the link primarily associated with the role 
			 * 	( inside of outside constraint links ) is listed as required
			 */
			for( var linkRef in pair.visualObject.links ){
			if( linkRef !== 'empty' ){
				var link = getObjPointer( master.model, pair.visualObject.links[ linkRef ] );
				
				//if this is the primary link
				if( link != undefined && link.modelID === pair.visualObject.modelID ){
					//determine if there is an anchor that denotes required
					if( typeof link.aSideAnchor !== 'object' && link.aSideAnchor.type === 'required' ){
						var found = false;
						
						//See if that required is listed in the rules for the model relationship
						for( var rulesRef in pair.modelRelationship.modelRuleConditions ){
						if( rulesRef !== 'empty' ){
							var aModelRule = this.syncPredicateHelperGetRule( pair.modelRelationship.modelRuleConditions[ rulesRef ], _newRules );
							
							if( aModelRule == undefined ){
								throwError( 'Canvas.Line', 'syncPredicate', 'The passed predicate contained a rule that could not be found in local storage or the passed set of new rules.' );
							}
							
							if( link.aSideAnchor.modelID === aModelRule.id ){
								found = true;
								break;
							}
						}
						}
						
						//if not found then remove the anchor
						if( found === false ){
							var link = cloneJSON( link );
							var required = cloneJSON( this.requiredTemplate );
							required.id = link.id + '/aSideAnchor';
							required.attr.id = required.id;
							required.modelID = aModelRule.id; 
							
							link.aSideAnchor = required;
							
							actions[ actions.length ] = actions[ actions.length ] = {	
								"objectID" : link.id,
								"commandType" : "update",
								"value" : link
							};
						}	
					}
					break;
				}
			}
			}
		}
		
		if( ( typeof modelObj.Role !== 'undefined' && modelObj.Role !== '' ) ){
			var text =  modelObj.Role;
			if( ( typeof modelObj.InverseRole !== 'undefined' && modelObj.InverseRole !== '' ) ){
				text += ' / ' + modelObj.InverseRole;
			}
			
			var visualText = undefined;
			for( var ref in visualModel.objects ){
			if( ref !== 'empty' ){
				 if( visualModel.objects[ ref ].type === 'roleText' ){
				 	visualText = visualModel.objects[ ref ];
				 	break;
				 }
			}
			}
			
			if( visualText == undefined ){
				var objID = uuid.v4();
				
				var visualText = cloneJSON( this.roleLabelTemplate );
				visualText.id = visualModel.id + "/objects/" + objID;
				visualText.modelID = modelObj.id + '/Role';
				visualText.parentID = visualModel.id;
				visualText.attr.id = visualText.id
				visualText.attr.name = visualText.parentID;
				visualText.attr.text = text;
				visualText.functions.attachTo.params = [ visualModel.id, "bottom", visualText.id  ];
				
				visualModel.objects[objID] = visualText;
			} else {
				visualText.attr.text = text;
			}	
		}
		
		actions[ actions.length ] = {	
			"objectID" : visualModel.id,
			"commandType" : "update",
			"value" : visualModel
		};
	}
	
	return actions;
}

CanvasLine.prototype.createInheritance = function( _modelRelationship ){
	var actions = [];
	
	var visualObjects = {
		"child" : null,
		"parent" : null
	}
	
	for( var conRef in _modelRelationship.ModelRelationshipConnectors ){
	if( conRef !== 'empty' ){
		var aModelRelationshipConnector = _modelRelationship.ModelRelationshipConnectors[ conRef ];
		
		var visualGroup = master.canvas.ormObj.findGroupByModelID( aModelRelationshipConnector.objectID );
		
		var visualRect = null;
		for( var rectRef in visualGroup.objects ){
			visualRect = visualGroup.objects[ rectRef ];
			
			if( visualRect.className === 'Rect' ){
				break;
			}
		}
		if( visualRect.className !== 'Rect' ){
			throwError( 'canvas.line.js', 'createInheritance', 'The passed visual group id, ' + visualGroup.id + ', contains no Rect.' );
		}
		
		visualObjects[ aModelRelationshipConnector.inheritance ] = {
			"visualGroup" : cloneJSON( visualGroup ),
			"visualGroupUUID" : conRef,
			"visualRect" : cloneJSON( visualRect ),
			"visualRectUUID" : rectRef
		}
	}
	}
	
	var linkUUID = uuid.v4();
	var link = cloneJSON( this.inheritanceTemplate );
	link.id = "VisualModel/links/" + linkUUID;
	link.modelID = _modelRelationship.id;
	link.aSide = visualObjects.child.visualRect.id;
	link.zSide = visualObjects.parent.visualRect.id;
	link.zSideAnchor = 'arrowAnchor';
	link.attr.id = link.id;
	
	actions[ actions.length ] = {	
		"objectID" : link.id,
		"commandType" : "insert",
		"value" : link
	}
	
	visualObjects.child.visualGroup.objects[ visualObjects.child.visualRectUUID ].links[ linkUUID ] = link.id;
	
	actions[ actions.length ] = {	
		"objectID" : visualObjects.child.visualGroup.id,
		"commandType" : "update",
		"value" : visualObjects.child.visualGroup
	}
	
	visualObjects.parent.visualGroup.objects[ visualObjects.parent.visualRectUUID ].links[ linkUUID ] = link.id;
	
	actions[ actions.length ] = {	
		"objectID" : visualObjects.parent.visualGroup.id,
		"commandType" : "update",
		"value" : visualObjects.parent.visualGroup
	}
	
	return actions;
}

CanvasLine.prototype.updateLink = function( _modelLinkID, _modelZSideID ){
	var visualLink = this.findLinkByModelID( _modelLinkID );
	if( visualLink == undefined ){
		throwError( 'canvas.line.js', 'updateLink', 'The passed _modelLinkID, ' + _modelLinkID + ', does not exist in the visual model.' );
	}
	
	var visualZGroup = master.canvas.ormObj.findGroupByModelID( _modelZSideID );
	if( visualZGroup == undefined ){
		throwError( 'canvas.line.js', 'updateLink', 'The passed _modelZSideID, ' + _modelZSideID + ', does not exist in the visual model.' );
	}
	
	for( var ref in visualZGroup.objects ){
	if( ref !== 'empty' ){
		var aVisualObject = visualZGroup.objects[ ref ];
		
		if( aVisualObject.modelID === _modelZSideID ){
			var visualZObject = aVisualObject; 
			break;
		}
	}
	}
	
	var actions = [];
	
	if( visualLink.zSide !== "" ){
		var oldVisualObject = getObjPointer( master.model, visualLink.zSide );
		if( oldVisualObject == undefined ){
			throwError( 'canvas.line.js', 'updateLink', 'The z side, ' + visualLink.zSide + ', for the passed _modelLinkID, ' + _modelLinkID + ', does not exist in the visual model.' );
		}
		
		var oldVisualGroup = getObjPointer( master.model, oldVisualObject.parentID );
		if( oldVisualGroup == undefined ){
			throwError( 'canvas.line.js', 'updateLink', 'The parentID, ' + oldVisualObject.parentID + ', for z side, ' + visualLink.zSide + ', for the passed _modelLinkID, ' + _modelLinkID + ', does not exist in the visual model.' );
		}
		
		var oldVisualGroup = cloneJSON( oldVisualGroup );
		var oldVisualObjectUUID = getPointerUUID( oldVisualObject.id );
		delete oldVisualGroup.objects[ oldVisualObjectUUID ].links[ visualLinkUUID ];
		
		var oldVisualGroupAction = {	
			"objectID" : oldVisualGroup.id,
			"commandType" : "update",
			"value" : oldVisualGroup
		}
		
		actions[ actions.length ] = oldVisualGroupAction; 
	}
	
	
	var visualLinkUUID = getPointerUUID( visualLink.id );
	
	var visualLink = cloneJSON( visualLink );
	visualLink.zSide = visualZObject.id;
	
	var visualLinkAction = {	
		"objectID" : visualLink.id,
		"commandType" : "update",
		"value" : visualLink
	}
	actions[ actions.length ] = visualLinkAction;
	
	var visualZGroup = cloneJSON( visualZGroup );
	var visualZObjectUUID = getPointerUUID( visualZObject.id );
	visualZGroup.objects[ visualZObjectUUID ].links[ visualLinkUUID ] = visualLink.id;
	
	var visualZGroupAction = {	
		"objectID" : visualZGroup.id,
		"commandType" : "update",
		"value" : visualZGroup
	}
	actions[ actions.length ] = visualZGroupAction;
	
	return actions;
}

CanvasLine.prototype.syncPredicateHelperGetRule = function( _childRuleID, _newRules ){
	var aModelRule = getObjPointer( master.model, _childRuleID );
	
	if( aModelRule != undefined ){
		var objDeleted = _newRules[ ( typeof aModelRule.parentID !== 'string' ) ? aModelRule.id : aModelRule.parentID ];
		
		if( objDeleted === false )
			return undefined;
	
		if( aModelRule.id.match( master.rule.ruleIDRegEx ) != null && typeof aModelRule.parentID === 'undefined' )
			return aModelRule;
				
		var aModelRule = getObjPointer( master.model, aModelRule.parentID );
		return aModelRule;
	} else {
		for( var refRule in _newRules ){
			var aModelRule = _newRules[ refRule ];
			if( aModelRule !== false ){
				for( var ref in aModelRule.ModelRuleConditions ){
				if( ref !== 'empty' ){
					var aRuleCondition = aModelRule.ModelRuleConditions[ ref ];
					
					if( aRuleCondition.id === _childRuleID ){
						return aModelRule;
					}
				}
				}
			}
		}
	}
	
	return undefined;
}

/*	moveLink: updates the link so that it remains tied to it a and z sides
 * 	this is designed to be called when the link is moved via a transaction
 * 	(remote or otherwise). If either the a or z side objects are moved using
 * 	the UI they will automatically stay conected.
 * 
 * 	Pred:
 * 	_id of the link to be moved. Can either be the visual obejct itself
 * 	or a string that contains its ID.
 */
CanvasLine.prototype.moveLink = function( _id ){
	//Set visualLine based upon input type
	if( typeof _id === 'string' ){
		var visualLine = getObjPointer( master.model, _id );
	} else {
		var visualLine = _id;
	}
	
	//If visualLine was either not an object or not a working ID throw error
	if( typeof visualLine !== 'object' ){
		console.log( 'moveLink was called but the link to be moved has not yet been added to the visual Model.' );
		return;
	}
	
	//Get the canvas that represents the visual object, throw error if not found
	var canvasLine =  master.canvas.stage.find( '#' + visualLine.id );
	if( canvasLine.length === 0 ){
		console.log( 'moveLink was called but the link to be moved has not yet been added to the canvas.' );
		return;
	}	
	canvasLine =  canvasLine[0];
	
	if( typeof canvasLine.moveLine === 'function' )
		canvasLine.moveLine();
}

CanvasLine.prototype.deleteLink = function( _id, _integrateWith ){
	var visualLine = getObjPointer( master.model, _id );
	if( visualLine == undefined ){
		throwError( 'canvas.line.js', 'deleteLink', 'Pased ID, ' + _id + 'does not exists in the model.' );
		return;
	}
	
	if( typeof _integrateWith !== 'object' ){
		_integrateWith = {};
	}
	
	var actions = [ {	
			"objectID" : visualLine.id,
			"commandType" : "delete",
			"value" : null
		} ];
	
	if( visualLine.aSide !== '' ){
		var visualObjectA = getObjPointer( master.model, visualLine.aSide );
		if( visualObjectA == undefined ){
			throwError( 'canvas.line.js', 'deleteLink', 'A side id, ' + visualLine.aSide + 'does not exists in the model.' );
			return;
		}
		
		if( typeof _integrateWith[ visualObjectA.parentID ] === 'undefined' ){
			var visualGroupA = getObjPointer( master.model, visualObjectA.parentID );
			if( visualGroupA == undefined ){
				throwError( 'canvas.line.js', 'deleteLink', 'A parent id, ' + visualObjectA.parentID + 'does not exists in the model.' );
				return;
			}
			visualGroupA = cloneJSON( visualGroupA );
			
			_integrateWith[ visualGroupA.id ] = visualGroupA;
		} else {
			visualGroupA = _integrateWith[ visualGroupA.parentID ];
		}
		
		delete visualGroupA.objects[ getPointerUUID( visualObjectA.id ) ].links[ getPointerUUID( visualLine.id ) ];
		
		actions[ actions.length ] = {	
			"objectID" : visualGroupA.id,
			"commandType" : "update",
			"value" : visualGroupA
		}
	}
	
	if( visualLine.zSide !== '' ){
		var visualObjectZ = getObjPointer( master.model, visualLine.zSide );
		if( visualObjectZ == undefined ){
			throwError( 'canvas.line.js', 'deleteLink', 'A side id, ' + visualLine.zSide + 'does not exists in the model.' );
			return;
		}
		
		if( typeof _integrateWith[ visualObjectZ.parentID ] === 'undefined' ){
			var visualGroupZ = getObjPointer( master.model, visualObjectZ.parentID );
			if( visualGroupZ == undefined ){
				throwError( 'canvas.line.js', 'deleteLink', 'A parent id, ' + visualObjectZ.parentID + 'does not exists in the model.' );
				return;
			}
			visualGroupZ = cloneJSON( visualGroupZ );
			
			_integrateWith[ visualGroupZ.id ] = visualGroupZ;
		} else {
			visualGroupZ = _integrateWith[ visualGroupZ.parentID ];
		}
			
		delete visualGroupZ.objects[ getPointerUUID( visualObjectZ.id ) ].links[ getPointerUUID( visualLine.id ) ];
		
		for( var i = 0; i < actions.length; i++ ){
			if( actions[i].objectID === visualObjectZ.id ){
				actions.splice( i, 1 );
				break;
			}	
		}
		
		actions[ actions.length ] = {	
			"objectID" : visualGroupZ.id,
			"commandType" : "update",
			"value" : visualGroupZ
		}
	}
	
	return actions;
}

/*	findPredicateByModelID:	finds the visual model predicate from the
 * 	modelID
 * 
 * 	Params:
 * 	_id: of an object on the visual model
 * 
 * 	Returns:
 * 	The object that represents the predicate on the visual model
 */
CanvasLine.prototype.findPredicateByModelID = function( _id ){
	var visualGroups = master.model.VisualModel.groups;
	
	/*	Loop through groups in the visual model and return the group 
	 * 	associated with the passed modelID
	 */
	for( var aGroup in visualGroups ){
	if( aGroup !== 'empty' ){
		aGroup = visualGroups[aGroup];
		
		if( aGroup.modelID != undefined && aGroup.modelID === _id ){
			return aGroup;
		}
	}	
	}
	
	//If no match was found return undefined
	return undefined;
}

/*	findLinkBySidesID:	finds the visual model link with the passed
 * 	aSide visual ID and zSide visual ID
 * 
 * 	Params:
 * 	_aID: a side visual id of the link (normally predicate side)
 * 	_zID: z side visual id of the link (normally object side)
 * 
 * 	Returns:
 * 	The visual object that represents the predicate on the visual model
 */
CanvasLine.prototype.findLinkBySidesID = function( _aID, _zID ){
	var visualLinks = master.model.VisualModel.links;
	
	/*	Loop through groups in the visual model and return the group 
	 * 	associated with the passed modelID
	 */
	for( var ref in visualLinks ){
	if( ref !== 'empty' ){
		var aLink = visualLinks[ref];
		
		if( aLink.aSide === _aID && aLink.zSide === _zID ){
			return aLink;
		}
	}	
	}
	
	//If no match was found return undefined
	return undefined;
}

CanvasLine.prototype.findLinkByModelID = function( _modelID ){
	var visualLinks = master.model.VisualModel.links;
	
	/*	Loop through groups in the visual model and return the group 
	 * 	associated with the passed modelID
	 */
	for( var ref in visualLinks ){
	if( ref !== 'empty' ){
		var aLink = visualLinks[ref];
		
		if( aLink.modelID === _modelID ){
			return aLink;
		}
	}	
	}
	
	//If no match was found return undefined
	return undefined;
}

CanvasLine.prototype.markSide = function( _id ){
	//Get the canvas object associated with _id
	var canvasShape = master.canvas.stage.find( '#' + _id );
	if( canvasShape.length === 0 )
		throwError( 'canvas.line.js', 'markSide', 'Passed ID does not exist on the Canvas' );
		
	canvasShape = canvasShape[0];
	
	if( master.line.type === 'unary' ){
		//Get the visual object
		var visualObj = getObjPointer( master.model, _id );
		if( visualObj == 'undefined' )
			throwError( 'canvas.line.js', 'markSide', 'Passed ID does not exist in the viusalModel' );
			
		//create the line
		master.line.createUnary( visualObj.modelID );
	//If an aSide is not defined, set the aSide
	} else if( this.aSideID === null ){
		//Get the visual object
		var visualObj = getObjPointer( master.model, _id );
		
		if( visualObj == 'undefined' )
			throwError( 'canvas.line.js', 'markSide', 'Passed ID does not exist in the viusalModel' );
		
		//Set aSide
		this.aSideID = visualObj.modelID;
		this.aSideVisualID = _id;
			
		/*	Change objects style to indicate that its selected, backup is not taken
		 * 	because it mouseoverSelect will have already taken it
		 */
		canvasShape.stroke( '#A637A8' );
		canvasShape.strokeWidth( 5 );
		if( visualObj.type === 'predicate' )
			canvasShape.moveToTop();
		master.canvas.layer.draw();
		
		//remove other mouse overs so it stays selected.
		canvasShape.off( 'mouseout.lineObjSelect mouseover.lineObjSelect' );
		
		//Create a guide line
		//first get mouse position and use those to set the moving side of the line
		var mouse = master.canvas.getMousePos();
		
		//final two points are idetentical this is so teh moveLineSide function can be used
		var points = [ 0, 0, mouse.x, mouse.y, mouse.x, mouse.y ];
		
		//Define the line
		var guideLine = new Kinetic.Line({
	  		points: points,
	  		stroke: 'black',
	  		strokeWidth: 1,
	  		id: 'canvas.line.guideLine.deleteMe'
	  	});
	  	master.canvas.lineLayer.add( guideLine );
	  	
	  	//Move side connected to an object so that it behaves just like a perminate line
	  	moveLineSide( guideLine, canvasShape, 'a', undefined );
	  	
	  	master.canvas.lineLayer.draw();
	  	
	  	/*	As the mouse moves over the canvas object move the line so that the
	  	 * 	is in sync with the mouse
	  	 */
	  	$('#ui').on('mousemove.lineObjSelect', function(){
	  		var mouse = master.canvas.getMousePos();
	  		var points = guideLine.points();
	  		points[points.length-4] = mouse.x;
	  		points[points.length-3] = mouse.y;
	  		points[points.length-2] = mouse.x;
	  		points[points.length-1] = mouse.y;
	  		moveLineSide( guideLine, canvasShape, 'a', undefined );
	  		master.canvas.lineLayer.draw();
	  	});
	  	
	  	//Set a single function for when the mouse is realeased
	  	$('html').on('mouseup.lineObjSelect', function(){
	  		master.canvas.line.mouseUp();
	  	});
	//If an aSide is defined either create a line or deselect the aSide
	} else {
		//Get the visual object
		var visualObj = getObjPointer( master.model, _id );
		
		if( visualObj == 'undefined' )
			throwError( 'canvas.line.js', 'markSide', 'Passed ID does not exist in the viusalModel' );
		
		//If passed ID is identical to the aSide, the delsect the aSide, otherwise create the line
		if( this.aSideID === visualObj.modelID ){
			//Visually restore group, then run moseOverSelect
			this.restoreGroup( _id );
				
			this.mouseOverSelect( _id );
		} else {
			//restore a and z side to original style
			this.restoreGroup( this.aSideVisualID );
			
			//create the line
			if( master.line.type === 'line' ){
				master.line.createLine( this.aSideID, visualObj.modelID );
			} else {
				master.line.createInheritance( this.aSideID, visualObj.modelID );
			}
		}

		//Either way restore functions for mouse over to a side.
		var aSideCanvasShape = master.canvas.stage.find( '#' + this.aSideVisualID );
		
		if( aSideCanvasShape.length > 0 ){
			aSideCanvasShape = aSideCanvasShape[0]
			
			//make sure we are not creating duplicates event handlers
			aSideCanvasShape.off( 'mouseover.lineObjSelect mouseout.lineObjSelect' );
			
			//Create event handler
			aSideCanvasShape.on( 'mouseover.lineObjSelect', function(){
				master.canvas.line.mouseOverSelect( this.id() );
			});
			
			aSideCanvasShape.on( 'mouseout.lineObjSelect', function(){
				master.canvas.line.restoreGroup( this.id() );
			});	
		}
		
		//reset aSide markers
		this.aSideID = null;
		this.aSideVisualID = null;
	}
}

/*	toggleCreateListener: if we're in line creation context set back to 
 * 	standard context, otherwise set to line creation context
 */
CanvasLine.prototype.toggleCreateListener = function(){
	if( master.line.active === true ){
		this.open();
	} else {
		this.close();
	}
}

/*	open: starts line creation context. For all affected objects
 */
CanvasLine.prototype.open = function(){
	//Deselect all objects
	deselect();
	
	//Loop through all objects
	for( var ref in master.model.VisualModel.groups ){
		var visualGroup = master.model.VisualModel.groups[ ref ];
		
		//If object is not entity, value, or predicate (in practice not a comment) set it up to interact with line tool
		if( visualGroup.type === 'entity' || visualGroup.type === 'value' || visualGroup.type === 'predicate' ){
			this.openAGroup( visualGroup.id );	
		}
	}
}

/*	openAGroup: conditions a canvas group for line context mode
 * 
 * 	Param: 
 * 	_id string with the _id to the canvas group
 */
CanvasLine.prototype.openAGroup = function( _id ){
	//Get the corisponding canvas object
	var canvasGroup = master.canvas.stage.find( '#' + _id );
	var visualGroup = getObjPointer( master.model, _id ); 
	
	if( canvasGroup.length > 0 && ( master.line.type === 'line' || visualGroup.type !== 'predicate' ) ){
		canvasGroup = canvasGroup[0];
		
		//disable the group so that it cannot be moved, selected, or resized.
		disableGroup( canvasGroup );
		
		//Loop though all of the children in each group
		canvasGroup.getChildren().each( function( shape, n ){
			//if the child object is a rectangle
			if( shape.getClassName() === 'Rect' ){
				//remove all listeners to avoid creating duplicates
				shape.off( 'lineObjSelect' )
				
				//Show that it is selectable on mouseover
				shape.on( 'mouseover.lineObjSelect', function(){
					master.canvas.line.mouseOverSelect( this.id() );
				});
				
				//Remove formatting abblied above on mouseout
				shape.on( 'mouseout.lineObjSelect', function(){
					master.canvas.line.restoreGroup( this.id() );
				});
				
				//On either touch start or mouse down on a object mark it
				shape.on('touchstart.lineObjSelect mousedown.lineObjSelect', function(e){
					master.canvas.line.markSide( this.id() );
				});
			}
		});
	}
}

CanvasLine.prototype.close = function(){
	for( var ref in master.model.VisualModel.groups ){
		var visualGroup = master.model.VisualModel.groups[ ref ];
		
		if( visualGroup.type === 'entity' || visualGroup.type === 'value' || visualGroup.type === 'predicate' ){
			for( ref in visualGroup.objects ){
				var aVisualObject = visualGroup.objects[ ref ];
				if( aVisualObject.className === 'Rect' ){
					this.restoreGroup( aVisualObject.id );
					
					var canvasShape = master.canvas.stage.find( '#' + aVisualObject.id );	
					canvasShape.off( '.lineObjSelect' );
				}
			}
			
			var canvasGroup = master.canvas.stage.find( '#' + visualGroup.id );
			
			if( canvasGroup.length > 0 ){
				canvasGroup = canvasGroup[0];
				enableGroup( canvasGroup );
			}	
		}
	}
}

CanvasLine.prototype.mouseOverSelect = function( _id ){
	this.mouseOverVisualID = _id;
	
	var visualObj = getObjPointer( master.model, _id );
	
	this.mouseOverID = visualObj.modelID;
	
	var canvasShape = master.canvas.stage.find( '#' + _id );
	
	if( canvasShape.length > 0 ){
		canvasShape = canvasShape[0];
		
		this.backupStroke[ canvasShape.id() ] = canvasShape.stroke();
		this.backupStrokeWidth[ canvasShape.id() ] = canvasShape.strokeWidth();
		
		canvasShape.stroke( '#37A8A8' );
		canvasShape.strokeWidth( 5 );
		if( visualObj.type === 'predicate' )
			canvasShape.moveToTop();
		
		master.canvas.layer.draw();
	}
}

CanvasLine.prototype.restoreGroup = function( _id ){
	this.mouseOverID = null;
	this.mouseOverVisualID = null;
	
	var canvasShape = master.canvas.stage.find( '#' + _id );
	
	if( canvasShape.length > 0 ){
		canvasShape = canvasShape[0];
		
		for( shapeID in this.backupStroke ){
			if( canvasShape.id() === shapeID ){
				canvasShape.stroke( this.backupStroke[ shapeID ] );
				canvasShape.strokeWidth( this.backupStrokeWidth[ shapeID ] );
				
				delete this.backupStroke[ shapeID ];
				delete this.backupStrokeWidth[ shapeID ];
				break;
			}
		}	
	}
	
	master.canvas.layer.draw();
}

CanvasLine.prototype.mouseUp = function(){
	if( this.mouseOverID !== null && this.mouseOverID !== this.aSideID ){
		this.markSide( this.mouseOverVisualID );
	}

	var deleteMe = master.canvas.stage.find( '#canvas.line.guideLine.deleteMe' );
	if( deleteMe.length > 0 ){
		deleteMe[0].destroy();
		master.canvas.lineLayer.draw();
	}
		
	$('html').off('mouseup.lineObjSelect');
	$('#ui').off('mousemove.lineObjSelect');
}

CanvasLine.prototype.editPredicate = function( _id ){
	var visualPred = getObjPointer( master.model, _id );
	if( visualPred == undefined ){
		throwError( 'canvas.line.js', 'editPredicate', 'Passed ID must exsist in the visual model' );
	}
	
	var modelPred = getObjPointer( master.model, visualPred.modelID )
	
	var visualPredRegExp = new RegExp( visualPred.modelID );
	
	this.editLayer.destroyChildren();
	this.editLineLayer.destroyChildren();
	this.uniques = {};
	this.canvasPredGroup = null;
	this.primaryGroup = null;
	this.mmCanvasUnique = null;
	this.mmCanvasUniqueTarget = null;
	this.mmCanvasUniqueTargetTarget = null;
	$('#oneary').val('');
	$('#twoary').val('');
	$('#threeary').val('');
	$('#fourary').val('');
	
	this.activePredID = _id;
	this.activePred = [];
	
	$('#wander_line_prop').show();
	
	var canvasPredGroupAttr = cloneJSON( this.predicateTemplate );
	this.canvasPredGroup = new Kinetic.Group( canvasPredGroupAttr );
	
	var middleX = ( this.width / 2 );
	var y = this.editY - 6;//- 6 to offset height added for unquiness constraint
	this.canvasPredGroup.x( middleX );
	this.canvasPredGroup.y( y );
	this.canvasPredGroup.draggable( false );
	
	this.editLayer.add( this.canvasPredGroup );
	
	var visualRoles = [];
	//Sort roles and set x/y values
	for( var ref in visualPred.objects ){
	if( ref !== 'empty' ){
		if( visualPred.objects[ ref ].type === 'roleRect' ){
			var aVisualRole = cloneJSON( visualPred.objects[ ref ] );
			aVisualRole.attr.id = 'edit' + aVisualRole.id;
			
			if( visualRoles.length === 0 ){
				visualRoles[ 0 ] = aVisualRole;
			} else {
				var inserted = false;
				for( var i = 0; i < visualRoles.length; i++ ){
					if( ( visualRoles[ i ].attr.x + visualRoles[ i ].attr.y ) > ( aVisualRole.attr.x + aVisualRole.attr.y ) ){
						visualRoles.splice( i, 0, aVisualRole );
						
						inserted = true;
						break;
					}
				}
				if( !inserted )
					visualRoles[ visualRoles.length ] = aVisualRole;
			}
		}
	}
	}
	
	for( var i = 0; i < visualRoles.length; i++ ){
		this.editPredicateCreateRole( visualRoles[ i ], i, visualRoles.length, false );
	}
	
	if( visualRoles.length === 2 ){
		this.createManyToManyUnique();
	}
	
	this.primaryGroup = new Kinetic.Group({
		x: this.canvasPredGroup.getTrueX() - 50,
		y: this.canvasPredGroup.getTrueY(),
		draggable: false
	});
	
	var primaryRect = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: 40,
		height: 20,
		strokeWidth: 1,
		fill: 'white'
	});
	this.primaryGroup.add( primaryRect );
	
	var primaryText = new Kinetic.Text({
		x: 5,
		y: 5,
		fontSize: 10,
		fontFamily: 'Calibri',
		fill: 'black',
		text: 'Primary'
  	});
	this.primaryGroup.add( primaryText );
	
	var primaryTarget = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: 40,
		height: 20,
		strokeWidth: 1
	});
	this.primaryGroup.add( primaryTarget );
	
	this.editLayer.add( this.primaryGroup );
	
	primaryTarget.on( 'mouseover', function(){
		primaryRect.stroke( '#c8c8c8' );
		primaryRect.fill( '#DADADA' );
		primaryRect.getLayer().draw();
	});
	
	primaryTarget.on( 'mouseout', function(){
		primaryRect.stroke( null );
		primaryRect.fill( 'white' );
		primaryRect.getLayer().draw();
	});
	
	primaryTarget.on( 'click touchstart', function(){
		if( master.canvas.line.primary === true ){
			master.canvas.line.primary = false;
			
			primaryRect.stroke( '#c8c8c8' );
			primaryRect.fill( '#DADADA' );
	
			primaryTarget.on( 'mouseover', function(){
				primaryRect.stroke( '#c8c8c8' );
				primaryRect.fill( '#DADADA' );
				primaryRect.getLayer().draw();
			});
			
			primaryTarget.on( 'mouseout', function(){
				primaryRect.stroke( null );
				primaryRect.fill( 'white' );
				primaryRect.getLayer().draw();
			});
			
			var activePred = master.canvas.line.activePred;
			
			if( activePred.length <= 2 ){
				var uniques = master.canvas.line.uniques;
				
				for( var ref in uniques ){
					uniques[ ref ].primary = false;
				}
			}

			primaryRect.getLayer().draw();
		} else {
			master.canvas.line.primary = true;
			
			primaryRect.stroke( '#c8c8c8' );
			primaryRect.fill( '#D1EEEE' );
	
			primaryTarget.off( 'mouseover mouseout');

			primaryRect.getLayer().draw();
			
			var activePred = master.canvas.line.activePred;
			
			if( activePred.length <= 2 ){
				var uniques = master.canvas.line.uniques;
				
				for( var ref in uniques ){
					uniques[ ref ].primary = true;
				}
			}
		}
	});
	
	for( var api = 0; api < this.activePred.length; api++ ){
		for( var ruleRef in this.activePred[ api ].modelObj.modelRuleConditions ){
		if( ruleRef !== 'empty' ){
			var aModelRule = getObjPointer( master.model, this.activePred[ api ].modelObj.modelRuleConditions[ ruleRef ] );
			var aModelRule = getObjPointer( master.model, aModelRule.parentID );
			
			if( master.line.ruleInsidePred( aModelRule, modelPred ) === true ){
				if( master.rule.uniqueTypes[ aModelRule.type ] === true ){
					if( aModelRule.type.substring( 0, 7 ) === 'primary' ){
						this.primary = true;
					}
					
					for( var i = 0; i < this.activePred.length; i++ ){
						for( var ref in aModelRule.ModelRuleConditions ){
						if( ref !== 'empty' ){
							var aModelRuleCondition = aModelRule.ModelRuleConditions[ ref ];
						
							if( this.activePred[ i ].modelObj.id === aModelRuleCondition.ModelRelationshipConnectorID ){
								this.activePred[ i ].unique = true;
							}
						}
						}
					}
					
					this.editPredInsertUnique();
					
					if( this.activePred.length <= 2 && this.primary === true ){
						primaryRect.stroke( '#c8c8c8' );
						primaryRect.fill( '#D1EEEE' );
						primaryTarget.off( 'mouseover mouseout');
						primaryRect.getLayer().draw();
					} else {
						this.primary = false;	
					}
				}
				
				if( aModelRule.type === 'required' ){
					for( var i = 0; i < this.activePred.length; i++ ){
						for( var ref in aModelRule.ModelRuleConditions ){
						if( ref !== 'empty' ){
							var aModelRuleCondition = aModelRule.ModelRuleConditions[ ref ];
						
							if( this.activePred[ i ].modelObj.id === aModelRuleCondition.ModelRelationshipConnectorID ){
								this.activePred[ i ].required = true;
								this.activePred[ i ].requiredObj.show();
								this.editLayer.draw();
							}
						}
						}
					}
				}
			}
		}
		}
	}
	
	$('html').on( 'keydown.editLinePredicate', function( e ){
		master.canvas.line.ctrl = e.ctrlKey;
		master.canvas.line.shift = e.shiftKey;
	});
	
	$('html').on( 'keyup.editLinePredicate', function( e ){
		if( master.canvas.line.ctrl === true && e.ctrlKey === false ){
			master.canvas.line.editPredInsertUnique();
			master.canvas.line.editLayer.draw();
		}
		if( master.canvas.line.shift === true && e.shiftKey === false ){
			var activePred = master.canvas.line.activePred;
			
			var started = false;
			for( var i = 0; i < activePred.length; i++ ){
				if( started === false && activePred[ i ].unique === true ){
					started = true;
				} else if ( started === true && activePred[ i ].unique === false ){
					activePred[ i ].unique = true;
				} else if ( started === true && activePred[ i ].unique === true ){
					break;
				}
			}
			
			master.canvas.line.editPredInsertUnique();
			master.canvas.line.editLayer.draw();
		}
		master.canvas.line.ctrl = e.ctrlKey;
		master.canvas.line.shift = e.shiftKey;
	});
	
	$('#nary').val( this.activePred.length );
	$('#role_label').val( modelPred.Role );
	$('#inverse_label').val( modelPred.InverseRole );
	
	this.editLayer.draw();
}

CanvasLine.prototype.closeEditPred = function(){
	this.editLayer.destroyChildren();
	this.editLineLayer.destroyChildren();
	this.canvasPredGroup = null;
	this.primaryGroup = null;
	this.mmCanvasUnique = null;
	this.mmCanvasUniqueTarget = null;
	this.mmCanvasUniqueTargetTarget = null;
	$('#oneary').val('');
	$('#twoary').val('');
	$('#threeary').val('');
	$('#fourary').val('');
	
	this.activePredID = null;
	this.activePred = null;
	
	$('html').off( 'editLinePredicate' );
	
	$('#wander_line_prop').hide();
}

CanvasLine.prototype.createManyToManyUnique = function(){
	if( this.mmCanvasUnique != undefined )
		return;
	
	var mmUniqueTargetAttr = cloneJSON( this.editUniquenessTemplate );
	mmUniqueTargetAttr.x += 2;
	mmUniqueTargetAttr.width = ( mmUniqueTargetAttr.width * 2 ) + 4; 
	this.mmCanvasUniqueTarget = new Kinetic.Rect( mmUniqueTargetAttr );
	
	mmUniqueTargetAttr.stroke = null;
	mmUniqueTargetAttr.fill = null;
	this.mmCanvasUniqueTargetTarget = new Kinetic.Rect( mmUniqueTargetAttr );
	
	this.canvasPredGroup.getChildren().each( function( shape, n ){
		shape.y( shape.y() + 12 );
	});
	
	this.canvasPredGroup.add( this.mmCanvasUniqueTarget );
	this.canvasPredGroup.y( this.canvasPredGroup.y() - 12 );
	
	var uniqueAttr = cloneJSON( this.uniquenessTemplate );
	uniqueAttr.points[0] = mmUniqueTargetAttr.x;
	uniqueAttr.points[1] = 4;
	uniqueAttr.points[2] = mmUniqueTargetAttr.x + mmUniqueTargetAttr.width;
	uniqueAttr.points[3] = 4;
	
	this.mmCanvasUnique = new Kinetic.Line( uniqueAttr );
	this.canvasPredGroup.add( this.mmCanvasUnique );
	this.canvasPredGroup.add( this.mmCanvasUniqueTargetTarget );
	
	this.mmCanvasUniqueTargetTarget.setAttr( 'child', this.mmCanvasUnique );
	this.mmCanvasUniqueTargetTarget.setAttr( 'target', this.mmCanvasUniqueTarget );
	this.mmCanvasUnique.hide();
	
	this.mmCanvasUniqueTargetTarget.on( 'mouseover.editPred', function(){
		this.getAttr( 'target' ).stroke( '#A637A8' );
		master.canvas.line.editLayer.draw();
	});
	
	this.mmCanvasUniqueTargetTarget.on( 'mouseout.editPred', function(){
		this.getAttr( 'target' ).stroke( 'black' );
		master.canvas.line.editLayer.draw();
	});
	
	this.mmCanvasUniqueTargetTarget.on( 'click.editPred', function(){
		if( this.getAttr( 'child' ).isVisible() ){
			this.getAttr( 'child' ).hide();
			master.canvas.line.uniques = {};
		} else {
			var activePred = master.canvas.line.activePred;
			this.getAttr( 'child' ).show();
			for( var i = 0; i < activePred.length; i++ ){
				activePred[i].uniqueObj.hide();
				activePred[i].unique = true;
			}
			
			master.canvas.line.editPredInsertUnique();
		}
		master.canvas.line.editLayer.draw();
	});
}

CanvasLine.prototype.removeManyToManyUnique = function(){
	if( this.mmCanvasUnique != undefined ){
		this.mmCanvasUnique.destroy();
		this.mmCanvasUniqueTarget.destroy();
		this.mmCanvasUnique = null;
		this.mmCanvasUniqueTarget = null;
		
		this.canvasPredGroup.getChildren().each( function( shape, n ){
			shape.y( shape.y() - 12 );
		});
		
		this.canvasPredGroup.y( this.canvasPredGroup.y() + 12 );
	}
}

CanvasLine.prototype.editPredInsertUnique = function(){
	var aUnique = [];
	for( var i = 0; i < this.activePred.length; i++ ){
		if( typeof this.activePred[i].unique === 'boolean' && this.activePred[i].unique ){
			this.activePred[i].unique = false;
			aUnique[ aUnique.length ] = i;
		}
	}
	
	var id = uuid.v4();
	
	if( this.activePred.length === 2 ){
		if( aUnique.length === 2 ){
			this.uniques = {};
			this.uniques[ id ] = { "primary" : this.primary, "uniques" : aUnique };
			this.mmCanvasUnique.show();
			
			for( var i = 0; i < this.activePred.length; i++ ){
				this.activePred[i].uniqueObj.hide();
			}
		} else {
			this.uniques[ id ] = { "primary" : this.primary, "uniques" : aUnique };
			this.activePred[ aUnique[0] ].uniqueObj.show();
			this.mmCanvasUnique.hide();
			for( var ref in this.uniques ){
				var aUnique = this.uniques[ ref ];
				if( aUnique.uniques.length === 2 ){
					delete this.uniques[ ref ];
				}
			}
		}
	} else if ( this.activePred.length === 1 ){
		this.uniques[ id ] = { "primary" : this.primary, "uniques" : aUnique };
		
		this.activePred[ aUnique[0] ].uniqueObj.show();
	} else {
		for( var ref in this.uniques ){
			var tempUnique = this.uniques[ ref ];
			if( aUnique.equals( tempUnique.uniques ) ){
				
				for( var i = 0; i < this.activePred.length; i++ ){
					this.activePred[i].uniqueObj.hide();
					this.activePred[i].unique = false;
				}
				return;
			}
		}
		this.uniques[ id ] = { "primary" : this.primary, "uniques" : aUnique };
		
		this.canvasPredGroup.getChildren().each( function( shape, n ){
			shape.y( shape.y() + master.canvas.line.uniqueDistanceFromRole );
		});
		
		this.canvasPredGroup.y( this.canvasPredGroup.y() - this.uniqueDistanceFromRole );
		
		if( aUnique.length === 1 ){
			var canvasUniqueGroup = new Kinetic.Group({
				id: id,
				x: this.activePred[ aUnique[0] ].roleObj.x(),
				y: 0
			});
			
			var uniqueAttr = cloneJSON( this.uniquenessTemplate );
			uniqueAttr.points[0] = 2
			uniqueAttr.points[1] = 0;
			uniqueAttr.points[2] = this.activePred[ aUnique[0] ].roleObj.getWidth() - 2;
			uniqueAttr.points[3] = 0;
			var canvasUnique = new Kinetic.Line( uniqueAttr );
			canvasUniqueGroup.add( canvasUnique );
			
			if( this.primary === true ){
				var uniqueAttr = cloneJSON( this.uniquenessTemplate );
				uniqueAttr.points[0] = 2
				uniqueAttr.points[1] = this.primarySpace;
				uniqueAttr.points[2] = this.activePred[ aUnique[0] ].roleObj.getWidth() - 2;
				uniqueAttr.points[3] = this.primarySpace;
				var canvasUnique = new Kinetic.Line( uniqueAttr );
				canvasUniqueGroup.add( canvasUnique );	
			}
			
			var xStart = ( this.activePred[ aUnique[0] ].roleObj.getWidth() * ( this.activePred.length - aUnique[0] ) ) + 15;
			
			var crossBack = new Kinetic.Rect({
				x: xStart,
				y: 0,
				width: this.uniqueDistanceFromRole,
				height: this.uniqueDistanceFromRole 
			});
			canvasUniqueGroup.add( crossBack );
			
			var lrCross = new Kinetic.Line({
				points: [ xStart, 1, xStart + this.uniqueDistanceFromRole, this.uniqueDistanceFromRole - 1 ],
				stroke: "red"
			});
			canvasUniqueGroup.add( lrCross );
			var rlCross = new Kinetic.Line({
				points: [ xStart + this.uniqueDistanceFromRole, 1, xStart, this.uniqueDistanceFromRole - 1 ],
				stroke: "red"
			});
			canvasUniqueGroup.add( rlCross );
			
			var crossTarget = new Kinetic.Rect({
				x: xStart,
				y: 0,
				width: this.uniqueDistanceFromRole,
				height: this.uniqueDistanceFromRole,
				target: crossBack
			});
			canvasUniqueGroup.add( crossTarget );
			crossTarget.on( 'mouseover', function(){
				if( this.getAttr( 'target' ).stroke() !== '#c8c8c8' ){
					this.getAttr( 'target' ).stroke( '#c8c8c8' );
					this.getAttr( 'target' ).fill( '#DADADA' );
					master.canvas.line.editLayer.draw();	
				}
			});
			crossTarget.on( 'mouseout', function(){
				this.getAttr( 'target' ).stroke( null );
				this.getAttr( 'target' ).fill( null );
				master.canvas.line.editLayer.draw();
			});
			crossTarget.on( 'click', function(){
				var group = this.getParent();
				master.canvas.line.editPredDeleteUnique( group.id() );
			});
			
			this.canvasPredGroup.add( canvasUniqueGroup );
		} else {
			var canvasUniqueGroup = new Kinetic.Group({
				id: id,
				x: this.activePred[ aUnique[0] ].roleObj.x(),
				y: 0
			});
			
			for( var i = 0; i < aUnique.length; ){
				var span = 1;
				for( var j = i + 1; j < aUnique.length; j++ ){
					if( aUnique[ j - 1 ] + 1 === aUnique[j] ){
						span++;
					} else {
						break;
					}
				}
				
				var uniqueAttr = cloneJSON( this.uniquenessTemplate );
				uniqueAttr.points[0] = this.activePred[ aUnique[i] ].roleObj.x() + 2 - canvasUniqueGroup.x();
				uniqueAttr.points[1] = 0;
				uniqueAttr.points[2] = ( this.activePred[ aUnique[i] ].roleObj.x() + ( this.activePred[ aUnique[i] ].roleObj.getWidth() * span ) ) - 2 - canvasUniqueGroup.x();
				uniqueAttr.points[3] = 0;
				var canvasUnique = new Kinetic.Line( uniqueAttr );
				canvasUniqueGroup.add( canvasUnique );
				
				if( this.primary === true ){
					var uniqueAttr = cloneJSON( this.uniquenessTemplate );
					uniqueAttr.points[0] = this.activePred[ aUnique[i] ].roleObj.x() + 2 - canvasUniqueGroup.x();
					uniqueAttr.points[1] = this.primarySpace;
					uniqueAttr.points[2] = ( this.activePred[ aUnique[i] ].roleObj.x() + ( this.activePred[ aUnique[i] ].roleObj.getWidth() * span ) ) - 2 - canvasUniqueGroup.x();
					uniqueAttr.points[3] = this.primarySpace;
					var canvasUnique = new Kinetic.Line( uniqueAttr );
					canvasUniqueGroup.add( canvasUnique );	
				}
				
				i += span;
			}
			
			for( var i = aUnique[ 0 ]; i < this.activePred.length && i < aUnique[ aUnique.length - 1 ]; i++ ){
				if( aUnique.indexOf( i ) === -1 ){
					var uniqueAttr = cloneJSON( this.uniquenessSpannerTemplate );
					uniqueAttr.points[0] = this.activePred[i].roleObj.x() + 2 - canvasUniqueGroup.x()
					uniqueAttr.points[1] = 0;
					uniqueAttr.points[2] = ( this.activePred[i].roleObj.x() + this.activePred[i].roleObj.getWidth() ) - 2 - canvasUniqueGroup.x();
					uniqueAttr.points[3] = 0;
					var canvasUnique = new Kinetic.Line( uniqueAttr );
					canvasUniqueGroup.add( canvasUnique );
				}
			}
			
			var xStart = ( this.activePred[ aUnique[0] ].roleObj.getWidth() * ( this.activePred.length - aUnique[0] ) ) + 15;
			
			var crossBack = new Kinetic.Rect({
				x: xStart,
				y: 0,
				width: this.uniqueDistanceFromRole,
				height: this.uniqueDistanceFromRole 
			});
			canvasUniqueGroup.add( crossBack );
			
			var lrCross = new Kinetic.Line({
				points: [ xStart, 1, xStart + this.uniqueDistanceFromRole, this.uniqueDistanceFromRole - 1 ],
				stroke: "red"
			});
			canvasUniqueGroup.add( lrCross );
			var rlCross = new Kinetic.Line({
				points: [ xStart + this.uniqueDistanceFromRole, 1, xStart, this.uniqueDistanceFromRole - 1 ],
				stroke: "red"
			});
			canvasUniqueGroup.add( rlCross );
			
			var crossTarget = new Kinetic.Rect({
				x: xStart,
				y: 0,
				width: this.uniqueDistanceFromRole,
				height: this.uniqueDistanceFromRole,
				target: crossBack
			});
			canvasUniqueGroup.add( crossTarget );
			crossTarget.on( 'mouseover', function(){
				if( this.getAttr( 'target' ).stroke() !== '#c8c8c8' ){
					this.getAttr( 'target' ).stroke( '#c8c8c8' );
					this.getAttr( 'target' ).fill( '#DADADA' );
					master.canvas.line.editLayer.draw();	
				}
			});
			crossTarget.on( 'mouseout', function(){
				this.getAttr( 'target' ).stroke( null );
				this.getAttr( 'target' ).fill( null );
				master.canvas.line.editLayer.draw();
			});
			crossTarget.on( 'click', function(){
				var group = this.getParent();
				master.canvas.line.editPredDeleteUnique( group.id() );
			});
			
			this.canvasPredGroup.add( canvasUniqueGroup );
		}
		
		for( var i = 0; i < this.activePred.length; i++ ){
			this.activePred[i].uniqueObj.hide();
			this.activePred[i].unique = false;
		}
	}
}

CanvasLine.prototype.editPredDeleteUnique = function( _id ){
	var canvasUnique = this.editStage.find( '#' + _id )[0];
	var oldY = canvasUnique.y();
	canvasUnique.destroy();
	
	delete this.uniques[ _id ];
	
	var children = this.canvasPredGroup.getChildren().toArray();
	for( var i = 0; i < children.length; i++ ){
		children[i].y( children[i].y() - this.uniqueDistanceFromRole );
		
		if( children[i].getClassName() === 'Group' ){
			if( oldY > children[i].y() ){
				children[i].y( children[i].y() + this.uniqueDistanceFromRole );
			}
		}		
	}
	
	this.editLayer.draw();
	
	this.canvasPredGroup.y( this.canvasPredGroup.y() + this.uniqueDistanceFromRole );
}

CanvasLine.prototype.editPredDelete = function( _id ){
	
}

CanvasLine.prototype.editPredicateCreateRole = function( _obj, _i, _nary, _new ){
	this.canvasPredGroup.x( this.canvasPredGroup.x() - ( this.editRoleTemplate.width / 2 ) );
	
	for( var i  = 0; i < this.activePred.length; i++ ){
		if( i >= _i ){
			this.activePred[i].obj.attr.x += this.editRoleTemplate.width;
			this.activePred[i].roleObj.x( this.activePred[i].obj.attr.x );
			this.activePred[i].uniqueTarget.x( this.activePred[i].uniqueTarget.x() + this.editRoleTemplate.width );
			this.activePred[i].uniqueTargetTarget.x( this.activePred[i].uniqueTargetTarget.x() + this.editRoleTemplate.width );
			this.activePred[i].uniqueObj.x( this.activePred[i].uniqueObj.x() + this.editRoleTemplate.width );
			
			this.activePred[i].roleObj.setAttr( 'vri', i + 1 );
			this.activePred[i].uniqueTargetTarget.setAttr( 'vri', i + 1 );
			this.activePred[i].uniqueObj.setAttr( 'vri', i + 1 );
			this.activePred[i].requiredTarget.setAttr( 'vri', i + 1 );
			this.activePred[i].requiredObj.setAttr( 'vri', i + 1 );	
		}
		
		if( typeof this.activePred[i].roleObj.moveLine === 'function' ){
			this.activePred[i].roleObj.moveLine();
			this.activePred[i].requiredObj.x( this.activePred[i].requiredTarget.x() );
			this.activePred[i].requiredObj.y( this.activePred[i].requiredTarget.y() );
		}
	}
	
	if( this.primaryGroup != undefined )
		this.primaryGroup.x( this.primaryGroup.x() - ( this.editRoleTemplate.width / 2 ) );
	
	var aPred = {
		"obj" : _obj,
		"modelObj" : getObjPointer( master.model, _obj.modelID ),
		"newObj" : _new,
		"active" : true,
		"roleObj" : null,
		"unique" : false,
		"uniqueTarget" : null,
		"uniqueTargetTarget" : null,
		"uniqueObj" : null,
		"required" : false,
		"requiredTarget" : null,
		"requiredObj" : null
	};
	
	var middleX = ( this.width / 2 );
	
	if( typeof this.activePred[ _i ] === 'undefined' ){
		this.activePred[ _i ] = aPred;
	} else {
		this.activePred.splice( _i, 0, aPred );
	}
	
	var newAttr = cloneJSON( this.editRoleTemplate );
	newAttr.id = 'edit' + _obj.id;
	newAttr.x = newAttr.width * _i;
	
	if( _new === true ){
		newAttr.y = this.activePred[ 0 ].roleObj.y();
	}
	
	if( _i === 0 && _nary > 1 ){
		newAttr.joinableSides = [ true, false, true, true ]
	} else if ( _i === 0 ) {
		newAttr.joinableSides = [ true, true, true, true ]
	} else if ( _i ===  _nary - 1 ){
		newAttr.joinableSides = [ true, true, true, false ]
	} else {
		newAttr.joinableSides = [ true, false, true, false ]
	}
	
	this.activePred[ _i ].obj.attr = newAttr;
	
	var canvasRole = new Kinetic.Rect( this.activePred[ _i ].obj.attr );	
	this.canvasPredGroup.add( canvasRole );
	this.activePred[ _i ].roleObj = canvasRole;
	
	var uniqueTargetAttr = cloneJSON( this.editUniquenessTemplate );
	uniqueTargetAttr.vri = _i; 
	uniqueTargetAttr.x = newAttr.x + 2;
	
	if( _new === true ){
		uniqueTargetAttr.y = this.activePred[ 0 ].uniqueTarget.y();
	}
	
	var canvasUniqueTarget = new Kinetic.Rect( uniqueTargetAttr );
	this.canvasPredGroup.add( canvasUniqueTarget );
	this.activePred[ _i ].uniqueTarget = canvasUniqueTarget;
	
	var uniqueAttr = cloneJSON( this.uniquenessTemplate );
	uniqueAttr.vri = _i;
	uniqueAttr.points[0] = uniqueTargetAttr.x;
	uniqueAttr.points[1] = 4;
	uniqueAttr.points[2] = uniqueTargetAttr.x + uniqueTargetAttr.width;
	uniqueAttr.points[3] = 4;
	
	if( _new === true ){
		uniqueAttr.y = this.activePred[ 0 ].uniqueObj.y();
	}
	
	var canvasUnique = new Kinetic.Line( uniqueAttr );
	this.canvasPredGroup.add( canvasUnique );
	this.activePred[ _i ].uniqueObj = canvasUnique;
	
	uniqueTargetAttr.stroke = null;
	uniqueTargetAttr.fill = null;
	
	var canvasUniqueTargetTarget = new Kinetic.Rect( uniqueTargetAttr );
	this.canvasPredGroup.add( canvasUniqueTargetTarget );
	this.activePred[ _i ].uniqueTargetTarget = canvasUniqueTargetTarget;
	
	canvasUniqueTargetTarget.setAttr( 'child', canvasUnique );
	canvasUniqueTargetTarget.setAttr( 'target', canvasUniqueTarget );
	
	canvasUnique.hide();
	
	canvasUniqueTargetTarget.on( 'mouseover.editPred', function(){
		this.getAttr( 'target' ).stroke( '#A637A8' );
		master.canvas.line.editLayer.draw();
	});
	
	canvasUniqueTargetTarget.on( 'mouseout.editPred', function(){
		this.getAttr( 'target' ).stroke( 'black' );
		master.canvas.line.editLayer.draw();
	});
	
	canvasUniqueTargetTarget.on( 'click.editPred', function(){
		var line = master.canvas.line;
		
		if( this.getAttr( 'child' ).isVisible() ){
			this.getAttr( 'child' ).hide();
			line.activePred[ this.getAttr( 'vri' ) ].unique = false;
			
			if( line.activePred.length === 2 ){
				for( var ref in line.uniques ){
					var unique = line.uniques[ ref ];
					if( unique.uniques.length === 1 && unique.uniques[ 0 ] === this.getAttr( 'vri' )  ){
						delete line.uniques[ ref ];
						break;
					}
				}
			} else if ( line.activePred.length === 1 ){
				line.uniques = {};
			}
		} else {
			this.getAttr( 'child' ).show();
			line.activePred[ this.getAttr( 'vri' ) ].unique = true;
		
			if( line.shift === false && line.ctrl === false ){
				line.editPredInsertUnique();
			}
		}
		
		master.canvas.line.editLayer.draw();
	});
	
	canvasUnique.on( 'mouseover.editPred', function(){
		this.getAttr( 'father' ).stroke( '#A637A8' );
		master.canvas.line.editLayer.draw();
	});

	canvasUnique.on( 'click.editPred', function(){
		var line = master.canvas.line;
		
		if( this.isVisible() ){
			this.hide();
			line.activePred.unique = false;
			
			if( line.activePred.length === 2 ){
				for( var ref in line.uniques ){
					var unique = line.uniques[ ref ];
					if( unique[ 0 ] === this.getAttr( 'vri' ) && unique.length === 1 ){
						delete line.uniques[ ref ];
						break;
					}
				}
			} else if ( line.activePred.length === 1 ){
				line.uniques = {};
			}
		} else {
			this.show();
			line.activePred.unique = true;
		
			if( line.shift === false && line.ctrl === false ){
				this.editPredInsertUnique();
			}
		}
		
		master.canvas.line.editLayer.draw();
	});
	
	if( _new === false ){
		var modelRelationship = getObjPointer( master.model, this.activePred[ _i ].obj.modelID );
		
		var zSideVisGroup = master.canvas.ormObj.findGroupByModelID( modelRelationship.objectID );
		
		if( zSideVisGroup == undefined ){
			var zSideCanvasGroup = master.canvas.ormObj.canvasDefaultShell();
		} else {
			var zSideCanvasGroup = master.canvas.ormObj.cloneCanvasDefault( zSideVisGroup.id );
		}
	} else {
		var zSideCanvasGroup = master.canvas.ormObj.canvasDefaultShell();
	}
	
	if( _i === 0 ){
		var x = 10;
		var y = this.editY;	
	} else if ( _i === ( _nary - 1  ) ){
		var x = this.width - zSideCanvasGroup.getWidth() - 10;
		var y = this.editY;
	} else if ( _i === 1 ){
		var x = ( this.width / 2 ) - ( zSideCanvasGroup.getWidth() * 2 );
		var y = this.editYRow2;
	} else if ( _i === 2 ){
		var x = ( this.width / 2 ) + zSideCanvasGroup.getWidth();
		var y = this.editYRow2;
	}
	
	zSideCanvasGroup.x( x );
	zSideCanvasGroup.y( y );
	zSideCanvasGroup.draggable( true );
	
	this.editLayer.add( zSideCanvasGroup );
	
	var aRect = null;
	var children = zSideCanvasGroup.getChildren().toArray();
	for( var i = 0; i < children.length; i++ ){
		if( children[ i ].getClassName() === 'Rect' ){
			aRect = children[ i ];
			break;
		}
	}
	
	if( aRect === null ){
		throwError( 'canvas.line.js', 'editPredicate', 'Canvas group linked to line does not have a Rect' );
	}
	
	var aSide = this.activePred[ _i ].roleObj;
	
	var canvasLine = new Kinetic.Line({
		id: uuid.v4(),
  		points: [0,0,0,0],
  		stroke: 'black',
  		strokeWidth: 1
  	});
  	this.editLineLayer.add( canvasLine );
  	
  	var requireTargetdAttr = cloneJSON( this.editRequiredTemplate );
  	requireTargetdAttr.vri = _i;
  	
  	var canvasRequiredTarget = new Kinetic.Circle( requireTargetdAttr );
  	this.editLayer.add( canvasRequiredTarget );
  	this.activePred[ _i ].requiredTarget = canvasRequiredTarget;
  	
	addLink( canvasLine, aSide, aRect, canvasRequiredTarget, undefined );
	
	var requiredAttr = cloneJSON( this.requiredTemplate.attr );
	requiredAttr.vri = _i;
	requiredAttr.x = canvasRequiredTarget.x();
	requiredAttr.y = canvasRequiredTarget.y();
	
	var canvasRequired = new Kinetic.Circle( requiredAttr );
  	this.editLayer.add( canvasRequired );
  	this.activePred[ _i ].requiredObj = canvasRequired;
  	canvasRequiredTarget.setAttr( 'child', canvasRequired );
  	canvasRequired.setAttr( 'father', canvasRequiredTarget );//parent is claimed
  	canvasRequired.hide();
  	
  	canvasRequiredTarget.on( 'mouseover.editPred', function(){
  		this.stroke( '#A637A8' );
  		master.canvas.line.editLayer.draw();
  	});
  	
  	canvasRequiredTarget.on( 'mouseout.editPred', function(){
  		this.stroke( 'black' );
  		master.canvas.line.editLayer.draw();
  	}); 
  	
  	canvasRequiredTarget.on( 'click.editPred', function(){
  		if( this.getAttr( 'child' ).isVisible() ){
  			this.getAttr( 'child' ).hide();
			master.canvas.line.activePred[ this.getAttr( 'vri' ) ].required = false;
  		} else {	
  			this.getAttr( 'child' ).show();
			master.canvas.line.activePred[ this.getAttr( 'vri' ) ].required = true;
  		}
  		master.canvas.line.editLayer.draw();	
  	});
  	
  	canvasRequired.on( 'click.editPred', function(){
  		if( this.isVisible() ){
  			this.hide();
			master.canvas.line.activePred[ this.getAttr( 'vri' ) ].required = false;
  		} else {
  			this.show();
			master.canvas.line.activePred[ this.getAttr( 'vri' ) ].required = true;
  		}
  		master.canvas.line.editLayer.draw();
  	});

  	canvasRequired.on( 'mouseover.editPred', function(){
  		this.getAttr( 'father' ).stroke( '#A637A8' );
  		master.canvas.line.editLayer.draw();
  	});
}

CanvasLine.prototype.changeNary = function(){
	var nary = $('#nary').val();
	
	//== is purposeful to deal with variable input
	if( nary != 2 ){
		this.removeManyToManyUnique();
	}
		
	if( nary > this.activePred.length ){
		for( var i = this.activePred.length; i < nary; i++ ){
			var id = this.activePredID + '/objects/' + uuid.v4();
			
			var visualRole = {
			    "id": id,
			    "modelID": null,
			    "type" : "roleRect",
			    "className": "Rect",
			    "attr": null,
			    "functions": {},
			    "links": { "empty":""}
			}
			
			var position = this.activePred.length - 1
			if( position <= 0 )
				position = this.activePred.length;
			
			this.editPredicateCreateRole( visualRole, position, nary, true );
		}
		
		if( nary == 2 ){
			this.createManyToManyUnique();
		}
		
		this.editLayer.draw();
	}
}
