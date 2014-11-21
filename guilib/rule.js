function Rule(){
	$( document ).ready(function(){
		for( var ref in master.rule.typeToIcon ){
			master.rule.typeToIcon[ ref ] = $('#' + master.rule.typeToIcon[ ref ] ); 
		} 
		
		var aTrue = true;
	});
}

Rule.prototype = {
	active : false,
	type : null,
	typeToIcon : {
		"required" : "icons_required",
		"unique" : "icons_unique",
		"primary" : "icons_primary"
	}
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
