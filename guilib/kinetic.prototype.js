Kinetic.isSelected = null;
Kinetic.multiSelect = null;

/*	*** Group Prototypes *** */
Kinetic.Group.prototype.getWidth = function(){
	var children = this.getChildren();
	
	var maxWidth = 0;
	
	for( var i = 0; i < children.length; i++ ){
		if( children[i].getWidth() + children[i].x() > maxWidth )
			maxWidth = children[i].getWidth() + children[i].x();
	}
	
	return maxWidth;
}

Kinetic.Group.prototype.getHeight = function(){
	var children = this.getChildren();
	
	var maxHeight = 0;
	
	for( var i = 0; i < children.length; i++ ){
		if( children[i].getHeight() + children[i].y() > maxHeight )
			maxHeight = children[i].getHeight() + children[i].y();
	}
	
	return maxHeight;
}

/*	getInteractiveHeight: get the height of the group without
 * 	the controls associated with an interactive group
 * 
 * 	returns (int):
 * 	height of the group without the controls associated with 
 * 	an interactive group
 */
Kinetic.Group.prototype.getInteractiveHeight = function(){
	var children = this.getChildren();
	
	var maxHeight = 0;
	
	for( var i = 0; i < children.length; i++ ){
		if( children[i].name() != 'topLeft' && children[i].name() != 'topRight' && children[i].name() != 'bottomRight' && children[i].name() != 'bottomLeft' ){
			if( children[i].getHeight() + children[i].y() > maxHeight ){
				maxHeight = children[i].getHeight() + children[i].y();
			}	
		}
	}
	
	return maxHeight;
}

/*	getInteractiveWidth: get the width of the group without
 * 	the controls associated with an interactive group
 * 
 * 	returns (int):
 * 	height of the group without the controls associated with 
 * 	an interactive group
 */
Kinetic.Group.prototype.getInteractiveWidth = function(){
	var children = this.getChildren();
	
	var maxWidth = 0;
	
	for( var i = 0; i < children.length; i++ ){
		if( children[i].name() != 'topLeft' && children[i].name() != 'topRight' && children[i].name() != 'bottomRight' && children[i].name() != 'bottomLeft' ){
			if( children[i].getWidth() + children[i].x() > maxWidth ){
				maxWidth = children[i].getWidth() + children[i].x();
			}
		}
	}
	
	return maxWidth;
}

Kinetic.Group.prototype.getTrueX = function(){
	var output = this.x();
	
	var child = this;
	while( child.getParent().getType() == 'Group' ){
		child = child.getParent();
		output += child.x(); 
	}
		
	return output;
}

Kinetic.Group.prototype.getCenterX = function(){
	var output = this.getWidth() + this.getTrueX();
		
	return output; 
}

Kinetic.Group.prototype.getTrueY = function(){
	var output = this.y();
	
	var child = this;
	while( child.getParent().getType() == 'Group' ){
		child = child.getParent();
		output += child.y(); 
	}
		
	return output;
}

Kinetic.Group.prototype.getCenterY = function(){
	var output = this.getHeight() + this.getTrueY();
		
	return output; 
}

/*	*** Rect Prototypes *** */
Kinetic.Rect.prototype.getTrueX = function(){
	var output = this.x();
	
	var child = this;
	while( child.getParent().getType() == 'Group' ){
		child = child.getParent();
		output += child.x(); 
	}
		
	return output;
}

Kinetic.Rect.prototype.getCenterX = function(){
	var output = this.getTrueX() + ( this.getWidth() / 2 );
		
	return output;
}

Kinetic.Rect.prototype.getTrueY = function(){
	var output = this.y();
	
	var child = this;
	while( child.getParent().getType() == 'Group' ){
		child = child.getParent();
		output += child.y(); 
	}
	
	return output;
}

Kinetic.Rect.prototype.getCenterY = function(){
	var output = this.getTrueY() + ( this.getHeight() / 2 );
		
	return output;
}

//Returns the 4 points that make up a rect in this order: top left, top right, bottom right, bottom left
Kinetic.Rect.prototype.getPoints = function(){
	var x = this.getTrueX();
	var y = this.getTrueY();
	
	var output = [ { "x" : x, "y" : y }
		, { "x" : x + this.getWidth(), "y" : y }
		, { "x" : x + this.getWidth(), "y" : y + this.getHeight() }
		, { "x" : x, "y" : y + this.getHeight() }
	]
	
	return output;
}

/*	*** Line Prototypes *** */
Kinetic.Line.prototype.width = function( _width ){
	if( _width == undefined ){
		var points = this.points();
		var minX = null, maxX = 0;
		
		for( var i = 0; i < points.length; i += 2 ){
			if( minX == null || minX > points[i] )
				minX = points[i];
				
			if( points[i] > maxX )
				maxX = points[i];
		}
		
		return maxX - minX;
	} else {
		var points = this.points();
		var newPoints = [];
		var ratio = ( this.width() == 0 ) ? 0 : _width / this.width();
		
		newPoints[0] = points[0];
		newPoints[1] = points[1];
		for( var i = 2; i < points.length; i += 2 ){
			newPoints[i] = newPoints[i - 2] + ( ( points[i] - points[i - 2] ) * ratio );
			newPoints[i+1] = points[i+1];
		}
		
		this.points( newPoints );		
	}
}

Kinetic.Line.prototype.getWidth = function(){
	return this.width();
}

Kinetic.Line.prototype.height = function( _height ){
	if( _height == undefined ){
		var points = this.points();
		var minY = null, maxY = 0;
		
		for( var i = 1; i < points.length; i += 2 ){
			if( minY == null || minY > points[i] )
				minY = points[i];
				
			if( points[i] > maxY )
				maxY = points[i];
		}
		
		return maxY - minY;
	} else {
		var points = this.points();
		var newPoints = [];
		var ratio = ( this.height() == 0 ) ? 0 : _height / this.height();
		
		newPoints[0] = points[0];
		newPoints[1] = points[1];
		for( var i = 3; i < points.length; i += 2 ){
			newPoints[i] = newPoints[i - 2] + ( ( points[i] - points[i - 2] ) * ratio );
			newPoints[i-1] = points[i-1];
		}
		
		this.points( newPoints );		
	}
}

Kinetic.Line.prototype.getHeight = function(){
	return this.height();
}

Kinetic.Line.prototype.getTrueX = function(){
	var points = this.points();
	var minX = undefined;
	
	for( var i = 0; i < points.length; i += 2 ){
		if( minX == undefined || minX > points[i] ){
			minX = points[i]
		}
	}
	var output = this.x() + minX;
	
	var child = this;
	while( child.getParent().getType() == 'Group' ){
		child = child.getParent();
		output += child.x(); 
	}
		
	return output;
}

Kinetic.Line.prototype.getCenterX = function(){
	var output = this.getTrueX() + ( this.getWidth() / 2 );
		
	return output;
}

Kinetic.Line.prototype.getTrueY = function(){
	var points = this.points();
	var minY = undefined;
	
	for( var i = 1; i < points.length; i += 2 ){
		if( minY == undefined || minY > points[i] ){
			minY = points[i]
		}
	}
	var output = this.y() + minY;
	
	var child = this;
	while( child.getParent().getType() == 'Group' ){
		child = child.getParent();
		output += child.y(); 
	}
	
	return output;
}

Kinetic.Line.prototype.getCenterY = function(){
	var output = this.getTrueY() + ( this.getHeight() / 2 );
		
	return output;
}

/*	*** Circle Prototypes *** */
Kinetic.Circle.prototype.getTrueX = function(){
	var output = this.x() - ( this.radius() / 2 );
	
	var child = this;
	while( child.getParent().getType() == 'Group' ){
		child = child.getParent();
		output += child.x(); 
	}
		
	return output;
}

Kinetic.Circle.prototype.getCenterX = function(){
	var output = this.getTrueX() + ( this.getWidth() / 2 );
		
	return output;
}

Kinetic.Circle.prototype.getTrueY = function(){
	var output = this.y() - ( this.radius() / 2 );
	
	var child = this;
	while( child.getParent().getType() == 'Group' ){
		child = child.getParent();
		output += child.y(); 
	}
	
	return output;
}

Kinetic.Circle.prototype.getCenterY = function(){
	var output = this.getTrueY() + ( this.getHeight() / 2 );
		
	return output;
}