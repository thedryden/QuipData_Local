var SELECTED_HEX = '#D1EEEE';

function disableGroup( _obj ){
	_obj.setAttr( 'disabled', true );
	_obj.draggable( false );
}

function enableGroup( _obj ){
	_obj.setAttr( 'disabled', false );
	_obj.draggable( true );
}

function deselect( _obj ){
	if( Kinetic.multiSelect !== null )
		destoryMultiselect();
	
	layers = {};
	
	if( _obj == undefined ){
		for( var group in Kinetic.isSelected ){
			var group = Kinetic.isSelected[ group ];
			var layer = deselectOne( group );
			layers[ layer._id ] = layer;
		}
	} else {
		var layer = deselectOne( _obj );
		layers[ layer._id ] = layer;
	}	
	
	for( var layer in layers ){
		layers[ layer ].draw();
	}
}

function deselectOne( _obj ){	
	_obj.setAttr( 'selected', false );
	if( _obj.find('.topLeft').length > 0 ){
		_obj.find('.topLeft')[0].hide();
		_obj.find('.topRight')[0].hide();
		_obj.find('.bottomRight')[0].hide();
		_obj.find('.bottomLeft')[0].hide();	
	} else {
		_obj.find('.outter')[0].hide();
	}
	
	delete Kinetic.isSelected[ _obj._id ];
	if( jQuery.isEmptyObject(Kinetic.isSelected) )
		Kinetic.isSelected = null;
	
	return _obj.getLayer();
}

function select( _selected ){
	document.body.style.cursor = 'all-scroll';
	
	_selected.setAttr( 'selected', true );
		
	if( Kinetic.isSelected == null )
		Kinetic.isSelected = {};
	
	Kinetic.isSelected[ _selected._id ] = _selected;
}

function selectStyle(){
	var i = 0;
	for( var group in Kinetic.isSelected ){
		if( i == 0 ){
			i++;
		} else {
			buildMultiselect();
			return;
		}
	}
	
	if( i == 1 ){
		for( var group in Kinetic.isSelected ){
			group = Kinetic.isSelected[ group ];
			
			if( group.find('.topLeft').length > 0 ){
				resetAnchors( group );
				group.find('.topLeft')[0].show();
				group.find('.topRight')[0].show();
				group.find('.bottomRight')[0].show();
				group.find('.bottomLeft')[0].show();
			} else {
				group.find('.outter')[0].show();	
			}
			group.getLayer().draw();
		}
	}
}

function destoryMultiselect(){
	var children = Kinetic.multiSelect.getChildren();
		
	while( children.length > 0 ){
		child = children[0];
		
		if( child.name() == 'selected' ){
			child.destroy();
		} else {
			var tempX = Kinetic.multiSelect.x() + child.x()
			child.setAttr( "x", tempX );
			
			var tempY = Kinetic.multiSelect.y() + child.y();
			child.setAttr( "y", tempY );
			
			var homeLayer = child.getAttr( 'homeLayer' );
			child.moveTo( homeLayer );
			child.draggable( true );
			child.setAttr( 'homeLayer', null );				
		}
	}
			
	Kinetic.multiSelect.destroy();
	Kinetic.multiSelect = null;
}

function buildMultiselect(){
	var minX = null;
	var minY = null;
	var layer = null;
	
	for( var group in Kinetic.isSelected ){
		group = Kinetic.isSelected[ group ];
		layer = group.getLayer();
		break;
	}
	if( Kinetic.multiSelect != null )
		destoryMultiselect();
		
	Kinetic.multiSelect = new Kinetic.Group({
		x: 0,
		y: 0,
		draggable: true
	});
		
	
	Kinetic.multiSelect.on( 'dragstart dragmove dragend', function(){} );
	
	var multiDragStart = Kinetic.multiSelect.eventListeners.dragstart;
	var multiDragMove = Kinetic.multiSelect.eventListeners.dragmove;
	var multiDragEnd = Kinetic.multiSelect.eventListeners.dragend;
	
	var minX = null;
	var maxX = 0;
	var minY = null;
	var maxY = 0;
	
	for( var group in Kinetic.isSelected ){
		group = Kinetic.isSelected[ group ];
		
		if( minX == null || minX > group.x() )
			minX = group.x();
			
		if( maxX < group.x() + group.getWidth() )
			maxX = group.x() + group.getWidth();
			
		if( minY == null || minY > group.y() )
			minY = group.y();
			
		if( maxY < group.y() + group.getHeight() )
			maxY = group.y() + group.getHeight();
		
		group.draggable(false);
		group.setAttr( "homeLayer", group.getLayer() );
		group.moveTo( Kinetic.multiSelect );
		
		var dragstarts = group.eventListeners.dragstart;
		if( dragstarts != undefined ){
			for( var i = 0; i < dragstarts.length; i++ ){
				multiDragStart[ multiDragStart.length ] = dragstarts[i];
			}	
		}
		
		var dragmoves = group.eventListeners.dragmove;
		if( dragmoves != undefined ){ 
			for( var i = 0; i < dragmoves.length; i++ ){
				multiDragMove[ multiDragMove.length ] = dragmoves[i];
			}	
		}
		
		var dragends = group.eventListeners.dragend;
		if( dragends != undefined ){
			for( var i = 0; i < dragends.length; i++ ){
				multiDragEnd[ multiDragEnd.length ] = dragends[i];
			}
		}
		
		if( group.find('.topLeft').length > 0 ){
			group.find('.topLeft')[0].hide();
			group.find('.topRight')[0].hide();
			group.find('.bottomRight')[0].hide();
			group.find('.bottomLeft')[0].hide();	
		} else {
			group.find('.outter')[0].hide();
		}
			
	}
	
	minX -= 20;
	maxX += 10;
	var tempWidth = maxX - minX;
	minY -= 20;
	minY += 10;
	var tempHeight = maxY - minY
	
	var selected = new Kinetic.Rect({
		x: minX,
		y: minY,
		stroke: SELECTED_HEX,
		strokeWidth: 3,
		width: tempWidth,
		height: tempHeight,
		name: 'selected'
	});
	
	Kinetic.multiSelect.add( selected );
	selected.moveToBottom();
	
	layer.add( Kinetic.multiSelect );
	
	layer.draw();
}

function moveLineSide( _line, _side, _az, _anchor ){
	var points = _line.points();
	
	if( _az == 'a' ){
		points[0] = _side.getCenterX();
		points[1] = _side.getCenterY();
		
		var lineSegment = {
			"point1" : { "x": points[0], "y": points[1] }
			, "point2" : { "x": points[4], "y": points[5] }
		}
	} else {
		points[points.length-2] = _side.getCenterX();
		points[points.length-1] = _side.getCenterY();
		
		var lineSegment = {
			"point1" : { "x": points[points.length-6], "y": points[points.length-5] }
			, "point2" : { "x": points[points.length-2], "y": points[points.length-1] }
		}
	}
	
	var sidePoints = _side.getPoints();
	
	//Top Side
	var sideSegment = {
		point1 : { "x": sidePoints[0].x, "y": sidePoints[0].y }
		, point2 : { "x": sidePoints[1].x, "y": sidePoints[1].y }
	}
	
	var tempPoints = moveLineSideHelperIntersect( lineSegment, sideSegment, _az, points, 'top', _anchor );
	if( tempPoints != null && typeof _side.getAttr( 'joinableSides' ) === 'object' && typeof _side.getAttr( 'joinableSides' )[ 0 ] === 'boolean' && !_side.getAttr( 'joinableSides' )[ 0 ] ){
		moveLineSideHelperPlanB( sidePoints, _side.getAttr( 'joinableSides' ), _az, points, 'top', _anchor );
	}
	
	//Right Side
	if( tempPoints == null ){
		var sideSegment = {
			point1 : { "x": sidePoints[1].x, "y": sidePoints[1].y }
			, point2 : { "x": sidePoints[2].x, "y": sidePoints[2].y }
		}
		
		tempPoints = moveLineSideHelperIntersect( lineSegment, sideSegment, _az, points, 'right', _anchor );
		if( tempPoints != null && typeof _side.getAttr( 'joinableSides' ) === 'object' && typeof _side.getAttr( 'joinableSides' )[ 1 ] === 'boolean' && !_side.getAttr( 'joinableSides' )[ 1 ] ){
			moveLineSideHelperPlanB( sidePoints, _side.getAttr( 'joinableSides' ), _az, points, 'right', _anchor );
		}
	}
	
	//Bottom Side
	if( tempPoints == null ){
		var sideSegment = {
			point1 : { "x": sidePoints[3].x, "y": sidePoints[3].y }
			, point2 : { "x": sidePoints[2].x, "y": sidePoints[2].y }
		}
		
		tempPoints = moveLineSideHelperIntersect( lineSegment, sideSegment, _az, points, 'bottom', _anchor );
		if( tempPoints != null && typeof _side.getAttr( 'joinableSides' ) === 'object' && typeof _side.getAttr( 'joinableSides' )[ 2 ] === 'boolean' && !_side.getAttr( 'joinableSides' )[ 2 ] ){
			moveLineSideHelperPlanB( sidePoints, _side.getAttr( 'joinableSides' ), _az, points, 'bottom', _anchor );
		}
	}
	
	//Left Side
	if( tempPoints == null ){
		var sideSegment = {
			point1 : { "x": sidePoints[0].x, "y": sidePoints[0].y }
			, point2 : { "x": sidePoints[3].x, "y": sidePoints[3].y }
		}
		
		tempPoints = moveLineSideHelperIntersect( lineSegment, sideSegment, _az, points, 'left', _anchor );
		if( tempPoints != null && typeof _side.getAttr( 'joinableSides' ) === 'object' && typeof _side.getAttr( 'joinableSides' )[ 3 ] === 'boolean' && !_side.getAttr( 'joinableSides' )[ 3 ] ){
			moveLineSideHelperPlanB( sidePoints, _side.getAttr( 'joinableSides' ), _az, points, 'left', _anchor );
		}	
	}
	
	if( tempPoints != null )
		points = tempPoints;
	
	_line.points(points);
	
	if( typeof _anchor === 'function' )
		_anchor( _line, _az );
			
	_line.getLayer().draw();
}

function moveLineSideHelper( _sideSegment, _az, _points, _side, _anchor ){
	if( _az == 'a' ){
		var x = _sideSegment.point1.x + ( Math.abs( _sideSegment.point2.x - _sideSegment.point1.x ) / 2 );
		var y = _sideSegment.point1.y + ( Math.abs( _sideSegment.point2.y - _sideSegment.point1.y ) / 2 );
		
		displayPointX = 2
		displayPointY = 3
	} else {
		var x = _sideSegment.point1.x + ( Math.abs( _sideSegment.point2.x - _sideSegment.point1.x ) / 2 );
		var y = _sideSegment.point1.y + ( Math.abs( _sideSegment.point2.y - _sideSegment.point1.y ) / 2 );
		
		displayPointX = _points.length-4
		displayPointY = _points.length-3
	}
	
	if( _anchor == undefined || typeof _anchor === 'function' ){
		_points[displayPointX] = x;
		_points[displayPointY] = y;
	} else {
		var displayX = x;
		var displayY = y; 
		
		//Deal with how circles x and y are set to the middle of the circle
		if( _anchor.getClassName() == "Circle" ){
			x += _anchor.radius();
			y -= _anchor.radius();
		}
		
		//Move the anchor to be on the side of the rect
		switch( _side ){
			case 'top':
				x -= ( _anchor.width() / 2 );
				break;
			case 'right':
				y += ( _anchor.getHeight() / 2 );
				break;
			case 'bottom':
				x -= ( _anchor.width() / 2 );
				y += _anchor.getHeight();
				break;
			case 'left':
				x -= _anchor.width();
				y += ( _anchor.getHeight() / 2 );
				break;
		}
		
		_anchor.x( x );
		_anchor.y( y );
		
		//Get proper values for displayPointX, and displayPointY
		switch( _side ){
			case 'top':
				displayY -= _anchor.getHeight();
				break;
			case 'right':
				displayX += _anchor.getWidth();
				break;
			case 'bottom':
				displayY += _anchor.getHeight();
				break;
			case 'left':
				displayX -= _anchor.width();
				break;
		}

		_points[displayPointX] = displayX;
		_points[displayPointY] = displayY;
	}
		
	return _points;
}

function moveLineSideHelperIntersect( _lineSegment, _sideSegment, _az, _points, _side, _anchor ){
	intersect = findLineIntersect( _lineSegment, _sideSegment );
	if( intersect !== null ){
		return moveLineSideHelper( _sideSegment, _az, _points, _side, _anchor )
	}
	
	return null;
}

function moveLineSideHelperPlanB( _sidePoints, _joinableSides, _az, _points, _side, _anchor ){
	if( _az == 'a' ){
		var mainPoint = { "x": _points[4], "y": _points[5] };
	} else {
		var mainPoint = { "x": _points[_points.length-6], "y": _points[_points.length-5] };
	}
	
	var aPoint = {};
	var minDistance = -1;
	var sideSegment = {};
	
	//Top Side
	if( typeof _joinableSides === 'object' && typeof _joinableSides[0] === 'boolean' && _joinableSides[0] ){
		aPoint = { "x": ( _sidePoints[0].x + _sidePoints[1].x ) / 2
		, "y": ( _sidePoints[0].y + _sidePoints[1].y ) / 2 };
		
		minDistance = findDistanceBetweenPoints( mainPoint, aPoint );
		sideSegment = {
			point1 : { "x": _sidePoints[0].x, "y": _sidePoints[0].y }
			, point2 : { "x": _sidePoints[1].x, "y": _sidePoints[1].y }
		}	
	}
	
	
	//Right Side
	if( typeof _joinableSides === 'object' && typeof _joinableSides[1] === 'boolean' && _joinableSides[1] ){
		aPoint = { "x" : ( _sidePoints[1].x + _sidePoints[2].x ) / 2
			, "y": ( _sidePoints[1].y + _sidePoints[2].y ) / 2 };
			
		if( minDistance === -1 || minDistance > findDistanceBetweenPoints( mainPoint, aPoint ) ){
			minDistance = findDistanceBetweenPoints( mainPoint, aPoint );
			
			sideSegment = {
				point1 : { "x": _sidePoints[1].x, "y": _sidePoints[1].y }
				, point2 : { "x": _sidePoints[2].x, "y": _sidePoints[2].y }
			}
		}
	}
	
	//Bottom Side
	if( typeof _joinableSides === 'object' && typeof _joinableSides[2] === 'boolean' && _joinableSides[2] ){
		aPoint = { "x": ( _sidePoints[3].x + _sidePoints[2].x ) / 2
			, "y": ( _sidePoints[3].y + _sidePoints[2].y ) / 2 };
			
		if( minDistance === -1 || minDistance > findDistanceBetweenPoints( mainPoint, aPoint ) ){
			minDistance = findDistanceBetweenPoints( mainPoint, aPoint );
			
			sideSegment = {
				point1 : { "x": _sidePoints[3].x, "y": _sidePoints[3].y }
				, point2 : { "x": _sidePoints[2].x, "y": _sidePoints[2].y }
			}
		}
	}

	//Left Side
	if( typeof _joinableSides === 'object' && typeof _joinableSides[3] === 'boolean' && _joinableSides[3] ){
		var aPoint = { "x": ( _sidePoints[0].x + _sidePoints[3].x ) / 2
			, "y": ( _sidePoints[0].y + _sidePoints[3].y ) / 2 };
		
		if( minDistance === -1 || minDistance > findDistanceBetweenPoints( mainPoint, aPoint ) ){
			minDistance = findDistanceBetweenPoints( mainPoint, aPoint );
			
			sideSegment = {
				point1 : { "x": _sidePoints[0].x, "y": _sidePoints[0].y }
				, point2 : { "x": _sidePoints[3].x, "y": _sidePoints[3].y }
			}
		}
	}
	
	if( minDistance === -1 )
		return null;
		
	return moveLineSideHelper( sideSegment, _az, _points, _side, _anchor )
}

function moveLineSideSimple( _line, _side, _az ){
	var points = _line.points();
	
	if( _az == 'a' ){
		points[0] = _side.getCenterX();
		points[1] = _side.getCenterY();
		points[2] = _side.getCenterX();
		points[3] = _side.getCenterY();
	} else {
		points[points.length-4] = _side.getCenterX();
		points[points.length-3] = _side.getCenterY();
		points[points.length-2] = _side.getCenterX();
		points[points.length-1] = _side.getCenterY();
	}
	
	_line.points( points );
	_line.getLayer().draw();
	
}

/*	addLink: transforms a line into a link that will automatically be joined
 * 	both the _aSide and _zSide Kinetic objects.
 * 
 * 	Parameter:
 * 	_line: line to be linked to the two sides. Must have an id attribute.
 * 	_aSide: a Kinetic object or a string that represents the id of a Kinetic
 * 	object. This will be one side of the link. A and Z labels are abitray, but
 * 	they can be used for referance latter. Must have an id attribute.
 * 	_zSide: a Kinetic object or a string that represents the id of a Kinetic
 * 	object. This will be one side of the link. A and Z labels are abitray, but
 * 	they can be used for referance latter. Must have an id attribute.
 * 	_aSideAnchor: a Kinetic object or a string that represents the id of a Kinetic
 * 	object. This will be used as decoractoin on the join point between the line
 * 	and the _aSide.
 * 	_zSideAnchor: a Kinetic object or a string that represents the id of a Kinetic
 * 	object. This will be used as decoractoin on the join point between the line
 * 	and the _aSide.
 */
function addLink( _line, _aSide, _zSide, _aSideAnchor, _zSideAnchor ){
	//Get objects if strings were passed
	if( typeof _line === 'string' )
		_line = master.canvas.stage.find( '#' + _line )[0];
		
	if( typeof _aSide === 'string' )
		_aSide = master.canvas.stage.find( '#' + _aSide )[0];
		
	if( typeof _zSide === 'string' )
		_zSide = master.canvas.stage.find( '#' + _zSide )[0];
	
	if( typeof _line.aSide !== 'undefined' || typeof _line.zSide !== 'undefined' ){
		console.log( 'addLink: Line is already linked, no action taken');
	} else if ( _line.id() == undefined || _aSide.id() == undefined || _zSide.id() == undefined ) {
		console.log( 'addLink: Line, aSide, or zSide did not have an id attribute set, no action taken');
	} else {
		//Set points, if there are 10 or more points the points between 3 and length - 4 will be kept perminately
		var points = _line.points();
		if( points.length >= 10 ){
			points[0] = _aSide.getCenterX();
			points[1] = _aSide.getCenterY();
			points[2] = _aSide.getCenterX();
			points[3] = _aSide.getCenterY();
			points[ points.length - 4 ] = _zSide.getCenterX();
			points[ points.length - 3 ] = _zSide.getCenterY();
			points[ points.length - 2 ] = _zSide.getCenterX();
			points[ points.length - 1 ] = _zSide.getCenterY();	
		} else {
			points[0] = _aSide.getCenterX();
			points[1] = _aSide.getCenterY();
			points[2] = _aSide.getCenterX();
			points[3] = _aSide.getCenterY();
			points[4] = _zSide.getCenterX();
			points[5] = _zSide.getCenterY();
			points[6] = _zSide.getCenterX();
			points[7] = _zSide.getCenterY();
		}
		
		_line.points(points);
		
		insertSide( _line, 'a', _aSide );
		if( typeof _aSideAnchor === 'function' || _aSide.getClassName() === 'Rect' ){
			insertAnchor( _line, 'a', _aSideAnchor );
		}
		
		insertSide( _line, 'z', _zSide );
		if( typeof _zSideAnchor === 'function' || _zSide.getClassName() === 'Rect' ){
			insertAnchor( _line, 'z', _zSideAnchor );
		}
		
		//Create a generic function that will keep the line in sync based upon its properties
		//and assign it as a property of the _line
		var funMoveLine = function(){
			if( this.aSide == undefined ){
				//Do Nothing
			} else if( this.aSide.getClassName() === 'Rect' ){
				moveLineSide( this, this.aSide, 'a', this.aSideAnchor );
			} else {
				moveLineSideSimple( this, this.aSide, 'a' );
			}
			
			if( this.zSide == undefined ){
				//Do nothing
			} else if( this.zSide.getClassName() === 'Rect' ){
				moveLineSide( this, this.zSide, 'z', this.zSideAnchor );
			} else {
				moveLineSideSimple( this, this.zSide, 'z' );
			}
				
		}
		
		_line.moveLine = funMoveLine;
	
		//Move the lines to make sure they are current right when added
		_line.moveLine();
	}
}

function insertSide( _line, _az, _side ){
	//Get objects if strings were passed
	if( typeof _line === 'string' )
		_line = master.canvas.stage.find( '#' + _line )[0];
		
	//Get objects if strings were passed
	if( typeof _side === 'string' )
		_side = master.canvas.stage.find( '#' + _side )[0];
		
	if( ( _az === 'a' && typeof _line.aSide !== 'undefined' ) || ( _az === 'z' && typeof _line.zSide !== 'undefined' ) ){
		console.log( 'insertSide: Line is already linked, no action taken');
	} else if ( _line.id() == undefined || _side.id() == undefined ) {
		console.log( 'insertSide: Line, or side did not have an id attribute set, no action taken');
	} else {
		
		//Then store the side in the line
		if( _az === 'a' ){
			_line.aSide = _side;	
		} else if ( _az === 'z' ){
			_line.zSide = _side;	
		}
		
		//Get the parent, and set on to side, if parent is a group...
		var parent = _side.getParent();
		var on = _side;
		if( parent.getType() === 'Group' ){
			//Set on to parent
			on = parent;
			
			//Add the side to the groups sides property, creating it if it does not already exist
			if( on.sides == undefined )
				on.sides = {};
			on.sides[ ( _side.id() != undefined ) ? _side.id() : uuid.v4() ] = _side;
		}
	
		//Add this line to the _side's lines property, creating it if it does not already exist
		if( typeof _side.lines === 'undefined' )
			_side.lines = {};
		_side.lines[ ( _line.id() != undefined ) ? _line.id() : uuid.v4() ] = _line;
		
		//Add a function property to _side that will call the move line property of each line
		//in _side's lines property
		_side.moveLine = function(){
			for( var ref in this.lines ){
				if( typeof this.lines[ ref ].moveLine === 'function' )
					this.lines[ ref ].moveLine();	
			}
		};
		
		//Remove any event handler on on (to prevent dupes) and then add a event handler to
		//move line(s) when it moves
		on.off( 'dragmove.link');
		on.on('dragmove.link', function(){
			if( typeof this.moveLine === 'function' )
				this.moveLine();
			
			if( typeof this.sides === 'object' ){
				for( var ref in this.sides ){
					if( typeof this.sides[ ref ].moveLine === 'function' )
						this.sides[ ref ].moveLine();
				}
			}	
		});
	
		//Finnaly move the line
		if( typeof _line.moveLine === 'function' )
			_line.moveLine();
	}
}

function deleteLink( _line ){
	deleteLinkSide( _line, 'a' );
	deleteLinkSide( _line, 'z' );
}

function deleteLinkSide( _line, _az ){
	if( typeof _line === 'string' )
		_line = master.canvas.stage.find( '#' + _line )[0];
	
	if( _line == undefined || _line.id() == undefined ){
		console.log( 'deleteLinkSide: line was either not defined or did not have an id attribute, no action taken' ); 
		return;
	} else 	if( _az === 'a' && _line.aSide != undefined && typeof _line.aSide.lines[ _line.id() ] === 'object' ){
		var side = _line.aSide;
		_line.aSide = undefined;
	} else if( _az === 'z' && _line.zSide != undefined && typeof _line.zSide.lines[ _line.id() ] === 'object' ){
		var side = _line.zSide;
		_line.zSide = undefined;
	} else {
		console.log( 'deleteLinkSide: passed side either did not exist in the passed line or was not properly configured, no action taken.' );
		return;
	}
	
	//Delete the entry for this line in sides	
	delete side.lines[ _line.id() ];
	
	//if the line container is now empty
	if( jQuery.isEmptyObject( side.lines ) ){
		//Delete the container
		delete side.lines;
		//Remove the event handler, if it existed (usually its not the group) 
		side.off( 'dragmove.link');
		
		//Get sides parent, if group and it has a sides property
		var parent = side.getParent();
		if( parent != undefined && parent.getType() === 'Group' && typeof parent.sides[ side.id() ] === 'object' ){
			//Delete this lines entry in sides
			delete parent.sides[ side.id() ];
			
			//If sides is now empty delete sides property and remove event handler
			if( jQuery.isEmptyObject( parent.sides ) ){
				delete parent.sides;
				
				parent.off( 'dragmove.link');
			}
		}
	}
}

function deleteAnchor( _line, _az ){
	//Get objects if strings were passed
	if( typeof _line === 'string' )
		_line = master.canvas.stage.find( '#' + _line )[0];
	
	if( _az === 'a' && typeof _line.aSideAnchor === 'undefined' ){
		console.log( 'deleteAnchor: anchor did not exist, no action taken' ); 
	} else {
		if( typeof _line.aSideAnchor.destroy === 'function' ){
			_line.aSideAnchor.destroy();
			_line.getLayer().draw();
		}
		
		_line.aSideAnchor = undefined;
	}
	
	if( _az === 'z' && typeof _line.zSideAnchor === 'undefined' ){
		console.log( 'deleteAnchor: anchor did not exist, no action taken' );
	} else {
		if( typeof _line.zSideAnchor.destroy === 'function' ){
			_line.zSideAnchor.destroy();
			_line.getLayer().draw();
		}	
		
		_line.zSideAnchor = undefined;
	}
	
	if( typeof _line.moveLine === 'function' )
		_line.moveLine();
}

function insertAnchor( _line, _az, _anchor ){
	//Get objects if strings were passed
	if( typeof _line === 'string' )
		_line = master.canvas.stage.find( '#' + _line )[0];
		
	if( typeof _anchor === 'string' )
		_anchor = master.canvas.stage.find( '#' + _anchor )[0];
	
	if( _az === 'a' ){
		if( typeof _line.aSideAnchor !== 'undefined' ){
			console.log( 'insertAnchor: the passed anchor already exists, no action taken.' );	
		} else {
			//'duck-type' to check if _anchor a Kinetic object or a function
			if( typeof _anchor === 'function' || ( typeof _anchor === 'object' && typeof _anchor.getStage === 'function' ) ){
				_line.aSideAnchor = _anchor;
			}
		}
	}
	
	if( _az === 'z' ){
		if( typeof _line.aSideAnchor !== 'undefined' ){
			console.log( 'insertAnchor: the passed anchor already exists, no action taken.' );	
		} else {
			//'duck-type' to check if _anchor a Kinetic object
			if( typeof _anchor === 'function' || ( typeof _anchor === 'object' && typeof _anchor.getStage === 'function' ) ){
				_line.zSideAnchor = _anchor;
			}
		}
	}
	
	if( typeof _line.moveLine === 'function' )
		_line.moveLine();
}

function arrowAnchor( _line, _az ){
	var points = _line.points(); 
	
	if( _az === 'a' ){
		var from = { x: points[ points.length - 4 ], y: points[ points.length - 3 ] };
		var point = { x: points[ 2 ], y: points[ 3 ] }
	} else {	 
		var from = { x: points[ 2 ], y: points[ 3 ] };
	  	var point = { x: points[ points.length - 4 ], y: points[ points.length - 3 ] };
	}
  	
  	var headLength = 15;
  	var lineWidth = 4;
  	var inCutLength = ( 15 / 2 ) - ( 4 / 2 );
  	var lineLength = findDistanceBetweenPoints( from, point );
  	
  	var lineAngle = Math.atan2( point.y - from.y, point.x - from.x );
  	
  	var bottomLeftOut = { 
  		x : point.x - headLength * Math.cos( lineAngle - Math.PI / 6),
  		y : point.y - headLength * Math.sin( lineAngle - Math.PI / 6)
  	}
  	
  	var bottomRightOut = {
  		x : point.x - headLength * Math.cos( lineAngle + Math.PI / 6 ),
  		y : point.y - headLength * Math.sin( lineAngle + Math.PI / 6 )
  	}
  	
  	var arrowBaseAngle = Math.atan2(bottomRightOut.y - bottomLeftOut.y, bottomRightOut.x - bottomLeftOut.x);
	
	var bottomLeftIn = {
		x: bottomLeftOut.x + ( Math.cos( arrowBaseAngle ) * inCutLength ),
		y: bottomLeftOut.y + ( Math.sin( arrowBaseAngle ) * inCutLength )
	}
  	
  	var bottomRightIn = {
		x: bottomRightOut.x - ( Math.cos( arrowBaseAngle ) * inCutLength ),
		y: bottomRightOut.y - ( Math.sin( arrowBaseAngle ) * inCutLength )
	}
  	
	var baseLeft = {
		x: from.x - ( Math.cos( arrowBaseAngle ) * ( lineWidth / 2 ) ),
		y: from.y - ( Math.sin( arrowBaseAngle ) * ( lineWidth / 2 ) )
	}
  	
	var baseRight = {
		x: from.x + ( Math.cos( arrowBaseAngle ) * ( lineWidth / 2 ) ),
		y: from.y + ( Math.sin( arrowBaseAngle ) * ( lineWidth / 2 ) )
	}
	
	var minX = point.x;
	var minY = point.y;
	
	if( minX > from.x ) mixX = from.x;
	if( minY > from.y ) mixY = from.y;
	if( minX > bottomLeftOut.x ) mixX = bottomLeftOut.x;
	if( minY > bottomLeftOut.y ) mixY = bottomLeftOut.y;
	if( minX > bottomRightOut.x ) mixX = bottomRightOut.x;
	if( minY > bottomRightOut.y ) mixY = bottomRightOut.y;
	if( minX > bottomLeftIn.x ) mixX = bottomLeftIn.x;
	if( minY > bottomLeftIn.y ) mixY = bottomLeftIn.y;
	if( minX > bottomRightIn.x ) mixX = bottomRightIn.x;
	if( minY > bottomRightIn.y ) mixY = bottomRightIn.y;
	if( minX > baseLeft.x ) mixX = baseLeft.x;
	if( minY > baseLeft.y ) mixY = baseLeft.y;
	if( minX > baseRight.x ) mixX = baseRight.x;
	if( minY > baseRight.y ) mixY = baseRight.y;
	
	point.x -= minX; point.y -= minY;
	from.x -= minX; from.y -= minY;
	bottomLeftOut.x -= minX; bottomLeftOut.y -= minY;
	bottomRightOut.x -= minX; bottomRightOut.y -= minY;
	bottomLeftIn.x -= minX; bottomLeftIn.y -= minY;
	bottomRightIn.x -= minX; bottomRightIn.y -= minY;
	baseLeft.x -= minX; baseLeft.y -= minY;
	baseRight.x -= minX; baseRight.y -= minY;

  	
  	var aFunc = function(context) {
		context.beginPath();
		context.moveTo(point.x, point.y);
		context.lineTo(bottomLeftOut.x, bottomLeftOut.y);
		context.lineTo(bottomLeftIn.x, bottomLeftIn.y);
		context.lineTo(baseLeft.x, baseLeft.y);
		context.lineTo(baseRight.x, baseRight.y);
		context.lineTo(bottomRightIn.x, bottomRightIn.y);
		context.lineTo(bottomRightOut.x, bottomRightOut.y);
		context.closePath();
		// KineticJS specific context method
		context.fillStrokeShape(this);
	}
	
	var arrowHead = _line.getLayer().find( '#' + 'arrowAnchor' + _line.id() );
	
	if( arrowHead.length > 0 ){
		var arrowHeadGroup = _line.getLayer().find( '#' + _line.id() )[0];
		arrowHeadGroup.x( minX );
		arrowHeadGroup.y( minY );
	
		var arrowHead = arrowHead[0];
		arrowHead.setAttr( 'sceneFunc', aFunc );
		
		var arrowHeadOutter = arrowHeadGroup.find('.outter')[0];
		arrowHeadOutter.setAttr( 'sceneFunc', aFunc );
	} else { 
		var arrowHeadGroup = new Kinetic.Group({
			x: minX,
			y: minX,
			draggable: false,
			id: _line.id()
		})
	
		var arrowHead = new Kinetic.Shape({
			sceneFunc: aFunc,
			fill: '#BF5FFF',
			stroke: 'black',
			strokeWidth: 1,
			id: 'arrowAnchor' + _line.id()
		});
		
		var arrowHeadOutter = new Kinetic.Shape({
			sceneFunc: aFunc,
			stroke: SELECTED_HEX,
			strokeWidth: 2,
			name: 'outter'
		});
		
		arrowHeadGroup.aSide = _line.aSide;
		arrowHeadGroup.zSide = _line.zSide;
		arrowHeadGroup.line = _line;
		
		arrowHeadGroup.add( arrowHead );
		arrowHeadGroup.add( arrowHeadOutter );
		arrowHeadOutter.hide();
		_line.getLayer().add( arrowHeadGroup );
		_line.moveLine();
		
		arrowHeadGroup.on('click touchstart', function(e){
			if( arrowHeadGroup.getAttr( 'disabled' ) ) return;
			
			if( !arrowHeadGroup.getAttr( 'selected' ) || Kinetic.multiSelect != null || !e.evt.shiftKey || !e.evt.ctrlKey ){
				//If shif and cntrl were not held during the click
				if( !e.evt.shiftKey && !e.evt.ctrlKey ){
					deselect();
					select( arrowHeadGroup );
				} else if ( _group.getAttr( 'selected' ) ) {
				//If shif or cntrl were held during the click and object was already selected
					deselect( arrowHeadGroup );
				} else {
				//If shif and cntrl were held during the click and object was not already selected
					select( arrowHeadGroup );
				}
				
				selectStyle();
				document.body.style.cursor = 'default';
			}
		});
	}
}

function makeSizableUpdate(activeAnchor) {
	var MIN_WIDTH = 3;
	var MIN_HEIGHT = 3;
	
	var _group = activeAnchor.getParent();

	var topLeft = _group.find('.topLeft')[0];
	var topRight = _group.find('.topRight')[0];
	var bottomRight = _group.find('.bottomRight')[0];
	var bottomLeft = _group.find('.bottomLeft')[0];

	var anchorX = activeAnchor.x();
	var anchorY = activeAnchor.y();

	// update anchor positions
	switch (activeAnchor.name()) {
		case 'topLeft':
			if( anchorX > bottomRight.x() - MIN_WIDTH ){
				anchorX = bottomRight.x() - MIN_WIDTH;
				activeAnchor.x( anchorX );
			}
		
			if( anchorY > bottomLeft.y() - MIN_HEIGHT ){
				anchorY = bottomLeft.y() - MIN_HEIGHT;
				activeAnchor.y( anchorY );
			}
				
			topRight.y(anchorY);
			bottomLeft.x(anchorX);
		break;
		case 'topRight':
			if( bottomLeft.x() + MIN_WIDTH > anchorX ){
				anchorX = bottomLeft.x()  + MIN_WIDTH;
				activeAnchor.x( anchorX );
			}
		
			if( anchorY > bottomLeft.y() - MIN_HEIGHT ){
				anchorY = bottomLeft.y() - MIN_HEIGHT;
				activeAnchor.y( anchorY );
			}
			
			topLeft.y(anchorY);
			bottomRight.x(anchorX);
	    break;
		case 'bottomRight':
			if( topLeft.x() + MIN_WIDTH > anchorX ){
				anchorX = topLeft.x() + MIN_WIDTH;
				activeAnchor.x( anchorX );
			}
		
			if( topLeft.y() + MIN_HEIGHT > anchorY ){
				anchorY = topLeft.y() + MIN_HEIGHT;
				activeAnchor.y( anchorY );
			}
			
		    bottomLeft.y(anchorY);
		    topRight.x(anchorX); 
	    break;
		case 'bottomLeft':
			if( anchorX > topRight.x() - MIN_WIDTH ){
				anchorX = topRight.x() - MIN_WIDTH;
				activeAnchor.x( anchorX );
			}
		
			if( topRight.y() + MIN_HEIGHT > anchorY ){
				anchorY = topRight.y() + MIN_HEIGHT;
				activeAnchor.y( anchorY );
			}
			
			bottomRight.y(anchorY);
			topLeft.x(anchorX); 
	    break;
	}

    var children = _group.getChildren();
	
	var maxX = 0;
	var maxY = 0;
	var minX = null;
	var minY = null;
	for( var i = 0; i < children.length; i++ ){
		if( children[i].name() != 'topLeft' && children[i].name() != 'topRight' && children[i].name() != 'bottomRight' && children[i].name() != 'bottomLeft' ){
			if( ( children[i].x() + children[i].width() ) > maxX )
				maxX = children[i].x() + children[i].width();
				
			if( ( children[i].y() + children[i].height() ) > maxY )
				maxY = children[i].y() + children[i].height();
				
			if( minX == null || minX > children[i].x() )
				minX = children[i].x();
				
			if( minY == null || minY > children[i].y() )
				minY = children[i].y();
		}
	}
	
	var curWidth = maxX - minX;
	var curHeight = maxY - minY;
	var width = topRight.x() - topLeft.x();
	var height = bottomLeft.y() - topLeft.y();
	if(width && height) {
		var widthRatio = width / curWidth;
		var heightRatio = height / curHeight;
		
		var children = _group.getChildren();
		
		for( var i = 0; i < children.length; i++ ){
			if( children[i].name() != 'topLeft' && children[i].name() != 'topRight' && children[i].name() != 'bottomRight' && children[i].name() != 'bottomLeft' ){
				if( $.isNumeric( children[i].getWidth() ) )
					children[i].width( children[i].getWidth() * widthRatio );
				if( $.isNumeric( children[i].getHeight() ) )
				children[i].height( children[i].getHeight() * heightRatio );

				children[i].x( topLeft.x() + ( ( children[i].x() - minX ) * widthRatio ) );
				children[i].y( topLeft.y() + ( ( children[i].y() - minY ) * heightRatio ) );
			}
		}
	}
}

function makeSizableHelper( _group, _x, _y, _name, _pointer ) {
	var stage = _group.getStage();
	var layer = _group.getLayer();

	var anchor = new Kinetic.Circle({
		x: _x,
		y: _y,
		stroke: '#666',
		fill: SELECTED_HEX,
		strokeWidth: 2,
		radius: 8,
		name: _name,
		draggable: true
	});

	anchor.on('dragmove', function() {
		makeSizableUpdate(this);
		this.getLayer().draw();
	});
	anchor.on('mousedown touchstart', function() {
		_group.setDraggable(false);
		this.moveToTop();
	});
	anchor.on('dragend', function() {
		_group.setDraggable(true);
		normalizeXY( _group );
		this.getLayer().draw();
		master.canvas.ormObj.visualOnlySync();
	});
	// add hover styling
	anchor.on('mouseover', function() {
		document.body.style.cursor = _pointer;
		this.setStrokeWidth(4);
		this.getLayer().draw();
	});
	anchor.on('mouseout', function() {
		document.body.style.cursor = 'default';
		this.strokeWidth(2);
		this.getLayer().draw();
	});
	
	_group.add(anchor);
	anchor.hide();
}

/*	If the minimum X or minimum Y of a child within a group is less than 0
 * 	than adjust the group and its children so X or Y value is less than 0 
 */
function normalizeXY( _group ){
	var minX = null;
	var minY = null;
	
	_group.getChildren().each( function( child, n ){
		if( minX = null || minX > child.x() ){
			minX = child.x()
		}
		if( minY = null || minY > child.y() ){
			minY = child.y()
		}
	});

	if( minX < 0 )
		_group.x( _group.x() + minX );
	
	if( minY < 0 )
		_group.y( _group.y() + minY );

	_group.getChildren().each( function( child, n ){
		if( minX < 0 )
			child.x( child.x() - minX );
			
		if( minY < 0 )
			child.y( child.y() - minY );
	});
}

function resetAnchors( _group ){
	var maxWidth = _group.getInteractiveWidth();
	var maxHeight = _group.getInteractiveHeight();
	
	_group.find( '.topLeft' )[0].position({ x: 0, y: 0 });
	_group.find( '.topRight' )[0].position({ x: maxWidth, y: 0 });
	_group.find( '.bottomLeft' )[0].position({ x: 0, y: maxHeight });
	_group.find( '.bottomRight' )[0].position({ x: maxWidth, y: maxHeight });
}

//	Run after adding all inital shapes to the group!!!
function makeInteractive( _group, _type ){
	if( typeof _group == 'string' ){
		_group = master.canvas.stage.find( '#' + _group )[0];
	}
	
	if( _group == undefined )
		return;
		
	var nw = false, sw = false, se = false, ne = false;
	var children = _group.getChildren().toArray();
	for( var i = 0; i < children.length; i++ ){
		var child = children[i];
		if( child.getName() === 'topLeft' )
			ne = true;
		if( child.getName() === 'topRight' )
			nw = true;
		if( child.getName() === 'bottomLeft' )
			sw = true;
		if( child.getName() === 'bottomRight' )
			se = true;
	}
	
	if( nw && ne && se && sw )
		return;
		
	_group.getChildren().each(function( shape, n ){
		if( shape.getClassName() === 'Rect' ){
			shape.moveToBottom();
		}
	});
	
	maxWidth = _group.getWidth();
	maxHeight = _group.getHeight();
	
	makeSizableHelper( _group, 0, 0, 'topLeft', 'nwse-resize' );
	makeSizableHelper( _group, maxWidth, 0, 'topRight', 'nesw-resize' );
	makeSizableHelper( _group, 0, maxHeight, 'bottomLeft', 'nesw-resize' );
	makeSizableHelper( _group, maxWidth, maxHeight, 'bottomRight', 'nwse-resize' );
	
	var topLeft = _group.find('.topLeft')[0];
	var topRight = _group.find('.topRight')[0];
	var bottomRight = _group.find('.bottomRight')[0];
	var bottomLeft = _group.find('.bottomLeft')[0];
	
	_group.setAttr( 'selected', false );
	_group.setAttr( 'disabled', false );
	
	_group.on('click touchstart', function(e){
		if( _group.getAttr( 'disabled' ) ) return;
		
		if( !_group.getAttr( 'selected' ) || Kinetic.multiSelect != null || !e.evt.shiftKey || !e.evt.ctrlKey ){
			//If shif and cntrl were not held during the click
			if( !e.evt.shiftKey && !e.evt.ctrlKey ){
				deselect();
				select( _group );
			} else if ( _group.getAttr( 'selected' ) ) {
			//If shif or cntrl were held during the click and object was already selected
				deselect( _group );
			} else {
			//If shif and cntrl were held during the click and object was not already selected
				select( _group );
			}
			
			selectStyle();
		}
	});
	
	_group.on('dragstart', function(e){
		if( _group.getAttr( 'disabled' ) ) return;
		
		if( !_group.getAttr( 'selected' ) ){
			//If shif and cntrl were not held during the click
			if( !e.evt.shiftKey && !e.evt.ctrlKey ){
				deselect();
				select( _group );
			} else if ( _group.getAttr( 'selected' ) ) {
			//If shif or cntrl were held during the click and object was already selected
				deselect( _group );
			} else {
			//If shif and cntrl were held during the click and object was not already selected
				select( _group );
			}
			
			selectStyle();
		}
	});
	
	_group.on('mouseover', function() {
		if( _group.getAttr( 'disabled' ) ) return;
		
		if( document.body.style.cursor !== 'nwse-resize' && document.body.style.cursor !== 'nesw-resize' && _group.getAttr( 'selected' ) ){
			document.body.style.cursor = 'all-scroll';
		}
	});
	
	_group.on('mouseout', function() {
		if( _group.getAttr( 'disabled' ) ) return;
		
		document.body.style.cursor = 'default';
  	});
  	
  	_group.on('dragend', function() {
		if( _group.getAttr( 'disabled' ) ) return;
  		
		master.canvas.ormObj.visualOnlySync();
	});
	
	if( typeof _type !== 'undefined' && _type === 'objects' ){
		_group.on('dblclick dbltap', function(){
			if( _group.getAttr( 'disabled' ) ) return;
			
			master.ormObj.openProperties( _group.id() );
			deselect( _group );
		});
	} else if ( typeof _type !== 'undefined' && _type === 'predicate' ){
		_group.on('dblclick dbltap', function(){
			if( _group.getAttr('disabled') ) return;
			
			master.canvas.line.editPredicate( _group.id() );
		});
	} else if ( typeof _type !== 'undefined' && _type === 'rule' ){
		_group.on('dblclick dbltap', function(){
			if( _group.getAttr('disabled') ) return;
			
			master.rule.openChangeSymbol( _group.id() );
		});
	}
}

//	Run after adding all inital shapes to the group!!!
function makeCircleSelectable( _group, _type ){
	if( typeof _group == 'string' ){
		_group = master.canvas.stage.find( '#' + _group )[0];
	}
	
	if( _group == undefined )
		return;
		
	var hasOutter = false;
	
	var maxRadius = -1;
	
	var children = _group.getChildren().toArray();
	for( var i = 0; i < children.length; i++ ){
		var child = children[i];
		if( child.getName() === 'outter' ){
			hasOutter = true;
		} else if ( child.getClassName() === 'Circle' ) {
			child.offsetX( child.radius() * -1 );
			child.offsetY( child.radius() * -1 );
			if( child.radius() > maxRadius )
				maxRadius = child.radius();
		}
	}
	
	if( hasOutter === true )
		return;
	
	var outter = new Kinetic.Circle({
		name: "outter",
		radius: maxRadius + 3,
		offsetX: ( maxRadius + 3 ) * -1, 
		offsetY: ( maxRadius + 3 ) * -1,
		x: -3,
		y: -3,
		stroke: SELECTED_HEX,
		strokeWidth: 3
	});
	outter.hide();
	_group.add( outter );
	
	_group.setAttr( 'selected', false );
	_group.setAttr( 'disabled', false );
	
	_group.on('click touchstart', function(e){
		if( _group.getAttr( 'disabled' ) ) return;
		
		if( !_group.getAttr( 'selected' ) || Kinetic.multiSelect != null || !e.evt.shiftKey || !e.evt.ctrlKey ){
			//If shif and cntrl were not held during the click
			if( !e.evt.shiftKey && !e.evt.ctrlKey ){
				deselect();
				select( _group );
			} else if ( _group.getAttr( 'selected' ) ) {
			//If shif or cntrl were held during the click and object was already selected
				deselect( _group );
			} else {
			//If shif and cntrl were held during the click and object was not already selected
				select( _group );
			}
			
			selectStyle();
		}
	});
	
	_group.on('dragstart', function(e){
		if( _group.getAttr( 'disabled' ) ) return;
		
		if( !_group.getAttr( 'selected' ) ){
			//If shif and cntrl were not held during the click
			if( !e.evt.shiftKey && !e.evt.ctrlKey ){
				deselect();
				select( _group );
			} else if ( _group.getAttr( 'selected' ) ) {
			//If shif or cntrl were held during the click and object was already selected
				deselect( _group );
			} else {
			//If shif and cntrl were held during the click and object was not already selected
				select( _group );
			}
			
			selectStyle();
		}
	});
	
	_group.on('mouseover', function() {
		if( _group.getAttr( 'disabled' ) ) return;
		
		document.body.style.cursor = 'all-scroll';
	});
	
	_group.on('mouseout', function() {
		if( _group.getAttr( 'disabled' ) ) return;
		
		document.body.style.cursor = 'default';
  	});
  	
  	_group.on('dragend', function() {
		if( _group.getAttr( 'disabled' ) ) return;
  		
		master.canvas.ormObj.visualOnlySync();
	});
	
	if( typeof _type !== 'undefined' && _type === 'objects' ){
		_group.on('dblclick dbltap', function(){
			if( _group.getAttr( 'disabled' ) ) return;
			
			master.ormObj.openProperties( _group.id() );
			deselect( _group );
		});
	} else if ( typeof _type !== 'undefined' && _type === 'predicate' ){
		_group.on('dblclick dbltap', function(){
			if( _group.getAttr('disabled') ) return;
			
			master.canvas.line.editPredicate( _group.id() );
		});
	} else if ( typeof _type !== 'undefined' && _type === 'rule' ){
		_group.on('dblclick dbltap', function(){
			if( _group.getAttr('disabled') ) return;
			
			master.rule.openChangeSymbol( _group.id() );
		});
	}
}

function attachTo( _obj, _location, _toAttach, _offset ){
	//Get objects if strings were passed
	if( typeof _obj === 'string' )
		_obj = master.canvas.stage.find( '#' + _obj )[0];
		
	if( typeof _toAttach === 'string' )
		_toAttach = master.canvas.stage.find( '#' + _toAttach )[0];
		
	if( _toAttach.id() == undefined ){
		console.log( 'attachTo: _toAttach did not have an id.' );
		return;
	}	
		
	if( typeof _offset !== 'number' ){
		_offset = 5;
	}
		
	_toAttach.draggable( false );
		
	_toAttach.attachedTo = _obj;
	_toAttach.location = _location;
	_toAttach.offset = _offset;
	
	_toAttach.sync = function(){
		if( _location === 'top' ){
			if( typeof this.attachedTo.getInteractiveWidth === 'function' ){
				var x = this.attachedTo.x() + ( ( this.attachedTo.getInteractiveWidth() - this.getWidth() ) / 2 );	
			} else {
				var x = this.attachedTo.x() + ( ( this.attachedTo.getWidth() - this.getWidth() ) / 2 );
			}
			var y = this.attachedTo.y() - this.offset;
		} else if ( _location === 'right' ){
			if( typeof this.attachedTo.getInteractiveWidth === 'function' ){
				var x = this.attachedTo.x() + this.attachedTo.getInteractiveWidth() + this.offset;
				var y = this.attachedTo.y() + ( ( this.attachedTo.getInteractiveHeight() - this.getHeight() ) / 2 );
			} else {
				var x = this.attachedTo.x() + this.attachedTo.getWidth() + this.offset;
				var y = this.attachedTo.y() + ( ( this.attachedTo.getHeight() - this.getHeight() ) / 2 );
			}
		} else if ( _location === 'bottom' ){
			if( typeof this.attachedTo.getInteractiveWidth === 'function' ){
				var x = this.attachedTo.x() + ( ( this.attachedTo.getInteractiveWidth() - this.getWidth() ) / 2 );
				var y = this.attachedTo.y() + this.attachedTo.getInteractiveHeight() + this.offset;
			} else {
				var x = this.attachedTo.x() + ( ( this.attachedTo.getWidth() - this.getWidth() ) / 2 );
				var y = this.attachedTo.y() + this.attachedTo.getHeight() + this.offset;
			}
		} else if ( _location === 'left' ){
			if( typeof this.attachedTo.getInteractiveWidth === 'function' ){
				var x = this.attachedTo.x() - this.offset;
				var y = this.attachedTo.y() + ( ( this.attachedTo.getInteractiveHeight() - this.getHeight() ) / 2 );
			} else{
				var x = this.attachedTo.x() - this.offset;
				var y = this.attachedTo.y() + ( ( this.attachedTo.getInteractiveHeight() - this.getInteractiveHeight() ) / 2 );
			}
		}
		
		this.x( x );
		this.y( y );
		
		this.getLayer().draw();
	}
	
	if( typeof _obj.attached === 'undefined' )
		_obj.attached = {};
		
	_obj.attached[ _toAttach.id() ] = _toAttach;
	
	_obj.off( 'dragmove.attach' )
	_obj.on( 'dragmove.attach', function(){
		if( typeof this.attached === 'object' )
			for( var ref in this.attached ){
				if( typeof this.attached[ ref ].sync === 'function' )
					this.attached[ ref ].sync();
			}
	});
	
	_toAttach.sync();
}

/*	Finds where two lines inersect when the lines are, each defined as a struct with below:
{
	"point1" : { "x": 0, "y": 0 },
	"point2" : { "x": 100, "y": 100 }
}

return the intercept point as the struct below:
{
	"x" : 0,
	"y" : 0
}
*/
function findLineIntersect( lineA, lineB ){
	var den = ( ( lineB.point2.x - lineB.point1.x ) * ( lineA.point1.y - lineA.point2.y ) ) - ( ( lineA.point1.x - lineA.point2.x ) * ( lineB.point2.y - lineB.point1.y ) )
	
	if( den == 0 )
		return null;
		
	var ta = ( ( ( lineB.point1.y - lineB.point2.y ) * ( lineA.point1.x - lineB.point1.x ) ) + ( ( lineB.point2.x - lineB.point1.x ) * ( lineA.point1.y - lineB.point1.y ) ) ) / den;
	
	if( !between( ta, 0, 1 ) )
		return null;
	
	var tb = ( ( ( lineA.point1.y - lineA.point2.y ) * ( lineA.point1.x - lineB.point1.x ) ) + ( ( lineA.point2.x - lineA.point1.x ) * ( lineA.point1.y - lineB.point1.y ) ) ) / den;
	
	if( !between( tb, 0, 1 ) )
		return null;
		
	var xa = lineA.point1.x + ta * ( lineA.point2.x - lineA.point1.x );
	var ya = lineA.point1.y + ta * ( lineA.point2.y - lineA.point1.y );
	
	return { x: xa, y: ya }
}

function findDistanceBetweenPoints( pointA, pointB ){
	var x = pointB.x - pointA.x;
	x *= x;
	
	var y = pointB.y - pointA.y;
	y *= y;
	
	return Math.sqrt( x + y ); 
} 