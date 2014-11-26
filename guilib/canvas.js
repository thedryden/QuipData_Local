/*	Canvas: this is object controls and is children control all aspects
 * 	of canvas manipulation. It is split into its own file so if future
 * 	developers want to move away from the KineticJS library for canvas
 * 	manipulation all of the code is sequestored into specific files.
 * 
 * 	Params:
 * 	_width (optional): Defines the width of the Canvas. If not passed
 * 	the width of div the canvas will be added to will be used.
 * 	_height (optional): Defines the height of the Canvas. If not passed
 * 	the height of div the canvas will be added to will be used.
 */
function Canvas( _width, _height ){
	//Gets location for the div that contains the canvas.
	this.divX = $('#ui').css( 'left' );
	this.divX = parseInt( stripChar( this.divX ) );
	this.divY = $('#ui').css( 'top' );
	this.divY = parseInt( stripChar( this.divY ) );
	
	/*	Spawns ormObj object for Canvas. This is the pair of
	 * 	ORMOBJ which control the non-canvas aspects of object manipulation
	 */ 
	this.ormObj = new CanvasORMObj();
	
	/*	Spawns Line object for Canvas. This is the pair of
	 * 	Line which control the non-canvas aspects of line manipulation
	 */ 
	this.line = new CanvasLine();
	
	/*	Spawns Rule object for Canvas. This is the pair of
	 * 	Rule which control the non-canvas aspects of extrenal rule manipulation
	 */ 
	this.rule = new CanvasRule();
	
	//Next two blocks get width and height.
	if( _width == undefined ){
		this.width = stripChar( $('#ui').css( 'width' ) );
	} else {
		this.width = _width;
	}
	
	if( _height == undefined ){
		this.height = stripChar( $('#ui').css( 'height' ) );
	} else {
		this.height = _height;
	}	
	
	//Sets up Kinetic stage
	this.stage = new Kinetic.Stage({
		container: 'ui',
		width: this.width,
		height: this.height
	});

	//Creates main layer, for objects
	this.layer = new Kinetic.Layer();
	/*	Creates the layer for lines. They are on they're own
	 * 	layer so that they are always behind any object
	 */ 
	this.lineLayer = new Kinetic.Layer();
	/*	Next four blocks  create background layer, this layer contains a single rect
	 * 	with a white background that convers the entire canvas. This
	 * 	allow you to bind events to clicking the background of the canvas
	 */
	this.background = new Kinetic.Layer();
	
	this.backRect = new Kinetic.Rect({
		width: this.width,
		height: this.height
	});
	
	this.backRect.on('click touchstart', function(e){
		if( !e.evt.shiftKey && !e.evt.ctrlKey )
			deselect();
	});
	
	this.background.add( this.backRect );
	
	//Add layers to stage
	this.stage.add(this.background);
  	this.stage.add(this.lineLayer);
  	this.stage.add(this.layer);
  	
  	/*	This object stores functions that can be called to manipulate
  	 * 	Kinteic objects upon creation to make them more interactive.
  	 */
  	this.callableFunctions = [];
  	this.callableFunctions['makeInteractive'] = makeInteractive;
  	this.callableFunctions['attachTo'] = attachTo;
  	this.callableFunctions['makeCircleSelectable'] = makeCircleSelectable;
  	this.callableFunctions['arrowAnchor'] = arrowAnchor;
}

/*	getMousePos: obtains the current position of the mouse over the
 * 	canvas object.
 * 
 * 	params:
 * 	Parameters do not need to be passed, call: var mouse = master.canvas.getMousePos();
 * 	
 * 	returns (object):
 * 	returns objects with two properties "x" and "y" that contain the X
 * 	and Y coordinates of the mouse pointer relative to the canvas (i.e. 0,0 is the top of 
 * 	canvas not the page).
 */
Canvas.prototype.getMousePos = function(canvas, evt){
	var mousePos = this.stage.getPointerPosition();
	
	if( mousePos == undefined )
		return undefined;
	
	return {
		x: mousePos.x,
		y: mousePos.y
	};
}

/*	reset: resets clears the canvas and resets it back to the current
 * 	contents of the visualModel
 * 
 * 	Params:
 * 	_callback: function to be called once reset is complete
 */
Canvas.prototype.reset = function( _callback ){
	//Clear the canvas
	this.layer.removeChildren();
	this.lineLayer.removeChildren();
	
	//Gets all groups from visual model
	var groups = master.model.VisualModel.groups;
	
	//Loop over all groups and process each
	for( var aGroupRef in groups ){
		if( aGroupRef != "empty" ){
			var aGroup = groups[aGroupRef];
			
			this.processModelGroup( aGroup.id, 'insert' );
			
		}
	}
	
	//Gets all groups from visual model
	var links = master.model.VisualModel.links;
	
	//Loop over all lines and process each
	for( var aLinkRef in links ){
		if( aLinkRef != "empty" ){
			var aLink = links[ aLinkRef ];
			
			this.processModelLinks( aLink.id, 'insert' );
		}
	}
	
	//Call callback function
	if( typeof _callback === 'function' ){
		_callback();
	}
}

Canvas.prototype.saveToImage = function(){
	var minX = -1;
	var minY = -1;
	var maxX = 0;
	var maxY = 0;
	
	for( var ref in master.model.VisualModel.groups ) {
	if( ref !== 'empty' ){
		var aVisualGroup = master.model.VisualModel.groups[ ref ];
		var aCanvasGroup = this.stage.find( '#' + aVisualGroup.id )[0];
		var x = aCanvasGroup.x();
		var y = aCanvasGroup.y();
		var width = aCanvasGroup.getWidth();
		var height = aCanvasGroup.getHeight();
		
		if( minX === -1 || minX > aCanvasGroup.x() ){
			minX = aVisualGroup.attr.x;
		}
		
		if( minY === -1 || minY > aCanvasGroup.y() ){
			minY = aVisualGroup.attr.y;
		}
		
		if(  ( aCanvasGroup.x() + aCanvasGroup.getWidth() ) > maxX ){
			maxX = aCanvasGroup.x() + aCanvasGroup.getWidth();
		}
			
		if(  ( aCanvasGroup.y() + aCanvasGroup.getHeight() ) > maxY ){
			maxY = aCanvasGroup.y() + aCanvasGroup.getHeight();
		} 
	} 
	}

	/*	since the stage toDataURL() method is asynchronous, we need
	* 	to provide a callback
	*/
	this.stage.toDataURL({
		x: minX - 10,
		y: minY - 10,
		width: maxX - minX + 10,
		height: maxY - minY + 10,
		callback: function(dataUrl) {
			/*	here you can do anything you like with the data url.
			 * 	In this tutorial we'll just open the url with the browser
			 * 	so that you can see the result as an image
			 */
			window.open(dataUrl);
		}
	});
}

/*	processModelUI: takes an id to a location on the visual
 * 	model and a command type and sends the command to the 
 * 	appropreate function.
 * 
 * 	Params:
 * 	_id: id to a location in the visual model
 * 	_commandType: type of command to be performed 
 * 	Valid values are: [ 'insert', 'update', 'delete' ]
 */
Canvas.prototype.processModelUI = function( _id, _commandType ){
	if( _id.substring( 0, 18 ) == 'VisualModel/groups' ){
		this.processModelGroup( _id, _commandType );
		return;
	}
	
	if( _id.substring( 0, 17 ) == 'VisualModel/links' ){
		this.processModelLinks( _id, _commandType );
		return;
	}
	
	if( _id.substring( 0, 20 ) == 'VisualModel/comments' ){
		this.processModelComments( _id, _commandType );
		return;
	}
}

/*	processModelGroup: processes a model group id in the visual model
 * 	perfroming the nessiary actions to place it on the canvas.
 * 
 * 	Params:
 * 	_id: id to an object withing the VisualModel/groups container in the
 * 	visualModel
 * 	_commandType: type of command to be performed 
 * 	Valid values are: [ 'insert', 'update', 'delete' ]
 */
Canvas.prototype.processModelGroup = function( _id, _commandType ){
	//Remove leading characters # or /
	_id = cleanObjPointer( _id );
	
	//Test to make sure the objects is in the correct container
	if( _id.substring( 0, 18 ) != 'VisualModel/groups' ){
		throwError( 'canvas.js', 'processModelGroup', 'Passed path was not for VisualModel or groups container' );
	}
	
	//Get object
	var visualObj = getObjPointer( master.model, _id );
	
	if( visualObj == undefined && _commandType !== 'delete' )
		throwError( 'canvas.js', 'processModelGroup', 'Passed path was not found' );
	
	var canvasGroup;
	
	//Block for insert
	if( _commandType == 'insert' ){
		//look for id in the canvas and throw error if it exists
		canvasGroup = this.stage.find( '#' + _id );
		
		if( canvasGroup.length > 0 )
			throwError( 'canvas.js', 'processModelGroup', 'command type of insert but the group already existes on the canvas.' );
		
		//Create group with passed attributes
		canvasGroup = new Kinetic.Group( visualObj.attr );
		
		//Create all of the group's children and add to the group
		if( visualObj.objects != undefined ){
			for( var objRef in visualObj.objects ){
				var childObj = visualObj.objects[objRef];
				var tempObj = new Kinetic[childObj.className](
					childObj.attr
				);
				
				if( typeof childObj.outside !== 'undefined' && childObj.outside === true ){
					this.layer.add( tempObj );
				} else {
					canvasGroup.add( tempObj );	
				}
				
				if( ( ( visualObj.type === 'entity' || visualObj.type === 'value' ) && childObj.className === 'Rect' ) 
				|| ( master.rule.ruleTypes[ visualObj.type ] === true && childObj.type === 'ruleCircle' ) ){
					tempObj.moveToBottom();	
				}
			}
		}
		
		//Add to the layer
		this.layer.add( canvasGroup );
		
		//Disable group if line context is on
		if( typeof master.line.active === 'boolean' && master.line.active )
			disableGroup( canvasGroup );
	}
	
	//Block for updates
	if( _commandType == 'update' ){
		//Get the group on the canvas
		canvasGroup = this.stage.find( '#' + _id );
		
		//If group does not exist throw an error
		if( canvasGroup.length === 0 )		
			throwError( 'canvas.js', 'processModelGroup', 'command type of update but the group does not exist on the canvas' );
			
		//Retrun value is an array, there should only be on item in the array, so get it
		canvasGroup = canvasGroup[0];
		
		//Set attributes
		canvasGroup.setAttrs( visualObj.attr );
		
		//Get children of canvas object
		var children = canvasGroup.getChildren().toArray();
		var tempChildren = this.stage.find( '.' + _id ).toArray()
		if( tempChildren != undefined )
			children.push.apply( children, tempChildren );
		
		/*	Loop through the canvas objects children with an ID 
		 * 	All objects on the visual model, and only objects on the visual model,
		 * 	will have an ID set (others may have a name, but not an ID)
		 */	
		for( var i = 0; i < children.length; i++ ){
			var child = children[i];
			
			if( child.id() != undefined ){
				//Use the ID to find it on the visual model
				var visualModelChild = getObjPointer( master.model, child.getId() );
				//If the child exists on the visualModel set its attributes, otherwise destory it
				if( visualModelChild == undefined ){
					if( typeof child.destroyChildren === 'function' )
						child.destroyChildren();
					child.destroy();
				} else {
					child.setAttrs( visualModelChild.attr );
					if( ( ( visualObj.type === 'entity' || visualObj.type === 'value' ) && child.className === 'Rect' ) 
					|| ( master.rule.ruleTypes[ visualObj.type ] === true && child.type === 'ruleCircle' ) ){
						child.moveToBottom();	
					}
					for( var linkRef in visualModelChild.links ){
						if( linkRef !== 'empty' ){
							this.line.moveLink( visualModelChild.links[ linkRef ] );
						}
					}
				}
			}
		}
		
		/*	Loop though objects in the visual model looking for objects that are not
		 * 	on the canvas. If found add them to the group.
		 */
		for( var ref in visualObj.objects ){
			var visualModelChild = visualObj.objects[ ref ];

			var canvasChild = this.stage.find( '#' + cleanObjPointer( visualModelChild.id ) )[0];
			
			if( canvasChild == undefined ){
				var tempObj = new Kinetic[ visualModelChild.className ](
					visualModelChild.attr
				);
				if( typeof visualModelChild.outside !== 'undefined' && visualModelChild.outside === true ){
					this.layer.add( tempObj );
				} else {
					canvasGroup.add( tempObj );	
				}
				
				if( ( ( visualObj.type === 'entity' || visualObj.type === 'value' ) && visualModelChild.className === 'Rect' ) 
				|| ( master.rule.ruleTypes[ visualObj.type ] === true && visualModelChild.type === 'ruleCircle' ) ){
					tempObj.moveToBottom();	
				}
			}
		}
		
		//Disable group if line context is on
		if( typeof master.line.active === 'boolean' && master.line.active )
			disableGroup( canvasGroup );
	}
	
	//Block for delete
	if( _commandType === 'delete' ){
		//Find the object on the canvas
		canvasGroup = this.stage.find( '#' + _id );
		
		/*	Destory the object. No error is thrown if not found
		 * 	since this will be called twice, once locally and once
		 * 	when the change comes down from Firebase
		 */
		if( canvasGroup.length > 0 ){
			canvasGroup = canvasGroup[0];
			
			if( typeof canvasGroup.destroyChildren === 'function' )
				canvasGroup.destroyChildren();
			canvasGroup.destroy();
			
			//Since "outside" object live outside of the group they will need to be cleaned
			//up seperately. All of these objects should have a name that is identical to
			//there parent visual group's name
			canvasObjects = this.stage.find( '.' + _id );
			canvasObjects.each(function( shape, n ){
				if( typeof shape.destroyChildren === 'function' )
					shape.destroyChildren();
				shape.destroy();
			})
		}
	} else {
	//Block to perform for both inserts and updates
		if( master.line.active === true && visualObj.type === 'predicate' ){
			this.line.openAGroup( visualObj.id );
		}
		
		if( master.rule.active === true && master.rule.ruleTypes[ visualObj.type ] === true ){
			this.rule.openAGroup( visualObj.id );
		}
	
		//If there are group level functions to call, call them
		if( visualObj.functions != undefined && visualObj.functions != '' ){
			this.callCallableFunctions( visualObj.functions )
		}
		
		//If there are children level functions to call, call them
		if( visualObj.objects != undefined ){
			for( var objRef in visualObj.objects ){
				var tempObj = visualObj.objects[ objRef ];
				
				if( tempObj.functions != undefined && tempObj.functions != '' ){
					this.callCallableFunctions( tempObj.functions )
				}
			}
		}
	}
	
	//Update layer
	this.layer.draw();
}

Canvas.prototype.processModelLinks = function( _id, _commandType ){
	if( _id.substring( 0, 17 ) !== 'VisualModel/links' ){
		throwError( 'canvas.js', 'processModelLinks', 'Passed path was not for VisualModel or links container' );
	}
	
	var visualLine = getObjPointer( master.model, _id );
	
	if( visualLine == undefined && _commandType !== 'delete' )
		throwError( 'canvas.js', 'processModelLinks', 'Passed path was not found' );
	
	var canvasLine;
	
	//Block for insert
	if( _commandType === 'insert' ){
		canvasLine = this.stage.find( '#' + _id );
		
		if( canvasLine.length > 0 )
			throwError( 'canvas.js', 'processModelLinks', 'command type of insert but the group already existes on the canvas.' );
		
		var points = [0,0,0,0];
		if( typeof visualLine.otherPoints === 'object' && typeof visualLine.otherPoints.length !== 'undefined' ){
			for( var i = 0; i < visualLine.otherPoints.length; i++ ){
				var point = visualLine.otherPoints[ i ];
				points[ points.length ] = point.x;
				points[ points.length ] = point.y;
			}
			for( var i = 0; i < 4; i++ ){
				points[ points.length ] = 0;
			}
		}
		
		var attr = cloneJSON( visualLine.attr );
		attr.points = points;
		
		var canvasLine = new Kinetic.Line( attr );
	  	this.lineLayer.add( canvasLine );

		if( visualLine.aSideAnchor === '' ){
			var aAnchor = undefined;
		} else if ( typeof visualLine.aSideAnchor === 'string' ){
			if( typeof this.callableFunctions[ visualLine.aSideAnchor ] === 'function' ){
				var aAnchor = this.callableFunctions[ visualLine.aSideAnchor ];
			} else {
				var aAnchor = undefined;
			}
		} else {
			var aAnchor = new Kinetic[ visualLine.aSideAnchor.className ]( visualLine.aSideAnchor.attr );
			this.layer.add( aAnchor );
		}
		
		if( visualLine.zSideAnchor === '' ){
			var zAnchor = undefined;
		} else if ( typeof visualLine.zSideAnchor === 'string' ){
			if( typeof this.callableFunctions[ visualLine.zSideAnchor ] === 'function' ){
				var zAnchor = this.callableFunctions[ visualLine.zSideAnchor ];
			} else {
				var zAnchor = undefined;
			}
		} else {
			var zAnchor = new Kinetic[ visualLine.zSideAnchor.className ]( visualLine.zSideAnchor.attr );
			this.layer.add( zAnchor );
		}
		
		this.addLink( 0, canvasLine, visualLine.aSide, visualLine.zSide, aAnchor, zAnchor );
	}
	
	//Block for update
	if( _commandType === 'update' ){
		canvasLine = this.stage.find( '#' + _id );
		
		if( canvasLine.length === 0 )
			throwError( 'canvas.js', 'processModelLinks', 'command type of update but the link does not exist on the canvas.' );
		canvasLine = canvasLine[0];
		
		if( typeof visualLine.otherPoints === 'object' && typeof visualLine.otherPoints.length !== 'undefined' ){
			var canvasPoints = canvasLine.points();
			
			var points = [canvasPoints[0],canvasPoints[1],canvasPoints[2],canvasPoints[3]];
			var otherPoints = visualLine.otherPoints
			for( var i = 0; i < otherPoints.length; i++ ){
				var point = otherPoints[ i ];
				
				points[ points.length ] = point.x;
				points[ points.length ] = point.y;
			}
			points[ points.length ] = canvasPoints[ points.length - 4 ];
			points[ points.length ] = canvasPoints[ points.length - 3 ];
			points[ points.length ] = canvasPoints[ points.length - 2 ];
			points[ points.length ] = canvasPoints[ points.length - 1 ];
			
			canvasLine.points( points );
		}
		
		if( typeof canvasLine.moveLine !== 'function' && visualLine.aSide !== '' && visualLine.zSide !== '' ){
			if( visualLine.aSideAnchor === '' ){
				var aAnchor = undefined;
			} else {
				var aAnchor = new Kinetic[ visualLine.aSideAnchor.className ]( visualLine.aSideAnchor.attr );
				this.lineLayer.add( aAnchor );
			}
			
			if( visualLine.zSideAnchor === '' ){
				var zAnchor = undefined;
			} else {
				var zAnchor = new Kinetic[ visualLine.zSideAnchor.className ]( visualLine.zSideAnchor.attr );
				this.lineLayer.add( zAnchor );
			}
			
			this.addLink( 0, canvasLine, visualLine.aSide, visualLine.zSide, aAnchor, zAnchor );
		} else {
			if( visualLine.aSide == "" && canvasLine.aSide != undefined ){
				deleteLinkSide( canvasLine, 'a' );
			}
			
			if( visualLine.aSide != "" && ( canvasLine.aSide == undefined || visualLine.aSide !== canvasLine.aSide.id() ) ){
				deleteLinkSide( canvasLine, 'a' );
				insertSide( canvasLine, 'a', visualLine.aSide )
			}
			
			if( visualLine.zSide == "" && canvasLine.zSide != undefined ){
				deleteLinkSide( canvasLine, 'z' );
			}
			
			if( visualLine.zSide != "" && ( canvasLine.zSide == undefined || visualLine.zSide !== canvasLine.zSide.id() ) ){
				deleteLinkSide( canvasLine, 'z' );
				insertSide( canvasLine, 'z', visualLine.zSide )
			}
	
			if( visualLine.aSideAnchor === '' && canvasLine.aSideAnchor != undefined ){
				deleteAnchor( canvasLine, 'a' );
			} else if( visualLine.aSideAnchor !== '' && ( typeof canvasLine.aSideAnchor === 'undefined' || canvasLine.aSideAnchor.id() !== visualLine.aSideAnchor.id ) ){
				var aAnchor = new Kinetic[ visualLine.aSideAnchor.className ]( visualLine.aSideAnchor.attr );
				this.layer.add( aAnchor );
				insertAnchor( canvasLine, 'a', aAnchor );
				this.lineLayer.draw();
			}
			
			if( visualLine.zSideAnchor === '' && canvasLine.zSideAnchor != undefined ){
				deleteAnchor( canvasLine, 'z' );
			} else if( visualLine.zSideAnchor !== '' && canvasLine.zSideAnchor.id() !== visualLine.zSideAnchor.id ) {
				var zAnchor = new Kinetic[ visualLine.zSideAnchor.className ]( visualLine.zSideAnchor.attr );
				this.layer.add( zAnchor );
				insertAnchor( canvasLine, 'z', zAnchor );
				this.lineLayer.draw();
			}
			
			if( visualLine.aSide === '' || visualLine.zSide ==='' ){
				canvasLine.hide();
				this.lineLayer.draw();
			} else {
				canvasLine.show();
				this.lineLayer.draw();
			}
		}
	}
	
	//Block for delete
	if( _commandType === 'delete' ){
		//Find the object on the canvas
		canvasLine = this.stage.find( '#' + _id );
		
		/*	Destory the object. No error is thrown if not found
		 * 	since this will be called twice, once locally and once
		 * 	when the change comes down from Firebase
		 */
		if( canvasLine.length > 0 ){
			canvasLine = canvasLine[0];
			
			deleteLink( canvasLine );
			if( canvasLine.line != undefined ){
				if( typeof canvasLine.line.destroyChildren === 'function' )
					canvasLine.line.destroyChildren();
				canvasLine.line.destroy();
			}	
				
			if( typeof canvasLine.destroyChildren === 'function' )
				canvasLine.destroyChildren();
			canvasLine.destroy();
			this.lineLayer.draw();
		}
	}
}

Canvas.prototype.addLink = function( _i, _line, _aSide, _zSide, _aAnchor, _zAnchor ){
	var aSideVisualObj = getObjPointer( master.model, _aSide );
	var zSideVisualObj = getObjPointer( master.model, _zSide );
	
	if( aSideVisualObj != undefined && zSideVisualObj != undefined ){
		addLink( _line, _aSide, _zSide, _aAnchor, _zAnchor );
	} else if ( _i > 10) {
		return;
	} else {
		_i++
		setTimeout( function(){
			master.canvas.addLink( _i, _line, _aSide, _zSide, _aAnchor, _zAnchor )
		}, 100 )
	}
} 

/*	callCallableFunctions: helper function that calls functions defined
 * 	in the visualModel.
 * 
 * 	Params:
 * 	_functions: this is the entire functions object defined in the visual
 * 	model. Defined as:
"functions" : {
	"type" : "array",
	"items" : {
		"type" : "object",
		"properties" : {
			//name of function to be called
			"functionName" : { "type" : "string" }
			//an actuall array (NOT an object since order is important) of parameters
			"parameters" : { "type" : "array", "items" : "string" }
		} 
	}
}
 */
Canvas.prototype.callCallableFunctions = function( _functions ){
	for( var funRef in _functions ){
		var tempFunction = _functions[funRef]
		//If not parameters just call the function
		if( tempFunction.params == undefined ){
			this.callableFunctions[tempFunction.functionName]()
		} else {
			//Get parameters
			var params = tempFunction.params;
			
			//switch is used to call the functions with up to five parameters
			switch( params.length ){
				case 0:
					this.callableFunctions[tempFunction.functionName]()
				break;
				case 1:
					this.callableFunctions[tempFunction.functionName]( params[0] )
				break;
				case 2:
					this.callableFunctions[tempFunction.functionName]( params[0], params[1] )
				break;
				case 3:
					this.callableFunctions[tempFunction.functionName]( params[0], params[1], params[2] )
				break;
				case 4:
					this.callableFunctions[tempFunction.functionName]( params[0], params[1], params[2], params[3] )
				break;
				case 5:
					this.callableFunctions[tempFunction.functionName]( params[0], params[1], params[2], params[3], params[4] )
				break;
			}	
		}
	}
}
