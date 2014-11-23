var UUID_REGEX = new RegExp( /[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}/g );
var ISO_DATE = new RegExp( /20[0-9][0-9]-[0,1][0-9]-[0,1,2,3][0-9]T[0,1,2][0-9]:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/ );

function JSONEqual( _json1, _json2, _parrentID ){
	if( typeof _json1 != 'object' || typeof _json2 != 'object' )
		return false;
	
	if( getPropertyCount( _json1 ) != getPropertyCount( _json2 ) )
		return false;
		
	if( _parrentID == undefined )
		_parrentID = '';
	
	var id1 = '';
	for( id1 in _json1 ){
		var id2 = '';
		var good = false;
		for( id2 in _json2 ){
			//If id's are equal or both UUIDs
			if( stringUUIDEqual( id1, id2 ) 
				|| ( _parrentID == 'TransactionLog' && id1.substring( 0, 1 ) == '-' && id2.substring( 0, 1 ) == '-' )
			){
				//If objects are of the same type
				if( typeof _json1[id1] == typeof _json2[id2] ){
					//If type ID referse to and object
					if( typeof _json1[id1] == 'object' ){
						//Do a recursive search, if it comes back true then true, otherwise contiue to test
						if( JSONEqual( _json1[id1], _json2[id2], id1 ) == true ){
							good = true;
							break;
						}
					//If array test if equal
					} else if( typeof _json1[id1] == 'array' && _json1[id1].equal( _json2[id2] ) ){
						good = true;
						break;
					} else if ( typeof _json1[id1] == 'string' ){
						if( stringUUIDEqual( _json1[id1], _json2[id2] ) ){
							good = true;
							break;
						} else if ( ISO_DATE.test( _json1[id1] ) && ISO_DATE.test( _json2[id2] ) ) {
							good = true;
							break; 
						} else {
							return false;
						}
					}else if( _json1[id1] == _json2[id2] ) {
						good = true;
						break;
					} else {
						return false;
					}
				} else {
					return false;
				}
			}
		}
		if( !good )
			return false;
			
		previousID = id1;
	}
	return true;
}

function stringUUIDEqual( _string1, _string2 ){
	if( typeof _string1 != 'string' || typeof _string2 != 'string' )
		return false;
	
	_string1 = _string1.replace( UUID_REGEX, 'UUID' );
	_string2 = _string2.replace( UUID_REGEX, 'UUID' );
	
	if( _string1 == _string2 )
		return true;
		
	return false;
}