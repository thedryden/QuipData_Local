function CanvasRule(){
	//Makes the following templates read only
	if( typeof Object.freeze === 'function' ){
		Object.freeze( this.ruleGroup );
		Object.freeze( this.ruleCircle );
		Object.freeze( this.requiredSymbol );
		Object.freeze( this.uniqueSymbol );
		Object.freeze( this.primarySymbol );
		Object.freeze( this.primarySymbol2 );
	}
	
	this.ruleSymbols = {
  		"required" : {
  			"requiredSymbol" : this.requiredSymbol
  		}
  		, "unique" : {
  			"uniqueSymbol" : this.uniqueSymbol
  		}
  		, "primary" : {
  			"primarySymbol" : this.primarySymbol
  			, "primarySymbol2" : this.primarySymbol2
  		}
  	}
}

CanvasRule.prototype = {
	ruleGroup : {
		"id" : "UUID",
		"modelID" : "UUID",
		"type" : "TYPE",
		"attr" : {
			id: 'UUID',
			x: 10,
			y: 10,
			draggable: true
		},
		"objects" : {},
		"functions" : {
			"makeCircleSelectable" : {
				"functionName" : "makeCircleSelectable",
				"params" : [ "UUID", "rule" ]
			}
		}	
	},
	
	ruleCircle : {
	    "id": "UUID",
	    "modelID": "UUID",
	    "parentID" : "UUID",
	    "type" : "ruleCircle",
	    "className": "Circle",
	    "attr": {
	  		"id": "UUID",
	  		"x": 0,
	  		"y": 0,
	  		"radius": 10,
	  		"offsetX": -10,
			"offsetY": -10,
	  		"stroke": 'black',
	  		"fill": 'white'
	  	},
	    "functions": {},
	    "links": { "empty":""}
	} 
  	
  	, requiredSymbol : {
	    "id": "UUID",
	    "modelID": "UUID",
	    "parentID" : "UUID",
	    "type" : "requiredSymobl",
	    "className": "Circle",
	    "attr": {
	  		"id": "UUID",
	  		"x": 6,
	  		"y": 6,
	  		"offsetX": -4,
			"offsetY": -4,
	  		"radius": 4,
	  		"fill": "#BF5FFF"
	  	},
	    "functions": {},
	    "links": { "empty":""}
	}
  	
  	, uniqueSymbol : {
	    "id": "UUID",
	    "modelID": "UUID",
	    "parentID" : "UUID",
	    "type" : "uniqueSymobl",
	    "className": "Line",
	    "attr": {
	  		"id": "UUID",
	  		"points": [ 0, 10, 20, 10 ],
	  		"stroke": 'black',
	  	},
	    "functions": {},
	    "links": { "empty":""}
	}
  	
  	, primarySymbol : {
	    "id": "UUID",
	    "modelID": "UUID",
	    "parentID" : "UUID",
	    "type" : "primarySymobl",
	    "className": "Line",
		"attr": {
	  		"id": "UUID",
	  		points : [ 1, 8, 19, 8 ],
	  		"stroke": 'black',
	  	},
	    "functions": {},
	    "links": { "empty":""}
	}
  	
  	, primarySymbol2 : {
	    "id": "UUID",
	    "modelID": "UUID",
	    "parentID" : "UUID",
	    "type" : "primarySymobl",
	    "className": "Line",
		"attr": {
	  		"id": "UUID",
	  		points : [ 1, 12, 19, 12 ],
	  		"stroke": 'black',
	  	},
	    "functions": {},
	    "links": { "empty":""}
	}
  	//Populated in constructor
  	, ruleSymbols : {}
  	
  	//When marking sides for rule, this stores the first side selected
	, aSideID : null
	, aSideVisualID : null
	/*	Stores properties need to restore object to their previous state
	 * 	after they have been selected.
	 */
	, backupStroke : {}
	, backupStrokeWidth : {}
	//When creating a new rule, this is the obejct that the mouse is over
	, mouseOverID : null
	, mouseVisualOverID : null	
}

CanvasRule.prototype.createRule = function( _modelRule ){
	actions = [];
	
	var aX = [];
	var aY = [];
	
	var visualRuleUUID = uuid.v4();
	
	var visualRule = cloneJSON( this.ruleGroup );
	visualRule.id = 'VisualModel/groups/' + visualRuleUUID;
	visualRule.modelID = _modelRule.id;
	visualRule.type = _modelRule.type;
	visualRule.attr.id = visualRule.id;
	visualRule.functions.makeCircleSelectable.params[0] = visualRule.id; 
	
	var visualCircleUUID = uuid.v4();
	
	var visualCircle = cloneJSON( this.ruleCircle );
	visualCircle.id = visualRule.id + '/objects/' + visualCircleUUID;
	visualCircle.modelID = _modelRule.id;
	visualCircle.parentID = visualRule.id;
	visualCircle.attr.id = visualCircle.id;
	visualRule.objects[ visualCircleUUID ] = visualCircle; 
	
	for( var ref in this.ruleSymbols[ _modelRule.type ] ){
		aSymbol = cloneJSON( this.ruleSymbols[ _modelRule.type ][ ref ] );
		
		aSymbolUUID = uuid.v4();
		
		aSymbol.id = visualRule.id + '/objects/' + aSymbolUUID;
		aSymbol.modelID = _modelRule.id;
		aSymbol.parentID = visualRule.id;
		aSymbol.attr.id = aSymbol.id;
		visualRule.objects[ aSymbolUUID ] = aSymbol;
	}
	
	for( var ruleRef in _modelRule.ModelRuleConditions ){
	if( ruleRef !== 'empty' ){
		var aModelRuleCon = _modelRule.ModelRuleConditions[ ruleRef ];
		
		var aModelRelationshipCon = getObjPointer( master.model, aModelRuleCon.ModelRelationshipConnectorID );
		if( aModelRelationshipCon == undefined ){
			throwError( 'canvas.rule.js', 'createRule', 'The model Relationship Connector, ' + aModelRuleCon.ModelRelationshipConnectorID + ', does not exists.' );
		}
		
		var aVisualPredicate = master.canvas.line.findPredicateByModelID( aModelRelationshipCon.parentID );
		if( aVisualPredicate == undefined ){
			throwError( 'canvas.rule.js', 'createRule', 'The visual model associated with the model id, ' + aModelRelationship.id + ', does not exists.' );
		}
		aVisualPredicate = cloneJSON( aVisualPredicate ); 
		
		var aVisualRole = null;
		for( var ref in aVisualPredicate.objects ){
		if( ref !== 'empty' ){
			aVisualRole = aVisualPredicate.objects[ ref ];
			if( aVisualRole.modelID === aModelRelationshipCon.id )
				break;
		} 
		}
		if( aVisualRole.modelID !== aModelRelationshipCon.id ) {
			throwError( 'canvas.rule.js', 'createRule', 'The visual model object associated with the model id, ' + aModelRelationshipCon.id + ', does not exists.' );
		}
		var aVisualRoleUUID = getPointerUUID( aVisualRole.id );
		
		var aLineUUID = uuid.v4();
		var aLine = cloneJSON( master.canvas.line.lineTemplate )
		aLine.id = 'VisualModel/links/' + aLineUUID;
		aLine.modelID = aModelRelationshipCon.id;
		aLine.aSide = aVisualRole.id;
		aLine.zSide = visualCircle.id;
		
		actions[ actions.length ] = {	
			"objectID" : aLine.id,
			"commandType" : "insert",
			"value" : aLine
		};
		
		aVisualPredicate.objects[ aVisualRoleUUID ].links[ aLineUUID ] = aLine.id;
		visualRule.objects[ visualCircleUUID ].links[ aLineUUID ] = aLine.id;
		
		actions[ actions.length ] = {	
			"objectID" : aVisualPredicate.id,
			"commandType" : "update",
			"value" : aVisualPredicate
		};
		
		aX[ aX.length ] = aVisualPredicate.attr.x + ( aVisualRole.attr.width / 2 );
		aY[ aY.length ] = aVisualPredicate.attr.y + ( aVisualRole.attr.height / 2);
	}
	}
	
	//Calculate position of rule as average of all other center positions
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
	
	visualRule.attr.x = x - ( visualCircle.attr.radius );
	visualRule.attr.y = y - ( visualCircle.attr.radius );
	
	actions[ actions.length ] = {	
		"objectID" : visualRule.id,
		"commandType" : "insert",
		"value" : visualRule
	};
	
	return actions;
}

CanvasRule.prototype.markSide = function( _id ){
	//Get the canvas object associated with _id
	var canvasShape = master.canvas.stage.find( '#' + _id );
	if( canvasShape.length === 0 )
		throwError( 'canvas.rule.js', 'markSide', 'Passed ID does not exist on the Canvas' );
		
	canvasShape = canvasShape[0];
	
	if( this.aSideID === null ){
		//Get the visual object
		var visualObj = getObjPointer( master.model, _id );
		
		if( visualObj == 'undefined' )
			throwError( 'canvas.rule.js', 'markSide', 'Passed ID does not exist in the viusalModel' );
		
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
		canvasShape.off( 'mouseout.ruleObjSelect mouseover.ruleObjSelect' );
		
		//Create a guide line
		//first get mouse position and use those to set the moving side of the line
		var mouse = master.canvas.getMousePos();
		
		//final two points are idetentical this is so the moveLineSide function can be used
		var points = [ 0, 0, mouse.x, mouse.y, mouse.x, mouse.y ];
		
		//Define the line
		var guideLine = new Kinetic.Line({
	  		points: points,
	  		stroke: 'black',
	  		strokeWidth: 1,
	  		id: 'canvas.rule.guideLine.deleteMe'
	  	});
	  	master.canvas.lineLayer.add( guideLine );
	  	
	  	//Move side connected to an object so that it behaves just like a perminate line
	  	moveLineSide( guideLine, canvasShape, 'a', undefined );
	  	
	  	master.canvas.lineLayer.draw();
	  	
	  	/*	As the mouse moves over the canvas object move the line so that the
	  	 * 	is in sync with the mouse
	  	 */
	  	$('#ui').on('mousemove.ruleObjSelect', function(){
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
	  	$('html').on('mouseup.ruleObjSelect', function(){
	  		master.canvas.rule.mouseUp();
	  	});
	//If an aSide is defined either create a rule or deselect the aSide
	} else {
		//Get the visual object
		var visualObj = getObjPointer( master.model, _id );
		
		if( visualObj == 'undefined' )
			throwError( 'canvas.rule.js', 'markSide', 'Passed ID does not exist in the viusalModel' );
		
		//If passed ID is identical to the aSide, the delsect the aSide, otherwise create the rule
		if( this.aSideID === visualObj.modelID ){
			//Visually restore group, then run moseOverSelect
			this.restoreGroup( _id );
				
			this.mouseOverSelect( _id );
		} else {
			//restore a and z side to original style
			this.restoreGroup( this.aSideVisualID );
			
			//create the rule
			master.rule.createRule( this.aSideID, visualObj.modelID );
		}

		//Either way restore functions for mouse over to a side.
		var aSideCanvasShape = master.canvas.stage.find( '#' + this.aSideVisualID );
		
		if( aSideCanvasShape.length > 0 ){
			aSideCanvasShape = aSideCanvasShape[0]
			
			//make sure we are not creating duplicates event handlers
			aSideCanvasShape.off( 'mouseover.ruleObjSelect mouseout.ruleObjSelect' );
			
			//Create event handler
			aSideCanvasShape.on( 'mouseover.ruleObjSelect', function(){
				master.canvas.rule.mouseOverSelect( this.id() );
			});
			
			aSideCanvasShape.on( 'mouseout.ruleObjSelect', function(){
				master.canvas.rule.restoreGroup( this.id() );
			});	
		}
		
		//reset aSide markers
		this.aSideID = null;
		this.aSideVisualID = null;
	}
}

/*	toggleCreateListener: if we're in rule creation context set back to 
 * 	standard context, otherwise set to rule creation context
 */
CanvasRule.prototype.toggleCreateListener = function(){
	if( master.rule.active === true ){
		this.open();
	} else {
		this.close();
	}
}

/*	open: starts rule creation context. For all affected objects
 */
CanvasRule.prototype.open = function(){
	//Deselect all objects
	deselect();
	
	//Loop through all objects
	for( var ref in master.model.VisualModel.groups ){
		var visualGroup = master.model.VisualModel.groups[ ref ];
		
		//If object is not entity, value, or predicate (in practice not a comment) set it up to interact with rule tool
		if( visualGroup.type === 'predicate' ){
			this.openAGroup( visualGroup.id );	
		}
	}
}

/*	openAGroup: conditions a canvas group for rule context mode
 * 
 * 	Param: 
 * 	_id string with the _id to the canvas group
 */
CanvasRule.prototype.openAGroup = function( _id ){
	//Get the corisponding canvas object
	var canvasGroup = master.canvas.stage.find( '#' + _id );
	var visualGroup = getObjPointer( master.model, _id ); 
	
	if( canvasGroup.length > 0 ){
		canvasGroup = canvasGroup[0];
		
		//disable the group so that it cannot be moved, selected, or resized.
		disableGroup( canvasGroup );
		
		//Loop though all of the children in each group
		canvasGroup.getChildren().each( function( shape, n ){
			//if the child object is a rectangle
			if( shape.getClassName() === 'Rect' ){
				//remove all listeners to avoid creating duplicates
				shape.off( 'ruleObjSelect' )
				
				//Show that it is selectable on mouseover
				shape.on( 'mouseover.ruleObjSelect', function(){
					master.canvas.rule.mouseOverSelect( this.id() );
				});
				
				//Remove formatting abblied above on mouseout
				shape.on( 'mouseout.ruleObjSelect', function(){
					master.canvas.rule.restoreGroup( this.id() );
				});
				
				//On either touch start or mouse down on a object mark it
				shape.on('touchstart.ruleObjSelect mousedown.ruleObjSelect', function(e){
					master.canvas.rule.markSide( this.id() );
				});
			}
		});
	}
}

CanvasRule.prototype.close = function(){
	for( var ref in master.model.VisualModel.groups ){
		var visualGroup = master.model.VisualModel.groups[ ref ];
		
		if( visualGroup.type === 'predicate' ){
			for( ref in visualGroup.objects ){
				var aVisualObject = visualGroup.objects[ ref ];
				if( aVisualObject.className === 'Rect' ){
					this.restoreGroup( aVisualObject.id );
					
					var canvasShape = master.canvas.stage.find( '#' + aVisualObject.id );	
					if( canvasShape.length > 0 ){
						canvasShape[0].off( '.ruleObjSelect' );
					}
					
				}
			}
			
			var canvasGroup = master.canvas.stage.find( '#' + visualGroup.id );
			
			if( canvasGroup.length > 0 ){
				enableGroup( canvasGroup[0] );
			}
		}
	}
}

CanvasRule.prototype.mouseOverSelect = function( _id ){
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

CanvasRule.prototype.restoreGroup = function( _id ){
	this.mouseOverID = null;
	this.mouseOverVisualID = null;
	
	var canvasShape = master.canvas.stage.find( '#' + _id );
	
	if( canvasShape.length > 0 ){
		canvasShape = canvasShape[0];
		
		var shapeID = canvasShape.id();
		if( this.backupStroke[ shapeID ] != undefined ){
			canvasShape.stroke( this.backupStroke[ shapeID ] );
			canvasShape.strokeWidth( this.backupStrokeWidth[ shapeID ] );
			
			delete this.backupStroke[ shapeID ];
			delete this.backupStrokeWidth[ shapeID ];	
		}
	}
	
	master.canvas.layer.draw();
}

CanvasRule.prototype.mouseUp = function(){
	if( this.mouseOverID !== null && this.mouseOverID !== this.aSideID ){
		this.markSide( this.mouseOverVisualID );
	}

	var deleteMe = master.canvas.stage.find( '#canvas.rule.guideLine.deleteMe' );
	if( deleteMe.length > 0 ){
		deleteMe[0].destroy();
		master.canvas.lineLayer.draw();
	}
		
	$('html').off('mouseup.ruleObjSelect');
	$('#ui').off('mousemove.ruleObjSelect');
}