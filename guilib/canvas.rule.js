function CanvasRule(){
	//Makes the following templates read only
	if( typeof Object.freeze === 'function' ){
		Object.freeze( this.requiredGroup );
		Object.freeze( this.ruleCircle );
		Object.freeze( this.requiredSymbol );
		Object.freeze( this.uniqueSymbol );
		Object.freeze( this.primarySymbol );
		Object.freeze( this.primarySymbol2 );
	}
}

CanvasRule.prototype = {
	requiredGroup : {
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
  		"x": 0,
  		"y": 0,
  		"radius": 10,
  		"offsetX": -10,
		"offsetY": -10,
  		"stroke": 'black',
  		"fill": 'white'
  	}
  	
  	, requiredSymbol : {
  		"id": "UUID",
  		"x": 6,
  		"y": 6,
  		"offsetX": -4,
		"offsetY": -4,
  		"radius": 4,
  		"fill": "#BF5FFF"
  	}
  	
  	, uniqueSymbol : {
  		"id": "UUID",
  		"points": [ 0, 10, 20, 10 ],
  		"stroke": 'black',
  	}
  	
  	, primarySymbol : {
  		"id": "UUID",
  		points : [ 1, 8, 19, 8 ],
  		"stroke": 'black',
  	}
  	
  	, primarySymbol2 : {
  		"id": "UUID",
  		points : [ 1, 12, 19, 12 ],
  		"stroke": 'black',
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
}

/*	toggleCreateListener: if we're in line creation context set back to 
 * 	standard context, otherwise set to line creation context
 */
CanvasRule.prototype.toggleCreateListener = function(){
	if( master.rule.active === true ){
		this.open();
	} else {
		this.close();
	}
}

/*	open: starts line creation context. For all affected objects
 */
CanvasRule.prototype.open = function(){
	//Deselect all objects
	deselect();
	
	//Loop through all objects
	for( var ref in master.model.VisualModel.groups ){
		var visualGroup = master.model.VisualModel.groups[ ref ];
		
		//If object is not entity, value, or predicate (in practice not a comment) set it up to interact with line tool
		if( visualGroup.type === 'predicate' ){
			this.openAGroup( visualGroup.id );	
		}
	}
}

/*	openAGroup: conditions a canvas group for line context mode
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