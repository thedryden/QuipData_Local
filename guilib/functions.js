function cleanObjPointer( _pointer ){
	if( _pointer == undefined ) return undefined
	if( _pointer.substring( 0, 1) == '#' ) _pointer = _pointer.substring( 1 );
	if( _pointer.substring( 0, 1) == '/' ) _pointer = _pointer.substring( 1 );
	
	return _pointer;
}

function getObjPointer( _obj, pointer ){
	if( pointer == undefined ) return undefined;
	
	pointer = cleanObjPointer( pointer );
	
	var slash = pointer.indexOf( '/' );
	if( slash < 0 ) return _obj[pointer];
	
	var segment = pointer.substring( 0, slash );
	
	var nextObj = _obj[segment];
	if( nextObj == undefined ) return undefined;
	
	return getObjPointer( nextObj, pointer.substring( slash ) );
}

function getObjPointerWithIntegrate( _obj, pointer, _integrateWith ){
	if( typeof _integrateWith[ pointer ] !== 'undefined' ){
		return _integrateWith[ pointer ];
	}
	
	if( pointer == undefined ) return undefined;
	
	pointer = cleanObjPointer( pointer );
	
	var slash = pointer.indexOf( '/' );
	if( slash < 0 ) return _obj[pointer];
	
	var segment = pointer.substring( 0, slash );
	
	var nextObj = _obj[segment];
	if( nextObj == undefined ) return undefined;
	
	return getObjPointer( nextObj, pointer.substring( slash ) );
}

function getObjPointerParent( _obj, pointer, _lvlsUp ){
	if( _lvlsUp == undefined ) _lvlsUp = 1;
	
	pointer = cleanObjPointer( pointer );
	
	var lvls = pointer.split("/").length - 1;
	lvls -= _lvlsUp;
	
	return getObjPointerParentHelper( _obj, pointer, lvls );
}

function getObjPointerParentHelper( _obj, pointer, _lvls ){
	if( _lvls == -1 ) 
		return _obj;
	
	pointer = cleanObjPointer( pointer );
	
	var slash = pointer.indexOf( '/' );
	if( slash < 0 ) return _obj[pointer];
	
	var segment = pointer.substring( 0, slash );
	
	var nextObj = _obj[segment];
	if( nextObj == undefined ) return undefined;
	
	return getObjPointerParentHelper( nextObj, pointer.substring( slash ), _lvls - 1 );
}

/*	getPointerUUID: Retruns the last peice for a JSON Pointer
 * 	i.e. if #/ex/12345 were passed into pointer 12345 would be
 * 	returned.
 * 
 * 	Parmas: 
 * 	_pointer: the string to be parsed.
 */
function getPointerUUID( _pointer ){
	var id = _pointer;
	var found = false;
	var i = id.length - 1;
	while( id[i] !== '/' && i > -1 )
		i--;
		
	if( id[i] === '/' ){
		id = id.substring( i + 1 );
		return id;
	}
	
	return;
}

function between( _test, _rangeA, _rangeB ){
	if( ( _test >= _rangeA && _test <= _rangeB ) || ( _test >= _rangeB && _test <= _rangeA ) )
		return true;
	
	return false;
}

//Requires JSON
function cloneJSON( _JSON ){
	return JSON.parse( JSON.stringify( _JSON ) );
}

/*	Creates a copy of the passed object with anything that is not 
 *  acceptable in a JSON string removed.
 */
function cleanObjectforJSON( _attr ){
	var output = {};
	
	for( var ref in _attr ){
		var value = _attr[ref];
		var type = typeof value;
		
		if( type === 'boolean' || type === 'number' || type === 'string' || value instanceof Array ){
			output[ref] = _attr[ref];
		} else if( type == 'object' ){
			output[ref] = cleanObjectforJSON( value );
		}
	}
	
	return output;
}

function JSONStringToHTML( _JSON ){
	var NBS = '&nbsp;&nbsp;';
			
	var output = '';
	var indent = 0;
	for( var i = 0; i < _JSON.length; i++ ){
		if( _JSON[i] == '{' || _JSON[i] == '['  ){						
			indent += 4;
			
			output += _JSON[i] + '<br />'
			
			for( var j = 1; j < indent; j++ )
				output += NBS;
		} else if( _JSON[i] == '}' || _JSON[i] == ']' ){
			indent -= 4
			
			output += '<br />';
			
			for( var j = 1; j < indent; j++ )
				output += NBS;
			
			output += _JSON[i];
		} else if ( _JSON[i] == ',' ){
			output += _JSON[i] + '<br />'
			
			for( var j = 1; j < indent; j++ )
				output += NBS;
		} else {
			output += _JSON[i];
		}
	}
	
	return output;
}

function stripChar( _input ){
	if( typeof _input !== 'string' )
		return _input;
		
	return _input.replace( /\D/g, '' );
}

if ( !Date.prototype.toISOString ) {
  ( function() {

    function pad(number) {
      var r = String(number);
      if ( r.length === 1 ) {
        r = '0' + r;
      }
      return r;
    }

    Date.prototype.toISOString = function() {
      return this.getUTCFullYear()
        + '-' + pad( this.getUTCMonth() + 1 )
        + '-' + pad( this.getUTCDate() )
        + 'T' + pad( this.getUTCHours() )
        + ':' + pad( this.getUTCMinutes() )
        + ':' + pad( this.getUTCSeconds() )
        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
        + 'Z';
    };

  }() );
}

/* Gest URL Parameter.
 * From: http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
 */
function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}

/*	returns the count of properties in the passed objects.
 * 	If a property is an object it will not be traversed merly counted
 */
function getPropertyCount( _obj, _NoCountEmpty ){
	if( typeof _obj !== 'object' )
		return -1;
		
	var i = 0;
	for( var ref in _obj ){
		if( _NoCountEmpty !== true || ref !== 'empty' )
			i++;
	}	
		
	return i;
}

function JSONEquals( _json1, _json2 ){
	for( var ref in _json1 ){
		var aProp = _json1[ ref ];
		
		//Note type of is the only comparison performed on functions, these shouldn't be in JSON anyway...
		if( typeof aProp !== typeof _json2[ ref ] ){
			return false;
		} else if( typeof aProp === 'object' && JSONEquals( aProp, _json2[ ref ] ) === false ){
			return false;
		} else if ( typeof aProp !== 'object' && typeof aProp !== 'function' && aProp !== _json2[ ref ] ){
			return false;
		}
	}
	
	return true;
}

/*	Adds and equals function to an array that compare the two array.
 * 	If the two array are not ordered identically false will be returned.
 */ 
ArrayEqualsFunc = function( _a ){
	if (this === _a) return true;
	if (this == null || _a == null) return false;
	//We know this is an array so testing for it to be an array is redundant
	if( typeof _a !== 'object' ) return false;
	if( typeof _a.length === 'undefined' ) return false;
	
	if (this.length !== _a.length) return false;

	for (var i = 0; i < this.length; ++i) {
		if (this[i] !== _a[i]) return false;
	}
	
	return true;
}

Object.defineProperty( Array.prototype, "equals", { 
	value: ArrayEqualsFunc,
	writable: false,
	enumerable: false,
	configurable: true
});
