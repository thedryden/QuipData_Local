/*	CanvasORMObj: this is the canvas pair of ORMObj. This object
 * 	contains all of the code nessisary to alter the canvas. It is
 * 	a child of the Canvas object.
 */
function CanvasORMObj(){
	this.NAME_REG_EX = /Model\/Model\/ModelObjects\/[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}\/name/
	
	/*	todo: set objectID, value.id, and value.functions.makeInteractive.params[0] to the same value
	 * 	set value.type to either [ 'entity', 'value' ]
	 * 	set value.modelID to its value
	 * 	set attr
	 */
	this.transactionTemplate = {
		"objectID" : "VisualModel/groups/UUID",
		"commandType" : "insert",
		"value" : {
		    "type": "",
		    "id": "VisualModel/groups/UUID",
		    "modelID": "Model/Model/ModelObjects/UUID",
		    "selectedBy": "default",
		    "attr": {},
		    "functions": { "makeInteractive" : { "functionName" : "makeInteractive", "params" : [ "VisualModel/groups/UUID", "objects" ] } },
		    "objects": {}
		}
	}

	/*	todo: set x and y
	 * 	id: set to a the proper json pointer to this object ending with a UUID
	 */
	this.groupTemplate = {
		x: 10,
		y: 10,
		draggable: true,
		id: 'UUID'
	}
	
	//	id: set to a the proper json pointer to this object ending with a UUID
	this.entityTemplate = {
		width: 40,
		height: 40,
		stroke: 'black',
		strokeWidth: 1,
		cornerRadius: 8,
		fill: 'white',
		id: 'UUID'
	}
	
	//	id: set to a the proper json pointer to this object ending with a UUID
	this.valueTemplate = {
		width: 40,
		height: 40,
		stroke: 'black',
		strokeWidth: 1,
		cornerRadius: 8,
		fill: 'white',
		id: 'UUID',
		dash: [10, 4]
	}
	
	/*	todo: text must be replace.
	 * 	id: set to a the proper json pointer to this object ending with a UUID
	 * 	y: stored value is the ratio of parent groups height, not the real value.
	 * 		To get real value mutliple stored value by the groups height.
	 */
	this.nameTempalte = {
		x: 5,
		y: .5,
		fontSize: '10pt',
		fontFamily: 'Calibri',
		fill: 'black',
		text: 'REPLACE_ME',
		wrap: "none",
		id: 'UUID'
  	}
	
	/*	todo: text must be replace.
	 * 	id: set to a the proper json pointer to this object ending with a UUID
	 * 	y: stored value is the ratio of parent groups height, not the real value.
	 * 		To get real value mutliple stored value by the groups height.
	 */
	this.nameAndPKTemplate = {
		x: 5,
		y: .375,
		fontSize: '10pt',
		fontFamily: 'Calibri',
		fill: 'black',
		text: 'REPLACE_ME',
		wrap: "none",
		id: 'UUID'
  	}
  	
  	/*	todo: text must be replace.
	 * 	id: set to a the proper json pointer to this object ending with a UUID
	 * 	y: stored value is the ratio of parent groups height, not the real value.
	 * 		To get real value mutliple stored value by the groups height.
	 */
  	this.pkTemplate = {
		x: 5,
		y: .5,
		fontSize: 10,
		fontFamily: 'Calibri',
		fill: 'black',
		text: '(REPLACE_ME)',
		wrap: "none",
		id: 'UUID'
  	}
}

/*	visualOnlySync: if the change to the object was visual only
 * 	(such as moving or resizing the object). Send the change as
 * 	a transaction without engaging ORMObj. Affects all selected
 * 	objects.
 */
CanvasORMObj.prototype.visualOnlySync = function(){
	var actions = [];
	
	try{
		//Loop over all selected actions and create actions for each.
		for( var group in Kinetic.isSelected ){
			var group = Kinetic.isSelected[ group ];
			
			var newAction = this.createSyncAction( group.getId() );
			actions[actions.length] = newAction;
		}
	}catch( err ){
		throwError( 'canvas.orm_obj.js', 'visualOnlySync', 'Was unable to create syncing action(s)', false );
		return;
	}
	
	try{
		//Turn actions into a transaction and process the transaction
		var trans = master.transaction.createTransaction( 'VisualModel', actions );
		master.transaction.processTransactions( trans );
	}catch( err ){
		throwError( 'canvas.orm_obj.js', 'visualOnlySync', err.message, false );
		return;
	}
}

CanvasORMObj.prototype.saveProperties = function( _modelPK ){
	var visualGroup = cloneJSON( master.ormObj.visualGroup );
	
	var pkProp = $('#obj_pk').val();
	var nameProp = $('#obj_name').val();
	var typeProp = $('#obj_type').val();
	
	var visualNameUUID = null
	var visualName = null;
	var visualPKUUID = null;
	var visualPK = null;
	var visualRectUUID = null;
	var visualRect = null;
	
	var width = 0;
	
	for( var ref in visualGroup.objects ){
	if( ref !== 'empty' ){
		if( visualGroup.objects[ ref ].type === 'name' ){
			visualNameUUID = ref;
			visualName = visualGroup.objects[ ref ];
		} else if ( visualGroup.objects[ ref ].type === 'pk' ) {
			visualPKUUID = ref;
			visualPK = visualGroup.objects[ ref ];
		} else if ( visualGroup.objects[ ref ].className === 'Rect' ) {
			visualRectUUID = ref;
			visualRect = visualGroup.objects[ ref ];
		}
	}
	}
	
	if( visualName != undefined && visualName.attr.text !== nameProp ){
		visualGroup.objects[ visualNameUUID ].attr.text = nameProp;
		visualGroup.objects[ visualNameUUID ].attr.x = this.nameTempalte.x
		visualGroup.objects[ visualNameUUID ].attr.width = 'auto';
		
		var tempText = new Kinetic.Text( visualGroup.objects[ visualNameUUID ].attr );
		width = tempText.width(); 
	} else if ( visualName == undefined && nameProp !== '' ){
		if( pkProp === '' ){
			visualNameAttr = cloneJSON( this.nameTempalte );	
		} else {
			visualNameAttr = cloneJSON( this.nameAndPKTemplate );
		}
		var visualNameUUID = uuid.v4();

		visualNameAttr.id = visualGroup.id + '/objects/' + visualNameUUID;
		visualNameAttr.text = nameProp;
		visualNameAttr.y *= visualRect.attr.height;
		
		var tempText = new Kinetic.Text( visualNameAttr );
		width = tempText.width();
		
		visualGroup.objects[ visualNameUUID ] = {
		    "id": visualNameAttr.id,
		    "modelID": visualGroup.modelID + '/name',
		    "parentID" : visualGroup.id, 
		    "type" : "name",
		    "className": "Text",
		    "attr": visualNameAttr,
		    "functions": {},
		    "links": { "empty":"" }
		};
	}
	
	if( visualPK != undefined && pkProp === '' ){
		delete visualGroup.objects[ visualPKUUID ];
		
		if( visualName != undefined ){
			visualGroup.objects[ visualNameUUID ].attr.y = ( visualRect.attr.height * this.nameTempalte.y );
		}
	} else if ( visualPK != undefined && visualPK.attr.text !== pkProp ){
		visualGroup.objects[ visualPKUUID ].attr.text = pkProp;
		
		var tempText = new Kinetic.Text( visualGroup.objects[ visualPKUUID ].attr );
		width = ( width > tempText.width() ) ? width : tempText.width();
	} else if ( visualPK == undefined && pkProp !== '' ){
		visualPKAttr = cloneJSON( this.pkTemplate );
		var visualPKUUID = uuid.v4();

		visualPKAttr.id = visualGroup.id + '/objects/' + visualPKUUID;
		visualPKAttr.text = '(' + pkProp + ')';
		visualPKAttr.y *= visualRect.attr.height;
		
		var tempText = new Kinetic.Text( visualPKAttr );
		width = ( width > tempText.width() ) ? width : tempText.width();
		
		visualGroup.objects[ visualPKUUID ] = {
		    "id": visualPKAttr.id,
		    "modelID": _modelPK,
		    "parentID" : visualGroup.id, 
		    "type" : "pk",
		    "className": "Text",
		    "attr": visualPKAttr,
		    "functions": {},
		    "links": { "empty":"" }
		};
		
		if( visualName != undefined ){
			visualGroup.objects[ visualNameUUID ].attr.y = ( visualRect.attr.height * this.nameAndPKTemplate.y );
		}
	}
	
	if( visualGroup.type != typeProp ){
		visualGroup.type = typeProp;
		
		if( visualGroup.type === 'entity' ){
			delete visualGroup.objects[ visualRectUUID ].attr.dash;
		} else if( visualGroup.type === 'value' ) {
			visualGroup.objects[ visualRectUUID ].attr.dash = cloneJSON( this.valueTemplate.dash );
		}
	}
	
	var rectWidth = visualGroup.objects[ visualRectUUID ].attr.width;
	visualGroup.objects[ visualRectUUID ].attr.width = ( width + 10 > rectWidth ) ? width + 10 : rectWidth;
	
	return [
		{	
			"objectID" : visualGroup.id,
			"commandType" : "update",
			"value" : visualGroup
		}
	]
}

/*	addObj: add a new objects.
 * 	
 * 	Params:
 * 	_type: type of object to be added. Valid values are: [ 'entity', 'value' ]
 * 	_modelID: the id of the model object this object is lined to.
 * 	_x (optional): position of the new object. If not passed position of the
 * 	mouse will be used.
 * 	_y (optional): position of the new object. If not passed position of the
 * 	mouse will be used.
 * 
 * 	Return:
 * 	a full assembled transaction action (JSON object) is returned.
 */
CanvasORMObj.prototype.addObj = function( _type, _modelID, _x, _y ){
	//New uuids for the group and its child rect
	var newID = uuid.v4();
	var objID = uuid.v4();
	
	//Create group from template
	var groupAttr = cloneJSON( this.groupTemplate );
	
	//If _x or _y is not defined get possition of the mouse
	if( _x == undefined || _y == undefined ){
		var mouse = master.canvas.getMousePos();
		_x = mouse.x;
		_y = mouse.y;	
	}
	//Set position of the group and its ID.
	groupAttr.x = _x;
	groupAttr.y = _y;
	groupAttr.id = "VisualModel/groups/" + newID;
	
	//Create transaction action the contains the new group
	/*	todo: set objectID, value.id, and value.functions.makeInteractive.params[0] to the same value
	 * 	set type to either [ 'entity', 'value' ]
	 * 	set value.modelID to its value
	 * 	set attr
	 */
	var visualActions = cloneJSON( this.transactionTemplate );
	visualActions.objectID = visualActions.objectID.replace( 'UUID', newID );
	visualActions.value.id = cleanObjPointer( visualActions.objectID );
	visualActions.value.functions.makeInteractive.params[0] = visualActions.value.id;
	visualActions.value.modelID = visualActions.value.modelID.replace( 'UUID', _modelID );
	visualActions.value.type = _type;
	visualActions.value.attr = groupAttr;
	
	//Get the correct tempalte based upon the _type
	if( _type === 'entity' ){
		var rectAttr = cloneJSON( this.entityTemplate );		
	} else if ( _type === 'value' ){
		var rectAttr = cloneJSON( this.valueTemplate );
	}
	
	//Throw error if _type was not vaild or tempalte did not exist
	if( !rectAttr ){
		throwError( 'canvas.orm_obj.js', 'addObj', 'Passed type of "' + ( !_type ) ? '' : _type + '" is not valid', true );
		return;
	}
	
	//Set new rects ID
	rectAttr.id = "VisualModel/groups/" + newID + "/objects/" + objID;
	
	//Add new rect to the visual action as a child object
	visualActions['value']['objects'][objID] = {
	    "id": "VisualModel/groups/" + newID + "/objects/" + objID,
	    "modelID": "Model/Model/ModelObjects/" + _modelID,
	    "parentID" : "VisualModel/groups/" + newID,
	    "className": "Rect",
	    "type" : _type + "Rect",
	    "attr": rectAttr,
	    "functions": {},
	    "links": {"empty":""}
	}
	
	//return the assembled action
	return visualActions;
}

/*	cloneCanvas: returns an exsact copy of the passed visual group ID
 * 	as a canvas group. NOTE: this return value has the same IDs as well
 * 	as all other properties. This will create ID conflicts if placed on
 * 	the same stage as the original.
 * 
 * 	Params:
 * 	_id: string pointer to the visual group you wish to clone.
 * 
 * 	Returns:
 * 	A canvas object with the ID's removed.
 */
CanvasORMObj.prototype.cloneCanvas = function( _id ){
	//Test to make sure the objects is in the correct container
	if( _id.substring( 0, 18 ) !== 'VisualModel/groups' ){
		throwError( 'canvas.js', 'cloneCanvas', 'Passed path was not for VisualModel or groups container' );
	}
	
	//Get object
	var visualObj = getObjPointer( master.model, _id );
	
	if( visualObj == undefined && _commandType !== 'delete' )
		throwError( 'canvas.js', 'cloneCanvas', 'Passed path was not found' );
	
	visualObj = cloneJSON( visualObj );
	if( visualObj.id )
		visualObj.id = 'clone' + visualObj.id;
	if( visualObj.attr.id )
		visualObj.attr.id = 'clone' + visualObj.attr.id;
	
	for( var ref in visualObj.objects ){
	if( ref !== 'empty' ){
		var avisualObject = visualObj.objects[ ref ];
		
		if( avisualObject.id )
			avisualObject.id = 'clone' + avisualObject.id;
		if( avisualObject.attr.id )
			avisualObject.attr.id = 'clone' + avisualObject.attr.id; 
	}
	}
	
	//Create group with passed attributes
	var canvasGroup = new Kinetic.Group( visualObj.attr );
	
	//Create all of the group's children and add to the group
	if( visualObj.objects != undefined ){
		for( var objRef in visualObj.objects ){
			var childObj = visualObj.objects[objRef];
			var tempObj = new Kinetic[childObj.className](
				childObj.attr
			);
			canvasGroup.add( tempObj );
		}
	}
	
	return canvasGroup;
}

CanvasORMObj.prototype.cloneCanvasDefault = function( _id ){
	//Test to make sure the objects is in the correct container
	if( _id.substring( 0, 18 ) !== 'VisualModel/groups' ){
		throwError( 'canvas.js', 'cloneCanvasDefault', 'Passed path was not for VisualModel or groups container' );
	}
	
	//Get object
	var visualObj = getObjPointer( master.model, _id );
	
	if( visualObj == undefined && _commandType !== 'delete' )
		throwError( 'canvas.js', 'cloneCanvasDefault', 'Passed path was not found' );
	
	visualObj = cloneJSON( visualObj );
	if( visualObj.id )
		visualObj.id = 'clone' + visualObj.id;
	if( visualObj.attr.id )
		visualObj.attr.id = 'clone' + visualObj.attr.id;
	
	for( var ref in visualObj.objects ){
	if( ref !== 'empty' ){
		var avisualObject = visualObj.objects[ ref ];
		
		if( avisualObject.id )
			avisualObject.id = 'clone' + avisualObject.id;
		if( avisualObject.attr.id )
			avisualObject.attr.id = 'clone' + avisualObject.attr.id; 
	}
	}
	
	//Create group with passed attributes
	var canvasGroup = new Kinetic.Group( visualObj.attr );
	
	//Create all of the group's children and add to the group
	if( visualObj.objects != undefined ){
		var nameText = null;
		var nameCanvas = null;
		var pkCanvas = null;
		var pkText = null; 
		
		var width = 0;
		
		for( var objRef in visualObj.objects ){
			var childObj = visualObj.objects[objRef];
			
			var attr = cloneJSON( childObj.attr );
			if( attr == undefined ){
				throwError( 'canvas.js', 'cloneCanvasDefault', 'Child object in visual group had no attr set.' );
			}
			
			if( childObj.type === 'entityRect' ){
				attr.width = this.entityTemplate.width;
				attr.height = this.entityTemplate.height;
			}
			
			if( childObj.type === 'valueRect' ){
				attr.width = this.valueTemplate.width;
				attr.height = this.valueTemplate.height;
			}
			
			if( childObj.type === 'name' ){
				nameText = childObj;
				
				if( attr.width )
					delete attr.width;
				if( attr.height )
					delete attr.height;
				
				if( visualObj.type === 'entity' ){
					var height = this.entityTemplate.height;
				} else {
					var height = this.valueTemplate.height;
				}
				
				if( pkText === null ){
					attr.x = this.nameTempalte.x;
					attr.y = height * this.nameTempalte.y;
				} else {
					attr.x = this.nameAndPKTemplate.x;
					attr.y = height * this.nameAndPKTemplate.y;
				}
			}
			
			if( childObj.type === 'pk' ){
				pkText = childObj;
				
				if( attr.width )
					delete attr.width;
				if( attr.height )
					delete attr.height;
				
				if( visualObj.type === 'entity' ){
					var height = this.entityTemplate.height;
				} else {
					var height = this.valueTemplate.height;
				}
				
				attr.x = this.pkTemplate.x;
				attr.y = height * this.pkTemplate.y;
				
				var tempCanvas = tempObj = new Kinetic[childObj.className](
					attr
				);
				
				if( nameText !== null ){
					nameCanvas.x( this.nameAndPKTemplate.x );
					nameCanvas.y( height * this.nameAndPKTemplate.y );
				}
			}
			
			var tempObj = new Kinetic[childObj.className](
				attr
			);
			canvasGroup.add( tempObj );
			
			if( childObj.type === 'name' ){
				nameCanvas = tempObj;
			} else if( childObj.type === 'pk' ){
				pkCanvas = tempObj;
			} else if ( childObj.className === 'Rect' ){				
				rectCanvas = tempObj;
				tempObj.moveToBottom();
			}
		}
	}
	
	if( nameCanvas != undefined ){
		width = nameCanvas.width(); 
	}
	
	if( pkCanvas != undefined && pkCanvas.width() > width ){
		width = pkCanvas.width();
	}
	
	width += 10;
	
	if( width > rectCanvas.width() ){
		if( width > ( rectCanvas.width() * 2 ) ){
			width = rectCanvas.width() * 2
			
			if( nameCanvas != undefined ){
				nameCanvas.width( width - 20 ); 
			}
			
			if( pkCanvas != undefined ){
				pkCanvas.width( width - 20 ); 
			}
		}
		
		rectCanvas.width( width );
	} 
	
	return canvasGroup;
}

CanvasORMObj.prototype.canvasDefaultShell = function( _template ){
	var groupAttr = cloneJSON( this.groupTemplate );
	
	var canvasGroup = new Kinetic.Group( groupAttr );
	
	var rectAttr = null
	if( _template === 'entity' ){
		rectAttr = cloneJSON( this.entityTemplate );
	}else {
		rectAttr = cloneJSON( this.valueTemplate );
	}
	
	var canvasRect = new Kinetic.Rect( rectAttr );
	
	canvasGroup.add( canvasRect );
	
	return canvasGroup;
}

/*	openEditName: opens the editor for changing the objects name
 * 	
 * 	Param: 
 * 	_id: the visualModel id of the object to be renamed
 */
CanvasORMObj.prototype.openEditName = function( _id ){
	//If passed ID is a string change it to the object it points to
	if( typeof _id === 'string' ){
		_id = getObjPointer( master.model, _id );
	}
	
	//If _id is not an object throw an error
	if( typeof _id !== 'object' ){
		throwError( 'canvas.orm_obj.js', 'openEditName', 'Passed _id was either not an object or not a string pointer to an object' );
	}
	
	//If ID is not defined in _id or ID does not point to something in VisualModel/groups throw an error
	if( _id.id == undefined || cleanObjPointer( _id.id ).substring( 0, 18 ) !== 'VisualModel/groups' ){
		throwError( 'canvas.orm_obj.js', 'openEditName', 'Passed _id was not for a VisualModel/groups' )
	}
	
	var attr = _id.attr;
	
	//Get current name if it exists and hide the name object
	//Get the maxWidth and maxHeight of any object
	var name = null;
	var maxHeight = 0;
	var maxWidth = 0;
	var rect;
	for( var ref in _id.objects ){
		var object = _id.objects[ref];
		if( object.modelID != undefined && object.modelID.match( this.NAME_REG_EX ) != null ){
			name = object.attr.text;
			var objName = master.canvas.stage.find( '#' + object.id );
			if( objName.length > 0 ){
				objName[0].hide();
				master.canvas.layer.draw();
			}
		}
		
		if( typeof object.attr.height !== 'undefined' ){
			var height  = parseInt( stripChar( object.attr.height ) );
			if( height  > maxHeight )
				maxHeight = height;
		}
		
		if( typeof object.attr.width !== 'undefined' ){
			var width = parseInt( stripChar( object.attr.width ) );
			if( width > maxWidth )
				maxWidth = width;
		}
		
		if( typeof object.className === 'string' && object.className === 'Rect' ){
			rect = object;
		}
	}
	
	//If name is still null set to blank
	name = ( name === null ) ? '' : name;
	
	//Get location for the text box
	var targetX = parseInt( attr.x ) + master.canvas.divX + this.nameTempalte.x;
	var targetY = parseInt( attr.y ) + master.canvas.divY  + ( maxHeight / 2 ) - 10;
	
	//Function to detect new width and adjust size of object as nessisary
	var keypress = function(){
		var min = maxWidth;
		var width = canvasTextWidth() + 20;
		if( width > min ){
			var obj = master.canvas.stage.find( '#' + rect.attr.id )[0];
			obj.width( width );
			
			master.canvas.layer.draw();
		}
	}
	
	//Function to be called if "enter" is pressed, or someone clicks anywhere
	var saveName = function( _value ){
		//Find name if it exists and set it back to show 
		for( var ref in _id.objects ){
			var object = _id.objects[ref];
			if( object.modelID != undefined && object.modelID.match( this.NAME_REG_EX ) != null ){
				var objName = master.canvas.stage.find( '#' + object.id );
				if( objName.length > 0 )
					objName[0].show();
				break
			}
		}
		
		//Call function to edit name, passing the modelID and new value
		master.ormObj.editName( _id.modelID, _value );
	}
	
	//Open the text editor
	openCanvasText( targetX, targetY, name, true, true, keypress, saveName );
}

/*	editName: Assembles a visualAction to change the name of the passed
 * 	id to the passed value.
 * 	
 * 	Params:
 * 	_id: id of the visualModel object to be edited
 * 	_value: value to set the name too.
 * 
 * 	Returns (object):
 * 	Valid Visual Action
 */
CanvasORMObj.prototype.editName = function( _id, _value ){
	//Create a visualAction that is equal to the current state of the passed object
	var newAction = this.createSyncAction( _id );
	
	//Extract the actual action
	var visualModel = newAction.value;
	
	//Throw error if action is undefined
	if( visualModel == undefined ){
		throwError( 'canvas.orm_obj.js', 'editName', 'Passed ID must exsist in the VisualModel' );
	}
	
	//Get the canvas group associated with _id. Throw an error if not found
	var group = master.canvas.stage.find( '#' + _id );
	if( group.length === 0 ){
		throwError( 'canvas.orm_obj.js', 'editName', 'Passed ID must exsist on the canvas'  )
	}
	var group = group[0];
	
	//Get the children of the visualModel
	var objects = visualModel.objects;
	
	//If a name object already exists, extract it.
	//Extract rect as well
	var name = null;
	var rect = null;
	for( var ref in objects ){
		var aObject = objects[ref];
		if( aObject.modelID != undefined && aObject.modelID.match( this.NAME_REG_EX ) != null )
			name = aObject;

		if( aObject.className === 'Rect' )
			rect = aObject;
	}
	
	/*	If the name is new, check to see if its the only text.
	 * 	If it is use the template nameTemplate
	 * 	If not use nameAndPKTemplate.
	 * 	Either way set y as approprate.
	 */
	if( name == null ){
		var template = this.nameTempalte;
		
		for( var ref in objects ){
			var aObject = objects[ref];
			if( aObject.className != undefined && aObject.className === 'Text' && aObject.modelID.match( this.NAME_REG_EX ) == null ){
				template = this.nameAndPKTemplate;
				break
			}
		}
		
		//Clone the chosen template
		template = cloneJSON( template );
								
		//Get new UUID
		var objID = uuid.v4();
		
		/*	todo: text must be replace.
		 * 	id: set to a the proper json pointer to this object ending with a UUID
		 * 	y: stored value is the ratio of parent groups height, not the real value.
		 * 		To get real value mutliple stored value by the groups height.
		 */
		template.text = _value;
		template.id = _id + "/objects/" + objID;
		template.y *= group.getInteractiveHeight();
		
		newAction.value.objects[objID] = {
		    "id": _id + "/objects/" + objID,
		    "modelID": visualModel.modelID + '/name',
		    "parentID" : _id, 
		    "type" : "name",
		    "className": "Text",
		    "attr": template,
		    "functions": {},
		    "links": { "empty":"" }
		};
	} else {
		name.attr.text = _value;
		name.attr.x = this.nameTempalte.x
		name.attr.width = 'auto';
		delete name.attr.visible;
		master.canvas.stage.find( '#' + name.id )[0].show();
	}
	
	return [ newAction ];
}

/*	findGroupByModelID: takes a model ID and returns the visualModel object
 * 	associated with it.
 * 
 * 	Params:
 * 	_id: valid id to an object in the model
 * 
 * 	Returns (object):
 * 	retunrs visualModel object associated with the object
 */
CanvasORMObj.prototype.findGroupByModelID = function( _id ){
	var visualGroups = master.model.VisualModel.groups;
	
	/*	Loop through groups in the visual model and return the group 
	 * 	associated with the passed modelID
	 */
	for( var aGroup in visualGroups ){
		aGroup = visualGroups[aGroup];
		
		if( aGroup.modelID != undefined && aGroup.modelID === _id ){
			return aGroup;
		}
	}
	
	//If no match was found return undefined
	return undefined;
}

/*	createSyncAction: creates and returns transaction action that will
 * 	sync the visualModel with the current state on the Canvas.
 * 	
 * 	Params:
 * 	_id to an object on the visualModle/Canvas
 * 	
 * 	Returns (object):
 * 	valide visualModel action for a transaction
 */
CanvasORMObj.prototype.createSyncAction = function( _id ){
	//gets the object associated with _id, throws and error if not found
	var visualModel = getObjPointer( master.model, _id );
	if( visualModel == undefined ){
		throwError( 'canvas.orm_obj.js', 'createSyncAction', 'Passed ID must exsist in the VisualModel' );
	}
	
	//get the canvas object associated with the _id, throws and error if not found
	var group = master.canvas.stage.find( '#' + _id );
	if( group.length === 0 ){
		throwError( 'canvas.orm_obj.js', 'createSyncAction', 'Passed ID must exsist on the canvas'  )
	}
	group = group[0];
	
	var groupAttr = cleanObjectforJSON( group.getAttrs() );
	if( typeof groupAttr.disabled !== 'undefined' )
		delete groupAttr.disabled;
		
	var tempObj = cloneJSON( visualModel );
	tempObj.attr = groupAttr;
	tempObj.objects = {};
	
	//Creates visual action at the group level
	var visualActions =	{	
		"objectID" : visualModel.id,
		"commandType" : "update",
		"value" : tempObj
	}
	
	//Extracts the objects object from the action for eaiser referance
	var objects = visualActions.value.objects;
	
	/*	Loop through each child ofthe group that has an id. For each object
	 * 	add it to the actions objects object
	 */
	var children = group.getChildren().each( function( child, n ){
		if( child.id() != undefined ){
			var visualChild = getObjPointer( master.model, child.id() );
			if( visualChild == undefined ){
				console.log( "There is a canvas object in the group id '" + _id + "' with the ID '" + child.id() + "' but is not in the VisualModel. This was NOT be added to the sync." )
			} else {	
				objects[ getPointerUUID( child.id() ) ] = {
				    "id": child.id(),
				    "type" : visualChild.type,
				    "modelID": visualChild.modelID,
				    "parentID" : visualActions.objectID, 
				    "className": child.getClassName(),
				    "attr": cleanObjectforJSON( child.getAttrs() ),
				    "functions": ( visualChild.functions == undefined ) ? '' : visualChild.functions,
				    "links": visualChild.links
				}
			}	
		}
	});
	
	/*	Loop through each child ofthe group that has an id. For each object
	 * 	add it to the actions objects object
	 */
	var children = master.canvas.stage.find( '.' + _id ).getChildren().each( function( child, n ){
		if( child.id() != undefined ){
			var visualChild = getObjPointer( master.model, child.id() );
			if( visualChild == undefined ){
				console.log( "There is a canvas object in the group id '" + _id + "' with the ID '" + child.id() + "' but is not in the VisualModel. This was NOT be added to the sync." )
			} else {	
				objects[ getPointerUUID( child.id() ) ] = {
				    "id": child.id(),
				    "type" : visualChild.type,
				    "modelID": visualChild.modelID,
				    "parentID" : visualActions.objectID, 
				    "className": child.getClassName(),
				    "attr": cleanObjectforJSON( child.getAttrs() ),
				    "outside" : true,
				    "functions": ( visualChild.functions == undefined ) ? '' : visualChild.functions,
				    "links": visualChild.links
				}
			}	
		}
	});
	
	return visualActions;
}

CanvasORMObj.prototype.massAddOneObject = function( _type, name, _modelID, _totalXY ){
	var aVisualAction = master.canvas.ormObj.addObj( _type, _modelID, _totalXY.x, _totalXY.y );
	
	var rectAction = null;
	for( var ref in aVisualAction['value']['objects'] ){
		rectAction = aVisualAction['value']['objects'][ ref ];
		break;
	}
	
	var y = rectAction.attr.height;
	var x = rectAction.attr.width;
	
	_totalXY.y += y + 10;
	if( ( _totalXY.y + y ) > master.canvas.height ){
		_totalXY.y = 10;
		_totalXY.y += x + 10;
	}
	
	var objID = uuid.v4();
	
	var nameAttr = cloneJSON( master.canvas.ormObj.nameTempalte );
	nameAttr.text = name;
	nameAttr.id = aVisualAction['value'].id + "/objects/" + objID;
	nameAttr.y *= rectAction.attr.height;
	
	var canvasName = new Kinetic.Text( nameAttr );
	rectAction.attr.width = ( canvasName.getWidth() + 10 > rectAction.attr.width ) ? canvasName.getWidth() + 10 : rectAction.attr.width; 
	
	aVisualAction.value.objects[objID] = {
	    "id": aVisualAction.value.id + "/objects/" + objID,
	    "modelID": aVisualAction['value'].modelID + '/name',
	    "parentID" : aVisualAction.value.id,
	    "className": "Text",
	    "attr": nameAttr,
	    "type": "name",
	    "functions": {},
	    "links": {"empty":""}
	}
	
	return aVisualAction;
}

CanvasORMObj.prototype.deleteObj = function( _id, _integrateWith ){
	var aVisualGroup = getObjPointer( master.model, _id );	
	if( aVisualGroup == undefined ){
		throwError( 'canvas.orm_obj.js', 'deleteObj', 'The passed _id, ' + _id + ', does not exist in the visual model' );
	}
	
	if( typeof _integrateWith !== 'object' ){
		_integrateWith = {};
	}
	
	actions = [];
	 
	actions[ actions.length ] = { 
		"objectID" : _id,
		"commandType" : "delete",
		"value": null
	}
	
	for( var objRef in aVisualGroup.objects ){
	if( ref !== 'empty' ){
		var aVisualObject = aVisualGroup.objects[ objRef ];
		
		for( var ref in aVisualObject.links ){
		if( ref !== 'empty' ){
			if( typeof _integrateWith[ aVisualObject.links[ ref ] ] === 'undefined' ){
				var aVisualLink = getObjPointer( master.model, aVisualObject.links[ ref ] );	
				if( aVisualLink == undefined ){
					throwError( 'canvas.orm_obj.js', 'deleteObj', 'The link id, ' + aVisualObject.links[ ref ] + ', does not exist in the visual model' );
				}
				aVisualLink = cloneJSON( aVisualLink );
				
				_integrateWith[ aVisualLink.id ] = aVisualLink;
			} else {
				aVisualLink = _integrateWith[ aVisualObject.links[ ref ] ];
			}
			
			if( aVisualGroup.type === 'predicate' || master.rule.ruleTypes[ aVisualGroup.type ] === true ){
				if( aVisualGroup.type === 'predicate' ){
					var aVisualLinkObj = getObjPointer( master.model, aVisualLink.zSide );	
					if( aVisualLinkObj == undefined ){
						throwError( 'canvas.orm_obj.js', 'deleteObj', 'The object id, ' + aVisualLink.zSide + ', does not exist in the visual model' );
					}	
				} else {
					var aVisualLinkObj = getObjPointer( master.model, aVisualLink.aSide );	
					if( aVisualLinkObj == undefined ){
						throwError( 'canvas.orm_obj.js', 'deleteObj', 'The object id, ' + aVisualLink.aSide + ', does not exist in the visual model' );
					}
				}
				
				if( typeof _integrateWith[ aVisualLinkObj.parentID ] === 'undefined' ){
					var aVisualLinkGroup = getObjPointer( master.model, aVisualLinkObj.parentID );	
					if( aVisualLinkGroup == undefined ){
						throwError( 'canvas.orm_obj.js', 'deleteObj', 'The visual group id, ' + aVisualLinkObj.parentID + ', does not exist in the visual model' );
					}
					aVisualLinkGroup = cloneJSON( aVisualLinkGroup );
					
					_integrateWith[ aVisualLinkGroup.id ] = aVisualLinkGroup;
				} else {
					aVisualLinkGroup = _integrateWith[ aVisualLinkObj.parentID ];
				}
				
				aVisualLinkObjUUID = getPointerUUID( aVisualLinkObj.id );
				delete aVisualLinkGroup.objects[ aVisualLinkObjUUID ].links[ ref ];
				
				actions[ actions.length ] = { 
					"objectID" : aVisualLinkGroup.id,
					"commandType" : "update",
					"value": aVisualLinkGroup
				}
				
				actions[ actions.length ] = { 
					"objectID" : aVisualLink.id,
					"commandType" : "delete",
					"value": null
				}
			} else {
				aVisualLink.zSide = "";
				
				actions[ actions.length ] = { 
					"objectID" : aVisualLink.id,
					"commandType" : "update",
					"value": aVisualLink
				}
			}
		}
		}
	}
	}
	
	return actions;
}

CanvasORMObj.prototype.deleteOnKeypress = function(){
	//Get all select objects ID's and place them into an array
	var out = [];
	for( var ref in Kinetic.isSelected ){
		var group = Kinetic.isSelected[ ref ];
		
		var visualGroup = getObjPointer( master.model, group.id() );
		
		out[ out.length ] = visualGroup.modelID;
	}
	
	if( out.length === 0 )
		return;
	
	//Deselect the objects
	deselect();
	//Send the ID to be delete to deleteObj in ORMObj 
	master.ormObj.deleteObj( out );
	
	//Reset cursor
	document.body.style.cursor = 'default';
}

/*	toggleCreateListener: toggles on and off a listener for creating new objects.
 * 	Located here because it is only called if someone clicks on the canvas.
 * 
 * 	Params:
 * 	_icon type of lisener to be toggled. Valid values are: [ 'entity', 'value' ]
 */
CanvasORMObj.prototype.toggleCreateListener = function( _icon ){
	if( master.ormObj.active === _icon ){
		master.canvas.backRect.on('click.createListener touchstart.createListener', function(e){
			master.ormObj.addObj( _icon );
		});
		
		master.canvas.backRect.on('mouseover.createListener', function() {
			document.body.style.cursor = 'copy';
		});
		
		master.canvas.backRect.on('mouseout.createListener', function() {
		document.body.style.cursor = 'default';
  	});
	} else {
		master.canvas.backRect.off( '.createListener' );
		document.body.style.cursor = 'default';
	}
		
}
